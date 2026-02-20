// src/core/model/validate.rs

use crate::error::Result;
use super::ModelEnvelope;

pub fn validate_structural(_m: &ModelEnvelope) -> Result<()> {
    // Qui fai validazioni "generiche" (version, campi minimi, ecc.)
    Ok(())
}
