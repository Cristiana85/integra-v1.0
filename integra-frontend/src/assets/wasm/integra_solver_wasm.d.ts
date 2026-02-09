/* tslint:disable */
/* eslint-disable */
/**
 * Setup iniziale per WASM: panic hook + logger
 */
export function start(): void;
export class Session {
  free(): void;
  dispose(): void;
  constructor();
  /**
   * Registra un'unica callback JS: riceve sempre una string JSON Envelope.
   */
  set_on_message(cb: Function): void;
  set_model(model: string): void;
  set_analysis(analysis: string): void;
  /**
   * Esegue una run. Ritorna subito al JS (non blocca UI se chiamato da Worker).
   * Per ora è sincrona lato wasm, ma dentro un Web Worker non blocca il main thread.
   */
  run(run_id: string): void;
  get_last_dataset_envelope_json(): string | undefined;
  readonly session_id: string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly start: () => void;
  readonly __wbg_session_free: (a: number, b: number) => void;
  readonly session_new: () => number;
  readonly session_set_on_message: (a: number, b: any) => void;
  readonly session_set_model: (a: number, b: number, c: number) => [number, number];
  readonly session_set_analysis: (a: number, b: number, c: number) => [number, number];
  readonly session_run: (a: number, b: number, c: number) => [number, number];
  readonly session_get_last_dataset_envelope_json: (a: number) => [number, number];
  readonly session_session_id: (a: number) => [number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?:
    | { module_or_path: InitInput | Promise<InitInput> }
    | InitInput
    | Promise<InitInput>,
): Promise<InitOutput>;
