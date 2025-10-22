// ✅ Import comuni per tutte le piattaforme
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

// ✅ Import solo per WASM (evita warning su Windows)
#[cfg(target_arch = "wasm32")]
use {
    js_sys::Function,
    serde_wasm_bindgen::{from_value, to_value},
    std::sync::Mutex, // ✅ Importato solo se siamo in WASM
    web_sys::window,
};

// ✅ Import solo per Windows/Linux (evita warning su WASM)
//#[cfg(not(target_arch = "wasm32"))]
// ✅ Import dei moduli locali (sempre necessari)
use super::{dataset::Dataset, netlist::Netlist, solver::Solver};
use super::{dataset::Trace, touchstone::Touchstone};

// ✅ Definiamo ANALYZER **solo in WebAssembly**
#[cfg(target_arch = "wasm32")]
static ANALYZER: Mutex<Option<Analyzer>> = Mutex::new(None);
use web_sys::console;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum JSType {
    Touchstone = 0,
    Netlist = 1,
    NetlistEl = 2,
    Dataset = 3,
    DatasetEl = 4,
}

impl JSType {
    pub fn from_u32(value: u32) -> Option<JSType> {
        match value {
            0 => Some(JSType::Touchstone),
            1 => Some(JSType::Netlist),
            2 => Some(JSType::NetlistEl),
            3 => Some(JSType::Dataset),
            4 => Some(JSType::DatasetEl),
            _ => None,
        }
    }
}

#[derive(Debug)]
pub enum AnalyzerError {
    MissingNetlist,
    MissingDataset,
    InvalidNetlistFormat(String),
    InvalidDatasetFormat(String),
}

#[derive(Serialize, Deserialize)]
pub struct Analyzer {
    touchstone: HashMap<String, Touchstone>,
    netlist: Option<Netlist>,
    dataset: Option<Dataset>,

    #[serde(skip_serializing, skip_deserializing)] // 🔹 Ignora `Solver`
    solver: Solver,
}

