// src/solver/engine/dispatcher.rs

use crate::error::{self, Result};
use crate::error::codes::ErrorCode;
use crate::simulator::context::SolverContext;

use crate::core::model::ModelPayload;
use crate::core::analysis::payloads::AnalysisPayload;

// calculators / engines
use crate::simulator::solvers::{
    tline,
    sparameter,
};

pub fn run(ctx: &mut SolverContext, emit_progress: impl Fn(f64, &str)) -> Result<()> {

    // (opzionale) validate "generico" envelope/model
    //crate::core::model::validate::validate_structural(&ctx.model)?;
    //crate::core::analysis::validate::validate_structural(&ctx.analysis)?;

    emit_progress(2.0, "dispatcher: selecting solver");

    match &ctx.analysis.payload {
        // -------------------------
        // TLINE:
        // -------------------------
        AnalysisPayload::Tline(_) => {
            tline::engine::solve_microstrip(ctx, emit_progress)
        },

        // -------------------------
        // SPARAMETER:
        // -------------------------
        AnalysisPayload::Sparameter(_) => {
            sparameter::engine::solve(ctx, emit_progress)
        },

        // -------------------------
        // LINK BUDGET:
        // -------------------------
        AnalysisPayload::LinkBudget(_) => Err(error::err(
            ErrorCode::SolverNotFound,
            "Netlist solver not implemented yet",
        )),
    }
    
    
}

fn model_payload_name(p: &ModelPayload) -> &'static str {
    match p {
        ModelPayload::TlineMicrostrip(_) => "tline_microstrip",
        ModelPayload::TlineStripline(_) => "tline_stripline",
        ModelPayload::Netlist(_) => "netlist",
        ModelPayload::Touchstone(_) => "touchstone",
    }
}

fn analysis_payload_name(p: &AnalysisPayload) -> &'static str {
    match p {
        AnalysisPayload::Tline(_) => "tline",
        AnalysisPayload::Sparameter(_) => "sparameter",
        AnalysisPayload::LinkBudget(_) => "link_budget",
    }
}
