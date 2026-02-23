use serde::{Deserialize, Serialize};

use crate::error::codes::ErrorCode;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorMessage {
    pub code: String,
    pub message: String,
    pub path: Option<String>,
    pub details: Option<serde_json::Value>,
}

impl ErrorMessage {
    /// COSTRUTTORE ESISTENTE (string)
    pub fn new(code: &str, message: &str) -> Self {
        Self {
            code: code.to_string(),
            message: message.to_string(),
            path: None,
            details: None,
        }
    }

    /// NUOVO: accetta l'enum ErrorCode
    pub fn from_code(code: ErrorCode, message: impl Into<String>) -> Self {
        Self {
            code: code.as_str().to_string(),
            message: message.into(),
            path: None,
            details: None,
        }
    }

    pub fn with_path(mut self, path: impl Into<String>) -> Self {
        self.path = Some(path.into());
        self
    }

    pub fn with_details(mut self, details: serde_json::Value) -> Self {
        self.details = Some(details);
        self
    }
}