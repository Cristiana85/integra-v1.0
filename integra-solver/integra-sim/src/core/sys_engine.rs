// src/core/controller.rs
use crate::comm::{
    ErrorPayload, PROTOCOL_VERSION, RequestEnvelope, ResponseEnvelope, SolverTestRequest, SolverTestResponse, update::{UpdateCallback, WasmUpdate}
};

use std::{sync::{Arc, atomic::{AtomicBool, Ordering}}, time::{Duration, SystemTime, UNIX_EPOCH}};
use serde_json::json;

/// Placeholder di strutture che in futuro saranno vere
#[derive(Default)]
pub struct Netlist;
#[derive(Default)]
pub struct Dataset;
#[derive(Default)]
pub struct GpuContext;

/// Controller principale del simulatore.
/// Qui vivono lo stato e i metodi "business" (simulazioni, import, ecc.)
pub struct SimulationController {
    netlist: Netlist,
    dataset: Dataset,
    gpu: GpuContext,
    update_cb: Option<UpdateCallback>,
    paused: Arc<AtomicBool>,
    cancelled: Arc<AtomicBool>,
}

impl SimulationController {
    pub fn new() -> Self {
        Self {
            netlist: Netlist::default(),
            dataset: Dataset::default(),
            gpu: GpuContext::default(),
            update_cb: None,
            paused: Arc::new(AtomicBool::new(false)),
            cancelled: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn set_update_callback(&mut self, cb: Option<UpdateCallback>) {
        self.update_cb = cb;
    }

    fn post_update(&self, update: WasmUpdate) {
        if let Some(cb) = &self.update_cb {
            cb(update);
        }
    }

    // Sleep per "pausa" mentre siamo in pausa
    #[cfg(not(target_arch = "wasm32"))]
    fn pause_sleep() {
        std::thread::sleep(Duration::from_millis(100));
    }

    #[cfg(target_arch = "wasm32")]
    fn pause_sleep() {
        // su wasm non possiamo bloccare il thread: no-op
        // (in un web worker va comunque bene: la pausa sarà solo "logica")
    }

    // Sleep per simulare il lavoro di uno step (solo per test)
    #[cfg(not(target_arch = "wasm32"))]
    fn work_sleep() {
        std::thread::sleep(Duration::from_millis(200));
    }

    #[cfg(target_arch = "wasm32")]
    fn work_sleep() {
        // su wasm non facciamo sleep; lo step viene eseguito subito
    }
    

    // --- wiring flags verso l’esterno ---

    pub fn paused_flag(&self) -> Arc<AtomicBool> {
        self.paused.clone()
    }

    pub fn cancelled_flag(&self) -> Arc<AtomicBool> {
        self.cancelled.clone()
    }


    // --- API di controllo usate dall’engine ---

    pub fn pause(&self) {
        self.paused.store(true, Ordering::Relaxed);
    }

    pub fn resume(&self) {
        self.paused.store(false, Ordering::Relaxed);
    }

    pub fn cancel(&self) {
        self.cancelled.store(true, Ordering::Relaxed);
    }

    pub fn reset_flags(&self) {
        self.paused.store(false, Ordering::Relaxed);
        self.cancelled.store(false, Ordering::Relaxed);
    }



    // --- simulation faking ---

    pub fn handle_solver_test(
        &mut self,
        req: RequestEnvelope,
        payload: SolverTestRequest,
    ) -> ResponseEnvelope {
        self.reset_flags();

        self.post_update(WasmUpdate {
            job_id: req.id.clone(),
            phase: "start".into(),
            percent: 0.0,
            message: "Starting test".into(),
        });

        let total_steps = 10;

        for step in 0..=total_steps {
            if self.cancelled.load(Ordering::Relaxed) {
                self.post_update(WasmUpdate {
                    job_id: req.id.clone(),
                    phase: "cancelled".into(),
                    percent: (step as f32 / total_steps as f32) * 100.0,
                    message: "Cancelled by user".into(),
                });

                return ResponseEnvelope {
                    id: req.id,
                    version: PROTOCOL_VERSION.into(),
                    message_type: "solver_test_result".into(),
                    ok: false,
                    payload: json!(null),
                    error: Some(ErrorPayload {
                        code: "CANCELLED".into(),
                        message: "Simulation cancelled by user".into(),
                    }),
                };
            }

            while self.paused.load(Ordering::Relaxed) {
                Self::pause_sleep();
                if self.cancelled.load(Ordering::Relaxed) {
                    break;
                }
            }

            Self::work_sleep();

            let percent = (step as f32 / total_steps as f32) * 100.0;

            self.post_update(WasmUpdate {
                job_id: req.id.clone(),
                phase: "running".into(),
                percent,
                message: format!("Step {step}/{total_steps}"),
            });
        }

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as i64;

        let response = SolverTestResponse {
            echo: payload.message,
            timestamp_ms: now,
        };

        self.post_update(WasmUpdate {
            job_id: req.id.clone(),
            phase: "done".into(),
            percent: 100.0,
            message: "Completed test".into(),
        });

        ResponseEnvelope {
            id: req.id,
            version: PROTOCOL_VERSION.into(),
            message_type: "solver_test_result".into(),
            ok: true,
            payload: serde_json::to_value(response).unwrap(),
            error: None,
        }
    }

    /// Placeholder per future API del simulatore
    /// (nomi d'esempio – li riempiremo più avanti)
    pub fn run_ac(&mut self, _req: RequestEnvelope) -> ResponseEnvelope {
        ResponseEnvelope {
            id: _req.id,
            version: PROTOCOL_VERSION.into(),
            message_type: "ac_result".into(),
            ok: false,
            payload: json!(null),
            error: Some(ErrorPayload {
                code: "NOT_IMPLEMENTED".into(),
                message: "AC analysis not implemented yet".into(),
            }),
        }
    }

    pub fn run_sparam(&mut self, _req: RequestEnvelope) -> ResponseEnvelope {
        ResponseEnvelope {
            id: _req.id,
            version: PROTOCOL_VERSION.into(),
            message_type: "sparam_result".into(),
            ok: false,
            payload: json!(null),
            error: Some(ErrorPayload {
                code: "NOT_IMPLEMENTED".into(),
                message: "S-parameter analysis not implemented yet".into(),
            }),
        }
    }

    // altri metodi: run_hb, run_transient, ecc…
}
