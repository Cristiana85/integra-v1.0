// src/native_interface.rs
use crate::{engine::IntegraEngine, protocol::update::WasmUpdate};

/// Oggetto "facciata" per l'uso nativo dell'engine.
/// In futuro qui puoi appendere:
/// - info sul contesto (utente, sessione, configurazioni)
/// - logging / tracing
/// - gestione di risorse native (file, GPU locale, ecc.)
pub struct NativeInterface {
    engine: IntegraEngine,
}

impl NativeInterface {
    /// Crea una nuova istanza dell'interfaccia nativa con un certo id logico
    pub fn new(id: impl Into<String>) -> Self {
        let mut engine = IntegraEngine::new(id);
        // callback che stampa su stderr
        engine.set_update_callback(Box::new(|update: WasmUpdate| {
            eprintln!(
                "[PROGRESS] {}",
                serde_json::to_string(&update).unwrap_or("{}".into())
            );
        }));
        Self { engine }
    }

    /// Punto d'ingresso "reale": prende JSON e restituisce JSON.
    /// Qui puoi mettere in futuro:
    /// - validazioni extra
    /// - mapping errori / codici specifici per la desktop app
    pub fn process_request(&mut self, request_json: &str) -> String {
        self.engine.dispatch_json(request_json)
    }

    /// Getter opzionale per l'id dell'engine
    pub fn engine_id(&self) -> &str {
        self.engine.id()
    }
}
