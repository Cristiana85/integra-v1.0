// src/solver/engine/dispatcher.rs

use crate::error::{self, Result};
use crate::error::codes::ErrorCode;
use crate::solver::context::SolverContext;

use crate::core::model::ModelPayload;
use crate::core::analysis::payloads::AnalysisPayload;

pub fn run(ctx: &mut SolverContext, emit_progress: impl Fn(f64, &str)) -> Result<()> {
    // (opzionale) validate "generico" envelope/model
    crate::core::model::validate::validate_structural(&ctx.model)?;
    crate::core::analysis::validate::validate_structural(&ctx.analysis)?;

    emit_progress(2.0, "dispatcher: selecting solver");

    match (&ctx.model.payload, &ctx.analysis.payload) {
        // -------------------------
        // TLINE: microstrip/stripline
        // -------------------------
        (ModelPayload::TlineMicrostrip(_), AnalysisPayload::Tline(_)) => {
            crate::solver::calculators::tline::engine::run_microstrip(ctx, emit_progress)
        }
        (ModelPayload::TlineStripline(_), AnalysisPayload::Tline(_)) => {
            crate::solver::calculators::tline::engine::run_stripline(ctx, emit_progress)
        }

        // -------------------------
        // NETLIST (placeholder)
        // -------------------------
        (ModelPayload::Netlist(_), _) => Err(error::err(
            ErrorCode::SolverNotFound,
            "Netlist solver not implemented yet",
        )),

        // -------------------------
        // Mismatch model-analysis
        // -------------------------
        _ => Err(error::err(
            ErrorCode::ModelInvalid, // meglio creare un code dedicato MODEL_ANALYSIS_MISMATCH se vuoi
            "Model/Analysis mismatch: payload types are not compatible",
        )
        .with_details(serde_json::json!({
            "model_payload": model_payload_name(&ctx.model.payload),
            "analysis_payload": analysis_payload_name(&ctx.analysis.payload),
        }))),
    }
    
    
}

        /**
         * return Err(
                 error::err(ErrorCode::ModelAnalysisMismatch, "Model and Analysis payload types are not compatible")
                .with_details(serde_json::json!({
                "model_payload": model_payload_name(&ctx.model.payload),
                "analysis_payload": analysis_payload_name(&ctx.analysis.payload),
                }))
            );
         */

fn model_payload_name(p: &ModelPayload) -> &'static str {
    match p {
        ModelPayload::TlineMicrostrip(_) => "tline_microstrip",
        ModelPayload::TlineStripline(_) => "tline_stripline",
        ModelPayload::Netlist(_) => "netlist",
    }
}

fn analysis_payload_name(p: &AnalysisPayload) -> &'static str {
    match p {
        AnalysisPayload::Tline(_) => "tline",
        //AnalysisPayload::LinkBudget(_) => "link_budget",
        //AnalysisPayload::ThermalPcb(_) => "thermal_pcb",
    }
}
