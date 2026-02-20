use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TlineAnalysis {
    #[serde(default)]
    pub outputs: Vec<String>, // ["Z0","alpha",...]
    #[serde(default)]
    pub loss_model: Option<String>,
    #[serde(default)]
    pub conductor_roughness_um: Option<f64>,
}
