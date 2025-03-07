use wasm_bindgen::prelude::*;
use std::collections::HashMap;
use std::sync::Mutex;
use std::f64;
use lazy_static::lazy_static; // ✅ Ensure lazy_static is imported
 
// ✅ Struct for Touchstone Data
#[derive(Debug, Clone)]
pub  struct TouchstoneData {
    frequencies: Vec<f64>,
    s_matrix: Vec<Vec<Vec<(f64, f64)>>>, // (real, imag)
}

// ✅ Global storage for imported Touchstone files
lazy_static! {
    static ref STORAGE: Mutex<HashMap<String, TouchstoneData>> = Mutex::new(HashMap::new());
}

// ✅ Allocate memory for frequency + S-matrix
#[wasm_bindgen]
pub fn allocate_memory(num_freqs: usize, num_ports: usize) -> Vec<f64> {
    vec![0.0; num_freqs * (1 + num_ports * num_ports * 2)] // 1 freq + 2 per S-matrix entry
}

// ✅ Import data from a buffer
#[wasm_bindgen]
pub fn import_data(filename: String, buffer: Vec<f64>, num_freqs: usize, num_ports: usize) {
    let mut frequencies = Vec::with_capacity(num_freqs);
    let mut s_matrix = vec![vec![vec![(0.0, 0.0); num_ports]; num_ports]; num_freqs];

    let mut index = 0;

    // ✅ Store frequencies
    for _ in 0..num_freqs {
        frequencies.push(buffer[index]);
        index += 1;
    }

    // ✅ Store S-matrix values
    for f in 0..num_freqs {
        for i in 0..num_ports {
            for j in 0..num_ports {
                let real_part = buffer[index];
                let imag_part = buffer[index + 1];
                index += 2;
                s_matrix[f][i][j] = (real_part, imag_part);
            }
        }
    }

    STORAGE.lock().unwrap().insert(filename, TouchstoneData { frequencies, s_matrix });
}

// ✅ Retrieve stored data
#[wasm_bindgen]
pub fn get_data(filename: String) -> Option<Vec<f64>> {
    let storage = STORAGE.lock().unwrap();
    if let Some(data) = storage.get(&filename) {
        let mut buffer = Vec::new();
        buffer.extend(&data.frequencies);

        for f in 0..data.frequencies.len() {
            for i in 0..data.s_matrix[f].len() {
                for j in 0..data.s_matrix[f][i].len() {
                    let (real, imag) = data.s_matrix[f][i][j];
                    buffer.push(real);
                    buffer.push(imag);
                }
            }
        }

        Some(buffer)
    } else {
        None
    }
}
