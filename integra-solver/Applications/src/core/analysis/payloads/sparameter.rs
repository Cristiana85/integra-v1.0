use serde::{Deserialize, Serialize};

pub use crate::core::dataset::DatasetSpec;

/// S-Parameter analysis: defines what to extract and how to format it.
///
/// Notes:
/// - MODEL provides the data source (e.g. Touchstone, Netlist)
/// - ANALYSIS selects the simulation (S-parameters) and the output representation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SparameterAnalysis {
    /// Output representation for dependent variables.
    ///
    /// - db_phase: magnitude in dB + phase in degrees
    /// - mag_phase: magnitude (linear) + phase in degrees
    /// - re_im: real + imaginary
    //#[serde(default)]
    //pub format: SparameterFormat,

    /// If true, phase (or imag) variables are included.
    /// If false, only the primary magnitude/real component is exported.
    //#[serde(default = "default_include_secondary")]
    //pub include_secondary: bool,

    #[serde(default)]
    pub strict: bool,

    /// SPEC dataset richiesta dall’utente: quali variabili dipendenti riempire
    pub dataset: DatasetSpec,
}

/*fn default_include_secondary() -> bool {
    true
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SparameterFormat {
    DbPhase,
    MagPhase,
    ReIm,
}

impl Default for SparameterFormat {
    fn default() -> Self {
        SparameterFormat::DbPhase
    }
}*/
