export interface JsHeapInfo {
  usedMB: number;
  totalMB: number;
  limitMB: number;
  percentOfLimit: number;
}

export interface StorageInfo {
  usedMB: number;
  quotaMB: number;
  percentUsed: number;
}

/**
 * Utility generica per:
 * - misurare memoria JS (heap) in MB
 * - misurare storage (IndexedDB + cache) in MB
 * - stimare dimensione oggetti in MB
 * - aiutare a "staccare" referenze pesanti
 *
 * Tutto SSR-safe (non usa window/navigator/performance lato server).
 */
export class MemoryUtils {
  // === ENV CHECK ===

  static readonly isBrowser =
    typeof window !== 'undefined' && typeof document !== 'undefined';

  static readonly hasPerformance = typeof performance !== 'undefined';

  static readonly hasNavigator = typeof navigator !== 'undefined';

  static readonly hasPerformanceMemory =
    this.hasPerformance && !!(performance as any).memory;

  static readonly hasStorageEstimate =
    this.hasNavigator &&
    'storage' in navigator &&
    typeof (navigator as any).storage?.estimate === 'function';

  static readonly hasUserAgentSpecificMemory =
    this.hasPerformance &&
    typeof (performance as any).measureUserAgentSpecificMemory === 'function';

  // === CONVERSIONI ===

  static bytesToMB(bytes: number): number {
    return bytes / (1024 * 1024);
  }

  static formatMB(mb: number, digits = 2): string {
    return mb.toFixed(digits);
  }

  // === JS HEAP ===

  /**
   * Lettura sincrona di performance.memory (Chrome/Edge).
   * Ritorna null se non disponibile o non in browser.
   */
  static getJsHeapInfo(): JsHeapInfo | null {
    if (!this.isBrowser || !this.hasPerformanceMemory) {
      return null;
    }

    const mem = (performance as any).memory as {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };

    const usedMB = this.bytesToMB(mem.usedJSHeapSize);
    const totalMB = this.bytesToMB(mem.totalJSHeapSize);
    const limitMB = this.bytesToMB(mem.jsHeapSizeLimit);
    const percentOfLimit = limitMB > 0 ? (usedMB / limitMB) * 100 : 0;

    return { usedMB, totalMB, limitMB, percentOfLimit };
  }

  /**
   * Versione async:
   * - prova prima performance.memory
   * - se non c'è, usa measureUserAgentSpecificMemory (dove supportato)
   *   che spesso forza anche una passata di GC.
   */
  static async getJsHeapInfoAsync(): Promise<JsHeapInfo | null> {
    const sync = this.getJsHeapInfo();
    if (sync) return sync;

    if (!this.isBrowser || !this.hasUserAgentSpecificMemory) {
      return null;
    }

    try {
      const result = await (
        performance as any
      ).measureUserAgentSpecificMemory();
      const bytes = result?.bytes ?? 0;
      const usedMB = this.bytesToMB(bytes);

      // Qui non sappiamo limite reale: facciamo "tutto usato"
      return {
        usedMB,
        totalMB: usedMB,
        limitMB: usedMB,
        percentOfLimit: 100,
      };
    } catch {
      return null;
    }
  }

  /**
   * Hint al GC: in pratica fa una misura UA specific memory.
   * Non è garantito, ma spesso causa una passata di GC.
   */
  static async hintGarbageCollection(): Promise<void> {
    if (!this.isBrowser || !this.hasUserAgentSpecificMemory) return;
    try {
      await (performance as any).measureUserAgentSpecificMemory();
    } catch {
      // ignoriamo
    }
  }

  // === STORAGE (IndexedDB + cache) ===

  /**
   * Misura storage usato/quotato lato browser (IndexedDB, cache, ecc.) in MB.
   */
  static async getStorageInfo(): Promise<StorageInfo | null> {
    if (!this.isBrowser || !this.hasStorageEstimate) {
      return null;
    }

    // TS non conosce bene navigator.storage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const estimate = await (navigator as any).storage.estimate();
    const used = estimate.usage ?? 0;
    const quota = estimate.quota ?? 0;

    const usedMB = this.bytesToMB(used);
    const quotaMB = this.bytesToMB(quota);
    const percentUsed = quota > 0 ? (used / quota) * 100 : 0;

    return { usedMB, quotaMB, percentUsed };
  }

  // === STIMA DIMENSIONI OGGETTI ===

  /**
   * Stima la dimensione JSON di un oggetto in MB.
   * Restituisce 0 se JSON.stringify fallisce (es. referenze circolari).
   */
  static approximateObjectSizeMB(value: any): number {
    try {
      const json = JSON.stringify(value);
      const bytes = new Blob([json]).size;
      return this.bytesToMB(bytes);
    } catch {
      return 0;
    }
  }

  // === "DEALLOCAZIONE" / DROP RIFERIMENTI ===

  /**
   * Pulisce campi pesanti di un oggetto:
   * - mode 'null' → li imposta a null
   * - mode 'emptyArray' → se sono array, li svuota
   * - mode 'delete' → li rimuove dal target
   */
  static dropHeavyFields(
    target: any,
    fields: string[],
    options?: { mode?: 'null' | 'emptyArray' | 'delete' }
  ): void {
    if (!target || typeof target !== 'object') return;
    const mode = options?.mode ?? 'null';

    for (const field of fields) {
      if (!(field in target)) continue;

      switch (mode) {
        case 'null':
          target[field] = null;
          break;
        case 'emptyArray':
          if (Array.isArray(target[field])) {
            (target[field] as any[]).length = 0;
          } else {
            target[field] = null;
          }
          break;
        case 'delete':
          delete target[field];
          break;
      }
    }
  }

  /**
   * Svuota tutti gli array "diretti" di un oggetto (non ricorsivo).
   */
  static dropAllArrays(target: any): void {
    if (!target || typeof target !== 'object') return;
    for (const key of Object.keys(target)) {
      const val = target[key];
      if (Array.isArray(val)) {
        (val as any[]).length = 0;
      }
    }
  }

  /**
   * Rende un oggetto "vuoto":
   * - setta tutte le proprietà a null
   * - opzionale: delete delle proprietà
   */
  static dropAllProps(target: any, options?: { deleteProps?: boolean }): void {
    if (!target || typeof target !== 'object') return;
    const del = options?.deleteProps ?? false;

    for (const key of Object.keys(target)) {
      if (del) {
        delete target[key];
      } else {
        target[key] = null;
      }
    }
  }

  /**
   * Aiuta a "ripulire" uno state Angular-like:
   * passi un oggetto (es. this) e una lista di campi
   * che vuoi azzerare con il mode scelto.
   */
  static releaseAngularState(
    state: Record<string, any>,
    fields: { name: string; mode?: 'null' | 'emptyArray' | 'delete' }[]
  ): void {
    if (!state || typeof state !== 'object') return;

    for (const cfg of fields) {
      if (!(cfg.name in state)) continue;
      this.dropHeavyFields(state, [cfg.name], { mode: cfg.mode ?? 'null' });
    }
  }

  /**
   * Log rapido a console di heap + storage (se disponibili).
   */
  static async debugLogAll(): Promise<void> {
    const heap = await this.getJsHeapInfoAsync();
    const storage = await this.getStorageInfo();

    console.group('[MemoryUtils] debugLogAll');
    console.log('Heap info (MB):', heap);
    console.log('Storage info (MB):', storage);
    console.groupEnd();
  }
}
