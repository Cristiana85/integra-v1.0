use wasm_bindgen::prelude::*;

use crate::{
    core::{
        analysis::AnalysisEnvelope,
        dataset::{Dataset, DependentVar, IndependentVar},
        model::ModelEnvelope,
    },
    error::{self, Result},
    solver::context::SolverContext,
    wasm::{
        callback::CallbackHub,
        json_bridge::{parse_json, to_json, Envelope, MsgType},
    },
};

#[wasm_bindgen]
pub struct Session {
    session_id: String,

    // MANY models (One analysis → many models)
    models: Vec<ModelEnvelope>,

    // ONE analysis
    analysis: Option<AnalysisEnvelope>,

    // Last merged dataset envelope json (Done)
    last_dataset_json: Option<String>,

    callbacks: CallbackHub,
}

#[wasm_bindgen]
impl Session {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Session {
        Session {
            session_id: crate::utils::ids::new_session_id(),
            models: Vec::new(),
            analysis: None,
            last_dataset_json: None,
            callbacks: CallbackHub::default(),
        }
    }

    /// Registra un'unica callback JS: riceve sempre una string JSON Envelope.
    #[wasm_bindgen]
    pub fn set_on_message(&mut self, cb: js_sys::Function) {
        self.callbacks.on_message = Some(cb);
    }

    // -------------------------------------------------------------------------
    // MODEL APIs
    // -------------------------------------------------------------------------

    /// Backward-compatible: imposta UN SOLO model (resetta la lista e inserisce 1 model).
    #[wasm_bindgen]
    pub fn set_model_json(&mut self, model_json: &str) -> std::result::Result<(), JsValue> {
        let model: ModelEnvelope = parse_json(model_json).map_err(to_js)?;
        crate::core::model::validate::validate_structural(&model).map_err(to_js)?;
        self.models.clear();
        self.models.push(model);
        Ok(())
    }

    /// Nuovo: aggiunge un model alla coda (many models).
    #[wasm_bindgen]
    pub fn push_model_json(&mut self, model_json: &str) -> std::result::Result<(), JsValue> {
        let model: ModelEnvelope = parse_json(model_json).map_err(to_js)?;
        crate::core::model::validate::validate_structural(&model).map_err(to_js)?;
        self.models.push(model);
        Ok(())
    }

    /// Pulisce solo la lista modelli.
    #[wasm_bindgen]
    pub fn clear_models(&mut self) {
        self.models.clear();
        self.models.shrink_to_fit();
    }

    // -------------------------------------------------------------------------
    // ANALYSIS APIs
    // -------------------------------------------------------------------------

    /// Imposta la SINGLE analysis (one analysis).
    #[wasm_bindgen]
    pub fn set_analysis_json(&mut self, analysis_json: &str) -> std::result::Result<(), JsValue> {
        let analysis: AnalysisEnvelope = parse_json(analysis_json).map_err(to_js)?;
        crate::core::analysis::validate::validate_structural(&analysis).map_err(to_js)?;
        self.analysis = Some(analysis);
        Ok(())
    }

    // -------------------------------------------------------------------------
    // DATASET APIs
    // -------------------------------------------------------------------------

    /// Pulisce solo l'ultimo dataset (envelope cached).
    #[wasm_bindgen]
    pub fn clear_dataset(&mut self) {
        self.last_dataset_json = None;
    }

    /// Cleanup best-effort dopo che la UI ha letto i risultati:
    /// - clear dataset envelope cached
    /// - clear models (+ shrink)
    /// - clear analysis
    #[wasm_bindgen]
    pub fn cleanup_after_read(&mut self) {
        self.last_dataset_json = None;

        self.models.clear();
        self.models.shrink_to_fit();

        self.analysis = None;
    }

    // -------------------------------------------------------------------------
    // RUN
    // -------------------------------------------------------------------------

