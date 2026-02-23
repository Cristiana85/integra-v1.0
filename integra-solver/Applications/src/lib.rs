pub mod wasm;
pub mod core;
pub mod simulator;
pub mod error;
pub mod utils;

pub use wasm::session::Session;


#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

//#[cfg(feature = "web")]
//use console_error_panic_hook::set_once;
//#[cfg(target_arch = "wasm32")]
//use console_log;

/// Setup iniziale per WASM: panic hook + logger
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
pub fn start() {
    // Log gli errori panico su console JS
    //console_error_panic_hook::set_once();

    // Imposta il logger a livello "Debug" (puoi ridurre a Info o Warn)
    //console_log::init_with_level(log::Level::Debug)
    //    .expect("failed to initialize logger");
}