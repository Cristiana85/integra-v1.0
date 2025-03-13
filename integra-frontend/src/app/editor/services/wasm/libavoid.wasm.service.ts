import { Injectable } from '@angular/core';
import init, { WasmSpAnalyzer } from 'src/assets/wasm/sp_solver_wasm.js';

@Injectable({
  providedIn: 'root',
})
export class WasmService {
  private spAnalyzer: WasmSpAnalyzer;

  constructor() {
    this.loadWasm();
  }

  async loadWasm() {
    await init('/assets/wasm/sp_solver_wasm_bg.wasm');
    this.spAnalyzer = new WasmSpAnalyzer();
  }

  add(jsonData: string): boolean {
    return this.spAnalyzer.add(0, jsonData);
  }

  get() {
    /*if (!this.spAnalyzer) {
      console.error('❌ WASM non ancora caricato!');
      return null;
    }

    const result = this.spAnalyzer.get(0);
    console.log('✅ Lista Touchstone:', result);
    return result;*/
  }
  //}

  delete(filename: string): boolean {
    return this.spAnalyzer.delete(0, filename); // 0 = Touchstone
  }

  progressOperation(callback: (progress: number) => void) {
    this.spAnalyzer.progress_operation((progress: number) => {
      console.log(`🔹 Progresso: ${progress}%`);
      callback(progress);
    });
  }
}
