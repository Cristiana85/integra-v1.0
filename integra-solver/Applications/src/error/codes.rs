#[derive(Debug, Clone, Copy)]
pub enum ErrorCode {
    JsonInvalid,
    ModelInvalid,
    AnalysisInvalid,
    ModelAnalysisMismatch,
    SolverNotFound,
    NotImplemented,
    Cancelled,
    Internal,
}

impl ErrorCode {
    pub fn as_str(&self) -> &'static str {
        match self {
            ErrorCode::JsonInvalid => "JSON_INVALID",
            ErrorCode::ModelInvalid => "MODEL_INVALID",
            ErrorCode::AnalysisInvalid => "ANALYSIS_INVALID",
            ErrorCode::ModelAnalysisMismatch => "MODEL_ANALYSIS_MISMATCH",
            ErrorCode::SolverNotFound => "SOLVER_NOT_FOUND",
            ErrorCode::NotImplemented => "NOT_IMPLEMENTED",
            ErrorCode::Cancelled => "CANCELLED",
            ErrorCode::Internal => "INTERNAL",
        }
    }
}
