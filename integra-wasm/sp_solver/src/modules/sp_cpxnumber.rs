pub mod sp_cpxnumber {
    use wasm_bindgen::prelude::*;
    
    #[wasm_bindgen]
    pub struct ComplexNumber {
        real: f64,
        imag: f64,
    }
    
    #[wasm_bindgen]
    impl ComplexNumber {
        #[wasm_bindgen(constructor)]
        pub fn new(real: f64, imag: f64) -> ComplexNumber {
            ComplexNumber { real, imag }
        }
    }
   
}