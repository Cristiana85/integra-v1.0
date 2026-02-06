#[derive(Debug, Clone)]
pub enum ErrorCode {
    JsonInvalid,
    ModelInvalid,
    AnalysisInvalid,
    SolverNotFound,
    Internal,
}

impl ErrorCode {
    pub fn as_str(&self) -> &'static str {
        match self {
            ErrorCode::JsonInvalid => "JSON_INVALID",
            ErrorCode::ModelInvalid => "MODEL_INVALID",
            ErrorCode::AnalysisInvalid => "ANALYSIS_INVALID",
            ErrorCode::SolverNotFound => "SOLVER_NOT_FOUND",
            ErrorCode::Internal => "INTERNAL",
        }
    }
}