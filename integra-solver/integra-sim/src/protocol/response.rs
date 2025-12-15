use serde::{Serialize, Deserialize};
use serde_json::Value;
use crate::protocol::ErrorPayload;

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseEnvelope {
    pub id: String,
    pub version: String,
    #[serde(rename = "type")]
    pub message_type: String,
    pub ok: bool,
    pub payload: Value,
    pub error: Option<ErrorPayload>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SolverTestResponse {
    pub echo: String,
    pub timestamp_ms: i64,
}
