pub mod wasm;
pub mod analysis;
pub mod dataset;
pub mod engine;
pub mod netlist;
pub mod model;
pub mod utils;
pub mod error;

pub use wasm::session::SolverSession;


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