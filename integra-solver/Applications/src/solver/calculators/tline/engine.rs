use crate::{
    core::{
        analysis::payloads::{AnalysisPayload, Sweep},
        dataset::{Dataset, DatasetMeta, DependentVar, IndependentVar},
        model::ModelPayload,
    },
    error::{self, Result},
    error::codes::ErrorCode,
    solver::context::SolverContext,
};

pub fn run_microstrip(ctx: &mut SolverContext, emit_progress: impl Fn(f64, &str)) -> Result<()> {
    let ms = match &ctx.model.payload {
        ModelPayload::TlineMicrostrip(m) => m,
        _ => {
            return Err(error::err(
                ErrorCode::ModelInvalid,
                "Expected tline_microstrip model payload",
            ))
        }
    };

    let a = match &ctx.analysis.payload {
        AnalysisPayload::Tline(a) => a,
        _ => {
            return Err(error::err(
                ErrorCode::AnalysisInvalid,
                "Expected tline analysis payload",
            ))
        }
    };

    // Qui userai ms + a per configurare solver reale
    let _ = (ms, a);

    run_common_tline(ctx, emit_progress, "tline_microstrip")
}

pub fn run_stripline(ctx: &mut SolverContext, emit_progress: impl Fn(f64, &str)) -> Result<()> {
    let sl = match &ctx.model.payload {
        ModelPayload::TlineStripline(m) => m,
        _ => {
            return Err(error::err(
                ErrorCode::ModelInvalid,
                "Expected tline_stripline model payload",
            ))
        }
    };

    let a = match &ctx.analysis.payload {
        AnalysisPayload::Tline(a) => a,
        _ => {
            return Err(error::err(
                ErrorCode::AnalysisInvalid,
                "Expected tline analysis payload",
            ))
        }
    };

    let _ = (sl, a);

    run_common_tline(ctx, emit_progress, "tline_stripline")
}

fn run_common_tline(
    ctx: &mut SolverContext,
    emit_progress: impl Fn(f64, &str),
    title_suffix: &str,
) -> Result<()> {
    emit_progress(5.0, "TLINE: setup");

    // Sweep: prendi dal common, o default
    let sweep = ctx.analysis.common.sweep.clone().unwrap_or_else(default_freq_sweep);

    // dataset demo (toy)
    let mut z0 = Vec::with_capacity(sweep.values.len());
    let mut alpha = Vec::with_capacity(sweep.values.len());

    for (i, f) in sweep.values.iter().enumerate() {
        let pct = 10.0 + (80.0 * (i as f64) / (sweep.values.len().max(1) as f64));
        emit_progress(pct, &format!("TLINE: solving @ {} {}", f, sweep.unit));

        let f_ghz = *f / 1e9;
        z0.push(50.0 + 0.2 * (f_ghz - 3.0));
        alpha.push(0.01 + 0.005 * f_ghz);
    }

    emit_progress(95.0, "TLINE: post-processing");

    let ds = Dataset {
        meta: DatasetMeta {
            title: format!("TLINE: Demo dataset ({})", title_suffix),
            solver: "tline".to_string(),
            units: serde_json::json!({"x":"Hz","Z0":"Ohm","alpha":"Np/m"}),
        },
        independent: IndependentVar {
            name: sweep.name,
            unit: sweep.unit,
            values: sweep.values,
        },
        dependent: vec![
            DependentVar { name: "Z0".to_string(), unit: "Ohm".to_string(), values: z0 },
            DependentVar { name: "alpha".to_string(), unit: "Np/m".to_string(), values: alpha },
        ],
    };

    ctx.dataset = Some(ds);
    emit_progress(100.0, "TLINE: done");
    Ok(())
}

fn default_freq_sweep() -> Sweep {
    Sweep {
        name: "freq".to_string(),
        unit: "Hz".to_string(),
        values: vec![1e9, 2e9, 3e9, 4e9, 5e9],
    }
}
