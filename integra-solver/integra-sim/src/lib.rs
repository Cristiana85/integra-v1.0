// src/lib.rs
pub mod protocol;
pub mod core;
pub mod gpu;
pub mod import;

pub mod dispatcher;
pub mod integra_engine;
pub mod wasm_interface;
pub mod native_interface;
pub mod storage;

// re-export comodo se vuoi usare il crate dall’esterno
pub use integra_engine::IntegraEngine;
pub use native_interface::NativeInterface;


#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

//#[cfg(feature = "web")]
//use console_error_panic_hook::set_once;
#[cfg(target_arch = "wasm32")]
use console_log;

/// Setup iniziale per WASM: panic hook + logger
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
pub fn start() {
    // Log gli errori panico su console JS
    console_error_panic_hook::set_once();

    // Imposta il logger a livello "Debug" (puoi ridurre a Info o Warn)
    console_log::init_with_level(log::Level::Debug)
        .expect("failed to initialize logger");
}