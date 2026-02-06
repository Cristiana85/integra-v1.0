use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sweep {
    pub name: String,   // es "freq"
    pub unit: String,   // "Hz"
    pub values: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Analysis {
    #[serde(default)]
    pub sweep: Option<Sweep>,

    #[serde(default)]
    pub settings: serde_json::Value, // solver options generiche
}
