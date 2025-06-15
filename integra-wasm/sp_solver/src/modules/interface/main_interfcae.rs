use sp_solver_wasm::modules::analyzer::{Analyzer, JSType};

fn main() {
    let mut analyzer = Analyzer::new();

    // ✅ 1. Creare un nuovo Dataset
    let json_dataset = r#"
    {
        "traces": []
    }"#;
    analyzer.add(JSType::Dataset, json_dataset);
    println!(
        "📄 Stato iniziale del Dataset:\n{}",
        analyzer.get(JSType::Dataset)
    );

    // ✅ 2. Aggiungere il primo Trace
    let json_trace1 = r#"
    {
        "tracename": "Trace1",
        "sweep": "freq",
        "solver": "simulatorA",
        "domain": "time",
        "data": "1.0,2.0,3.0",
        "format": "csv"
    }"#;
    analyzer.add(JSType::DatasetEl, json_trace1);
    println!(
        "📄 Dopo aggiunta di Trace1:\n{}",
        analyzer.get(JSType::DatasetEl)
    );

    // ✅ 3. Aggiungere un secondo Trace
    let json_trace2 = r#"
    {
        "tracename": "Trace2",
        "sweep": "voltage",
        "solver": "simulatorB",
        "domain": "frequency",
        "data": "4.0,5.0,6.0",
        "format": "json"
    }"#;
    analyzer.add(JSType::DatasetEl, json_trace2);
    println!(
        "📄 Dopo aggiunta di Trace2:\n{}",
        analyzer.get(JSType::DatasetEl)
    );

    // ✅ 4. Modificare il primo Trace
    let json_trace1_mod = r#"
    {
        "tracename": "Trace1",
        "sweep": "freq",
        "solver": "simulatorX",
        "domain": "time",
        "data": "10.0,20.0,30.0",
        "format": "csv"
    }"#;
    analyzer.modify(JSType::DatasetEl, "Trace1", json_trace1_mod);
    println!(
        "📄 Dopo modifica di Trace1:\n{}",
        analyzer.get(JSType::DatasetEl)
    );

    // ✅ 5. Eliminare Trace2
    analyzer.delete(JSType::DatasetEl, "Trace2".to_string());
    println!(
        "📄 Dopo eliminazione di Trace2:\n{}",
        analyzer.get(JSType::DatasetEl)
    );

    // ✅ 6. Aggiungere un nuovo Trace dopo la modifica
    let json_trace3 = r#"
    {
        "tracename": "Trace3",
        "sweep": "current",
        "solver": "simulatorC",
        "domain": "time",
        "data": "7.0,8.0,9.0",
        "format": "xml"
    }"#;
    analyzer.add(JSType::DatasetEl, json_trace3);
    println!(
        "📄 Dopo aggiunta di Trace3:\n{}",
        analyzer.get(JSType::DatasetEl)
    );

    // ✅ 7. Eliminare il Dataset intero
    analyzer.delete(JSType::Dataset, "".to_string());
    println!(
        "📄 Dopo eliminazione dell'intero Dataset:\n{}",
        analyzer.get(JSType::Dataset)
    );
}