    /// Esegue una run: One analysis → many models
    /// - applica la stessa analysis a tutti i models
    /// - merge in un Dataset unico:
    ///   - IndependentVar deve coincidere esattamente per tutti
    ///   - DependentVar rinominate con suffix "__m{i}"
    #[wasm_bindgen]
    pub fn run(&mut self, run_id: &str) -> std::result::Result<(), JsValue> {
        if self.models.is_empty() {
            let e = error::err(crate::error::codes::ErrorCode::ModelInvalid, "No models in queue");
            // emettiamo errore come envelope (coerente col pattern run)
            self.emit_error_envelope(run_id, e);
            return Err(JsValue::from_str("run failed"));
        }

        let analysis = self.analysis.clone().ok_or_else(|| {
            to_js(error::err(
                crate::error::codes::ErrorCode::AnalysisInvalid,
                "Analysis not set",
            ))
        })?;

        let total = self.models.len();

        // Dataset finale (merged)
        let mut final_dataset: Option<Dataset> = None;

        // progress emitter -> envelope(progress)
        // (manteniamo il formato già usato, aggiungendo info su model index/total)
        let emit_progress = |pct: f64, msg: &str, model_index: usize, model_total: usize| {
            let env = Envelope {
                r#type: MsgType::Progress,
                id: run_id.to_string(),
                payload: serde_json::json!({
                    "pct": pct,
                    "message": msg,
                    "stage": "solve",
                    "model_index": model_index,
                    "model_total": model_total
                }),
            };

            if let Ok(s) = to_json(&env) {
                self.callbacks.emit(&s);
            }
        };

        // Per ogni model, run dispatcher, poi merge dataset
        for (i, model) in self.models.iter().cloned().enumerate() {
            emit_progress(1.0, "session: preparing context", i, total);

            let mut ctx = SolverContext::new(run_id.to_string(), model, analysis.clone());

            // Adapter progress: possiamo lasciare il pct del dispatcher "locale",
            // ma arricchiamo con i+total; oppure (futuro) normalizzare su 0..100 globale.
            let dispatcher_progress = |pct: f64, msg: &str| {
                emit_progress(pct, msg, i, total);
            };

            match crate::solver::engine::dispatcher::run(&mut ctx, dispatcher_progress) {
                Ok(()) => {
                    let ds_i = ctx.dataset.take().ok_or_else(|| {
                        to_js(error::err(
                            crate::error::codes::ErrorCode::Internal,
                            "Dataset missing after successful run",
                        ))
                    })?;

                    match &mut final_dataset {
                        None => {
                            let mut base = ds_i;
                            suffix_dependent_names(&mut base.dependent, i);

                            // mettiamo informazioni di merge in meta.units (campo già previsto)
                            // senza cambiare la forma del Dataset (resta tipizzato)
                            base.meta.units = serde_json::json!({
                                "mode": "one_analysis_many_models",
                                "models_total": total
                            });

                            final_dataset = Some(base);
                        }
                        Some(fd) => {
                            if !independent_equal(&fd.independent, &ds_i.independent) {
                                let e = error::invalid(
                                    crate::error::codes::ErrorCode::Internal,
                                    &format!("models[{}]", i),
                                    "IndependentVar mismatch: cannot merge datasets",
                                    serde_json::json!({
                                        "expected": {
                                            "name": fd.independent.name,
                                            "unit": fd.independent.unit,
                                            "len": fd.independent.values.len()
                                        },
                                        "got": {
                                            "name": ds_i.independent.name,
                                            "unit": ds_i.independent.unit,
                                            "len": ds_i.independent.values.len()
                                        }
                                    }),
                                );
                                self.emit_error_envelope(run_id, e);
                                return Err(JsValue::from_str("run failed"));
                            }

                            let mut deps = ds_i.dependent;
                            suffix_dependent_names(&mut deps, i);
                            fd.dependent.extend(deps);
                        }
                    }

                    emit_progress(99.0, "session: model done", i, total);
                }
                Err(e) => {
                    // errore già strutturato: lo impacchettiamo in envelope error
                    self.emit_error_envelope(run_id, e);
                    return Err(JsValue::from_str("run failed"));
                }
            }
        }

        // Produce Done envelope con dataset merged
        let dataset = final_dataset.ok_or_else(|| {
            to_js(error::err(
                crate::error::codes::ErrorCode::Internal,
                "Merged dataset missing",
            ))
        })?;

        let done_env = Envelope {
            r#type: MsgType::Done,
            id: run_id.to_string(),
            payload: serde_json::json!({ "dataset": dataset }),
        };

        let done_json = to_json(&done_env).map_err(to_js)?;
        self.last_dataset_json = Some(done_json.clone());
        self.callbacks.emit(&done_json);
        Ok(())
    }

    #[wasm_bindgen]
    pub fn get_last_dataset_envelope_json(&self) -> Option<String> {
        self.last_dataset_json.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn session_id(&self) -> String {
        self.session_id.clone()
    }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

impl Session {
    fn emit_error_envelope(&self, run_id: &str, e: crate::error::types::ErrorMessage) {
        let err_env = Envelope {
            r#type: MsgType::Error,
            id: run_id.to_string(),
            payload: serde_json::to_value(e).unwrap_or_else(|_| {
                serde_json::json!({"code":"INTERNAL","message":"Error serialization failed"})
            }),
        };

        if let Ok(err_json) = to_json(&err_env) {
            self.callbacks.emit(&err_json);
        }
    }
}

fn independent_equal(a: &IndependentVar, b: &IndependentVar) -> bool {
    a.name == b.name && a.unit == b.unit && a.values == b.values
}

fn suffix_dependent_names(deps: &mut [DependentVar], model_index: usize) {
    for d in deps {
        d.name = format!("{}__m{}", d.name, model_index);
    }
}

fn to_js(e: crate::error::types::ErrorMessage) -> JsValue {
    JsValue::from_str(
        &serde_json::to_string(&e).unwrap_or_else(|_| {
            "{\"code\":\"INTERNAL\",\"message\":\"to_js failed\"}".to_string()
        }),
    )
}