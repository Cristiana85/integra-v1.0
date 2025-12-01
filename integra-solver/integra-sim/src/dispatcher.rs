use serde_json::{json, Value};

use crate::controller::protocol::{ErrorPayload, RequestEnvelope, ResponseEnvelope, Status};

pub struct Dispatcher;

impl Dispatcher {
    pub fn new() -> Self {
        Dispatcher
    }

    pub fn handle_message(&self, input: &str) -> String {
        // Step 1: Deserializza input
        let request: Result<RequestEnvelope, _> = serde_json::from_str(input);

        let response = match request {
            Ok(req) => self.handle_command(req),
            Err(e) => ResponseEnvelope {
                id: None,
                command: "invalid".into(),
                status: Status::Error,
                payload: None,
                error: Some(ErrorPayload {
                    code: "invalid_json".into(),
                    message: e.to_string(),
                    details: None,
                }),
            },
        };

        serde_json::to_string(&response).unwrap_or_else(|e| {
            json!({
                "id": null,
                "command": "internal",
                "status": "error",
                "error": {
                    "code": "serialization_error",
                    "message": e.to_string()
                }
            })
            .to_string()
        })
    }

    fn handle_command(&self, req: RequestEnvelope) -> ResponseEnvelope {
        match req.command.as_str() {

            "ping" => ResponseEnvelope {
                id: req.id,
                command: req.command,
                status: Status::Ok,
                payload: Some(req.payload),
                error: None,
            },

            "simulate" => {
                // Legge netlist dal payload
                let netlist = req.payload.get("netlist").and_then(Value::as_str);

                match netlist {
                    Some(text) => ResponseEnvelope {
                        id: req.id,
                        command: req.command,
                        status: Status::Ok,
                        payload: Some(json!({
                            "message": format!("Simulazione completata: {}", text)
                        })),
                        error: None,
                    },
                    None => ResponseEnvelope {
                        id: req.id,
                        command: req.command,
                        status: Status::Error,
                        payload: None,
                        error: Some(ErrorPayload {
                            code: "missing_field".into(),
                            message: "Campo 'netlist' mancante".into(),
                            details: Some(json!({ "expected": "netlist: string" })),
                        }),
                    },
                }
            },

            _ => ResponseEnvelope {
                id: req.id,
                command: req.command,
                status: Status::Error,
                payload: None,
                error: Some(ErrorPayload {
                    code: "unknown_command".into(),
                    message: "Comando non riconosciuto".into(),
                    details: None,
                }),
            },
        }
    }
}