impl Analyzer {
    pub fn new() -> Self {
        Self {
            touchstone: HashMap::new(),
            netlist: None,
            dataset: None,
            solver: Solver::new(),
        }
    }
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub struct WasmAnalyzer {
    wanalyzer: Analyzer,
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
impl WasmAnalyzer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmAnalyzer {
        console::log_1(&"✅ Creazione di un nuovo WasmAnalyzer".into());
        WasmAnalyzer {
            wanalyzer: Analyzer::new(),
        }
    }

    #[wasm_bindgen(method)]
    pub fn add(&mut self, data_type: u32, json_data: &str) -> bool {
        console::log_1(&format!("🔹 Tentativo di aggiungere: {}", json_data).into());

        let wanalyzer = &mut self.wanalyzer;

        match JSType::from_u32(data_type) {
            Some(JSType::Touchstone) => match serde_json::from_str::<Touchstone>(json_data) {
                Ok(touchstone) => {
                    console::log_1(&format!("✅ Touchstone ricevuto: {:?}", touchstone).into());
                    wanalyzer
                        .touchstone
                        .insert(touchstone.name.clone(), touchstone);
                    return true;
                }
                Err(e) => {
                    console::log_1(&format!("❌ Errore nel parsing JSON Touchstone: {}", e).into())
                }
            },

            Some(JSType::Netlist) => match serde_json::from_str::<Netlist>(json_data) {
                Ok(netlist) => {
                    console::log_1(&format!("✅ Netlist ricevuto: {:?}", netlist).into());
                    wanalyzer.netlist = Some(netlist);
                    return true;
                }
                Err(e) => {
                    console::log_1(&format!("❌ Errore nel parsing JSON Netlist: {}", e).into())
                }
            },

            Some(JSType::NetlistEl) => match serde_json::from_str::<Netlist>(json_data) {
                Ok(new_netlist) => {
                    if let Some(ref mut existing_netlist) = wanalyzer.netlist {
                        existing_netlist.cells.extend(new_netlist.cells);
                        console::log_1(&"✅ Nuove celle aggiunte alla Netlist esistente!".into());
                        return true;
                    } else {
                        wanalyzer.netlist = Some(new_netlist);
                        console::log_1(&"🆕 Nuova Netlist creata con il primo elemento.".into());
                        return true;
                    }
                }
                Err(e) => {
                    console::log_1(&format!("❌ Errore nel parsing JSON NetlistEl: {}", e).into())
                }
            },

            Some(JSType::Dataset) => match serde_json::from_str::<Dataset>(json_data) {
                Ok(dataset) => {
                    wanalyzer.dataset = Some(dataset);
                    console::log_1(&"✅ Dataset aggiunto con successo!".into());
                    return true;
                }
                Err(e) => {
                    console::log_1(&format!("❌ Errore nel parsing JSON Dataset: {}", e).into())
                }
            },

            Some(JSType::DatasetEl) => match serde_json::from_str::<Trace>(json_data) {
                Ok(trace) => {
                    if let Some(ref mut dataset) = wanalyzer.dataset {
                        dataset.traces.push(trace);
                        console::log_1(&"✅ Nuovo Trace aggiunto al Dataset!".into());
                        return true;
                    } else {
                        console::log_1(
                            &"❌ Nessun Dataset presente per aggiungere un Trace!".into(),
                        );
                    }
                }
                Err(e) => {
                    console::log_1(&format!("❌ Errore nel parsing JSON DatasetEl: {}", e).into())
                }
            },

            _ => console::log_1(&"❌ DataType non valido o non supportato".into()),
        }

        false
    }

    #[wasm_bindgen(method)]
    pub fn delete(&mut self, data_type: u32, identifier: String) -> bool {
        let wanalyzer = &mut self.wanalyzer;

        match JSType::from_u32(data_type) {
            Some(JSType::Touchstone) => {
                let deleted = wanalyzer.touchstone.remove(&identifier).is_some();
                console::log_1(
                    &format!("🗑️ Touchstone '{}' eliminato: {}", identifier, deleted).into(),
                );
                deleted
            }

            Some(JSType::Netlist) => {
                if wanalyzer.netlist.is_some() {
                    wanalyzer.netlist = None;
                    console::log_1(&"🗑️ Netlist eliminata!".into());
                    return true;
                }
                console::log_1(&"❌ Nessuna Netlist da eliminare!".into());
                false
            }

            Some(JSType::NetlistEl) => {
                if let Some(ref mut netlist) = wanalyzer.netlist {
                    let original_len = netlist.cells.len();
                    netlist.cells.retain(|cell| cell.id != identifier);
                    let deleted = original_len != netlist.cells.len();

                    console::log_1(
                        &format!(
                            "{}",
                            if deleted {
                                format!("🗑️ Cella '{}' eliminata!", identifier)
                            } else {
                                format!("❌ Cella '{}' non trovata!", identifier)
                            }
                        )
                        .into(),
                    );

                    deleted
                } else {
                    console::log_1(
                        &"❌ Nessuna Netlist presente per eliminare un elemento!".into(),
                    );
                    false
                }
            }

            Some(JSType::Dataset) => {
                if wanalyzer.dataset.is_some() {
                    wanalyzer.dataset = None;
                    console::log_1(&"🗑️ Dataset eliminato!".into());
                    return true;
                }
                console::log_1(&"❌ Nessun Dataset da eliminare!".into());
                false
            }

            Some(JSType::DatasetEl) => {
                if let Some(ref mut dataset) = wanalyzer.dataset {
                    let original_len = dataset.traces.len();
                    dataset.traces.retain(|trace| trace.tracename != identifier);
                    let deleted = original_len != dataset.traces.len();

                    console::log_1(
                        &format!(
                            "{}",
                            if deleted {
                                format!("🗑️ Trace '{}' eliminato!", identifier)
                            } else {
                                format!("❌ Trace '{}' non trovato!", identifier)
                            }
                        )
                        .into(),
                    );

                    deleted
                } else {
                    console::log_1(&"❌ Nessun Dataset presente per eliminare un Trace!".into());
                    false
                }
            }

            _ => {
                console::log_1(&"❌ DataType non valido per la cancellazione!".into());
                false
            }
        }
    }

    #[wasm_bindgen(method)]
    pub fn modify(&mut self, data_type: u32, identifier: String, new_json_data: String) -> bool {
        console::log_1(
            &format!(
                "🔹 Tentativo di modifica di '{}' con DataType {}",
                identifier, data_type
            )
            .into(),
        );

        let wanalyzer = &mut self.wanalyzer;

        match JSType::from_u32(data_type) {
            Some(JSType::NetlistEl) => {
                if let Some(ref mut netlist) = wanalyzer.netlist {
                    for cell in &mut netlist.cells {
                        if cell.id == identifier {
                            match serde_json::from_str::<serde_json::Value>(&new_json_data) {
                                Ok(new_data) => {
                                    if let Some(attrs) = new_data.get("attrs") {
                                        cell.attrs = attrs.clone();
                                        console::log_1(
                                            &format!(
                                                "✅ Cella '{}' modificata con successo!",
                                                identifier
                                            )
                                            .into(),
                                        );
                                        return true;
                                    }
                                }
                                Err(e) => console::log_1(
                                    &format!("❌ Errore nel parsing JSON: {}", e).into(),
                                ),
                            }
                        }
                    }
                }
            }

            Some(JSType::DatasetEl) => {
                if let Some(ref mut dataset) = wanalyzer.dataset {
                    for trace in &mut dataset.traces {
                        if trace.tracename == identifier {
                            match serde_json::from_str::<Trace>(&new_json_data) {
                                Ok(updated_trace) => {
                                    *trace = updated_trace;
                                    console::log_1(
                                        &format!(
                                            "✅ Trace '{}' modificato con successo!",
                                            identifier
                                        )
                                        .into(),
                                    );
                                    return true;
                                }
                                Err(e) => console::log_1(
                                    &format!("❌ Errore nel parsing JSON: {}", e).into(),
                                ),
                            }
                        }
                    }
                }
            }

            _ => console::log_1(&"❌ DataType non valido per la modifica!".into()),
        }

        false
    }

    #[wasm_bindgen(method)]
    pub fn progress_operation(&mut self, callback: Function) {
        fn step(callback: Function, i: u32) {
            if i > 100 {
                return;
            }

            let progress = JsValue::from_f64(i as f64);
            let _ = callback.call1(&JsValue::NULL, &progress);

            let next_callback = callback.clone();
            let closure =
                wasm_bindgen::closure::Closure::once_into_js(move || step(next_callback, i + 1));

            let win = window().expect("Nessuna finestra disponibile in WASM");
            let _ = win.set_timeout_with_callback_and_timeout_and_arguments_0(
                closure.as_ref().unchecked_ref(),
                50,
            );
        }

        step(callback, 0);
    }

    #[wasm_bindgen]
    pub fn analyze(&mut self, touchstone: JsValue, netlist: JsValue, dataset: JsValue) -> JsValue {
        // ✅ Verifica che `wanalyzer` abbia `solver`
        match self.wanalyzer.solver.init(
            serde_wasm_bindgen::from_value(touchstone).ok(),
            serde_wasm_bindgen::from_value(netlist).ok(),
            serde_wasm_bindgen::from_value(dataset).ok(),
        ) {
            Ok(_) => JsValue::from_str("✅ Solver inizializzato correttamente!"),
            Err(errors) => {
                let error_msgs: Vec<String> = errors.iter().map(|e| format!("{:?}", e)).collect();
                JsValue::from_str(&error_msgs.join("\n")) // ✅ Restituisce errori come stringa
            }
        }
    }

    #[wasm_bindgen]
    pub fn handle_error(&self, error: JsValue) -> JsValue {
        let error_message = match error.as_string() {
            Some(msg) => format!("❌ Errore: {}", msg),
            None => "❌ Errore sconosciuto!".to_string(),
        };

        JsValue::from_str(&error_message) // ✅ Restituisce l'errore senza `web_sys`
    }
}

#[cfg(not(target_arch = "wasm32"))]
impl Analyzer {
    pub fn add(&mut self, data_type: JSType, json_data: &str) -> bool {
        match data_type {
            // ✅ Aggiunge un Touchstone
            JSType::Touchstone => match serde_json::from_str::<Touchstone>(json_data) {
                Ok(touchstone) => {
                    self.touchstone.insert(touchstone.name.clone(), touchstone);
                    println!("✅ Touchstone aggiunto!");
                    true
                }
                Err(e) => {
                    println!("❌ Errore nel parsing JSON Touchstone: {}", e);
                    false
                }
            },

            // ✅ Aggiunge una Netlist
            JSType::Netlist => match serde_json::from_str::<Netlist>(json_data) {
                Ok(netlist) => {
                    self.netlist = Some(netlist);
                    println!("✅ Netlist aggiunta!");
                    true
                }
                Err(e) => {
                    println!("❌ Errore nel parsing JSON Netlist: {}", e);
                    false
                }
            },

            // ✅ Aggiunge un elemento alla Netlist esistente
            JSType::NetlistEl => match serde_json::from_str::<Netlist>(json_data) {
                Ok(new_netlist) => {
                    if let Some(ref mut existing_netlist) = self.netlist {
                        existing_netlist.cells.extend(new_netlist.cells);
                        println!("✅ Nuove celle aggiunte alla Netlist esistente!");
                    } else {
                        self.netlist = Some(new_netlist);
                        println!("🆕 Nuova Netlist creata con il primo elemento.");
                    }
                    true
                }
                Err(e) => {
                    println!("❌ Errore nel parsing JSON NetlistEl: {}", e);
                    false
                }
            },

            JSType::Dataset => match Dataset::from_json(json_data) {
                Ok(dataset) => {
                    self.dataset = Some(dataset);
                    println!("✅ Dataset creato con successo!");
                    true
                }
                Err(e) => {
                    println!("❌ Errore nel parsing JSON Dataset: {}", e);
                    false
                }
            },

            // ✅ Aggiunge un nuovo Trace a un Dataset esistente
            JSType::DatasetEl => match serde_json::from_str::<Trace>(json_data) {
                Ok(new_trace) => {
                    if let Some(ref mut dataset) = self.dataset {
                        dataset.traces.push(new_trace);
                        println!("✅ Nuovo Trace aggiunto al Dataset!");
                        true
                    } else {
                        println!("❌ Nessun Dataset esistente per aggiungere un Trace!");
                        false
                    }
                }
                Err(e) => {
                    println!("❌ Errore nel parsing JSON Trace: {}", e);
                    false
                }
            },
        }
    }

