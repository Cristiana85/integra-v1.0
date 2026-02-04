use serde::{Deserialize, Serialize};
use crate::error::ErrorReport;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SParamsSpec {
    // TODO: freq sweep, ports, z0, metric defs, solver settings
}

impl SParamsSpec {
    pub fn validate(&self) -> Result<(), ErrorReport> {
        Ok(())
    }
}
