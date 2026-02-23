use wasm_bindgen::prelude::*;

use crate::{
    core::{analysis::AnalysisEnvelope, model::ModelEnvelope},
    error,
    simulator::context::SolverContext,
    wasm::{
        callback::CallbackHub,
        json_bridge::{parse_json, to_json, Envelope, MsgType},
    },
};

#[wasm_bindgen]
pub struct Session {
    session_id: String,

    // MULTI models macro
    models: Vec<ModelEnvelope>,

    // SINGLE analysis
    analysis: Option<AnalysisEnvelope>,

    // cached last done envelope
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

    #[wasm_bindgen]
    pub fn set_on_message(&mut self, cb: js_sys::Function) {
        self.callbacks.on_message = Some(cb);
    }

    // -------------------------------------------------------------------------
    // MODEL APIs
    // -------------------------------------------------------------------------

    /// Backward-compatible: reset e inserisce un solo modello.
    #[wasm_bindgen]
    pub fn set_model_json(&mut self, model_json: &str) -> std::result::Result<(), JsValue> {
        let model: ModelEnvelope = parse_json(model_json).map_err(to_js)?;
        crate::core::model::validate::validate_structural(&model).map_err(to_js)?;
        self.models.clear();
        self.models.push(model);
        Ok(())
    }

    /// Multi: aggiunge un modello macro.
    #[wasm_bindgen]
    pub fn push_model_json(&mut self, model_json: &str) -> std::result::Result<(), JsValue> {
        let model: ModelEnvelope = parse_json(model_json).map_err(to_js)?;
        crate::core::model::validate::validate_structural(&model).map_err(to_js)?;
        self.models.push(model);
        Ok(())
    }

    #[wasm_bindgen]
    pub fn clear_models(&mut self) {
        self.models.clear();
        self.models.shrink_to_fit();
    }

    // -------------------------------------------------------------------------
    // ANALYSIS APIs
    // -------------------------------------------------------------------------

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

    #[wasm_bindgen]
    pub fn clear_dataset(&mut self) {
        self.last_dataset_json = None;
    }

    #[wasm_bindgen]
    pub fn cleanup_after_read(&mut self) {
        self.last_dataset_json = None;
        self.analysis = None;
        self.models.clear();
        self.models.shrink_to_fit();
    }

    // -------------------------------------------------------------------------
    // RUN
    // -------------------------------------------------------------------------

    #[wasm_bindgen]
    pub fn run(&mut self, run_id: &str) -> std::result::Result<(), JsValue> {
        if self.models.is_empty() {
            let e = error::err(crate::error::codes::ErrorCode::ModelInvalid, "No models loaded");
            self.emit_error_envelope(run_id, e);
            return Err(JsValue::from_str("run failed"));
        }

        let analysis = match self.analysis.clone() {
            Some(a) => a,
            None => {
                let e = error::err(crate::error::codes::ErrorCode::AnalysisInvalid, "Analysis not set");
                self.emit_error_envelope(run_id, e);
                return Err(JsValue::from_str("run failed"));
            }
        };

        // Context multi-model
        let mut ctx = SolverContext::new(run_id.to_string(), self.models.clone(), analysis);

        // progress emitter (Envelope progress)
        let emit_progress = |pct: f64, msg: &str| {
            let env = Envelope {
                r#type: MsgType::Progress,
                id: run_id.to_string(),
                payload: serde_json::json!({
                    "pct": pct,
                    "message": msg,
                    "stage": "solve"
                }),
            };
            if let Ok(s) = to_json(&env) {
                self.callbacks.emit(&s);
            }
        };

        match crate::simulator::routing::dispatcher::run(&mut ctx, emit_progress) {
            Ok(()) => {
                let dataset = ctx.dataset.take().ok_or_else(|| {
                    to_js(error::err(
                        crate::error::codes::ErrorCode::Internal,
                        "Dataset missing after successful run",
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
            Err(e) => {
                self.emit_error_envelope(run_id, e);
                Err(JsValue::from_str("run failed"))
            }
        }
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
// internals
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

fn to_js(e: crate::error::types::ErrorMessage) -> JsValue {
    JsValue::from_str(
        &serde_json::to_string(&e).unwrap_or_else(|_| {
            "{\"code\":\"INTERNAL\",\"message\":\"to_js failed\"}".to_string()
        }),
    )
}