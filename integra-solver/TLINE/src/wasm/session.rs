use js_sys::Function;
use wasm_bindgen::{JsCast, JsValue};
use wasm_bindgen::prelude::wasm_bindgen;

use crate::analysis::types::{Analysis, AnalysisKind};
use crate::dataset::store::DatasetStore;
use crate::dataset::types::{Event, SessionStateView};
use crate::engine::runtime::{Budget, EngineRuntime, SessionState};
use crate::engine::traits::{AnalysisRunner, EngineContext};
use crate::engine::tline::microstrip::MicrostripRunner;
use crate::error::{codes, ErrorReport};
use crate::wasm::bridge::{err, ok, parse};
use crate::dataset::buffers::BufferStore;
use crate::wasm::callback::{CallbackConfig, CallbackSink};

#[derive(Default)]
struct SessionConfig {
    callback: CallbackConfig,
}

#[wasm_bindgen]
pub struct SolverSession {
    cfg: SessionConfig,

    state: SessionState,
    analysis: Option<Analysis>,

    runtime: EngineRuntime,

    dataset: DatasetStore,
    buffers: BufferStore,

    callback: CallbackSink,

    runner: Option<Box<dyn AnalysisRunner>>,
    run_id: u32,
}

#[wasm_bindgen]
impl SolverSession {
    #[wasm_bindgen(constructor)]
    pub fn new(config: JsValue) -> SolverSession {
        let mut cfg = SessionConfig::default();

        // config: { callbacks: { enabled, maxBatch, maxHz } }
        if !config.is_null() && !config.is_undefined() {
            let obj = js_sys::Object::from(config);
            let callbacks = js_sys::Reflect::get(&obj, &JsValue::from_str("callbacks")).ok();
            if let Some(cbv) = callbacks {
                if cbv.is_object() {
                    let cobj = js_sys::Object::from(cbv);
                    if let Ok(v) = js_sys::Reflect::get(&cobj, &JsValue::from_str("enabled")) {
                        if let Some(b) = v.as_bool() { cfg.callback.enabled = b; }
                    }
                    if let Ok(v) = js_sys::Reflect::get(&cobj, &JsValue::from_str("maxBatch")) {
                        if let Some(n) = v.as_f64() { cfg.callback.max_batch = n.max(1.0) as usize; }
                    }
                    if let Ok(v) = js_sys::Reflect::get(&cobj, &JsValue::from_str("maxHz")) {
                        if let Some(n) = v.as_f64() { cfg.callback.max_hz = n.max(0.1); }
                    }
                }
            }
        }

        let callback = CallbackSink::new(cfg.callback.clone());

        SolverSession {
            cfg,
            state: SessionState::Idle,
            analysis: None,
            runtime: EngineRuntime::default(),
            dataset: DatasetStore::new(),
            buffers: BufferStore::new(),
            callback,
            runner: None,
            run_id: 0,
        }
    }

    pub fn set_callback(&mut self, cb: JsValue) -> JsValue {
        if cb.is_null() || cb.is_undefined() {
            self.callback.set(None);
            return ok(());
        }
        let f: Function = match cb.dyn_into() {
            Ok(f) => f,
            Err(_) => return err(ErrorReport::new(codes::INPUT_INVALID, "callback must be a function")),
        };
        self.callback.set(Some(f));
        ok(())
    }

    pub fn set_analysis(&mut self, analysis_json: JsValue) -> JsValue {
        let analysis: Analysis = match parse(analysis_json) {
            Ok(v) => v,
            Err(e) => return err(e),
        };
        if let Err(e) = analysis.validate() {
            return err(e);
        }
        self.analysis = Some(analysis);
        self.state = SessionState::Ready;
        ok(())
    }

    pub fn start(&mut self) -> JsValue {
        if self.state != SessionState::Ready && self.state != SessionState::Paused {
            return err(ErrorReport::new(codes::STATE_INVALID, "start allowed only in Ready/Paused"));
        }
        let analysis = match self.analysis.clone() {
            Some(a) => a,
            None => return err(ErrorReport::new(codes::NOT_READY, "analysis not set")),
        };

        // select runner
        let runner: Box<dyn AnalysisRunner> = match analysis.kind {
            AnalysisKind::TLineMicrostrip(spec) => Box::new(MicrostripRunner::new(spec)),
            _ => return err(ErrorReport::new(codes::NOT_READY, "analysis kind not implemented yet")),
        };

        self.run_id = self.run_id.wrapping_add(1).max(1);
        self.dataset.reset_for_run(self.run_id);
        self.runtime.reset();
        self.runtime.request_resume();

        self.runner = Some(runner);

        // emit state event
        self.dataset.events.push(Event::state(self.run_id, "running"));

        self.state = SessionState::Running;
        ok(())
    }

