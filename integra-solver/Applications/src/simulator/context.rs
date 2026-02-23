use crate::core::{
    analysis::AnalysisEnvelope,
    dataset::Dataset,
    model::{ModelEnvelope, ModelPayload},
};

/// Contenitore unico della simulazione corrente (bootstrap §6.1),
/// esteso per supportare N modelli macro + 1 analysis.
pub struct SolverContext {
    pub run_id: String,

    /// MULTI-MODEL: tutti i modelli macro caricati nella sessione
    pub models: Vec<ModelEnvelope>,

    /// SINGLE analysis: definisce cosa/come simulare
    pub analysis: AnalysisEnvelope,

    /// Output
    pub dataset: Option<Dataset>,
}

impl SolverContext {
    pub fn new(run_id: String, models: Vec<ModelEnvelope>, analysis: AnalysisEnvelope) -> Self {
        Self {
            run_id,
            models,
            analysis,
            dataset: None,
        }
    }

    // -------------------------------------------------------------------------
    // Helper per engine: query dei modelli presenti
    // -------------------------------------------------------------------------

    /// Restituisce true se esiste almeno un modello con payload `type` specifico.
    pub fn has_model_type(&self, type_name: &str) -> bool {
        self.models.iter().any(|m| match (&m.payload, type_name) {
            (ModelPayload::TlineMicrostrip(_), "tline_microstrip") => true,
            (ModelPayload::TlineStripline(_), "tline_stripline") => true,
            (ModelPayload::Netlist(_), "netlist") => true,
            (ModelPayload::Touchstone(_), "touchstone") => true,
            _ => false,
        })
    }

    pub fn touchstones(&self) -> impl Iterator<Item = &crate::core::model::payloads::touchstone::TouchstoneModel> {
        self.models.iter().filter_map(|m| match &m.payload {
            ModelPayload::Touchstone(ts) => Some(ts),
            _ => None,
        })
    }

    pub fn netlists(&self) -> impl Iterator<Item = &crate::core::model::payloads::netlist::NetlistModel> {
        self.models.iter().filter_map(|m| match &m.payload {
            ModelPayload::Netlist(nl) => Some(nl),
            _ => None,
        })
    }

    pub fn microstrips(&self) -> impl Iterator<Item = &crate::core::model::payloads::tline::MicrostripModel> {
        self.models.iter().filter_map(|m| match &m.payload {
            ModelPayload::TlineMicrostrip(ms) => Some(ms),
            _ => None,
        })
    }

    pub fn striplines(&self) -> impl Iterator<Item = &crate::core::model::payloads::tline::StriplineModel> {
        self.models.iter().filter_map(|m| match &m.payload {
            ModelPayload::TlineStripline(sl) => Some(sl),
            _ => None,
        })
    }
}