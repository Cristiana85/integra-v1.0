// src/dispatcher.rs
pub struct Dispatcher;

impl Dispatcher {
    pub fn new() -> Self {
        Dispatcher
    }

    pub fn handle_message(&self, message: &str) -> String {
        // Logica simulata, da sostituire
        format!("{{\"response\": \"Handled: {}\"}}", message)
    }
}