use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Touchstone {
    pub name: String,
    pub frequencies: Vec<f64>,
    pub s_matrix: Vec<Vec<(f64, f64)>>,
}

impl Touchstone {
    pub fn new(name: String, frequencies: Vec<f64>, s_matrix: Vec<Vec<(f64, f64)>>) -> Touchstone {
        Touchstone {
            name,
            frequencies,
            s_matrix,
        }
    }

    pub fn get(&self) -> JsValue {
        serde_wasm_bindgen::to_value(self).unwrap_or(JsValue::UNDEFINED)
    }

    pub fn set(&mut self, json_data: &str) -> Result<(), JsValue> {
        let updated: Touchstone = serde_json::from_str(json_data)
            .map_err(|e| JsValue::from_str(&format!("Errore parsing JSON: {}", e)))?;

        self.name = updated.name;
        self.frequencies = updated.frequencies;
        self.s_matrix = updated.s_matrix;

        Ok(())
    }

    /// 🔹 Crea un oggetto `SPTouchstone` da una stringa JSON
    pub fn from_json(json_data: &str) -> Result<Self, String> {
        serde_json::from_str(json_data)
            .map_err(|e| format!("Errore nel parsing del Touchstone JSON: {}", e))
    }

    /// 🔹 Converte un oggetto `SPTouchstone` in JSON
    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(self).unwrap_or_else(|_| "{}".to_string())
    }
}
