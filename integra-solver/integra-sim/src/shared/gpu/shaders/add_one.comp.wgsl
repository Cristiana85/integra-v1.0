@group(0) @binding(0)
var<storage, read> input_buffer: array<f32>;

@group(0) @binding(1)
var<storage, read_write> output_buffer: array<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let idx = global_id.x;
    // supponiamo che l'host usi al massimo 1024 elementi
    if (idx < 1024u) {
        output_buffer[idx] = input_buffer[idx] + 1.0;
    }
}
