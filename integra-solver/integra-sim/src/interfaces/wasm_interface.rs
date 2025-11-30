use crate::dispatcher::Dispatcher;
use log::{debug, error, info, warn};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmInterface {
    dispatcher: Dispatcher,
}

#[wasm_bindgen]
impl WasmInterface {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmInterface {
        console_error_panic_hook::set_once();
        //info!("Messaggio informativo");
        //debug!("Dettagli di debug");
        //warn!("Un warning!");
        //error!("Errore critico!");
        WasmInterface {
            dispatcher: Dispatcher::new(),
        }
    }

    #[wasm_bindgen]
    pub fn handle_request(&self, input: &str) -> String {
        self.dispatcher.handle_message(input)
    }
}

/*use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;

use crate::solver::SolverController; // il tuo orchestratore FFT/WebGPU

const ADD_ONE_SHADER: &str = include_str!("shaders/add_one.comp.wgsl");

#[wasm_bindgen]
pub struct WasmInterface {
    controller: Rc<RefCell<SolverController>>,
}

#[wasm_bindgen]
impl WasmInterface {
    /// Costruttore chiamabile da JS: new WasmInterface()
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmInterface {
        // opzionale: potresti anche NON usare più #[wasm_bindgen(start)]
        console_error_panic_hook::set_once();
        let _ = wasm_logger::init(wasm_logger::Config::default());

        WasmInterface {
            controller: Rc::new(RefCell::new(SolverController::new())),
        }
    }

    /// Inizializza GPU / FFT / etc (async → Promise)
    #[wasm_bindgen]
    pub fn init(&self) -> js_sys::Promise {
        let controller = self.controller.clone();
        future_to_promise(async move {
            controller
                .borrow_mut()
                .init_gpu_and_fft()
                .await
                .map_err(|e| JsValue::from_str(&format!("init error: {e}")))?;
            Ok(JsValue::UNDEFINED)
        })
    }

    /// Esegue la FFT su un Float32Array → Promise<Float32Array>
    #[wasm_bindgen]
    pub fn run_fft(&self, input: js_sys::Float32Array) -> js_sys::Promise {
        let controller = self.controller.clone();
        let mut vec = input.to_vec(); // copia in Rust

        future_to_promise(async move {
            controller
                .borrow_mut()
                .run_fft(&mut vec)
                .await
                .map_err(|e| JsValue::from_str(&format!("fft error: {e}")))?;

            let out = js_sys::Float32Array::from(vec.as_slice());
            Ok(out.into())
        })
    }
}
*/