    pub fn pause(&mut self) -> JsValue {
        if self.state != SessionState::Running {
            return err(ErrorReport::new(codes::STATE_INVALID, "pause only in Running"));
        }
        self.runtime.request_pause();
        self.dataset.events.push(Event::state(self.run_id, "pausing"));
        ok(())
    }

    pub fn resume(&mut self) -> JsValue {
        if self.state != SessionState::Paused {
            return err(ErrorReport::new(codes::STATE_INVALID, "resume only in Paused"));
        }
        self.runtime.request_resume();
        self.dataset.events.push(Event::state(self.run_id, "running"));
        self.state = SessionState::Running;
        ok(())
    }

    pub fn stop(&mut self) -> JsValue {
        if self.state != SessionState::Running && self.state != SessionState::Paused {
            return err(ErrorReport::new(codes::STATE_INVALID, "stop only in Running/Paused"));
        }
        self.runtime.request_stop_graceful();
        self.dataset.events.push(Event::state(self.run_id, "stopping"));
        ok(())
    }

    /// FE calls this in a RAF loop (or timer) to progress computation in chunks.
    pub fn tick(&mut self, budget_json: JsValue) -> JsValue {
        if self.state != SessionState::Running {
            // allow tick in Paused to complete graceful transitions if needed
            if self.state != SessionState::Paused {
                return err(ErrorReport::new(codes::STATE_INVALID, "tick only in Running/Paused"));
            }
        }

        let budget: Budget = match parse(budget_json) {
            Ok(v) => v,
            Err(_) => Budget::default(),
        };

        let mut ctx = EngineContext {
            run_id: self.run_id,
            runtime: &mut self.runtime,
            dataset: &mut self.dataset,
            buffers: &mut self.buffers,
        };

        let Some(runner) = self.runner.as_mut() else {
            return err(ErrorReport::new(codes::NOT_READY, "runner not created; call start()"));
        };

        let status = match runner.tick(&mut ctx, budget) {
            Ok(s) => s,
            Err(e) => {
                self.dataset.events.push(Event::error(self.run_id, &e.code, &e.message, e.details));
                self.state = SessionState::Errored;
                return ok(self.get_state_view());
            }
        };

        // update state from runtime/status
        match status.as_str() {
            "paused" => self.state = SessionState::Paused,
            "stopped" => self.state = SessionState::Stopped,
            "done" => self.state = SessionState::Done,
            _ => {}
        }

        // flush callback if enabled and enough events accumulated
        if self.callback.is_active() && self.dataset.events.len() >= self.callback.cfg.max_batch {
            let batch = self.dataset.events.drain_batch(self.run_id);
            let _ = self.callback.try_flush(&batch); // swallow callback errors for now
        }

        ok(self.get_state_view())
    }

    pub fn drain_events(&mut self) -> JsValue {
        let batch = self.dataset.events.drain_batch(self.run_id);
        ok(batch)
    }

    pub fn get_state(&self) -> JsValue {
        ok(self.get_state_view())
    }

    pub fn take_metrics(&mut self, handle: u32) -> JsValue {
        match self.dataset.take_metrics(handle) {
            Ok(payload) => ok(payload),
            Err(e) => err(e),
        }
    }

    // buffer bridge for TypedArray
    pub fn buffer_ptr(&self, handle: u32) -> JsValue {
        match self.buffers.ptr_len(crate::utils::ids::BufferHandle(handle)) {
            Ok((ptr, _)) => ok(ptr as u32),
            Err(e) => err(e),
        }
    }
    pub fn buffer_len(&self, handle: u32) -> JsValue {
        match self.buffers.ptr_len(crate::utils::ids::BufferHandle(handle)) {
            Ok((_, len)) => ok(len as u32),
            Err(e) => err(e),
        }
    }
    pub fn free_buffer(&mut self, handle: u32) -> JsValue {
        ok(self.buffers.free(crate::utils::ids::BufferHandle(handle)))
    }

    fn get_state_view(&self) -> SessionStateView {
        SessionStateView {
            run_id: self.run_id,
            state: self.state.as_str().to_string(),
            progress: self.runtime.progress,
        }
    }
}
