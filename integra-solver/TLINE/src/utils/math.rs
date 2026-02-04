use crate::error::{codes, ErrorReport};

pub fn ln(x: f64) -> Result<f64, ErrorReport> {
    if !(x > 0.0) || !x.is_finite() {
        return Err(ErrorReport::new(codes::NUMERIC_FAILURE, "ln domain error"));
    }
    Ok(x.ln())
}
