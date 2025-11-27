use std::collections::HashMap;

use serde::{Serialize, Deserialize};

use crate::core::touchstone_raw::TouchstoneRaw;

use super::{touchstone::Touchstone, IntegraError};

#[derive(Debug, Serialize, Deserialize)]
pub struct IntegraSolver {
    pub touchstone_list: HashMap<String, Touchstone>,
}

impl IntegraSolver {
    pub fn new() -> Self {
        Self {
            touchstone_list: HashMap::new(),
        }
    }

    pub fn write_touchstone(&mut self, json_str: &str) -> Result<(), IntegraError> {
        let raw: TouchstoneRaw = serde_json::from_str(json_str)
            .map_err(|e| IntegraError::Generic(format!("JSON invalido: {e}")))?;

        let touchstone = Touchstone::load(raw)?;
        self.touchstone_list.insert(touchstone.id.clone(), touchstone);
        Ok(())
    }

    pub fn delete_touchstone(&mut self, id: &str) -> Result<(), IntegraError> {
        match self.touchstone_list.remove(id) {
            Some(_) => Ok(()),
            None => Err(IntegraError::NotFound(id.to_string())),
        }
    }

    pub fn get_touchstone(&self, id: &str) -> Result<String, IntegraError> {
        match self.touchstone_list.get(id) {
            Some(touchstone) => serde_json::to_string(touchstone)
                .map_err(|e| IntegraError::Generic(format!("Serializzazione fallita: {e}"))),
            None => Err(IntegraError::NotFound(id.to_string())),
        }
    }

    pub fn list_ids(&self) -> Vec<String> {
        self.touchstone_list.keys().cloned().collect()
    }

    pub fn to_json(&self) -> String {
        serde_json::to_string_pretty(self).unwrap_or_else(|_| "{}".to_string())
    }

    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}
