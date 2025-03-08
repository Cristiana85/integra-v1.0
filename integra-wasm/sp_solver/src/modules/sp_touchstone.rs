// Touchstone file parsing module
pub mod sp_touchstone {
    use js_sys::Array;
    use serde::{Deserialize, Serialize};
    use wasm_bindgen::prelude::*;
    use wasm_bindgen::JsValue;

    #[wasm_bindgen]
    #[derive(Clone, Serialize, Deserialize)]
    pub struct SPTouchstone {
        name: String,
        frequencies: Vec<f64>,
        s_matrix: Vec<Vec<(f64, f64)>>, // Matrice di scattering con coppie (real, imag)
    }

    #[wasm_bindgen]
    impl SPTouchstone {
        #[wasm_bindgen(constructor)]
        pub fn new(
            name: String,
            frequencies: Vec<f64>,
            s_matrix: Vec<Vec<(f64, f64)>>,
        ) -> SPTouchstone {
            SPTouchstone {
                name,
                frequencies,
                s_matrix,
            }
        }
        #[wasm_bindgen(getter)]
        pub fn get_name(&self) -> String {
            self.name.clone()
        }

        #[wasm_bindgen(getter)]
        pub fn get_frequencies(&self) -> Vec<f64> {
            self.frequencies.clone()
        }

        #[wasm_bindgen(getter)]
        pub fn get_s_matrix(&self) -> JsValue {
            serde_wasm_bindgen::to_value(&self.s_matrix).unwrap()
        }
    }
}
