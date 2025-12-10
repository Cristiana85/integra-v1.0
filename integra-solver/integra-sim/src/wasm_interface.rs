#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

use crate::integra_engine::IntegraEngine;
use std::cell::RefCell;

thread_local! {
    static ENGINE: RefCell<IntegraEngine> =
        RefCell::new(IntegraEngine::new("wasm-engine"));
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub struct WasmEngine;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
impl WasmEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmEngine {
        WasmEngine {}
    }

    #[wasm_bindgen]
    pub fn dispatch_json(&self, req: String) -> String {
        ENGINE.with(|e| e.borrow_mut().dispatch_json(&req))
    }
}
