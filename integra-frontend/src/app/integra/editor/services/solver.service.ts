import init, {
  import_touchstone,
  get_touchstone,
  remove_touchstone,
} from '../../../../../wasm/integra_solver';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SolverService {
  private initialized = false;

  // Inizializza il modulo wasm solo una volta
  async initWasm(): Promise<void> {
    if (!this.initialized) {
      await init('/wasm/integra_solver/solver_bg.wasm'); // <-- attenzione: serve path pubblico!
      this.initialized = true;
    }
  }

  // Importa un touchstone (JSON string)
  async importTouchstone(json: string): Promise<void> {
    await this.initWasm();
    import_touchstone(json);
  }

  // Ottieni lista di ID
  async listIds(): Promise<string[]> {
    await this.initWasm();
    const val = "ToDo";
    return val as unknown as string[];
  }

  // Ottieni un touchstone serializzato
  async getTouchstone(id: string): Promise<string> {
    await this.initWasm();
    return get_touchstone(id);
  }

  // Rimuovi un touchstone
  async removeTouchstone(id: string): Promise<void> {
    await this.initWasm();
    remove_touchstone(id);
  }
}
