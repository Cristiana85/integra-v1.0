use crate::core::model::ModelEnvelope;

// qui in futuro: parse/validate e costruisci runtime specifico.
// per ora dimostrazione: lasciamo il json libero.
pub fn validate(_model: &ModelEnvelope) -> crate::error::Result<()> {
    Ok(())
}
