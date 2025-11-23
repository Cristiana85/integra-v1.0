use wasm_bindgen::prelude::*;
use std::cell::RefCell;
use std::rc::Rc;

use crate::core::integra_solver::IntegraSolver;

thread_local! {
    static SOLVER: Rc<RefCell<IntegraSolver>> = Rc::new(RefCell::new(IntegraSolver::new()));
}

#[wasm_bindgen]
pub fn import_touchstone(json_str: &str) -> Result<(), JsValue> {
    SOLVER.with(|solver| {
        solver
            .borrow_mut()
            .write_touchstone(json_str)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    })
}

#[wasm_bindgen]
pub fn remove_touchstone(id: &str) -> Result<(), JsValue> {
    SOLVER.with(|solver| {
        solver
            .borrow_mut()
            .delete_touchstone(id)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    })
}

#[wasm_bindgen]
pub fn get_touchstone(id: &str) -> Result<String, JsValue> {
    SOLVER.with(|solver| {
        solver
            .borrow()
            .get_touchstone(id)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    })
}

