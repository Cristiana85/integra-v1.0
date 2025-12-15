import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  SimulationStorageService,
  RcSimulationRecord,
  RcSimulationPoint,
} from '../shared/services/simulation-storage.service';
import {
  JsHeapInfo,
  StorageInfo,
  MemoryUtils,
} from '../shared/services/utils/memory-utils.service';

@Component({
  selector: 'app-index-db',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './index-db.component.html',
  styleUrls: ['./index-db.component.scss'],
})
export class IndexDbComponent implements OnInit, OnDestroy {
  private readonly isBrowser: boolean;
  private memoryIntervalId: any = null;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly storage: SimulationStorageService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Parametri RC
  r = 1000;
  c = 1e-6;
  vin = 5;

  // Numero punti per heavy (clampato per sicurezza)
  heavySteps = 500_000;

  // Stato UI
  isRunning = false; // <-- booleano semplice
  message = signal<string>('');

  // Memoria
  heapInfo = signal<JsHeapInfo | null>(null);
  storageInfo = signal<StorageInfo | null>(null);

  // Sim summary (niente punti)
  totalSimulations = signal<number>(0);
  lastSimSummary = signal<{
    id: number;
    points: number;
    approxBinaryMB: number;
    heavy: boolean;
  } | null>(null);

  async ngOnInit() {
    if (!this.isBrowser) {
      this.message.set(
        'Esecuzione lato server: IndexedDB e memoria browser non disponibili.'
      );
      return;
    }

    await this.refreshStorageInfo();
    await this.refreshSimulationCount(); // solo conta, no punti
    this.startMemoryPolling();
  }

  ngOnDestroy() {
    if (this.memoryIntervalId != null) {
      clearInterval(this.memoryIntervalId);
      this.memoryIntervalId = null;
    }
  }

  // ========= SIMULAZIONE BASE =========

  private simulateRC(
    R: number,
    C: number,
    Vin: number,
    steps: number
  ): Omit<RcSimulationRecord, 'id'> {
    const tau = R * C;
    const points: RcSimulationPoint[] = [];
    const maxTime = 5 * tau;
    const dt = maxTime / steps;

    for (let i = 0; i <= steps; i++) {
      const t = dt * i;
      const vout = Vin * (1 - Math.exp(-t / tau));
      points.push({ t, vout });
    }

    return {
      type: 'RC',
      params: { R, C, Vin },
      tau,
      points,
      timestamp: new Date().toISOString(),
    };
  }

  // ========= LIGHT =========

  async runLightSimulation() {
    if (!this.isBrowser) return;
    if (this.isRunning) return; // <-- boolean

    this.isRunning = true;
    this.message.set('Eseguo simulazione RC (light)...');

    try {
      const STEPS = 50;
      const sim = this.simulateRC(this.r, this.c, this.vin, STEPS);
      const pointCount = STEPS + 1;

      const approxBinaryMB = (pointCount * 2 * 8) / (1024 * 1024);

      const id = await this.storage.saveSimulation(sim);
      console.log('[LIGHT] salvata in IndexedDB, id=', id);

      this.lastSimSummary.set({
        id,
        points: pointCount,
        approxBinaryMB,
        heavy: false,
      });

      await this.refreshSimulationCount();
      await this.refreshStorageInfo();
      await MemoryUtils.hintGarbageCollection();

      this.message.set(
        `Light salvata (ID ${id}, punti=${pointCount}, ~${approxBinaryMB.toFixed(
          2
        )} MB binari stimati).`
      );
    } catch (err: any) {
      console.error('[LIGHT] errore:', err);
      this.message.set(
        'Errore nella simulazione light: ' + (err?.message || err)
      );
    } finally {
      this.isRunning = false; // <-- IMPORTANTISSIMO
    }
  }

  // ========= HEAVY (LIMITATA) =========

