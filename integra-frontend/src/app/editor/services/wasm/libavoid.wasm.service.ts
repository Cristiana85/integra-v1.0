import { Injectable } from '@angular/core';
import { data } from 'jquery';
import init, {
  WasmAnalyzer,
  WasmSolver,
} from 'src/assets/wasm/sp_solver_wasm.js';

@Injectable({
  providedIn: 'root',
})
export class WasmService {
  private wasmAnalyzer: WasmAnalyzer;
  private wasmSolver: WasmSolver;

  constructor() {
    this.loadWasm();
  }

  async loadWasm() {
    await init('/assets/wasm/sp_solver_wasm_bg.wasm');
    this.wasmAnalyzer = new WasmAnalyzer();
    this.wasmSolver = new WasmSolver();
  }

  add(data_type: number, jsonData: string): boolean {
    return this.wasmAnalyzer.add(data_type, jsonData);
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

  delete(data_type: number, filename: string): boolean {
    return this.wasmAnalyzer.delete(data_type, filename); // 0 = Touchstone
  }

  progressOperation(callback: (progress: number) => void) {
    this.wasmAnalyzer.progress_operation((progress: number) => {
      console.log(`🔹 Progresso: ${progress}%`);
      callback(progress);
    });
  }

  init(touchstone: any, netlist: any, dataset: any): boolean {
    try {
      this.wasmSolver.init(touchstone, netlist, dataset);
      return true;
    } catch (error) {
      console.error("Errore durante l'inizializzazione:", error);
      return false;
    }
  }

  parseDataset(): boolean {
    try {
      this.wasmSolver.parse_dataset();
      return true;
    } catch (error) {
      console.error('Errore nel parsing dataset:', error);
      return false;
    }
  }

  analyze(touchstone: any, netlist: any, dataset: any): void {
    this.wasmAnalyzer.analyze(touchstone, netlist, dataset);
  }

  clear(): void {
    this.wasmSolver.clear();
  }

  getData(): string | null {
    return this.wasmSolver.get_data();
  }
}
