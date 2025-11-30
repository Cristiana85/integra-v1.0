use integra_sim::interfaces::native_interface::NativeInterface;

fn main() {
    let iface = NativeInterface::new();
    let result = iface.handle_request(r#"{"type":"simulate","data":"..." }"#);
    println!("{}", result);
}