use nalgebra::Complex;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct ComplexDTO {
    pub re: f64,
    pub im: f64,
}

impl From<ComplexDTO> for Complex<f64> {
    fn from(dto: ComplexDTO) -> Self {
        Complex::new(dto.re, dto.im)
    }
}

#[derive(Debug, Deserialize)]
pub struct TouchstoneRaw {
    pub id: String,
    pub n_port: usize,
    pub frequencies: Vec<f64>,
    pub sparam: Vec<Vec<Vec<ComplexDTO>>>,
    pub rn: Option<Vec<f64>>,
    pub fmin: Option<Vec<f64>>,
    pub sopt: Option<Vec<ComplexDTO>>,
}
