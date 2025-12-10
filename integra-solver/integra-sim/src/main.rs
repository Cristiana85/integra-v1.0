use integra_sim::NativeInterface;

fn main() {
    // Simula la richiesta JSON che arriverà
    let request_json = r#"{
        "id": "1",
        "version": "1.0",
        "type": "run_ac",
        "payload": {
            "message": "Hello from native main!"
        }
    }"#;

    // Oggetto nativo "vivo"
    let mut native = NativeInterface::new("native-main");

    let response_json = native.process_request(request_json);

    //println!("Request:\n{request_json}\n");
    println!("Response:\n{response_json}");
}
