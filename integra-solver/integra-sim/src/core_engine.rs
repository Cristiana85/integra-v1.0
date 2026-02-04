use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

// src/engine.rs
use crate::comm_engine::Dispatcher;
use crate::core::{SimulationController, UpdateCallback};
use crate::comm::{
    RequestEnvelope, ResponseEnvelope, ErrorPayload, PROTOCOL_VERSION,
};
use serde_json::json;

/// Engine OO condiviso da WASM + native.
pub struct IntegraEngine {
    id: String,
    dispatcher: Dispatcher,
    controller: SimulationController,
    update_cb: Option<UpdateCallback>,
    // copie dei flag, per poterli toccare dall’esterno
    paused: Arc<AtomicBool>,
    cancelled: Arc<AtomicBool>,
}

impl IntegraEngine {
    pub fn new(id: impl Into<String>) -> Self {
        let controller = SimulationController::new();
        let paused: Arc<AtomicBool> = controller.paused_flag();
        let cancelled: Arc<AtomicBool> = controller.cancelled_flag();
        Self {
            id: id.into(),
            dispatcher: Dispatcher::new(),
            controller,
            update_cb: None,
            paused,
            cancelled,
        }
    }

    // Il controller è l’unico proprietario della callback
    pub fn set_update_callback(&mut self, cb: UpdateCallback) {
        self.controller.set_update_callback(Some(cb));
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


    // --- API di controllo esposte verso fuori ---

    pub fn pause(&self) {
        self.paused.store(true, Ordering::Relaxed);
    }

    pub fn resume(&self) {
        self.paused.store(false, Ordering::Relaxed);
    }

    pub fn cancel(&self) {
        self.cancelled.store(true, Ordering::Relaxed);
    }

}
