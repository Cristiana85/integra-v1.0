use serde::{Deserialize, Serialize};
use crate::error::{codes, ErrorReport};
use super::tline::MicrostripSpec;
use super::sparams::SParamsSpec;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Analysis {
    pub kind: AnalysisKind,
}

impl Analysis {
    pub fn validate(&self) -> Result<(), ErrorReport> {
        match &self.kind {
            AnalysisKind::TLineMicrostrip(s) => s.validate(),
            AnalysisKind::SParams(s) => s.validate(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "spec")]
pub enum AnalysisKind {
    #[serde(rename = "tline_microstrip")]
    TLineMicrostrip(MicrostripSpec),

    #[serde(rename = "sparams")]
    SParams(SParamsSpec),
}
