use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestEnvelope {
    pub id: String,
    pub version: String,
    #[serde(rename = "type")]
    pub message_type: String,
    pub payload: Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SolverTestRequest {
    pub message: String,
}
