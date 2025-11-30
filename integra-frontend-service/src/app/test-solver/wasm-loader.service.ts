// src/app/services/wasm-loader.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class WasmLoaderService {
  private wasm: any | null = null;
  private wasmInterface: any | null = null;
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async init(): Promise<void> {
    // Se non sono in browser (SSR) → NON fare nulla
    if (!this.isBrowser) {
      return;
    }

    if (this.wasmInterface) {
      return; // già inizializzato
    }

    // ⚠️ Cambia il path in base a dove hai messo i file
    // Se li stai servendo come asset in /wasm/...
    const wasmModule = await import('../../wasm/solvers/sp/integra_sim.js');

    // Costruisco una URL ASSOLUTA valida per fetch in browser
    const wasmUrl = new URL(
      '/wasm/solvers/sp/integra_sim_bg.wasm',
      window.location.origin
    ).toString();

    // Inizializzo il modulo wasm-bindgen passando la URL
    await wasmModule.default({
      module_or_path: wasmUrl
    });

    // Creo l'istanza del tuo struct Rust
    this.wasmInterface = new wasmModule.WasmInterface();
  }

  handleRequest(input: string): string {
    if (!this.wasmInterface) {
      throw new Error('WASM non inizializzato. Chiama prima init().');
    }
    return this.wasmInterface.handle_request(input);
  }
}
