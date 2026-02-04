use serde::{Deserialize, Serialize};
use crate::utils::ids::{BufferHandle, MetricsHandle};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionStateView {
    pub run_id: u32,
    pub state: String,
    pub progress: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventBatch {
    pub run_id: u32,
    pub events: Vec<Event>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Event {
    #[serde(rename="state")]
    State { run_id: u32, state: String },
    #[serde(rename="progress")]
    Progress { run_id: u32, progress: f32 },
    #[serde(rename="metrics_ready")]
    MetricsReady { run_id: u32, handle: u32 },
    #[serde(rename="error")]
    Error { run_id: u32, code: String, message: String, details: Option<serde_json::Value> },
}

impl Event {
    pub fn state(run_id: u32, state: &str) -> Self {
        Event::State { run_id, state: state.to_string() }
    }
    pub fn progress(run_id: u32, progress: f32) -> Self {
        Event::Progress { run_id, progress }
    }
    pub fn metrics_ready(run_id: u32, handle: u32) -> Self {
        Event::MetricsReady { run_id, handle }
    }
    pub fn error(run_id: u32, code: &str, message: &str, details: Option<serde_json::Value>) -> Self {
        Event::Error { run_id, code: code.to_string(), message: message.to_string(), details }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NamedBuffer {
    pub name: String,
    pub dtype: String, // "f64" | "f32"
    pub handle: u32,
    pub len: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsPayload {
    pub handle: u32,
    pub kind: String,
    pub summary: serde_json::Value,
    pub buffers: Vec<NamedBuffer>,
}
