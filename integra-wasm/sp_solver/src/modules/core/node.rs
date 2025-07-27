use std::rc::Rc;
use std::cell::RefCell;

#[derive(Debug, Clone)]
pub struct Node {
    name: Option<String>,
    n_node: i32,
    port: i32,
    internal: i32,
    component: Option<Rc<RefCell<Component>>>,
}

impl Node {
    /// Default constructor - unnamed node
    pub fn new() -> Self {
        Node {
            name: None,
            n_node: 0,
            port: 0,
            internal: 0,
            component: None,
        }
    }

    /// Named constructor
    pub fn with_name(name: &str) -> Self {
        Node {
            name: Some(name.to_string()),
            n_node: 0,
            port: 0,
            internal: 0,
            component: None,
        }
    }

    /// Setters and getters
    pub fn set_node(&mut self, n: i32) {
        self.n_node = n;
    }

    pub fn get_node(&self) -> i32 {
        self.n_node
    }

    pub fn set_port(&mut self, p: i32) {
        self.port = p;
    }

    pub fn get_port(&self) -> i32 {
        self.port
    }

    pub fn set_internal(&mut self, i: i32) {
        self.internal = i;
    }

    pub fn get_internal(&self) -> i32 {
        self.internal
    }

    pub fn set_component(&mut self, c: Rc<RefCell<Component>>) {
        self.component = Some(c);
    }

    pub fn get_component(&self) -> Option<Rc<RefCell<Component>>> {
        self.component.clone()
    }
}