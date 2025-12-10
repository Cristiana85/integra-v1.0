// src/dispatcher.rs
use crate::protocol::*;
use crate::core::SimulationController;
use serde_json::json;

pub struct Dispatcher;

impl Dispatcher {
    pub fn new() -> Self {
        Self {}
    }

    /// Riceve il messaggio già deserializzato + controller,
    /// decide quale metodo del controller chiamare.
    pub fn dispatch(
        &self,
        req: RequestEnvelope,
        controller: &mut SimulationController,
    ) -> ResponseEnvelope {
        // controlliamo la versione una volta sola qui
        if req.version != PROTOCOL_VERSION {
            return ResponseEnvelope {
                id: req.id,
                version: PROTOCOL_VERSION.into(),
                message_type: "error".into(),
                ok: false,
                payload: json!(null),
                error: Some(ErrorPayload {
                    code: "VERSION_MISMATCH".into(),
                    message: format!("Unsupported protocol version: {}", req.version),
                }),
            };
        }

        match req.message_type.as_str() {
            "ping" => self.handle_ping(req),
            "solver_test" => self.handle_solver_test(req, controller),
            "run_ac" => controller.run_ac(req),
            "run_sparam" => controller.run_sparam(req),
            // "run_hb", "run_transient", ecc. seguiranno
            other => ResponseEnvelope {
                id: req.id,
                version: PROTOCOL_VERSION.into(),
                message_type: "error".into(),
                ok: false,
                payload: json!(null),
                error: Some(ErrorPayload {
                    code: "UNKNOWN_TYPE".into(),
                    message: format!("Unknown message type {}", other),
                }),
            },
        }
    }

    fn handle_ping(&self, req: RequestEnvelope) -> ResponseEnvelope {
        ResponseEnvelope {
            id: req.id,
            version: PROTOCOL_VERSION.into(),
            message_type: "pong".into(),
            ok: true,
            payload: json!({ "protocol_version": PROTOCOL_VERSION }),
            error: None,
        }
    }

    fn handle_solver_test(
        &self,
        req: RequestEnvelope,
        controller: &mut SimulationController,
    ) -> ResponseEnvelope {
        let parsed: SolverTestRequest = match serde_json::from_value(req.payload.clone()) {
            Ok(v) => v,
            Err(e) => {
                return ResponseEnvelope {
                    id: req.id,
                    version: PROTOCOL_VERSION.into(),
                    message_type: "solver_test_result".into(),
                    ok: false,
                    payload: json!(null),
                    error: Some(ErrorPayload {
                        code: "BAD_PAYLOAD".into(),
                        message: e.to_string(),
                    }),
                }
            }
        };
        controller.handle_solver_test(req, parsed)
    }
}
