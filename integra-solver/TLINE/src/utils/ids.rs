pub fn new_session_id() -> String {
    format!("sess-{}", js_now_ms())
}

fn js_now_ms() -> u64 {
    // evita dipendenze extra: web_sys Date
    (js_sys::Date::now()) as u64
}
