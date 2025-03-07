import { Injectable } from '@angular/core';
import init, { Calculator } from 'src/assets/wasm/sp_solver.js';

@Injectable({
  providedIn: 'root',
})
export class WasmService {
  private wasmModule: any;

  constructor() {
    this.loadWasm(); // ✅ Chiamata corretta al metodo asincrono
  }

  // ✅ Metodo asincrono corretto
  private async loadWasm(): Promise<void> {
    try {
      await init('/assets/wasm/sp_solver_bg.wasm');
      //this.wasmModule = wasmModule;
      //console.log('✅ WASM Module Loaded!', this.wasmModule);
      console.log(Calculator.add(10, 5));
      //let a = wasmModule.add(10, 5);
      //console.log('✅ WASM Module Loaded!', this.wasmModule);
    } catch (err) {
      console.error('❌ Failed to load WASM:', err);
    }
  }

  allocateMemory(numFreqs: number, numPorts: number): Float64Array {
    if (!this.wasmModule) throw new Error('WASM module not loaded');
    const ptr = this.wasmModule.allocate_memory(numFreqs, numPorts);
    return new Float64Array(
      this.wasmModule.memory.buffer,
      ptr,
      numFreqs * (1 + numPorts * numPorts * 2)
    );
  }

  importData(
    filename: string,
    buffer: Float64Array,
    numFreqs: number,
    numPorts: number
  ) {
    if (!this.wasmModule) throw new Error('WASM module not loaded');
    this.wasmModule.import_data(filename, buffer, numFreqs, numPorts);
  }

  getData(filename: string): Float64Array | null {
    if (!this.wasmModule) throw new Error('WASM module not loaded');
    const ptr = this.wasmModule.get_data(filename);
    if (!ptr) return null;
    return new Float64Array(this.wasmModule.memory.buffer, ptr);
  }
}
