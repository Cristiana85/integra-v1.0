use sp_solver_wasm::modules::analyzer::{Analyzer, DataType};

fn main() {
    let mut analyzer = Analyzer::new();
    println!("✅ Analyzer creato!");

    // 🔹 Aggiunta di una Netlist
    let json_netlist = r#"
    {
        "cells": [
            { "id": "r1", "type": "resistor", "attrs": { "resistance": 1000, "inductance": 5 }, "position": { "x": 10, "y": 10 } },
            { "id": "c1", "type": "capacitor", "attrs": { "capacitance": 10 }, "position": { "x": 20, "y": 30 } }
        ]
    }"#;

    if analyzer.add(DataType::Netlist, json_netlist) {
        println!("✅ Netlist aggiunta con successo!");
    }

    // 🔹 Aggiunta di un NetlistEl
    let json_netlist_element = r#"
    {
        "cells": [
            { "id": "c2", "type": "capacitor", "attrs": { "capacitance": 20 }, "position": { "x": 30, "y": 40 } }
        ]
    }"#;

    if analyzer.add(DataType::NetlistEl, json_netlist_element) {
        println!("✅ Netlist aggiornata con nuovi elementi!");
    }

    // 🔹 3. Stampa della Netlist aggiornata
    let netlist_json = analyzer.get(DataType::Netlist);
    println!("📄 Stato attuale della Netlist:\n{}", netlist_json);

    // 🔹 2. Modifica della cella "r1"
    let json_modifica = r#"
    {
        "attrs": { "resistance": 500, "inductance": 2.5 }
    }"#;

    println!("🔹 Modifica della cella 'r1'...");
    if analyzer.modify(DataType::NetlistEl, "r1", json_modifica) {
        println!("✅ Cella 'r1' modificata con successo!");
    } else {
        println!("❌ Errore nella modifica della cella!");
    }

    // 🔹 3. Stampa della Netlist aggiornata
    let netlist_json = analyzer.get(DataType::Netlist);
    println!("📄 Stato attuale della Netlist:\n{}", netlist_json);

    // 🔹 Elimina un NetlistEl (ad esempio "c2")
    if analyzer.delete(DataType::NetlistEl, "c2".to_string()) {
        println!("✅ NetlistEl eliminato con successo!");
    } else {
        println!("❌ Errore nell'eliminazione di NetlistEl!");
    }

    // 🔹 Elimina l'intera Netlist
    if analyzer.delete(DataType::Netlist, "".to_string()) {
        println!("✅ Netlist eliminata completamente!");
    } else {
        println!("❌ Nessuna Netlist da eliminare!");
    }

    // 🔹 Controlla che sia vuota
    println!(
        "📄 Stato attuale dopo eliminazione:\n{}",
        analyzer.get(DataType::Netlist)
    );
}
