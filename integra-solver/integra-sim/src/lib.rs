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
#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}