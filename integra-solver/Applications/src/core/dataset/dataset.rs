use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dataset {
    pub meta: DatasetMeta,

    /// La spec usata per generare il dataset (utile per debug/export)
    pub spec: DatasetSpec,

    pub independent: IndependentVar,
    pub dependent: Vec<DependentVar>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatasetMeta {
    /// Campo libero come già previsto dall’architettura
    #[serde(default)]
    pub info: serde_json::Value,

    /// Nel tuo repo avevi anche `units` in alcuni punti: se esiste già, tienilo.
    /// Se non esiste, puoi rimuovere questo campo.
    #[serde(default)]
    pub units: serde_json::Value,
}

/// Specifica richiesta dall’utente (via Analysis).
/// Oggi: independent fissata (freq), domani potrà essere scelta/parametrizzata.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatasetSpec {
    /// Per ora lasciamo “freq” hard-coded, ma lo mettiamo già nella spec per futuro.
    pub independent: IndependentSpec,

    /// Variabili dipendenti richieste dall’utente
    pub dependent: Vec<DependentSpec>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndependentSpec {
    /// es. "freq"
    pub name: String,
    /// es. "Hz"
    pub unit: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependentSpec {
    /// Nome “user facing” che finirà in DependentVar.name (es. "angle(S21)")
    pub name: String,

    /// Espressione/identificatore che il solver interpreta (es. "angle(S21)")
    pub expr: String,

    /// Unità opzionale richiesta (se None, decide il solver)
    #[serde(default)]
    pub unit: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndependentVar {
    pub name: String,
    pub unit: String,
    pub values: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependentVar {
    pub name: String,
    pub unit: String,
    pub values: Vec<f64>,
}

impl Dataset {
    pub fn empty_with_spec(spec: DatasetSpec) -> Self {
        Self {
            meta: DatasetMeta {
                info: serde_json::Value::Null,
                units: serde_json::Value::Null,
            },
            spec,
            independent: IndependentVar {
                name: "x".to_string(),
                unit: "".to_string(),
                values: Vec::new(),
            },
            dependent: Vec::new(),
        }
    }
}