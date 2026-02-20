use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetlistModel {
    pub format: String, // "spice" | "touchstone" | "custom"
    pub text: String,   // o in futuro: { "url": "..."} oppure "lines": [...]
}
