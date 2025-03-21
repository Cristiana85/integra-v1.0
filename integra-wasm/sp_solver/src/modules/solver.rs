use serde::{Deserialize, Serialize};
use web_sys::console;

// ✅ Import solo per WASM
use serde_wasm_bindgen::to_value;
#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

// ✅ Import per Windows/Linux (evita warning su WASM)
#[cfg(not(target_arch = "wasm32"))]
use std::println;

use super::{analyzer::AnalyzerError, dataset::Dataset, netlist::Netlist, touchstone::Touchstone};

#[derive(Serialize, Deserialize)]
pub struct Analysis {
    pub id: String,
    pub r#type: String,
    pub sweep: Option<String>,
    pub param: Option<String>,
    pub opt: Option<String>,
}
#[derive(Serialize, Deserialize)]
pub struct Model {
    pub id: String,
    pub r#type: String,
    pub attr: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct Network {
    pub id: String,
    pub r#type: CellType, // Usa CellType per mantenere coerenza
    pub attr: Option<String>,
    pub reduced: bool,
    pub nodes: Vec<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct Simulation {
    pub tracename: String,
    pub solver: String,
    pub domain: String,
    pub data: String,
    pub format: String,
}

#[derive(Serialize, Deserialize)]
pub struct Parameter {
    pub tracename: String,
    pub solver: String,
    pub domain: String,
    pub data: String,
    pub format: String,
}

#[derive(PartialEq, Serialize, Deserialize)]
pub enum CellType {
    Analysis,
    Model,
    Unknown(String), // Per altri tipi non previsti
}

impl From<&str> for CellType {
    fn from(value: &str) -> Self {
        match value {
            "analysis" => CellType::Analysis,
            "model" => CellType::Model,
            other => CellType::Unknown(other.to_string()),
        }
    }
}

#[derive(PartialEq)]
pub enum SweepType {
    Simulation,
    Parameter,
    Unknown(String),
}

impl From<&str> for SweepType {
    fn from(value: &str) -> Self {
        match value {
            "simulation" => SweepType::Simulation,
            "param" => SweepType::Parameter,
            other => SweepType::Unknown(other.to_string()),
        }
    }
}

#[derive(Serialize, Deserialize, Default)]
pub struct Solver {
    touchstone: Option<Touchstone>,
    netlist: Option<Netlist>,
    dataset: Option<Dataset>,
    analysis_list: Vec<Analysis>,
    model_list: Vec<Model>,
    network_list: Vec<Network>,
    simulation_list: Vec<Simulation>, // Lista per le simulazioni
    parameter_list: Vec<Parameter>,   // Lista per i parametri
    results: Option<String>,
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub struct WasmSolver {
    solver: Solver,
}

// ✅ Implementazione per WASM
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
impl WasmSolver {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmSolver {
        WasmSolver {
            solver: Solver::default(),
        }
    }

    #[wasm_bindgen]
    pub fn init(
        &mut self,
        touchstone: JsValue,
        netlist: JsValue,
        dataset: JsValue,
    ) -> Result<(), JsValue> {
        // 1️⃣ 📌 Deserializzazione dei dati JSON in strutture Rust
        let touchstone: Option<Touchstone> = match serde_wasm_bindgen::from_value(touchstone) {
            Ok(val) => Some(val),
            Err(e) => {
                web_sys::console::log_1(
                    &format!("❌ Errore nel parsing del Touchstone: {:?}", e).into(),
                );
                return Err(JsValue::from_str("Errore nel parsing del Touchstone"));
            }
        };

        let netlist: Option<Netlist> = match serde_wasm_bindgen::from_value(netlist) {
            Ok(val) => Some(val),
            Err(e) => {
                web_sys::console::log_1(
                    &format!("❌ Errore nel parsing della Netlist: {:?}", e).into(),
                );
                return Err(JsValue::from_str("Errore nel parsing della Netlist"));
            }
        };

        let dataset: Option<Dataset> = match serde_wasm_bindgen::from_value(dataset) {
            Ok(val) => Some(val),
            Err(e) => {
                web_sys::console::log_1(
                    &format!("❌ Errore nel parsing del Dataset: {:?}", e).into(),
                );
                return Err(JsValue::from_str("Errore nel parsing del Dataset"));
            }
        };

        // 2️⃣ 📌 Inizializza le variabili in `self`
        self.solver.touchstone = touchstone;
        self.solver.netlist = netlist;
        self.solver.dataset = dataset;

        // 3️⃣ 🔄 Pulisce le liste prima del parsing
        self.solver.analysis_list.clear();
        self.solver.model_list.clear();
        self.solver.network_list.clear();
        self.solver.simulation_list.clear();
        self.solver.parameter_list.clear();

        let mut errors = Vec::new();

        // 4️⃣ 🛠 Parsing della Netlist
        if let Err(e) = self.parse_netlist() {
            errors.push(e);
        }

        // 5️⃣ 🛠 Parsing del Dataset
        if let Err(e) = self.parse_dataset() {
            errors.push(e);
        }

        // 6️⃣ ✅ Se ci sono errori, li restituiamo
        if !errors.is_empty() {
            return Err(JsValue::from_str(&format!("{:?}", errors)));
        }

        // 7️⃣ ✅ Reset dei risultati
        self.solver.results = None;
        web_sys::console::log_1(&"✅ Solver inizializzato con nuovi dati!".into());

        Ok(())
    }

    #[wasm_bindgen]
    pub fn parse_netlist(&mut self) -> Result<(), JsValue> {
        self.solver.analysis_list.clear();
        self.solver.model_list.clear();
        self.solver.network_list.clear();

        let netlist = self.solver.netlist.as_ref().ok_or_else(|| {
            JsValue::from_str("❌ Errore: Nessuna Netlist presente per il parsing!")
        })?;

        let mut errors = Vec::new();

        for cell in &netlist.cells {
            let cell_type = CellType::from(cell.r#type.as_str());

            match cell_type {
                CellType::Analysis => {
                    if cell.id.is_empty() {
                        errors.push(JsValue::from_str("⚠️ Analysis senza ID!"));
                    }
                    let analysis_entry = Analysis {
                        id: cell.id.clone(),
                        r#type: cell.r#type.clone(),
                        sweep: cell
                            .attrs
                            .get("sweep")
                            .and_then(|v| v.as_str())
                            .map(String::from),
                        param: cell
                            .attrs
                            .get("param")
                            .and_then(|v| v.as_str())
                            .map(String::from),
                        opt: cell
                            .attrs
                            .get("opt")
                            .and_then(|v| v.as_str())
                            .map(String::from),
                    };
                    self.solver.analysis_list.push(analysis_entry);
                }

                CellType::Model => {
                    if cell.id.is_empty() {
                        errors.push(JsValue::from_str("⚠️ Model senza ID!"));
                    }
                    let model_entry = Model {
                        id: cell.id.clone(),
                        r#type: cell.r#type.clone(),
                        attr: cell
                            .attrs
                            .get("attr")
                            .and_then(|v| v.as_str())
                            .map(String::from),
                    };
                    self.solver.model_list.push(model_entry);
                }

                CellType::Unknown(_) => {
                    let network_entry = Network {
                        id: cell.id.clone(),
                        r#type: cell_type,
                        attr: cell
                            .attrs
                            .get("attr")
                            .and_then(|v| v.as_str())
                            .map(String::from),
                        reduced: cell
                            .attrs
                            .get("reduced")
                            .and_then(|v| v.as_bool())
                            .unwrap_or(false),
                        nodes: cell
                            .attrs
                            .get("nodes")
                            .and_then(|v| v.as_array())
                            .map(|arr| {
                                arr.iter()
                                    .filter_map(|n| n.as_i64().map(|num| num as i32))
                                    .collect()
                            })
                            .unwrap_or_else(Vec::new),
                    };
                    self.solver.network_list.push(network_entry);
                }
            }
        }

        if errors.is_empty() {
            web_sys::console::log_1(&"✅ Parsing della Netlist completato!".into());
            Ok(())
        } else {
            Err(JsValue::from_str(&format!("{:?}", errors)))
        }
    }

    #[wasm_bindgen]
    pub fn parse_dataset(&mut self) -> Result<(), JsValue> {
        self.solver.simulation_list.clear();
        self.solver.parameter_list.clear();

        let dataset = self
            .solver
            .dataset
            .as_ref()
            .ok_or(JsValue::from_str("Missing Dataset"))?;
        let mut errors = Vec::new();

        for trace in &dataset.traces {
            let sweep_type = SweepType::from(trace.sweep.as_str());

            match sweep_type {
                SweepType::Simulation => {
                    let simulation_entry = Simulation {
                        tracename: trace.tracename.clone(),
                        solver: trace.solver.clone(),
                        domain: trace.domain.clone(),
                        data: trace.data.clone(),
                        format: trace.format.clone(),
                    };
                    self.solver.simulation_list.push(simulation_entry);
                }
                SweepType::Parameter => {
                    let parameter_entry = Parameter {
                        tracename: trace.tracename.clone(),
                        solver: trace.solver.clone(),
                        domain: trace.domain.clone(),
                        data: trace.data.clone(),
                        format: trace.format.clone(),
                    };
                    self.solver.parameter_list.push(parameter_entry);
                }
                SweepType::Unknown(unknown_sweep) => {
                    errors.push(JsValue::from_str(&format!(
                        "⚠️ Sweep sconosciuto: {}",
                        unknown_sweep
                    )));
                }
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(JsValue::from_str(&format!("{:?}", errors)))
        }
    }

    #[wasm_bindgen]
    pub fn solve(&mut self) {
        web_sys::console::log_1(&"🔄 Avvio della funzione solve()...".into());

        // ✅ Controllo se i dati sono stati inizializzati
        if self.solver.touchstone.is_none()
            || self.solver.netlist.is_none()
            || self.solver.dataset.is_none()
        {
            web_sys::console::log_1(&"❌ Errore: il solver non è stato inizializzato correttamente! Chiama `init()` prima di `solve()`.".into());
            return;
        }

        // ✅ Simulazione avviata
        self.solver.results = Some("Dati di simulazione generati".to_string());
        web_sys::console::log_1(&"✅ Simulazione completata!".into());
    }

    #[wasm_bindgen]
    pub fn clear(&mut self) {
        self.solver.touchstone = None;
        self.solver.netlist = None;
        self.solver.dataset = None;
        self.solver.analysis_list.clear();
        self.solver.results = None;
        web_sys::console::log_1(&"🗑️ Solver resettato!".into());
    }

    #[wasm_bindgen]
    pub fn get_data(&self) -> Option<String> {
        match &self.solver.results {
            Some(results) => {
                web_sys::console::log_1(&format!("📄 Risultati disponibili: {}", results).into());
                Some(results.clone()) // Qui Rust inferisce bene il tipo
            }
            None => {
                web_sys::console::log_1(
                    &"❌ Nessun risultato disponibile! Esegui `solve()` prima.".into(),
                );
                None
            }
        }
    }
}

impl Solver {
    pub fn new() -> Solver {
        Solver {
            touchstone: None,
            netlist: None,
            dataset: None,
            analysis_list: Vec::new(),
            model_list: Vec::new(),
            network_list: Vec::new(),
            simulation_list: Vec::new(), // Inizializziamo la lista delle simulazioni
            parameter_list: Vec::new(),  // Inizializziamo la lista dei parametri
            results: None,
        }
    }

    pub fn init(
        &mut self,
        touchstone: Option<Touchstone>,
        netlist: Option<Netlist>,
        dataset: Option<Dataset>,
    ) -> Result<(), Vec<AnalyzerError>> {
        // 1️⃣ 📌 Inizializza le variabili in `self`
        self.touchstone = touchstone;
        self.netlist = netlist;
        self.dataset = dataset;

        // 2️⃣ 🔄 Pulisce le liste prima del parsing
        self.analysis_list.clear();
        self.model_list.clear();
        self.network_list.clear();
        self.simulation_list.clear();
        self.parameter_list.clear();

        let mut errors = Vec::new();

        // 3️⃣ 🛠 Parsing della Netlist
        if let Err(e) = self.parse_netlist() {
            errors.push(e);
        }

        // 4️⃣ 🛠 Parsing del Dataset
        if let Err(e) = self.parse_dataset() {
            errors.push(e);
        }

        // 5️⃣ ✅ Se ci sono errori, li restituiamo
        if !errors.is_empty() {
            return Err(errors);
        }

        // 6️⃣ ✅ Reset dei risultati
        self.results = None;
        web_sys::console::log_1(&"✅ Solver inizializzato con nuovi dati!".into());

        Ok(())
    }

    pub fn parse_netlist(&mut self) -> Result<(), AnalyzerError> {
        self.analysis_list.clear();
        self.model_list.clear();
        self.network_list.clear();

        let netlist = self.netlist.as_ref().ok_or(AnalyzerError::MissingNetlist)?;
        let mut errors = Vec::new();

        for cell in &netlist.cells {
            let cell_type = CellType::from(cell.r#type.as_str());

            match cell_type {
                CellType::Analysis => {
                    if cell.id.is_empty() {
                        errors.push(AnalyzerError::InvalidNetlistFormat(
                            "⚠️ Analysis senza ID!".into(),
                        ));
                    }
                    let analysis_entry = Analysis {
                        id: cell.id.clone(),
                        r#type: cell.r#type.clone(),
                        sweep: cell
                            .attrs
                            .get("sweep")
                            .and_then(|v| v.as_str())
                            .map(String::from),
                        param: cell
                            .attrs
                            .get("param")
                            .and_then(|v| v.as_str())
                            .map(String::from),
                        opt: cell
                            .attrs
                            .get("opt")
                            .and_then(|v| v.as_str())
                            .map(String::from),
                    };
                    self.analysis_list.push(analysis_entry);
                }

                CellType::Model => {
                    if cell.id.is_empty() {
                        errors.push(AnalyzerError::InvalidNetlistFormat(
                            "⚠️ Model senza ID!".into(),
                        ));
                    }
                    let model_entry = Model {
                        id: cell.id.clone(),
                        r#type: cell.r#type.clone(),
                        attr: cell
                            .attrs
                            .get("attr")
                            .and_then(|v| v.as_str())
                            .map(String::from),
                    };
                    self.model_list.push(model_entry);
                }

                CellType::Unknown(_) => {
                    let network_entry = Network {
                        id: cell.id.clone(),
                        r#type: cell_type,
                        attr: cell
                            .attrs
                            .get("attr")
                            .and_then(|v| v.as_str())
                            .map(String::from),
                        reduced: cell
                            .attrs
                            .get("reduced")
                            .and_then(|v| v.as_bool())
                            .unwrap_or(false),
                        nodes: cell
                            .attrs
                            .get("nodes")
                            .and_then(|v| v.as_array())
                            .map(|arr| {
                                arr.iter()
                                    .filter_map(|n| n.as_i64().map(|num| num as i32))
                                    .collect()
                            })
                            .unwrap_or_else(Vec::new),
                    };
                    self.network_list.push(network_entry);
                }
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors.remove(0)) // Restituiamo il primo errore
        }
    }

    pub fn parse_dataset(&mut self) -> Result<(), AnalyzerError> {
        self.simulation_list.clear();
        self.parameter_list.clear();

        let dataset = self.dataset.as_ref().ok_or(AnalyzerError::MissingDataset)?;
        let mut errors = Vec::new();

        for trace in &dataset.traces {
            let sweep_type = SweepType::from(trace.sweep.as_str());

            match sweep_type {
                SweepType::Simulation => {
                    let simulation_entry = Simulation {
                        tracename: trace.tracename.clone(),
                        solver: trace.solver.clone(),
                        domain: trace.domain.clone(),
                        data: trace.data.clone(),
                        format: trace.format.clone(),
                    };
                    self.simulation_list.push(simulation_entry);
                }
                SweepType::Parameter => {
                    let parameter_entry = Parameter {
                        tracename: trace.tracename.clone(),
                        solver: trace.solver.clone(),
                        domain: trace.domain.clone(),
                        data: trace.data.clone(),
                        format: trace.format.clone(),
                    };
                    self.parameter_list.push(parameter_entry);
                }
                SweepType::Unknown(unknown_sweep) => {
                    errors.push(AnalyzerError::InvalidDatasetFormat(format!(
                        "⚠️ Sweep sconosciuto: {}",
                        unknown_sweep
                    )));
                }
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors.remove(0)) // Restituiamo il primo errore
        }
    }

    /// 🔹 **Esegue la simulazione**
    pub fn solve(&mut self) {
        if self.touchstone.is_none() || self.netlist.is_none() || self.dataset.is_none() {
            web_sys::console::log_1(
                &"❌ Errore: il solver non è stato inizializzato correttamente!".into(),
            );
            return;
        }

        self.results = Some("Dati di simulazione generati".to_string());
        web_sys::console::log_1(&"✅ Simulazione completata!".into());
    }

    /// 🔄 **Resetta il solver**
    pub fn clear(&mut self) {
        self.touchstone = None;
        self.netlist = None;
        self.dataset = None;
        self.analysis_list.clear();
        self.results = None;
        web_sys::console::log_1(&"🗑️ Solver resettato!".into());
    }

    /// 📄 **Restituisce i dati calcolati**
    pub fn get_data(&self) -> Option<String> {
        if let Some(ref results) = self.results {
            web_sys::console::log_1(&format!("📄 Risultati disponibili: {}", results).into());
            Some(results.clone())
        } else {
            web_sys::console::log_1(
                &"❌ Nessun risultato disponibile! Esegui `solve()` prima.".into(),
            );
            None
        }
    }
}
