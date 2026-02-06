use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatasetMeta {
    pub title: String,
    pub solver: String,
    #[serde(default)]
    pub units: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndependentVar {
    pub name: String,
    pub unit: String,
    pub values: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependentVar {
    pub name: String,
    pub unit: String,
    pub values: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dataset {
    pub meta: DatasetMeta,
    pub independent: IndependentVar,
    pub dependent: Vec<DependentVar>,
}
