use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Sweep {
    pub start: u32,
    pub stop: u32,
    pub points: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AnalysisCommon {
    #[serde(default)]
    pub sweep: Option<Sweep>,
    #[serde(default)]
    pub use_webgpu: Option<bool>,
    #[serde(default)]
    pub precision: Option<String>, // "fast" | "accurate" ...
}
