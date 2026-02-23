use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkBudgetAnalysis {
    #[serde(default)]
    pub name: Option<String>,
}
