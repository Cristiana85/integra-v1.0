use chrono::{DateTime, Utc};
use ndarray::{Array2};
use num_complex::Complex;
use serde::{Deserialize, Serialize};

use crate::core::{touchstone_raw::TouchstoneRaw, IntegraError};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Touchstone {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub n_port: Option<usize>,
    pub frequencies: Option<Vec<f64>>,
    pub s_matrix: Vec<Array2<Complex<f64>>>, // one per freq
    pub rn: Option<Vec<f64>>,
    pub fmin: Option<Vec<f64>>,
    pub sopt: Option<Vec<Complex<f64>>>,
}

impl Touchstone {
    pub fn new(id: String) -> Self {
        Self {
            id,
            timestamp: Utc::now(),
            n_port: None,
            frequencies: None,
            s_matrix: Vec::new(),
            rn: None,
            fmin: None,
            sopt: None,
        }
    }

    pub fn load(raw: TouchstoneRaw) -> Result<Self, IntegraError> {
        let num_freq = raw.frequencies.len();
        let mut s_matrix = Vec::with_capacity(num_freq);

        for (f_idx, mtx) in raw.sparam.into_iter().enumerate() {
            if mtx.len() != raw.n_port || mtx[0].len() != raw.n_port {
                return Err(IntegraError::InvalidMatrixSize {
                    expected: raw.n_port,
                    found: (mtx.len(), mtx[0].len()),
                });
            }

            let flat: Vec<Complex<f64>> = mtx.into_iter().flatten().map(Complex::from).collect();

            let array = Array2::from_shape_vec((raw.n_port, raw.n_port), flat).map_err(|_| {
                IntegraError::Generic(format!("Errore nella matrice S di f[{}]", f_idx))
            })?;

            s_matrix.push(array);
        }

        // Converti sopt se presente
        let sopt = raw.sopt.map(|v| v.into_iter().map(Complex::from).collect());

        Ok(Self {
            id: raw.id,
            timestamp: Utc::now(),
            n_port: Some(raw.n_port),
            frequencies: Some(raw.frequencies),
            s_matrix,
            rn: raw.rn,
            fmin: raw.fmin,
            sopt,
        })
    }

    /// Ottieni Sij per una certa frequenza e coppia di porte
    pub fn get_sij(&self, freq_index: usize, i: usize, j: usize) -> Option<Complex<f64>> {
        self.s_matrix
            .get(freq_index)
            .and_then(|m| m.get((i, j)).cloned())
    }
}
