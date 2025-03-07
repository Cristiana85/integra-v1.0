import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WasmService {
  private wasmModule: any;

  constructor() {
    this.loadWasm();
  }

  async loadWasm() {
    try {
      const wasm = await import('../../../../../wasm/solvers/sp/sp_solver.js'); // Adjust the path if needed
      this.wasmModule = await wasm.default();
      console.log('✅ WASM module loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load WASM module:', error);
    }
  }

  allocateMemory(numFreqs: number, numPorts: number): Float64Array {
    if (!this.wasmModule) throw new Error("WASM module not loaded");
    const ptr = this.wasmModule.allocate_memory(numFreqs, numPorts);
    return new Float64Array(this.wasmModule.memory.buffer, ptr, numFreqs * (1 + numPorts * numPorts * 2));
  }

  importData(filename: string, buffer: Float64Array, numFreqs: number, numPorts: number) {
    if (!this.wasmModule) throw new Error("WASM module not loaded");
    this.wasmModule.import_data(filename, buffer, numFreqs, numPorts);
  }

  getData(filename: string): Float64Array | null {
    if (!this.wasmModule) throw new Error("WASM module not loaded");
    const ptr = this.wasmModule.get_data(filename);
    if (!ptr) return null;
    return new Float64Array(this.wasmModule.memory.buffer, ptr);
  }
}
