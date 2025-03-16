use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Represents a dataset object
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Dataset {
    pub tracename: String,
    pub sweep: String,
    pub solver: String,
    pub domain: String,
    pub data: String,
    pub format: String,
}

impl Dataset {
    /// Parses a dataset from a JSON string
    pub fn from_json(json_data: &str) -> Result<Self, String> {
        serde_json::from_str(json_data).map_err(|e| format!("JSON parse error: {}", e))
    }
}