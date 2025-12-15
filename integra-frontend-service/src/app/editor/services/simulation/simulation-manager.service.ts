import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, takeUntil, Subject } from 'rxjs';
import { IntegraEngineService } from './integra-engine.service';
import { SimulationJob, SimulationState, SimulationId } from '../../models/simulation/simulation-job.model';
import { ProgressUpdate } from '../../models/protocol/progress-update.model';
import { ResponseEnvelope } from '../../models/protocol/response-envelope.model';

@Injectable({
  providedIn: 'root',
})
export class SimulationManagerService {
  private currentJobSubject = new BehaviorSubject<SimulationJob | null>(null);
  readonly currentJob$ = this.currentJobSubject.asObservable();

  private destroyJob$ = new Subject<void>();

  constructor(private engine: IntegraEngineService) {
    // sottoscrivo lo stream globale dei progress e lo filtro per current job
    /*this.engine.getProgressStream()
      .pipe(
        filter(() => !!this.currentJobSubject.value),
        filter(update => update.job_id === this.currentJobSubject.value?.id),
        takeUntil(this.destroyJob$),
      )
      .subscribe(update => {
        const job = this.currentJobSubject.value;
        if (!job) return;
        this.currentJobSubject.next({
          ...job,
          lastProgress: update,
          state: update.percent >= 100 ? SimulationState.Completed : SimulationState.Running,
        });
      });*/
  }

  /**
   * True se esiste una simulazione in corso (Running).
   */
  get isSimulationRunning$(): Observable<boolean> {
    return this.currentJob$.pipe(
      map(job => job?.state === SimulationState.Running),
    );
  }

  /**
   * Avvia una simulazione generica (per ora usiamo solver_test).
   * Ritorna la ResponseEnvelope quando il solver finisce, ma gli
   * aggiornamenti di progress arrivano in push su currentJob$.
   */
  async runSolverTest(message: string): Promise<ResponseEnvelope<any>> {
    const current = this.currentJobSubject.value;
    if (current?.state === SimulationState.Running) {
      throw new Error('A simulation is already running for this user');
    }

    // creiamo subito il job con stato Running
    const jobId = crypto.randomUUID();
    this.currentJobSubject.next({
      id: jobId,
      state: SimulationState.Running,
    });

    // atteniamo progress filtrati per questo jobId
    // (Rust deve usare req.id come job_id nei ProgressUpdate)
    const response = await this.engine.sendRequest<{ message: string }, any>(
      'solver_test',
      { message },
      jobId,
    );

    // se il solver non manda progress 100%, sistemiamo noi
    const job = this.currentJobSubject.value;
    if (job) {
      this.currentJobSubject.next({
        ...job,
        state: response.ok ? SimulationState.Completed : SimulationState.Failed,
        error: response.ok ? undefined : response.error?.message,
      });
    }

    return response;
  }

  /**
   * Resetta lo stato dopo una simulazione (per UI, cleanup, etc.).
   */
  resetCurrentJob(): void {
    this.destroyJob$.next();
    this.currentJobSubject.next(null);
  }
}
