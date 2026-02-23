pub mod common;
pub mod tline;
pub mod sparameter;
pub mod link_budget;
pub mod thermal_pcb;

use serde::{Deserialize, Serialize};

pub use common::{AnalysisCommon, Sweep};
pub use sparameter::{SparameterAnalysis};

use link_budget::LinkBudgetAnalysis;
use tline::TlineAnalysis;

// re-exported above
//use link_budget::LinkBudgetAnalysis;
//use thermal_pcb::ThermalPcbAnalysis;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum AnalysisPayload {
    Tline(TlineAnalysis),
    Sparameter(SparameterAnalysis),
    LinkBudget(LinkBudgetAnalysis),
}
