use serde::{Deserialize, Serialize};

use super::payloads::ModelPayload;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelEnvelope {
    pub version: u32,
    pub payload: ModelPayload,
    #[serde(default)]
    pub meta: serde_json::Value, // opzionale: name, tags, ecc.
}