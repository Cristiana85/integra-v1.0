use integra_sim::protocol::update::WasmUpdate;
// src/main.rs
use integra_sim::{
    IntegraEngine
};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

fn main() {
    // Engine condiviso tra thread mediante Arc<Mutex<>>
    let engine = Arc::new(Mutex::new(IntegraEngine::new("test-engine")));

    // Registra progress callback
    {
        let mut eng = engine.lock().unwrap();
        eng.set_update_callback(Box::new(move |update: WasmUpdate| {
            println!(
                "[PROGRESS] job_id={} phase={} {:>5.1}% msg={}",
                update.job_id,
                update.phase,
                update.percent,
                update.message
            );
        }));
    }

    // JSON di richiesta
    let request_json = r#"{
        "id": "job-123",
        "version": "1.0",
        "type": "solver_test",
        "payload": {
            "message": "Hello with pause/resume!"
        }
    }"#.to_string();

    // Clona Arc per il thread di simulazione
    let engine_sim = engine.clone();

    // --- Thread simulazione ---
    let handle = thread::spawn(move || {
        println!("=== SIM THREAD: starting simulation ===");

        let mut eng = engine_sim.lock().unwrap();
        let response = eng.dispatch_json(&request_json);

        println!("=== SIM THREAD: final response ===");
        println!("{response}");
    });

    // --- Thread "controllo" (main) ---

    // un po' di tempo e poi mettiamo in pausa
    thread::sleep(Duration::from_secs(1));
    {
        let eng = engine.lock().unwrap();
        println!("=== MAIN: pause simulation ===");
        eng.pause();
    }

    thread::sleep(Duration::from_secs(2));
    {
        let eng = engine.lock().unwrap();
        println!("=== MAIN: resume simulation ===");
        eng.resume();
    }

    // opzionale: cancella dopo un po'
    // se vuoi vedere la fine "pulita", commenta le prossime 4 righe
    thread::sleep(Duration::from_secs(1));
    {
        let eng = engine.lock().unwrap();
        println!("=== MAIN: cancel simulation ===");
        eng.cancel();
    }

    // aspetta che il thread di simulazione finisca
    handle.join().unwrap();

    println!("=== MAIN: done ===");
}
