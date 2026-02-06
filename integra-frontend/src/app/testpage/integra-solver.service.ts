import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type SolverEvent =
  | { type: 'worker_ready'; sessionId: string }
  | { type: 'wasm_message'; envelope: any }
  | { type: 'worker_error'; message: string };

@Injectable({ providedIn: 'root' })
export class IntegraSolverService {
  private worker?: Worker;
  private events$ = new Subject<SolverEvent>();

  public stream(): Observable<SolverEvent> {
    return this.events$.asObservable();
  }

  init() {
    if (this.worker) return;

    this.worker = new Worker(new URL('./integra-solver.worker', import.meta.url), {
      type: 'module',
    });

    this.worker.onmessage = ({ data }) => {
      if (data.type === 'worker_ready') {
        this.events$.next({ type: 'worker_ready', sessionId: data.sessionId });
      } else if (data.type === 'wasm_message') {
        // il worker manda json string envelope: parse qui
        try {
          const env = JSON.parse(data.json);
          this.events$.next({ type: 'wasm_message', envelope: env });
        } catch (e) {
          this.events$.next({ type: 'worker_error', message: 'Invalid JSON from wasm' });
        }
      } else if (data.type === 'worker_error') {
        this.events$.next({ type: 'worker_error', message: data.message });
      }
    };
  }

  setModel(model: any) {
    this.worker?.postMessage({ type: 'set_model', modelJson: JSON.stringify(model) });
  }

  setAnalysis(analysis: any) {
    this.worker?.postMessage({ type: 'set_analysis', analysisJson: JSON.stringify(analysis) });
  }

  run(runId: string) {
    this.worker?.postMessage({ type: 'run', runId });
  }
}
