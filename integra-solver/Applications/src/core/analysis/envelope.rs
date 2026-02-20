use serde::{Deserialize, Serialize};

use super::payloads::{AnalysisCommon, AnalysisPayload};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisEnvelope {
    pub version: u32,
    #[serde(default)]
    pub common: AnalysisCommon,
    pub payload: AnalysisPayload,
}
