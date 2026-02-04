#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

use crate::core_engine::IntegraEngine;
use std::cell::RefCell;

// src/core/controller.rs
use crate::comm::{
    update::{UpdateCallback, WasmUpdate}
};

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
    pub fn set_update_callback(&self, cb: js_sys::Function) {
        ENGINE.with(|e| {
            let mut eng = e.borrow_mut();

            let rust_cb: UpdateCallback = Box::new(move |update: WasmUpdate| {
                let json = serde_json::to_string(&update).unwrap_or_else(|_| "{}".into());
                let _ = cb.call1(&JsValue::NULL, &JsValue::from_str(&json));
            });

            eng.set_update_callback(rust_cb);
        });
    }

    #[wasm_bindgen]
    pub fn dispatch_json(&self, req: String) -> String {
        ENGINE.with(|e| e.borrow_mut().dispatch_json(&req))
    }

    // Hook per pause/resume/cancel: compilano anche in wasm, ma finché la sim non è chunked
    // l’effetto non sarà “visibile”.
    #[wasm_bindgen]
    pub fn pause(&self) {
        ENGINE.with(|e| e.borrow().pause());
    }

    #[wasm_bindgen]
    pub fn resume(&self) {
        ENGINE.with(|e| e.borrow().resume());
    }

    #[wasm_bindgen]
    pub fn cancel(&self) {
        ENGINE.with(|e| e.borrow().cancel());
    }

}
