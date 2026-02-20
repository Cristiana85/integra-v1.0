// src/solver/context.rs

use crate::core::{
    analysis::AnalysisEnvelope,
    dataset::Dataset,
    model::ModelEnvelope,
};

pub struct SolverContext {
    pub run_id: String,
    pub model: ModelEnvelope,
    pub analysis: AnalysisEnvelope,
    pub dataset: Option<Dataset>,
}

impl SolverContext {
    pub fn new(run_id: String, model: ModelEnvelope, analysis: AnalysisEnvelope) -> Self {
        Self {
            run_id,
            model,
            analysis,
            dataset: None,
        }
    }
}
