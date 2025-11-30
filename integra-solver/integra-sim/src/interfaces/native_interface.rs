use crate::dispatcher::Dispatcher;

pub struct NativeInterface {
    dispatcher: Dispatcher,
}

impl NativeInterface {
    pub fn new() -> Self {
        NativeInterface {
            dispatcher: Dispatcher::new(),
        }
    }

    pub fn handle_request(&self, input: &str) -> String {
        self.dispatcher.handle_message(input)
    }
}
