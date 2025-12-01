import { Injectable } from '@angular/core';

const DB_NAME = 'circuitSimDB';
const DB_VERSION = 1;
const STORE_NAME = 'simulations';

export interface RcSimulationPoint {
  t: number;
  vout: number;
}

export interface RcSimulationRecord {
  id?: number; // verrà assegnato da IndexedDB
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
  private openDatabase(): Promise<IDBDatabase> {
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
        reject(error);
      };
    });
  }

  saveSimulation(record: Omit<RcSimulationRecord, 'id'>): Promise<number> {
    return this.openDatabase().then((db) => {
      return new Promise<number>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.add(record);

        request.onsuccess = () => {
          resolve(request.result as number);
        };

        request.onerror = (event: Event) => {
          const error = (event.target as IDBRequest).error;
          reject(error);
        };
      });
    });
  }

  getAllSimulations(): Promise<RcSimulationRecord[]> {
    return this.openDatabase().then((db) => {
      return new Promise<RcSimulationRecord[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result as RcSimulationRecord[]);
        };

        request.onerror = (event: Event) => {
          const error = (event.target as IDBRequest).error;
          reject(error);
        };
      });
    });
  }

  clearAllSimulations(): Promise<void> {
    return this.openDatabase().then((db) => {
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = (event: Event) => {
          const error = (event.target as IDBRequest).error;
          reject(error);
        };
      });
    });
  }
}
