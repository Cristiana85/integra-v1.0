use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetlistCell {
    pub id: String,
    pub r#type: String,
    pub attrs: Value,
    pub position: Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetlistLink {
    pub id: String,
    pub source: Value,
    pub target: Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Netlist {
    pub cells: Vec<NetlistCell>,
    #[serde(default)]
    pub links: Vec<NetlistLink>,
}

impl Netlist {
    /// 🔹 Converte un JSON in `SPNetlist`, usando logging per INFO, DEBUG ed ERROR
    pub fn from_json(json_data: &str) -> Result<Self, String> {
        info!("📌 Avvio parsing Netlist...");

        let parsed: Self = match serde_json::from_str(json_data) {
            Ok(netlist) => netlist,
            Err(e) => {
                error!("❌ Errore nel parsing del Netlist JSON: {}", e);
                return Err(format!("Errore nel parsing del Netlist JSON: {}", e));
            }
        };

        info!("✅ Parsing completato con successo!");
        debug!("📜 Netlist Deserializzato: {:?}", parsed);

        info!("📌 Celle trovate:");
        for cell in &parsed.cells {
            info!("  - ID: {}, Tipo: {}", cell.id, cell.r#type);

            if let Value::Object(attrs_map) = &cell.attrs {
                for (key, value) in attrs_map {
                    debug!("    🔹 {}: {}", key, value);
                }
            } else {
                error!(
                    "    ⚠️ `attrs` non è un oggetto valido per la cella {}",
                    cell.id
                );
            }

            debug!("    📍 Posizione: {}", cell.position);
        }

        info!("📌 Collegamenti trovati:");
        for link in &parsed.links {
            info!(
                "  - ID: {}, Sorgente: {}, Destinazione: {}",
                link.id, link.source, link.target
            );
        }

        Ok(parsed)
    }

    /// 🔹 Converte l'oggetto in JSON
    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(self).unwrap_or_else(|_| "{}".to_string())
    }
}