    pub fn get(&mut self, data_type: JSType) -> String {
        match data_type {
            JSType::Touchstone => {
                serde_json::to_string_pretty(&self.touchstone).unwrap_or_else(|_| "{}".to_string())
            }
            JSType::Netlist => {
                if let Some(netlist) = &self.netlist {
                    netlist.to_json()
                } else {
                    "{}".to_string()
                }
            }
            JSType::Dataset => {
                if let Some(dataset) = &self.dataset {
                    dataset.to_json()
                } else {
                    "{}".to_string()
                }
            }
            JSType::DatasetEl => {
                if let Some(dataset) = &self.dataset {
                    let traces_json = serde_json::to_string_pretty(&dataset.traces)
                        .unwrap_or_else(|_| "[]".to_string());
                    traces_json
                } else {
                    "[]".to_string() // Nessun `Trace` disponibile
                }
            }
            _ => "{}".to_string(),
        }
    }

    pub fn delete(&mut self, data_type: JSType, identifier: String) -> bool {
        match data_type {
            // ✅ Elimina un file Touchstone
            JSType::Touchstone => {
                let deleted = self.touchstone.remove(&identifier).is_some();
                if deleted {
                    println!("✅ Touchstone '{}' eliminato!", identifier);
                } else {
                    println!("❌ Touchstone '{}' non trovato!", identifier);
                }
                deleted
            }

            // ✅ Elimina l'intera Netlist
            JSType::Netlist => {
                if self.netlist.is_some() {
                    self.netlist = None;
                    println!("✅ Netlist eliminata!");
                    true
                } else {
                    println!("❌ Nessuna Netlist da eliminare!");
                    false
                }
            }

            // ✅ Elimina un singolo elemento della Netlist
            JSType::NetlistEl => {
                if let Some(ref mut netlist) = self.netlist {
                    let original_len = netlist.cells.len();
                    netlist.cells.retain(|cell| cell.id != identifier);

                    let deleted = original_len != netlist.cells.len();
                    if deleted {
                        println!("✅ Elemento '{}' rimosso dalla Netlist!", identifier);
                    } else {
                        println!("❌ Elemento '{}' non trovato nella Netlist!", identifier);
                    }
                    deleted
                } else {
                    println!("❌ Nessuna Netlist presente per eliminare un elemento!");
                    false
                }
            }

            JSType::Dataset => {
                if self.dataset.is_some() {
                    self.dataset = None;
                    println!("✅ Dataset eliminato!");
                    true
                } else {
                    println!("❌ Nessun Dataset da eliminare!");
                    false
                }
            }

            // ✅ Elimina un singolo Trace all'interno del Dataset
            JSType::DatasetEl => {
                if let Some(ref mut dataset) = self.dataset {
                    let original_len = dataset.traces.len();
                    dataset.traces.retain(|trace| trace.tracename != identifier);

                    if dataset.traces.len() != original_len {
                        println!("✅ Trace '{}' rimosso dal Dataset!", identifier);
                        true
                    } else {
                        println!("❌ Trace '{}' non trovato nel Dataset!", identifier);
                        false
                    }
                } else {
                    println!("❌ Nessun Dataset presente per eliminare un Trace!");
                    false
                }
            }
        }
    }

