use crate::{
    core::{
        analysis::payloads::{AnalysisPayload, Sweep},
        dataset::{Dataset, DatasetMeta, DependentVar, IndependentVar},
        model::ModelPayload,
    },
    error::{self, Result},
    error::codes::ErrorCode,
    simulator::context::SolverContext,
};

pub fn solve_microstrip(ctx: &mut SolverContext, emit_progress: impl Fn(f64, &str)) -> Result<()> {
    Ok(())
}

pub fn solve_stripline(ctx: &mut SolverContext, emit_progress: impl Fn(f64, &str)) -> Result<()> {
    Ok(())
}
