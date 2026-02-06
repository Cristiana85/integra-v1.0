use crate::{
    core::{
        dataset::{Dataset, DatasetMeta, DependentVar, IndependentVar},
    },
    error::Result,
    solver::context::SolverContext,
};

pub fn run(ctx: &mut SolverContext, emit_progress: impl Fn(f64, &str)) -> Result<()> {
    super::model_map::validate(&ctx.model)?;

    // Sweep: se non presente, mettiamo un default
    let sweep = ctx.analysis.sweep.clone().unwrap_or_else(|| crate::core::analysis::Sweep {
        name: "freq".to_string(),
        unit: "Hz".to_string(),
        values: vec![1e9, 2e9, 3e9, 4e9, 5e9],
    });

    emit_progress(5.0, "TLINE: setup");

    // Dataset finto ma coerente: Z0 ~ 50 + piccola variazione, alpha cresce con freq
    let mut z0 = Vec::with_capacity(sweep.values.len());
    let mut alpha = Vec::with_capacity(sweep.values.len());

    for (i, f) in sweep.values.iter().enumerate() {
        let pct = 10.0 + (80.0 * (i as f64) / (sweep.values.len().max(1) as f64));
        emit_progress(pct, &format!("TLINE: solving @ {} {}", f, sweep.unit));

        let f_ghz = *f / 1e9;
        z0.push(50.0 + 0.2 * (f_ghz - 3.0));          // toy
        alpha.push(0.01 + 0.005 * f_ghz);             // toy
    }

    emit_progress(95.0, "TLINE: post-processing");

    let ds = Dataset {
        meta: DatasetMeta {
            title: "TLINE: Demo dataset".to_string(),
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
