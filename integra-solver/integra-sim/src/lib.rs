// Punto di ingresso del crate
pub mod interfaces;
pub mod dispatcher;
pub mod controller;
pub mod gpu;

#[cfg(feature = "web")]
use wasm_bindgen::prelude::*;

//#[cfg(feature = "web")]
//use console_error_panic_hook::set_once;
#[cfg(feature = "web")]
use console_log;

/// Setup iniziale per WASM: panic hook + logger
#[cfg(feature = "web")]
#[wasm_bindgen(start)]
pub fn start() {
    // Log gli errori panico su console JS
    console_error_panic_hook::set_once();

    // Imposta il logger a livello "Debug" (puoi ridurre a Info o Warn)
    console_log::init_with_level(log::Level::Debug)
        .expect("failed to initialize logger");
}