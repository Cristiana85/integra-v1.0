#[cfg(not(target_arch = "wasm32"))]
fn main() {
    use sp_solver_wasm::modules::sp_analyzer::sp_analyzer::SPAnalyzer;

    println!("Running SP solver in standalone mode...");
    let mut analyzer = SPAnalyzer::new();
    analyzer.solve_netlist();
}