    pub fn modify(&mut self, data_type: JSType, identifier: &str, new_json_data: &str) -> bool {
        match data_type {
            JSType::NetlistEl => {
                if let Some(ref mut netlist) = self.netlist {
                    for cell in &mut netlist.cells {
                        if cell.id == identifier {
                            match serde_json::from_str::<serde_json::Value>(new_json_data) {
                                Ok(new_data) => {
                                    if let Some(attrs) = new_data.get("attrs") {
                                        cell.attrs = attrs.clone(); // Modifica gli attributi
                                        return true;
                                    }
                                }
                                Err(e) => {
                                    println!("❌ Errore nel parsing JSON: {}", e);
                                }
                            }
                        }
                    }
                }
                false
            }

            // ✅ Modifica un singolo valore all'interno del campo "data" del Dataset
            JSType::DatasetEl => {
                if let Some(ref mut dataset) = self.dataset {
                    for trace in &mut dataset.traces {
                        if trace.tracename == identifier {
                            match serde_json::from_str::<Trace>(new_json_data) {
                                Ok(new_trace_data) => {
                                    *trace = new_trace_data;
                                    println!("✅ Trace '{}' modificato con successo!", identifier);
                                    return true;
                                }
                                Err(e) => {
                                    println!("❌ Errore nel parsing JSON: {}", e);
                                    return false;
                                }
                            }
                        }
                    }
                    println!("❌ Trace '{}' non trovato nel Dataset!", identifier);
                } else {
                    println!("❌ Nessun Dataset presente per modificare un Trace!");
                }
                false
            }
            _ => false,
        }
    }

