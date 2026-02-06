pub mod codes;
pub mod types;

use codes::ErrorCode;
use types::ErrorMessage;

pub type Result<T> = std::result::Result<T, ErrorMessage>;

pub fn err(code: ErrorCode, message: impl Into<String>) -> ErrorMessage {
    ErrorMessage::new(code.as_str(), message)
}
