use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Struttura principale del Dataset
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Dataset {
    pub traces: Vec<Trace>, // Un Dataset ora ha una lista di Trace
}

/// Struttura per un singolo Trace
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Trace {
    pub tracename: String,
    pub sweep: String,
    pub solver: String,
    pub domain: String,
    pub data: String,
    pub format: String,
}

impl Dataset {
    /// 🔹 Crea un `Dataset` da un JSON
    pub fn from_json(json_data: &str) -> Result<Self, String> {
        serde_json::from_str(json_data).map_err(|e| format!("JSON parse error: {}", e))
    }

    /// 🔹 Converte `Dataset` in JSON
    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(self).unwrap_or_else(|_| "{}".to_string())
    }
}
