use serde::{Deserialize, Serialize};

use crate::error::{self, ErrorCode, Result};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MsgType {
    Run,
    Progress,
    Done,
    Error,
    Log,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Envelope<T = serde_json::Value> {
    pub r#type: MsgType,
    pub id: String,
    pub payload: T,
}

pub fn parse_json<T: for<'de> Deserialize<'de>>(s: &str) -> Result<T> {
    serde_json::from_str(s).map_err(|e| {
        error::err(ErrorCode::JsonInvalid, format!("Invalid JSON: {}", e))
    })
}

pub fn to_json<T: Serialize>(v: &T) -> Result<String> {
    serde_json::to_string(v).map_err(|e| error::err(ErrorCode::Internal, e.to_string()))
}
