use crate::{
    core::{
        analysis::payloads::AnalysisPayload, dataset::{Dataset, DependentVar, IndependentVar}, model::payloads::touchstone::TouchstoneModel
    },
    error::{ErrorMessage, Result, codes::ErrorCode},
    simulator::context::SolverContext,
};

/// Per funzioni interne che vogliono esporre errori leggeri a stringa
type StrResult<T> = std::result::Result<T, &'static str>;

/// Entry point S-parameter: prende tutto da ctx (models + analysis), riempie ctx.dataset.
/// Nota: FnMut perché chiamato più volte.
pub fn solve(
    ctx: &mut SolverContext,
    mut emit_progress: impl FnMut(f64, &str),
) -> Result<()> {
    emit_progress(5.0, "sparameter: reading analysis");

    // 1) analysis
    let analysis = match &ctx.analysis.payload {
        AnalysisPayload::Sparameter(a) => a,
        _ => {
            return Err(ErrorMessage::from_code(
                ErrorCode::ModelAnalysisMismatch,
                "Sparameter engine called with incompatible analysis",
            ));
        }
    };

    // 2) pick a touchstone model
    emit_progress(10.0, "sparameter: selecting touchstone model");

    let ts = ctx.touchstones().next().ok_or_else(|| {
        ErrorMessage::from_code(
            ErrorCode::ModelAnalysisMismatch,
            "Sparameter requires at least one Touchstone model",
        )
        .with_details(serde_json::json!({
            "required": ["touchstone"],
            "found": model_types_in_ctx(ctx)
        }))
    })?;

    // 3) parse touchstone
    emit_progress(20.0, "sparameter: parsing touchstone");

    let parsed = parse_touchstone_v1(ts, analysis.strict)?;

    // 4) build dataset from user spec
    emit_progress(30.0, "sparameter: building dataset");
    
    let mut dataset = Dataset::empty_with_spec(analysis.dataset.clone());

    // independent (for now fixed to freq in Hz, but spec provides name/unit)
    dataset.independent = IndependentVar {
        name: dataset.spec.independent.name.clone(),
        unit: dataset.spec.independent.unit.clone(),
        values: parsed.freq_hz.clone(),
    };

    // dependent variables (user requested)
    let total = dataset.spec.dependent.len().max(1);
    for (k, dep_spec) in dataset.spec.dependent.iter().enumerate() {
        emit_progress(
            30.0 + (60.0 * (k as f64) / (total as f64)),
            &format!("sparameter: eval {}", dep_spec.expr),
        );

        let (unit_default, values) = eval_dep_expr(&parsed, &dep_spec.expr).map_err(|msg| {
            ErrorMessage::from_code(ErrorCode::AnalysisInvalid, msg)
                .with_path(format!("analysis.payload.dataset.dependent[{}].expr", k))
                .with_details(serde_json::json!({ "expr": dep_spec.expr }))
        })?;

        let unit_final = dep_spec.unit.clone().unwrap_or(unit_default);

        dataset.dependent.push(DependentVar {
            name: dep_spec.name.clone(),
            unit: unit_final,
            values,
        });
    }

    dataset.meta.info = serde_json::json!({
        "source": "touchstone",
        "n_ports": ts.n_ports
    });

    ctx.dataset = Some(dataset);

    emit_progress(100.0, "sparameter: done");
    Ok(())
}

// -----------------------------------------------------------------------------
// Parsed touchstone representation (minimal)
// -----------------------------------------------------------------------------

#[derive(Debug, Clone)]
struct ParsedTouchstone {
    freq_hz: Vec<f64>,
    /// For each frequency point: matrix S[n_ports][n_ports] as complex (re, im)
    s: Vec<Vec<Vec<(f64, f64)>>>,
    n_ports: usize,
}

