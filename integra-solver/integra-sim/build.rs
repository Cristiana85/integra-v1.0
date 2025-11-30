//use std::process::Command;

fn main() {}
/*fn main() {
    // Valida tutti i file .wgsl nella cartella `shaders/`
    let status = Command::new("cargo")
        .args(["wgsl", "validate", "shaders"])
        .status()
        .expect("failed to run `cargo wgsl` (is `cargo-wgsl` installed?)");

    if !status.success() {
        panic!("WGSL validation failed. Fix shader errors and rebuild.");
    }
}*/

//use std::fs;

/*fn main() {
    // Path relativo a `crates/gpu/`
    let shader_path = "src/shaders/add_one.comp.wgsl";
    println!("cargo:rerun-if-changed={shader_path}");

    let src = fs::read_to_string(shader_path)
        .expect("Failed to read WGSL shader file");

    if let Err(e) = naga::front::wgsl::parse_str(&src) {
        panic!("WGSL shader validation failed for {shader_path}: {e:?}");
    }
}*/

