use crate::core::model::Model;

// qui in futuro: parse/validate e costruisci runtime specifico.
// per ora dimostrazione: lasciamo il json libero.
pub fn validate(_model: &Model) -> crate::error::Result<()> {
    Ok(())
}
