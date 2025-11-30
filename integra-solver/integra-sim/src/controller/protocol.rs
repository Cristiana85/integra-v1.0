use serde::{Deserialize, Serialize};
use serde_json::Value;

pub type RequestId = String;

/* ========= ENVELOPE ========= */

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestEnvelope {
    pub id: Option<RequestId>,
    pub command: String,
    #[serde(default)]
    pub payload: Value,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseEnvelope {
    pub id: Option<RequestId>,
    pub command: String,
    pub status: Status,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub payload: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<ErrorPayload>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Ok,
    Error,
}

/* ========= ERROR ========= */

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ErrorPayload {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<Value>,
}

#[derive(Debug)]
pub struct ProtocolError {
    pub code: String,
    pub message: String,
    pub details: Option<Value>,
}

impl ProtocolError {
    pub fn new(code: &str, message: &str) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            details: None,
        }
    }
}

/* ========= PING PAYLOAD ========= */

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PingRequest {}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PingResponse {
    pub version: String,
}

/* ========= API ========= */

pub trait SimulationApi {
    fn ping(&self, _req: PingRequest) -> Result<PingResponse, ProtocolError> {
        Err(ProtocolError::new("UNIMPLEMENTED", "Ping not implemented"))
    }
}
