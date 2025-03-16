use std::fmt;

pub struct Analysis {
    data: String, // Esempio di contenuto
}

impl Analysis {
    pub fn new() -> Self {
        Analysis {
            data: String::new(),
        }
    }

    pub fn load(&mut self, _data: &str) {
        // Placeholder for loading analysis data
    }
    pub fn run(&self) {
        // Placeholder for analysis logic
    }
    pub fn reset(&mut self) {
        // Placeholder for resetting solver
    }
}

// ✅ Implementiamo Display per poter usare `to_string()`
impl fmt::Display for Analysis {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "SPAnalysis: {}", self.data)
    }
}
