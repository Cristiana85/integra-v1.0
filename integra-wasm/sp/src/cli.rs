use std::error::Error;

use isolver::core::integra_solver::IntegraSolver;

fn main() -> Result<(), Box<dyn Error>> {
    let mut solver = IntegraSolver::new();

    // 1. Legge un touchstone da file JSON
    //let json = fs::read_to_string("data/example_touchstone.json")?;
    let json = r#"
                        {
                        "id": "demo",
                        "n_port": 2,
                        "frequencies": [1.0e9, 2.0e9],
                        "sparam": [
                            [
                            [{ "re": 0.1, "im": 0.0 }, { "re": 0.2, "im": 0.0 }],
                            [{ "re": 0.3, "im": 0.0 }, { "re": 0.4, "im": 0.0 }]
                            ],
                            [
                            [{ "re": 0.5, "im": 0.0 }, { "re": 0.6, "im": 0.0 }],
                            [{ "re": 0.7, "im": 0.0 }, { "re": 0.8, "im": 0.0 }]
                            ]
                        ],
                        "rn": [50.0, 50.0],
                        "fmin": [0.9, 1.0],
                        "sopt": [
                            { "re": 0.1, "im": 0.1 },
                            { "re": 0.2, "im": -0.1 }
                        ]
                        }
                        "#;
    let _ = solver.write_touchstone(&json);
    println!("✅ Touchstone importato!");

    // 2. Elenca tutti gli ID presenti
    let ids = solver.list_ids();
    println!("📦 ID disponibili:");
    for id in &ids {
        println!("  - {}", id);
    }

    // 3. Recupera un touchstone come JSON
    if let Some(first_id) = ids.first() {
        let _ts_json: Result<String, isolver::core::IntegraError> = solver.get_touchstone(first_id);
        println!("\n📄 JSON Touchstone '{}':\n", first_id);
    }

    // 4. Rimuove un touchstone
    if let Some(first_id) = ids.first() {
        let _ = solver.delete_touchstone(first_id);
        println!("❌ Touchstone '{}' rimosso.", first_id);
    }

    Ok(())
}