    pub fn analyze(
        &mut self,
        touchstone: Option<Touchstone>,
        netlist: Option<Netlist>,
        dataset: Option<Dataset>,
    ) {
        match self.solver.init(touchstone, netlist, dataset) {
            Ok(_) => web_sys::console::log_1(&"✅ Solver inizializzato correttamente!".into()),
            Err(errors) => {
                for error in errors {
                    self.handle_error(error);
                }
            }
        }
    }

    pub fn handle_error(&self, error: AnalyzerError) {
        match error {
            AnalyzerError::MissingNetlist => {
                web_sys::console::log_1(&"❌ Errore: Netlist mancante!".into());
            }
            AnalyzerError::MissingDataset => {
                web_sys::console::log_1(&"❌ Errore: Dataset mancante!".into());
            }
            AnalyzerError::InvalidNetlistFormat(msg) => {
                web_sys::console::log_1(&format!("❌ Errore Netlist: {}", msg).into());
            }
            AnalyzerError::InvalidDatasetFormat(msg) => {
                web_sys::console::log_1(&format!("❌ Errore Dataset: {}", msg).into());
            }
        }
    }

    pub fn progress_operation<F>(&mut self, mut callback: F)
    where
        F: FnMut(u32),
    {
        use std::{thread, time::Duration};

        for i in 1..=100 {
            callback(i);
            thread::sleep(Duration::from_millis(50));
        }
    }
}
