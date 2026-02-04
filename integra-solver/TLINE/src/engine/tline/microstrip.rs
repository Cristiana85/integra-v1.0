use crate::analysis::tline::{MicrostripSpec, SweepSpec};
use crate::dataset::types::{Event, MetricsPayload, NamedBuffer};
use crate::engine::traits::{AnalysisRunner, EngineContext};
use crate::error::{codes, ErrorReport};
use crate::utils::{math::ln, units::{C0, MU0}};
use serde_json::json;

pub struct MicrostripRunner {
    spec: MicrostripSpec,
    // sweep state
    freqs: Vec<f64>,
    idx: usize,
    // accumulators
    beta: Vec<f64>,
    alpha_total: Vec<f64>,
    z0: f64,
    eps_eff: f64,
}

impl MicrostripRunner {
    pub fn new(spec: MicrostripSpec) -> Self {
        Self { spec, freqs: vec![], idx: 0, beta: vec![], alpha_total: vec![], z0: 0.0, eps_eff: 0.0 }
    }
}

fn z0_eps_eff(w: f64, h: f64, er: f64) -> Result<(f64, f64), ErrorReport> {
    let u = w / h;
    let eps_eff = if u <= 1.0 {
        (er + 1.0) / 2.0 + (er - 1.0) / 2.0 * (1.0 / (1.0 + 12.0 / u).sqrt())
    } else {
        (er + 1.0) / 2.0 + (er - 1.0) / 2.0 * (1.0 / (1.0 + 12.0 / u).sqrt())
            + 0.04 * (1.0 - u).powi(2)
    };

    let z0 = if u <= 1.0 {
        let term = ln(8.0 / u + 0.25 * u)?;
        60.0 / eps_eff.sqrt() * term
    } else {
        let term = u + 1.393 + 0.667 * ln(u + 1.444)?;
        120.0 * std::f64::consts::PI / (eps_eff.sqrt() * term)
    };

    Ok((z0, eps_eff))
}

fn make_freqs(sw: &SweepSpec) -> Vec<f64> {
    let n = sw.points as usize;
    let f0 = sw.f_start_hz;
    let f1 = sw.f_stop_hz;
    let mut out = Vec::with_capacity(n);
    if sw.kind == "lin" {
        let step = (f1 - f0) / ((n - 1) as f64);
        for i in 0..n { out.push(f0 + step * (i as f64)); }
    } else {
        let ln0 = f0.ln();
        let ln1 = f1.ln();
        let step = (ln1 - ln0) / ((n - 1) as f64);
        for i in 0..n { out.push((ln0 + step * (i as f64)).exp()); }
    }
    out
}

fn alpha_c_db_per_m(w: f64, z0: f64, sigma: f64, f: f64) -> f64 {
    if f <= 0.0 { return 0.0; }
    let rs = (std::f64::consts::PI * f * MU0 / sigma).sqrt();
    let w_eff = w.max(1e-12);
    let r_per_m = rs / w_eff;
    let alpha_np = r_per_m / (2.0 * z0.max(1e-9));
    8.686 * alpha_np
}

fn alpha_d_db_per_m(er: f64, eps_eff: f64, tan_delta: f64, beta: f64) -> f64 {
    if tan_delta <= 0.0 { return 0.0; }
    if (er - 1.0).abs() < 1e-12 { return 0.0; }
    let factor = (eps_eff - 1.0) / (er - 1.0);
    let alpha_np = 0.5 * beta * factor * tan_delta;
    8.686 * alpha_np
}

impl AnalysisRunner for MicrostripRunner {
    fn tick(&mut self, ctx: &mut EngineContext, budget: crate::engine::runtime::Budget) -> Result<String, ErrorReport> {
        // init once
        if self.freqs.is_empty() {
            let (z0, ee) = z0_eps_eff(self.spec.w_m, self.spec.h_m, self.spec.er)?;
            self.z0 = z0;
            self.eps_eff = ee;

            if let Some(sw) = &self.spec.sweep {
                self.freqs = make_freqs(sw);
                self.beta = Vec::with_capacity(self.freqs.len());
                self.alpha_total = Vec::with_capacity(self.freqs.len());
            } else {
                self.freqs = vec![self.spec.f_hz];
                self.beta = Vec::with_capacity(1);
                self.alpha_total = Vec::with_capacity(1);
            }
            self.idx = 0;
            ctx.runtime.progress = 0.0;
            ctx.dataset.events.push(Event::progress(ctx.run_id, 0.0));
        }

        // graceful pause
        if ctx.runtime.pause_requested() {
            ctx.dataset.events.push(Event::state(ctx.run_id, "paused"));
            return Ok("paused".to_string());
        }

        let total = self.freqs.len().max(1);
        let mut work = 0u32;

        while self.idx < self.freqs.len() && work < budget.max_work {
            let f = self.freqs[self.idx];
            let vp = C0 / self.eps_eff.sqrt();
            let beta = 2.0 * std::f64::consts::PI * f / vp;
            let ac = alpha_c_db_per_m(self.spec.w_m, self.z0, self.spec.sigma_s_per_m, f);
            let ad = alpha_d_db_per_m(self.spec.er, self.eps_eff, self.spec.tan_delta, beta);
            self.beta.push(beta);
            self.alpha_total.push(ac + ad);

            self.idx += 1;
            work += 1;

            // graceful stop check between points (ok per microstrip)
            if ctx.runtime.stop_requested() {
                break;
            }
        }

        ctx.runtime.progress = (self.idx as f32) / (total as f32);
        ctx.dataset.events.push(Event::progress(ctx.run_id, ctx.runtime.progress));

        // If done OR stop requested: emit metrics payload (final or partial) and finish.
        if self.idx >= self.freqs.len() || ctx.runtime.stop_requested() {
            // allocate buffers
            let freq_h = ctx.buffers.alloc_f64(self.freqs[..self.idx].to_vec()).0;
            let beta_h = ctx.buffers.alloc_f64(self.beta.clone()).0;
            let alpha_h = ctx.buffers.alloc_f64(self.alpha_total.clone()).0;

            let (amin, amax) = self.alpha_total.iter().fold((f64::INFINITY, f64::NEG_INFINITY), |acc, &v| {
                (acc.0.min(v), acc.1.max(v))
            });

            let payload = MetricsPayload {
                handle: 0, // set by store
                kind: "tline_microstrip".to_string(),
                summary: json!({
                    "z0_ohm": self.z0,
                    "eps_eff": self.eps_eff,
                    "points": self.idx as u32,
                    "alpha_total_db_per_m_min": amin,
                    "alpha_total_db_per_m_max": amax,
                    "stopped": ctx.runtime.stop_requested()
                }),
                buffers: vec![
                    NamedBuffer { name: "freq_hz".into(), dtype: "f64".into(), handle: freq_h, len: self.idx as u32 },
                    NamedBuffer { name: "beta_rad_per_m".into(), dtype: "f64".into(), handle: beta_h, len: self.idx as u32 },
                    NamedBuffer { name: "alpha_total_db_per_m".into(), dtype: "f64".into(), handle: alpha_h, len: self.idx as u32 },
                ],
            };

            let mh = ctx.dataset.insert_metrics(payload);
            ctx.dataset.events.push(Event::metrics_ready(ctx.run_id, mh));

            if ctx.runtime.stop_requested() {
                ctx.dataset.events.push(Event::state(ctx.run_id, "stopped"));
                return Ok("stopped".to_string());
            } else {
                ctx.dataset.events.push(Event::state(ctx.run_id, "done"));
                return Ok("done".to_string());
            }
        }

        Ok("running".to_string())
    }
}
