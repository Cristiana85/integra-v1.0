use crate::core::{analysis::Analysis, dataset::Dataset, model::Model};

pub struct SolverContext {
    pub run_id: String,
    pub model: Model,
    pub analysis: Analysis,
    pub dataset: Option<Dataset>,
}

impl SolverContext {
    pub fn new(run_id: String, model: Model, analysis: Analysis) -> Self {
        Self { run_id, model, analysis, dataset: None }
    }
}
