use crate::error::{self, Result};
use crate::solver::context::SolverContext;

pub fn run(ctx: &mut SolverContext, emit_progress: impl Fn(f64, &str)) -> Result<()> {
    match ctx.model.kind.as_str() {
        "tline" => crate::solver::calculators::tline::engine::run(ctx, emit_progress),
        _ => Err(error::err(crate::error::codes::ErrorCode::SolverNotFound, format!("Unknown solver kind: {}", ctx.model.kind))),
    }
}
