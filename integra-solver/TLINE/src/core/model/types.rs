use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Model {
    /// quale calcolatore? "tline", "link_budget", "thermal_pcb", ...
    pub kind: String,

    /// struttura generica estendibile
    #[serde(default)]
    pub data: serde_json::Value,
}
