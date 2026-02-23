use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u32)]
pub enum ErrorCode {
    JsonInvalid = 0,
    ModelInvalid = 1,
    AnalysisInvalid = 2,
    ModelAnalysisMismatch = 3,
    SolverNotFound = 4,
    NotImplemented = 5,
    Internal = 6,
}

impl ErrorCode {
    pub fn as_str(self) -> &'static str {
        match self {
            ErrorCode::JsonInvalid => "JSON_INVALID",
            ErrorCode::ModelInvalid => "MODEL_INVALID",
            ErrorCode::AnalysisInvalid => "ANALYSIS_INVALID",
            ErrorCode::ModelAnalysisMismatch => "MODEL_ANALYSIS_MISMATCH",
            ErrorCode::SolverNotFound => "SOLVER_NOT_FOUND",
            ErrorCode::NotImplemented => "NOT_IMPLEMENTED",
            ErrorCode::Internal => "INTERNAL",
        }
    }
}