  async runHeavySimulation() {
    if (!this.isBrowser) return;
    if (this.isRunning) return;

    const MAX_STEPS = 1_000_000; // calcolati
    let steps = Number(this.heavySteps);
    if (!Number.isFinite(steps) || steps <= 0) {
      steps = 200_000;
    }
    if (steps > MAX_STEPS) {
      steps = MAX_STEPS;
      this.heavySteps = steps;
    }

    // fattore di decimazione per salvataggio
    const SAVE_EVERY = 20; // salva 1 punto ogni 20

    this.isRunning = true;
    this.message.set(
      `HEAVY con decimazione: ${steps.toLocaleString()} step, salvo 1 ogni ${SAVE_EVERY}...`
    );

    try {
      const R = this.r;
      const C = this.c;
      const Vin = this.vin;

      const tau = R * C;
      const maxTime = 5 * tau;
      const dt = maxTime / steps;

      const points: RcSimulationPoint[] = [];
      const YIELD_EVERY = 50_000;

      console.time('[HEAVY_DECIMATED] simulateRC');
      for (let i = 0; i <= steps; i++) {
        const t = dt * i;
        const vout = Vin * (1 - Math.exp(-t / tau));

        if (i % SAVE_EVERY === 0 || i === steps) {
          points.push({ t, vout });
        }

        if (i > 0 && i % YIELD_EVERY === 0) {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
      }
      console.timeEnd('[HEAVY_DECIMATED] simulateRC');

      const savedPoints = points.length;
      const approxBinaryMB = (savedPoints * 2 * 8) / (1024 * 1024);

      console.log('[HEAVY_DECIMATED] punti calcolati:', steps + 1);
      console.log('[HEAVY_DECIMATED] punti salvati:', savedPoints);

      const sim: Omit<RcSimulationRecord, 'id'> = {
        type: 'RC',
        params: { R, C, Vin },
        tau,
        points,
        timestamp: new Date().toISOString(),
      };

      console.time('[HEAVY_DECIMATED] saveSimulation');
      const id = await this.storage.saveSimulation(sim);
      console.timeEnd('[HEAVY_DECIMATED] saveSimulation');

      this.lastSimSummary.set({
        id,
        points: savedPoints,
        approxBinaryMB,
        heavy: true,
      });

      await this.refreshSimulationCount();
      await this.refreshStorageInfo();
      await MemoryUtils.hintGarbageCollection();

      this.message.set(
        `HEAVY decimata salvata (ID ${id}): calcolati ${(
          steps + 1
        ).toLocaleString()} punti, salvati ${savedPoints.toLocaleString()}, ~${approxBinaryMB.toFixed(
          2
        )} MB binari stimati.`
      );
    } catch (err: any) {
      console.error('[HEAVY_DECIMATED] errore:', err);
      this.message.set('Errore nella HEAVY decimata: ' + (err?.message || err));
    } finally {
      this.isRunning = false;
    }
  }

  // ========= CLEAR =========

  async clearSimulations() {
    if (!this.isBrowser) return;

    try {
      await this.storage.clearAllSimulations();
      this.totalSimulations.set(0);
      this.lastSimSummary.set(null);

      await this.refreshStorageInfo();
      await MemoryUtils.hintGarbageCollection();

      this.message.set('Tutte le simulazioni sono state cancellate.');
    } catch (err: any) {
      console.error('[CLEAR] errore:', err);
      this.message.set(
        'Errore nella cancellazione simulazioni: ' + (err?.message || err)
      );
    }
  }

  private async refreshSimulationCount() {
    if (!this.isBrowser) return;

    try {
      const sims = await this.storage.getAllSimulations();
      this.totalSimulations.set(sims.length);
      // NON usiamo i points, li ignoriamo subito
    } catch (err) {
      console.warn('[refreshSimulationCount] errore:', err);
    }
  }

  // ========= MEMORIA =========

  async checkJsHeapOnce() {
    if (!this.isBrowser) return;

    const info = await MemoryUtils.getJsHeapInfoAsync();
    this.heapInfo.set(info);

    if (!info) {
      this.message.set(
        'API memoria JS non disponibili in questo browser / contesto.'
      );
    } else {
      this.message.set(
        `JS Heap: ${info.usedMB.toFixed(2)} MB / ${info.limitMB.toFixed(
          2
        )} MB (~${info.percentOfLimit.toFixed(2)}% del limite).`
      );
    }
  }

  async checkStorageOnce() {
    if (!this.isBrowser) return;

    const info = await MemoryUtils.getStorageInfo();
    this.storageInfo.set(info);

    if (!info) {
      this.message.set(
        'API storage non disponibili in questo browser / contesto.'
      );
    } else {
      this.message.set(
        `Storage: ${info.usedMB.toFixed(2)} MB usati / ${info.quotaMB.toFixed(
          2
        )} MB (${info.percentUsed.toFixed(2)}% quota).`
      );
    }
  }

  private async refreshStorageInfo() {
    if (!this.isBrowser) return;
    const info = await MemoryUtils.getStorageInfo();
    this.storageInfo.set(info);
  }

  private startMemoryPolling() {
    if (!this.isBrowser) return;

    const poll = async () => {
      try {
        const heap = await MemoryUtils.getJsHeapInfoAsync();
        if (heap) this.heapInfo.set(heap);
      } catch (e) {
        console.warn('[MEM POLL] heap error:', e);
      }

      try {
        const storage = await MemoryUtils.getStorageInfo();
        if (storage) this.storageInfo.set(storage);
      } catch (e) {
        console.warn('[MEM POLL] storage error:', e);
      }
    };

    poll();
    if (this.memoryIntervalId != null) {
      clearInterval(this.memoryIntervalId);
    }
    this.memoryIntervalId = setInterval(poll, 5000);
  }

  async runCpuOnlyHeavy() {
    if (!this.isBrowser) return;
    if (this.isRunning) return;

    const MAX_STEPS = 5_000_000; // CPU test, ma senza salvataggio
    let steps = Number(this.heavySteps);
    if (!Number.isFinite(steps) || steps <= 0) {
      steps = 1_000_000;
    }
    if (steps > MAX_STEPS) {
      steps = MAX_STEPS;
      this.heavySteps = steps;
    }

    this.isRunning = true;
    this.message.set(
      `CPU-only HEAVY: ${steps.toLocaleString()} step senza salvataggio...`
    );

    try {
      const R = this.r;
      const C = this.c;
      const Vin = this.vin;

      const tau = R * C;
      const maxTime = 5 * tau;
      const dt = maxTime / steps;

      let acc = 0;
      const YIELD_EVERY = 100_000;

      console.time('[CPU_ONLY_HEAVY]');
      for (let i = 0; i <= steps; i++) {
        const t = dt * i;
        const vout = Vin * (1 - Math.exp(-t / tau));
        acc += vout;

        if (i > 0 && i % YIELD_EVERY === 0) {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
      }
      console.timeEnd('[CPU_ONLY_HEAVY]');

      this.message.set(
        `CPU-only HEAVY finita. steps=${steps.toLocaleString()}, acc=${acc.toExponential(
          4
        )}`
      );
    } catch (err: any) {
      console.error('[CPU_ONLY_HEAVY] errore:', err);
      this.message.set('Errore nella CPU-only heavy: ' + (err?.message || err));
    } finally {
      this.isRunning = false;
    }
  }
}
