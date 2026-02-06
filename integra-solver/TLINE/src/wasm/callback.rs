use wasm_bindgen::prelude::*;

#[derive(Default)]
pub struct CallbackHub {
    pub on_message: Option<js_sys::Function>, // unico canale: envelope json string
}

impl CallbackHub {
    pub fn emit(&self, json_msg: &str) {
        if let Some(cb) = &self.on_message {
            let _ = cb.call1(&JsValue::NULL, &JsValue::from_str(json_msg));
        }
    }
}
