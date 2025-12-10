use serde::{Serialize, Deserialize};

// Per native (thread multipli) vogliamo Send + Sync
#[cfg(not(target_arch = "wasm32"))]
pub type UpdateCallback = Box<dyn Fn(WasmUpdate) + Send + 'static>;

// Per wasm invece NO Send/Sync (la closure cattura js_sys::Function che non è Send)
#[cfg(target_arch = "wasm32")]
pub type UpdateCallback = Box<dyn Fn(WasmUpdate) + 'static>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WasmUpdate {
    pub job_id: String,
    pub phase: String,     // es: "building_matrix", "solving", "postprocessing"
    pub percent: f32,      // 0.0 .. 100.0
    pub message: String,   // testo libero
}