use wasm_bindgen::prelude::*;

use crate::{
    core::{
        analysis::AnalysisEnvelope,
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
    model: Option<ModelEnvelope>,
    analysis: Option<AnalysisEnvelope>,
    last_dataset_json: Option<String>,
    callbacks: CallbackHub,
}

#[wasm_bindgen]
impl Session {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Session {
        Session {
            session_id: crate::utils::ids::new_session_id(),
            model: None,
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

    #[wasm_bindgen]
    pub fn set_model_json(&mut self, model_json: &str) -> std::result::Result<(), JsValue> {
        let model: ModelEnvelope = parse_json(model_json).map_err(to_js)?;
        // (opzionale) validazione strutturale subito
        crate::core::model::validate::validate_structural(&model).map_err(to_js)?;
        self.model = Some(model);
        Ok(())
    }

    #[wasm_bindgen]
    pub fn set_analysis_json(&mut self, analysis_json: &str) -> std::result::Result<(), JsValue> {
        let analysis: AnalysisEnvelope = parse_json(analysis_json).map_err(to_js)?;
        // (opzionale) validazione strutturale subito
        crate::core::analysis::validate::validate_structural(&analysis).map_err(to_js)?;
        self.analysis = Some(analysis);
        Ok(())
    }

    /// Esegue una run. In worker non blocca il main thread.
    #[wasm_bindgen]
    pub fn run(&mut self, run_id: &str) -> std::result::Result<(), JsValue> {
        let model = self.model.clone().ok_or_else(|| {
            to_js(error::err(crate::error::codes::ErrorCode::ModelInvalid, "Model not set"))
        })?;

        let analysis = self.analysis.clone().ok_or_else(|| {
            to_js(error::err(crate::error::codes::ErrorCode::AnalysisInvalid, "Analysis not set"))
        })?;

        let mut ctx = SolverContext::new(run_id.to_string(), model, analysis);

        // progress emitter -> envelope(progress)
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

        // run dispatcher
        match crate::solver::engine::dispatcher::run(&mut ctx, emit_progress) {
            Ok(()) => {
                let dataset = ctx.dataset.take().ok_or_else(|| {
                    to_js(error::err(crate::error::codes::ErrorCode::Internal, "Dataset missing after successful run"))
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
                let err_env = Envelope {
                    r#type: MsgType::Error,
                    id: run_id.to_string(),
                    payload: serde_json::to_value(e).unwrap_or_else(|_| {
                        serde_json::json!({"code":"INTERNAL","message":"Error serialization failed"})
                    }),
                };
                let err_json = to_json(&err_env).map_err(to_js)?;
                self.callbacks.emit(&err_json);
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

fn to_js(e: crate::error::types::ErrorMessage) -> JsValue {
    JsValue::from_str(
        &serde_json::to_string(&e).unwrap_or_else(|_| {
            "{\"code\":\"INTERNAL\",\"message\":\"to_js failed\"}".to_string()
        }),
    )
}
