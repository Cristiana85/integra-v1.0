use wasm_bindgen::prelude::*;

// Expose a Rust function to JavaScript
#[wasm_bindgen]
pub fn process_text(input: &str) -> String {
    format!("Processed: {}", input)
}