/// Minimal Touchstone v1 parser (supports MA/DB/RI).
/// Returns crate::error::Result<T> (ErrorMessage as error).
fn parse_touchstone_v1(ts: &TouchstoneModel, strict: bool) -> Result<ParsedTouchstone> {
    let mut lines = ts
        .content
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty() && !l.starts_with('!'));

    // defaults from model
    let mut freq_unit = ts.freq_unit.to_lowercase(); // hz/khz/mhz/ghz
    let mut format = ts.format.to_lowercase();       // ma/db/ri
    let n_ports = ts.n_ports as usize;

    // optional header "# ..."
    if let Some(first) = lines.clone().next() {
        if first.starts_with('#') {
            let header = first;
            lines.next();

            let tokens: Vec<&str> = header[1..].split_whitespace().collect();
            if tokens.len() >= 3 {
                freq_unit = tokens[0].to_lowercase();
                format = tokens[2].to_lowercase();
            }
        }
    }

    let hz_mul = match freq_unit.as_str() {
        "hz" => 1.0,
        "khz" => 1e3,
        "mhz" => 1e6,
        "ghz" => 1e9,
        other => {
            if strict {
                return Err(ErrorMessage::from_code(
                    ErrorCode::ModelInvalid,
                    format!("Unsupported freq_unit: {}", other),
                ));
            }
            1e9
        }
    };

    // Need: freq + (2 numbers) * (N*N complex)
    let need_numbers = 1 + 2 * n_ports * n_ports;

    let mut freq_hz: Vec<f64> = Vec::new();
    let mut s_all: Vec<Vec<Vec<(f64, f64)>>> = Vec::new();
    let mut buffer: Vec<f64> = Vec::new();

    for line in lines {
        let clean = line.split('!').next().unwrap_or("").trim();
        if clean.is_empty() {
            continue;
        }

        for tok in clean.split_whitespace() {
            if let Ok(v) = tok.parse::<f64>() {
                buffer.push(v);
            } else if strict {
                return Err(ErrorMessage::from_code(
                    ErrorCode::ModelInvalid,
                    "Non-numeric token in touchstone",
                ));
            }
        }

        while buffer.len() >= need_numbers {
            let record: Vec<f64> = buffer.drain(0..need_numbers).collect();

            let f = record[0] * hz_mul;
            let mut mat = vec![vec![(0.0, 0.0); n_ports]; n_ports];

            // Common Touchstone ordering: by column j=1..N: S1j S2j ... SNj
            let mut idx = 1;
            for col in 0..n_ports {
                for row in 0..n_ports {
                    let a = record[idx];
                    let b = record[idx + 1];
                    idx += 2;

                    let (re, im) = match format.as_str() {
                        "ri" => (a, b),
                        "ma" => {
                            let mag = a;
                            let ang = b.to_radians();
                            (mag * ang.cos(), mag * ang.sin())
                        }
                        "db" => {
                            let mag = 10f64.powf(a / 20.0);
                            let ang = b.to_radians();
                            (mag * ang.cos(), mag * ang.sin())
                        }
                        other => {
                            if strict {
                                return Err(ErrorMessage::from_code(
                                    ErrorCode::ModelInvalid,
                                    format!("Unsupported touchstone format: {}", other),
                                ));
                            }
                            (a, b)
                        }
                    };

                    mat[row][col] = (re, im);
                }
            }

            freq_hz.push(f);
            s_all.push(mat);
        }
    }

    if freq_hz.is_empty() {
        return Err(ErrorMessage::from_code(
            ErrorCode::ModelInvalid,
            "Touchstone contains no data records",
        ));
    }

    Ok(ParsedTouchstone {
        freq_hz,
        s: s_all,
        n_ports,
    })
}

// -----------------------------------------------------------------------------
// Expression evaluator: angle(S21), db(S21), mag(S21), re(S21), im(S21)
// -----------------------------------------------------------------------------

fn eval_dep_expr(parsed: &ParsedTouchstone, expr: &str) -> StrResult<(String, Vec<f64>)> {
    let e = expr.trim().to_lowercase();

    let (func, sij) = split_func_call(&e)?;
    let (i, j) = parse_sij(&sij)?; // 1-based

    if i == 0 || j == 0 || i > parsed.n_ports || j > parsed.n_ports {
        return Err("Sij index out of range for this touchstone n_ports");
    }

    let row = i - 1;
    let col = j - 1;

    let mut out = Vec::with_capacity(parsed.freq_hz.len());

    for mat in &parsed.s {
        let (re, im) = mat[row][col];
        match func.as_str() {
            "re" => out.push(re),
            "im" => out.push(im),
            "mag" => out.push((re * re + im * im).sqrt()),
            "db" => {
                let mag = (re * re + im * im).sqrt().max(1e-300);
                out.push(20.0 * mag.log10());
            }
            "angle" | "phase" => out.push(im.atan2(re).to_degrees()),
            _ => return Err("Unsupported function (use re/im/mag/db/angle)"),
        }
    }

    let unit = match func.as_str() {
        "re" | "im" | "mag" => "",
        "db" => "dB",
        "angle" | "phase" => "deg",
        _ => "",
    }
    .to_string();

    Ok((unit, out))
}

fn split_func_call(s: &str) -> StrResult<(String, String)> {
    let open = s.find('(').ok_or("Invalid expr: expected fn(Sij)")?;
    let close = s.rfind(')').ok_or("Invalid expr: expected fn(Sij)")?;
    if close <= open {
        return Err("Invalid expr parentheses");
    }
    let func = s[..open].trim().to_string();
    let arg = s[open + 1..close].trim().to_string();
    Ok((func, arg))
}

fn parse_sij(s: &str) -> StrResult<(usize, usize)> {
    // For now supports single-digit i,j: S21 etc (fine for 2-port test)
    let t = s.trim().to_lowercase();
    if !t.starts_with('s') {
        return Err("Invalid Sij token: must start with S");
    }
    let chars: Vec<char> = t.chars().collect();
    if chars.len() != 3 {
        return Err("For now only supports Sij with single-digit i,j (e.g., S21)");
    }
    let i = chars[1].to_digit(10).ok_or("Invalid i in Sij")? as usize;
    let j = chars[2].to_digit(10).ok_or("Invalid j in Sij")? as usize;
    Ok((i, j))
}

fn model_types_in_ctx(ctx: &SolverContext) -> Vec<&'static str> {
    use crate::core::model::ModelPayload;
    ctx.models
        .iter()
        .map(|m| match &m.payload {
            ModelPayload::TlineMicrostrip(_) => "tline_microstrip",
            ModelPayload::TlineStripline(_) => "tline_stripline",
            ModelPayload::Netlist(_) => "netlist",
            ModelPayload::Touchstone(_) => "touchstone",
        })
        .collect()
}