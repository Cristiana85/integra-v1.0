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
use super::netlist::Netlist;
use super::touchstone::Touchstone;

// ✅ Definiamo ANALYZER **solo in WebAssembly**
#[cfg(target_arch = "wasm32")]
static ANALYZER: Mutex<Option<Analyzer>> = Mutex::new(None);
use web_sys::console;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DataType {
    Touchstone = 0,
    Netlist = 1,
    NetlistEl = 2,
    Models = 3,
    Analysis = 4,
}

impl DataType {
    pub fn from_u32(value: u32) -> Option<DataType> {
        match value {
            0 => Some(DataType::Touchstone),
            1 => Some(DataType::Netlist),
            2 => Some(DataType::NetlistEl),
            3 => Some(DataType::Models),
            4 => Some(DataType::Analysis),
            _ => None,
        }
    }
}

// ✅ Struttura principale
#[derive(Debug, Serialize, Deserialize)]
pub struct Analyzer {
    touchstones: HashMap<String, Touchstone>,
    netlist: Option<Netlist>,
}

impl Analyzer {
    pub fn new() -> Self {
        Self {
            touchstones: HashMap::new(),
            netlist: None,
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

        match DataType::from_u32(data_type) {
            Some(DataType::Touchstone) => match serde_json::from_str::<Touchstone>(json_data) {
                Ok(touchstone) => {
                    console::log_1(&format!("✅ Touchstone ricevuto: {:?}", touchstone).into());
                    wanalyzer
                        .touchstones
                        .insert(touchstone.name.clone(), touchstone);
                    return true;
                }
                Err(e) => {
                    console::log_1(&format!("❌ Errore nel parsing JSON Touchstone: {}", e).into());
                    return false;
                }
            },

            Some(DataType::Netlist) => match serde_json::from_str::<Netlist>(json_data) {
                Ok(netlist) => {
                    console::log_1(&format!("✅ Netlist ricevuto: {:?}", netlist).into());
                    wanalyzer.netlist = Some(netlist);
                    return true;
                }
                Err(e) => {
                    console::log_1(&format!("❌ Errore nel parsing JSON Netlist: {}", e).into());
                    return false;
                }
            },

            Some(DataType::NetlistEl) => match serde_json::from_str::<Netlist>(json_data) {
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
                    console::log_1(&format!("❌ Errore nel parsing JSON NetlistEl: {}", e).into());
                    return false;
                }
            },

            _ => {
                console::log_1(&"❌ DataType non valido o non supportato".into());
                return false;
            }
        }
    }

