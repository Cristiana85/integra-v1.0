pub mod request;
pub mod response;
pub mod error;
pub mod update;
pub use update::{UpdateCallback, WasmUpdate};

pub const PROTOCOL_VERSION: &str = "1.0";

pub use request::*;
pub use response::*;
pub use error::*;
