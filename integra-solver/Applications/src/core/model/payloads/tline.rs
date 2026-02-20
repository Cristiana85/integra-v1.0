use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MicrostripSubstrate {
    pub er: f64,
    pub h_mm: f64,
    #[serde(default)]
    pub tan_d: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StriplineSubstrate {
    pub er: f64,
    pub b_mm: f64, // distanza piani (slot height)
    #[serde(default)]
    pub tan_d: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceGeom {
    pub w_mm: f64,
    pub t_mm: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conductor {
    #[serde(default)]
    pub sigma: Option<f64>, // S/m
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MicrostripModel {
    pub substrate: MicrostripSubstrate,
    pub trace: TraceGeom,
    #[serde(default)]
    pub conductor: Option<Conductor>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StriplineModel {
    pub substrate: StriplineSubstrate,
    pub trace: TraceGeom,
    #[serde(default)]
    pub conductor: Option<Conductor>,
}
