use js_sys::Function;
use wasm_bindgen::JsValue;
use crate::dataset::types::EventBatch;
use crate::error::ErrorReport;

#[derive(Debug, Clone)]
pub struct CallbackConfig {
    pub enabled: bool,
    pub max_batch: usize,
    pub max_hz: f64, // placeholder: se vuoi throttling time-based
}

impl Default for CallbackConfig {
    fn default() -> Self {
        Self { enabled: true, max_batch: 32, max_hz: 30.0 }
    }
}

pub struct CallbackSink {
    pub cfg: CallbackConfig,
    cb: Option<Function>,
}

impl CallbackSink {
    pub fn new(cfg: CallbackConfig) -> Self { Self { cfg, cb: None } }
    pub fn set(&mut self, cb: Option<Function>) {
        if !self.cfg.enabled { self.cb = None; return; }
        self.cb = cb;
    }
    pub fn is_active(&self) -> bool { self.cfg.enabled && self.cb.is_some() }

    pub fn try_flush(&self, batch: &EventBatch) -> Result<(), ErrorReport> {
        if !self.is_active() { return Ok(()); }
        let cb = self.cb.as_ref().unwrap();
        let payload = serde_wasm_bindgen::to_value(batch)
            .map_err(|e| ErrorReport::new("INTERNAL", format!("event serialize error: {e}")))?;
        cb.call1(&JsValue::NULL, &payload)
            .map_err(|e| ErrorReport::new("INTERNAL", format!("callback error: {:?}", e)))?;
        Ok(())
    }
}
