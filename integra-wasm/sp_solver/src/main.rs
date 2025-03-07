#[cfg(target_os = "windows")]
mod windows_exe {
    use rfd::FileDialog;
    use std::fs::File;
    use std::io::{BufRead, BufReader};
    use std::collections::HashMap;
    use std::str::FromStr;
    use std::path::PathBuf;

    #[derive(Debug, Clone)]
    pub struct TouchstoneData {
        pub frequencies: Vec<f64>,
        pub s_matrix: Vec<Vec<Vec<(f64, f64)>>>, // (real, imag)
    }

    fn extract_num_ports(filename: &str) -> Option<usize> {
        filename.rsplit('.').next()?.strip_prefix("s")?.strip_suffix("p")?.parse().ok()
    }

    pub fn load_touchstone_file(filename: &str) -> Result<TouchstoneData, Box<dyn std::error::Error>> {
        println!("📂 Opening file: {}", filename);
        let file = File::open(filename)?;
        let reader = BufReader::new(file);
        let lines = reader.lines().filter_map(Result::ok).collect::<Vec<String>>();

        if lines.is_empty() || !lines[0].starts_with("#") {
            return Err("Invalid Touchstone format".into());
        }

        let num_ports = 2;//extract_num_ports(filename).ok_or("Cannot determine number of ports")?;
        let num_params = num_ports * num_ports;
        let expected_columns = 1 + num_params * 2;

        let mut frequencies = Vec::new();
        let mut s_matrix = vec![vec![vec![(0.0, 0.0); num_ports]; num_ports]; 0];

        for line in lines.iter().skip(1) {
            let values: Vec<f64> = line.split_whitespace()
                .filter_map(|v| f64::from_str(v).ok())
                .collect();

                println!("{}", values.get(0).unwrap());

            if values.len() != expected_columns {
                return Err(format!("Incorrect data format in line: {}", line).into());
            }

            let freq = values[0];
            frequencies.push(freq);
            let mut matrix = vec![vec![(0.0, 0.0); num_ports]; num_ports];

            let mut index = 1;
            for i in 0..num_ports {
                for j in 0..num_ports {
                    matrix[i][j] = (values[index], values[index + 1]);
                    index += 2;
                }
            }

            s_matrix.push(matrix);
        }

        Ok(TouchstoneData { frequencies, s_matrix })
    }

    pub fn run() {
        println!("📂 Please select a Touchstone file (.sNp)...");

        // ✅ Open file picker
        if let Some(path) = FileDialog::new()
            .add_filter("Touchstone Files", &["s2p", "s3p", "s4p"])
            .pick_file()
        {
            let filename = path.to_string_lossy().to_string();
            println!("✅ Selected file: {}", filename);

            match load_touchstone_file(&filename) {
                Ok(data) => {
                    println!("✅ Loaded {} with {} frequencies", filename, data.frequencies.len());
                    for (f, freq) in data.frequencies.iter().enumerate() {
                        println!("Freq: {:.3} GHz", freq);
                        for (i, row) in data.s_matrix[f].iter().enumerate() {
                            for (j, &(real, imag)) in row.iter().enumerate() {
                                println!("S[{}][{}] = ({}, {})", i + 1, j + 1, real, imag);
                            }
                        }
                    }
                }
                Err(e) => eprintln!("❌ Error: {}", e),
            }
        } else {
            println!("❌ No file selected.");
        }
    }
}

#[cfg(target_os = "windows")]
fn main() {
    windows_exe::run();
}

#[cfg(not(target_os = "windows"))]
fn main() {
    println!("❌ This executable is only for Windows. Use the WASM library instead.");
}
