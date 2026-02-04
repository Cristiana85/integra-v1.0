use wasm_bindgen::JsValue;
use crate::error::{codes, ErrorReport};

#[derive(serde::Serialize)]
pub struct OkWrap<T> { pub ok: bool, pub value: T }

#[derive(serde::Serialize)]
pub struct ErrWrap { pub ok: bool, pub error: ErrorReport }

pub fn ok<T: serde::Serialize>(value: T) -> JsValue {
    serde_wasm_bindgen::to_value(&OkWrap { ok: true, value }).unwrap()
}

pub fn err(e: ErrorReport) -> JsValue {
    serde_wasm_bindgen::to_value(&ErrWrap { ok: false, error: e }).unwrap()
}

pub fn parse<T: for<'de> serde::Deserialize<'de>>(v: JsValue) -> Result<T, ErrorReport> {
    serde_wasm_bindgen::from_value(v).map_err(|e| {
        ErrorReport::new(codes::INPUT_INVALID, format!("JSON parse error: {e}"))
    })
}
