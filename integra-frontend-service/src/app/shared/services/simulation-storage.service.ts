// src/app/shared/services/simulation-storage.service.ts
import { Injectable } from '@angular/core';

const DB_NAME = 'circuitSimDB';
const DB_VERSION = 1;
const STORE_NAME = 'simulations';

export interface RcSimulationPoint {
  t: number;
  vout: number;
}

export interface RcSimulationRecord {
  id?: number;
  type: 'RC';
  params: {
    R: number;
    C: number;
    Vin: number;
  };
  tau: number;
  points: RcSimulationPoint[];
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class SimulationStorageService {
  private get hasIndexedDb(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (!this.hasIndexedDb) {
      return Promise.reject(
        new Error('IndexedDB non disponibile in questo contesto.')
      );
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event: Event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        console.error('[IndexedDB] open error:', error);
        reject(error);
      };
    });
  }

  async saveSimulation(
    record: Omit<RcSimulationRecord, 'id'>
  ): Promise<number> {
    const db = await this.openDatabase();

    return new Promise<number>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(record);

      req.onsuccess = () => {
        resolve(req.result as number);
      };

      req.onerror = (event: Event) => {
        const error = (event.target as IDBRequest).error;
        console.error('[IndexedDB] save error:', error);
        reject(error);
      };
    });
  }

  async getAllSimulations(): Promise<RcSimulationRecord[]> {
    const db = await this.openDatabase();

    return new Promise<RcSimulationRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        resolve(req.result as RcSimulationRecord[]);
      };

      req.onerror = (event: Event) => {
        const error = (event.target as IDBRequest).error;
        console.error('[IndexedDB] getAll error:', error);
        reject(error);
      };
    });
  }

  async clearAllSimulations(): Promise<void> {
    const db = await this.openDatabase();

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = (event: Event) => {
        const error = (event.target as IDBRequest).error;
        console.error('[IndexedDB] clear error:', error);
        reject(error);
      };
    });
  }
}
