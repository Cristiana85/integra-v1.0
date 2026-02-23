use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TouchstoneModel {
    pub n_ports: u32,

    /// "s" | "z" | "y" (per ora)
    #[serde(default = "default_param_type")]
    pub param_type: String,

    /// "ma" | "db" | "ri" (Touchstone common)
    #[serde(default = "default_format")]
    pub format: String,

    /// "hz" | "khz" | "mhz" | "ghz"
    #[serde(default = "default_freq_unit")]
    pub freq_unit: String,

    /// Zref (Ohm), di solito 50
    #[serde(default = "default_zref")]
    pub zref_ohm: f64,

    /// Contenuto del file .sNp (testo)
    /// (in futuro puoi aggiungere anche base64 o URL, ma meglio partire testo)
    pub content: String,
}

fn default_param_type() -> String { "s".to_string() }
fn default_format() -> String { "ma".to_string() }
fn default_freq_unit() -> String { "ghz".to_string() }
fn default_zref() -> f64 { 50.0 }