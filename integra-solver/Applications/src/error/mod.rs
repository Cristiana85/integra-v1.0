pub mod codes;
pub mod types;

pub use codes::ErrorCode;
pub use types::ErrorMessage;

pub type Result<T> = std::result::Result<T, ErrorMessage>;

pub fn err(code: ErrorCode, message: impl Into<String>) -> ErrorMessage {
    ErrorMessage::new(code.as_str(), message)
}

/// Helper: errore "invalid field value" con path + details
pub fn invalid(code: ErrorCode, path: &str, message: impl Into<String>, details: serde_json::Value) -> ErrorMessage {
    err(code, message).with_path(path).with_details(details)
}