    #[wasm_bindgen(method)]
    pub fn delete(&mut self, data_type: u32, identifier: String) -> bool {
        let wanalyzer = &mut self.wanalyzer;

        match DataType::from_u32(data_type) {
            // 🔹 Elimina un file Touchstone
            Some(DataType::Touchstone) => {
                let deleted = wanalyzer.touchstones.remove(&identifier).is_some();
                console::log_1(
                    &format!("🗑️ Touchstone '{}' eliminato: {}", identifier, deleted).into(),
                );
                deleted
            }

            // 🔹 Elimina l'intera Netlist
            Some(DataType::Netlist) => {
                if wanalyzer.netlist.is_some() {
                    wanalyzer.netlist = None;
                    console::log_1(&"🗑️ Netlist eliminata!".into());
                    return true;
                }
                console::log_1(&"❌ Nessuna Netlist da eliminare!".into());
                false
            }

            // 🔹 Elimina un singolo elemento della Netlist
            Some(DataType::NetlistEl) => {
                if let Some(ref mut netlist) = wanalyzer.netlist {
                    let original_len = netlist.cells.len();
                    netlist.cells.retain(|cell| cell.id != identifier);
                    let deleted = original_len != netlist.cells.len();

                    if deleted {
                        console::log_1(&format!("🗑️ Cella '{}' eliminata!", identifier).into());
                    } else {
                        console::log_1(&format!("❌ Cella '{}' non trovata!", identifier).into());
                    }
                    deleted
                } else {
                    console::log_1(
                        &"❌ Nessuna Netlist presente per eliminare un elemento!".into(),
                    );
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
                "🔹 Tentativo di modifica della cella '{}' con DataType {}",
                identifier, data_type
            )
            .into(),
        );

        let wanalyzer = &mut self.wanalyzer;

        match DataType::from_u32(data_type) {
            Some(DataType::NetlistEl) => {
                if let Some(ref mut netlist) = wanalyzer.netlist {
                    for cell in &mut netlist.cells {
                        if cell.id == identifier {
                            match serde_json::from_str::<serde_json::Value>(&new_json_data) {
                                Ok(new_data) => {
                                    if let Some(attrs) = new_data.get("attrs") {
                                        cell.attrs = attrs.clone(); // ✅ Modifica gli attributi
                                        console::log_1(
                                            &format!(
                                                "✅ Cella '{}' modificata con successo!",
                                                identifier
                                            )
                                            .into(),
                                        );
                                        return true;
                                    } else {
                                        console::log_1(
                                            &"❌ Il JSON fornito non contiene il campo 'attrs'!"
                                                .into(),
                                        );
                                    }
                                }
                                Err(e) => {
                                    console::log_1(
                                        &format!("❌ Errore nel parsing JSON: {}", e).into(),
                                    );
                                }
                            }
                        }
                    }
                    console::log_1(
                        &format!("❌ Cella '{}' non trovata nella Netlist!", identifier).into(),
                    );
                } else {
                    console::log_1(&"❌ Nessuna Netlist presente per modificare una cella!".into());
                }
                false
            }

            _ => {
                console::log_1(&"❌ DataType non valido per la modifica!".into());
                false
            }
        }
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
}

#[cfg(not(target_arch = "wasm32"))]
impl Analyzer {
    pub fn add(&mut self, data_type: DataType, json_data: &str) -> bool {
        match data_type {
            DataType::Touchstone => match serde_json::from_str::<Touchstone>(json_data) {
                Ok(touchstone) => {
                    self.touchstones.insert(touchstone.name.clone(), touchstone);
                    true
                }
                Err(_) => false,
            },
            DataType::Netlist => match serde_json::from_str::<Netlist>(json_data) {
                Ok(netlist) => {
                    self.netlist = Some(netlist);
                    true
                }
                Err(_) => false,
            },

            DataType::NetlistEl => match serde_json::from_str::<Netlist>(json_data) {
                Ok(new_netlist) => {
                    if let Some(ref mut existing_netlist) = self.netlist {
                        // ✅ Aggiunge solo le nuove celle senza toccare i link esistenti
                        existing_netlist.cells.extend(new_netlist.cells);
                        println!("✅ Nuove celle aggiunte alla Netlist esistente!");
                    } else {
                        // Se la Netlist non esiste ancora, crea una nuova
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

            _ => false,
        }
    }

    pub fn get(&mut self, data_type: DataType) -> String {
        match data_type {
            DataType::Touchstone => {
                serde_json::to_string_pretty(&self.touchstones).unwrap_or_else(|_| "{}".to_string())
            }
            DataType::Netlist => {
                if let Some(netlist) = &self.netlist {
                    netlist.to_json()
                } else {
                    "{}".to_string()
                }
            }
            _ => "{}".to_string(),
        }
    }

    pub fn delete(&mut self, data_type: DataType, identifier: String) -> bool {
        match data_type {
            DataType::Touchstone => self.touchstones.remove(&identifier).is_some(),

            DataType::Netlist => {
                if self.netlist.is_some() {
                    self.netlist = None;
                    true
                } else {
                    false
                }
            }

            DataType::NetlistEl => {
                if let Some(ref mut netlist) = self.netlist {
                    let original_len = netlist.cells.len();
                    netlist.cells.retain(|cell| cell.id != identifier);

                    original_len != netlist.cells.len()
                } else {
                    false
                }
            }

            _ => false,
        }
    }

    pub fn modify(&mut self, data_type: DataType, identifier: &str, new_json_data: &str) -> bool {
        match data_type {
            DataType::NetlistEl => {
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
            _ => false,
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
