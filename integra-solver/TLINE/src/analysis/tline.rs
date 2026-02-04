use serde::{Deserialize, Serialize};
use crate::error::{codes, ErrorReport};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MicrostripSpec {
    pub w_m: f64,
    pub h_m: f64,
    #[serde(default)]
    pub t_m: f64,

    pub er: f64,
    #[serde(default)]
    pub tan_delta: f64,

    #[serde(default = "default_sigma")]
    pub sigma_s_per_m: f64,

    // either single freq or sweep
    #[serde(default)]
    pub f_hz: f64,

    #[serde(default)]
    pub sweep: Option<SweepSpec>,
}

fn default_sigma() -> f64 { 5.8e7 }

impl MicrostripSpec {
    pub fn validate(&self) -> Result<(), ErrorReport> {
        if !(self.w_m > 0.0) || !(self.h_m > 0.0) {
            return Err(ErrorReport::new(codes::INPUT_INVALID, "w_m and h_m must be > 0"));
        }
        if self.t_m < 0.0 { return Err(ErrorReport::new(codes::INPUT_INVALID, "t_m must be >= 0")); }
        if !(self.er >= 1.0) { return Err(ErrorReport::new(codes::INPUT_INVALID, "er must be >= 1")); }
        if self.tan_delta < 0.0 { return Err(ErrorReport::new(codes::INPUT_INVALID, "tan_delta must be >= 0")); }
        if !(self.sigma_s_per_m > 0.0) { return Err(ErrorReport::new(codes::INPUT_INVALID, "sigma_s_per_m must be > 0")); }

        if let Some(sw) = &self.sweep { sw.validate()?; }
        else {
            if !(self.f_hz > 0.0) {
                return Err(ErrorReport::new(codes::INPUT_INVALID, "provide f_hz>0 or sweep"));
            }
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SweepSpec {
    pub f_start_hz: f64,
    pub f_stop_hz: f64,
    pub points: u32,
    #[serde(default = "default_kind")]
    pub kind: String, // "lin" | "log"
}

fn default_kind() -> String { "lin".to_string() }

impl SweepSpec {
    pub fn validate(&self) -> Result<(), ErrorReport> {
        if !(self.f_start_hz > 0.0) || !(self.f_stop_hz > 0.0) {
            return Err(ErrorReport::new(codes::INPUT_INVALID, "f_start_hz and f_stop_hz must be > 0"));
        }
        if self.f_stop_hz <= self.f_start_hz {
            return Err(ErrorReport::new(codes::INPUT_INVALID, "f_stop_hz must be > f_start_hz"));
        }
        if self.points < 2 { return Err(ErrorReport::new(codes::INPUT_INVALID, "points must be >= 2")); }
        if self.kind != "lin" && self.kind != "log" {
            return Err(ErrorReport::new(codes::INPUT_INVALID, r#"kind must be "lin" or "log""#));
        }
        Ok(())
    }
}
