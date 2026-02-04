use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SessionState {
    Idle,
    Ready,
    Running,
    Paused,
    Stopped,
    Done,
    Errored,
}

impl SessionState {
    pub fn as_str(&self) -> &'static str {
        match self {
            SessionState::Idle => "idle",
            SessionState::Ready => "ready",
            SessionState::Running => "running",
            SessionState::Paused => "paused",
            SessionState::Stopped => "stopped",
            SessionState::Done => "done",
            SessionState::Errored => "errored",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Budget {
    /// max “work units” per tick (per microstrip sweep = freq points)
    #[serde(default = "default_work")]
    pub max_work: u32,
}

fn default_work() -> u32 {
    64
}

impl Default for Budget {
    fn default() -> Self {
        Self {
            max_work: default_work(),
        }
    }
}

#[derive(Default)]
pub struct EngineRuntime {
    pause_req: bool,
    stop_req: bool,
    pub progress: f32,
}

impl EngineRuntime {
    pub fn reset(&mut self) {
        self.pause_req = false;
        self.stop_req = false;
        self.progress = 0.0;
    }
    pub fn request_pause(&mut self) {
        self.pause_req = true;
    }
    pub fn request_resume(&mut self) {
        self.pause_req = false;
    }
    pub fn request_stop_graceful(&mut self) {
        self.stop_req = true;
    }

    pub fn pause_requested(&self) -> bool {
        self.pause_req
    }
    pub fn stop_requested(&self) -> bool {
        self.stop_req
    }
}
