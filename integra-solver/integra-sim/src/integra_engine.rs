// src/engine.rs
use crate::dispatcher::Dispatcher;
use crate::core::SimulationController;
use crate::protocol::{
    RequestEnvelope, ResponseEnvelope, ErrorPayload, PROTOCOL_VERSION,
};
use serde_json::json;

/// Engine OO condiviso da WASM + native.
pub struct IntegraEngine {
    id: String,
    dispatcher: Dispatcher,
    controller: SimulationController,
}

impl IntegraEngine {
    pub fn new(id: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            dispatcher: Dispatcher::new(),
            controller: SimulationController::new(),
        }
    }

    /// Entrypoint unico: JSON → JSON
    pub fn dispatch_json(&mut self, request_json: &str) -> String {
        let req: Result<RequestEnvelope, _> = serde_json::from_str(request_json);

        let resp: ResponseEnvelope = match req {
            Ok(env) => self.dispatcher.dispatch(env, &mut self.controller),
            Err(e) => ResponseEnvelope {
                id: "UNKNOWN".into(),
                version: PROTOCOL_VERSION.into(),
                message_type: "error".into(),
                ok: false,
                payload: json!(null),
                error: Some(ErrorPayload {
                    code: "BAD_JSON".into(),
                    message: e.to_string(),
                }),
            },
        };

        serde_json::to_string(&resp).unwrap_or_else(|e| {
            format!(
                r#"{{"id":"UNKNOWN","version":"1.0","type":"error","ok":false,"payload":null,"error":{{"code":"SERIALIZATION_ERROR","message":"{}"}}}}"#,
                e
            )
        })
    }

    pub fn id(&self) -> &str {
        &self.id
    }
}
