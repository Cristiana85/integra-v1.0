use std::fmt;

#[derive(Debug)]
pub enum IntegraError {
    InvalidPortCount,
    PortCountExceedsMax(usize),
    FrequencyMismatch { expected: usize, actual: usize },
    NotFound(String),
    OutOfBounds(String),
    Generic(String),
    InvalidMatrixSize { expected: usize, found: (usize, usize) },
    LengthMismatch { field: &'static str, expected: usize, found: usize },
    IndexOutOfBounds,
}

impl fmt::Display for IntegraError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            IntegraError::InvalidPortCount => write!(f, "Numero di porte non valido."),
            IntegraError::PortCountExceedsMax(n) => write!(f, "Numero di porte oltre il massimo consentito: {}", n),
            IntegraError::FrequencyMismatch { expected, actual } => write!(
                f,
                "Numero di frequenze ({}) non corrisponde al numero di matrici S ({})",
                actual, expected
            ),
            IntegraError::NotFound(name) => write!(f, "Elemento '{}' non trovato.", name),
            IntegraError::OutOfBounds(desc) => write!(f, "Indice fuori limite: {}", desc),
            IntegraError::Generic(msg) => write!(f, "Errore generico: {}", msg),
            IntegraError::InvalidMatrixSize { expected, found } => write!(
                f, 
                "Matrice non valida: attesa {}x{}, trovata {}x{}",
                expected, expected, found.0, found.1
            ),
            IntegraError::LengthMismatch { field, expected, found } => write!(
                f, 
                "Dimensione campo '{}' errata: attesa {}, trovata {}",
                field, expected, found
            ),
            IntegraError::IndexOutOfBounds => write!(f, "Indice fuori dai limiti"),
        }
    }
}

impl From<String> for IntegraError {
    fn from(value: String) -> Self {
        IntegraError::Generic(value)
    }
}

impl From<&str> for IntegraError {
    fn from(value: &str) -> Self {
        IntegraError::Generic(value.to_string())
    }
}
