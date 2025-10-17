mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, {{project-name}}!");
}

/// Funzione esposta a JavaScript
#[wasm_bindgen]
pub fn process_text(input: &str) -> String {
    format!("Rust says: {}", input)
}