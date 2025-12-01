import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SimulationStorageService,
  RcSimulationRecord,
  RcSimulationPoint,
} from '../shared/services/simulation-storage.service';

@Component({
  selector: 'app-rc-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './index-db.component.html',
  styleUrls: ['./index-db.component.scss'],
})
export class IndexDBComponent {
  private storage = inject(SimulationStorageService);

  // parametri input
  r = 1000; // ohm
  c = 1e-6; // F
  vin = 5; // V

  // stato UI
  isRunning = false;
  lastSimulation: RcSimulationRecord | null = null;
  savedSimulations: RcSimulationRecord[] = [];
  message = '';

  // ===== Simulazione RC (stessa logica dell'esempio HTML) =====
  private simulateRC(
    R: number,
    C: number,
    Vin: number
  ): Omit<RcSimulationRecord, 'id'> {
    const tau = R * C;
    const points: RcSimulationPoint[] = [];
    const maxTime = 5 * tau;
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const t = (maxTime / steps) * i;
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

  async runSimulation() {
    this.isRunning = true;
    this.message = 'Eseguo simulazione...';

    try {
      // 1. simula
      const sim = this.simulateRC(this.r, this.c, this.vin);

      // 2. salva in IndexedDB
      const id = await this.storage.saveSimulation(sim);
      this.lastSimulation = { ...sim, id };
      this.message = `Simulazione eseguita e salvata con ID ${id}`;
    } catch (err: any) {
      console.error(err);
      this.message =
        'Errore nel salvataggio in IndexedDB: ' + (err?.message || err);
    } finally {
      this.isRunning = false;
    }
  }

  async loadSimulations() {
    this.message = 'Carico simulazioni salvate...';
    try {
      this.savedSimulations = await this.storage.getAllSimulations();
      this.message = `Trovate ${this.savedSimulations.length} simulazioni salvate.`;
    } catch (err: any) {
      console.error(err);
      this.message =
        'Errore nel caricamento da IndexedDB: ' + (err?.message || err);
    }
  }

  async clearSimulations() {
    try {
      await this.storage.clearAllSimulations();
      this.savedSimulations = [];
      this.lastSimulation = null;
      this.message = 'Tutte le simulazioni sono state cancellate.';
    } catch (err: any) {
      console.error(err);
      this.message = 'Errore nella cancellazione: ' + (err?.message || err);
    }
  }

  trackById(_index: number, item: RcSimulationRecord) {
    return item.id;
  }
}
