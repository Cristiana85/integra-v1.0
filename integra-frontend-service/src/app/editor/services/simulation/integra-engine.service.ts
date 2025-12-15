import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { EngineMode } from './engine-mode.enum';
import { RequestEnvelope } from '../../models/protocol/request-envelope.model';
import { ResponseEnvelope } from '../../models/protocol/response-envelope.model';
import { ProgressUpdate } from '../../models/protocol/progress-update.model';

// import del bundle wasm generato da wasm_bindgen
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class IntegraEngineService {

  private readonly PROTOCOL_VERSION = '1.0';

  private engineMode: EngineMode = EngineMode.Wasm; // o da environment

  private wasmReady: Promise<void> | null = null;

  private readonly isBrowser: boolean;

  private wasmInterface: any | null = null;

  private progressSubject = new Subject<ProgressUpdate>();

  public readonly progress$: Observable<ProgressUpdate> = this.progressSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.engineMode === EngineMode.Wasm) {
      this.wasmReady = this.bootstrapWasmEngine();
    } else {
      this.bootstrapNativeChannel();
    }
  }

  // ---------- Public API low-level ----------

  /**
   * Invia una richiesta al motore e restituisce la ResponseEnvelope.
   * Il call site deciderà il tipo di payload.
   */
  async sendRequest<TReq, TResp>(
    type: string,
    payload: TReq,
    idOverride?: string,
  ): Promise<ResponseEnvelope<TResp>> {
    const envelope: RequestEnvelope<TReq> = {
      id: crypto.randomUUID(),
      version: this.PROTOCOL_VERSION,
      type,
      payload,
    };

    if (this.engineMode === EngineMode.Wasm) {
      return this.sendToWasm<TReq, TResp>(envelope);
    } else {
      return this.sendToNative<TReq, TResp>(envelope);
    }
  }

  /**
   * Stream globale dei progress update (tutti i job, filtrerai per job_id nel facade).
   */
  getProgressStream(): Observable<ProgressUpdate> {
    return this.progress$;
  }

  // ---------- WASM implementation ----------

  private async bootstrapWasmEngine(): Promise<void> {
    // Se non sono in browser (SSR) → NON fare nulla
    if (!this.isBrowser) {
      return;
    }

    if (this.wasmInterface) {
      return; // già inizializzato
    }

    // ⚠️ Cambia il path in base a dove hai messo i file
    // Se li stai servendo come asset in /wasm/...
    const wasmModule = await import('../../../../wasm/solvers/sp/integra_sim.js');

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

    // registriamo la callback di progress (push dal core Rust)
    // wasm_bindgen mapperà js_sys::Function -> (json: string) => void
    /*(this.wasmInterface as any).set_progress_callback((json: string) => {
      try {
        const update = JSON.parse(json) as ProgressUpdate;
        this.progressSubject.next(update);
      } catch (err) {
        console.error('Failed to parse WASM progress JSON', err, json);
      }
    });*/

  }

  private async sendToWasm<TReq, TResp>(
    envelope: RequestEnvelope<TReq>,
  ): Promise<ResponseEnvelope<TResp>> {
    if (!this.wasmReady) {
      this.wasmReady = this.bootstrapWasmEngine();
    }
    await this.wasmReady;

    if (!this.wasmInterface) {
      throw new Error('WASM engine not initialized');
    }

    const reqJson = JSON.stringify(envelope);
    const respJson = this.wasmInterface.dispatch_json(reqJson);
    return JSON.parse(respJson) as ResponseEnvelope<TResp>;
  }

  // ---------- NATIVE implementation ----------

  /**
   * Qui prepari il canale di progress per native (WebSocket, SSE, IPC…).
   * Per ora mettiamo un placeholder con WebSocket.
   */
  private bootstrapNativeChannel(): void {
    const ws = new WebSocket('ws://localhost:9000/sim-progress'); // esempio

    ws.onmessage = (evt: MessageEvent) => {
      try {
        const update = JSON.parse(evt.data) as ProgressUpdate;
        this.progressSubject.next(update);
      } catch (err) {
        console.error('Failed to parse native progress JSON', err, evt.data);
      }
    };

    ws.onopen = () => console.log('[Native] progress WebSocket connected');
    ws.onerror = err => console.error('[Native] progress WebSocket error', err);
    ws.onclose = () => console.warn('[Native] progress WebSocket closed');
  }

  private async sendToNative<TReq, TResp>(
    envelope: RequestEnvelope<TReq>,
  ): Promise<ResponseEnvelope<TResp>> {
    const reqJson = JSON.stringify(envelope);

    // qui puoi usare fetch verso il bridge (Spring Boot, Electron, ecc.)
    const response = await fetch('http://localhost:9000/api/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: reqJson,
    });

    const respJson = await response.text();
    return JSON.parse(respJson) as ResponseEnvelope<TResp>;
  }
}
