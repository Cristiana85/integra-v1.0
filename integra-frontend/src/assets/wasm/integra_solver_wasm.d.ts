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
  set_on_message(cb: Function): void;
  /**
   * Backward-compatible: reset e inserisce un solo modello.
   */
  set_model_json(model_json: string): void;
  /**
   * Multi: aggiunge un modello macro.
   */
  push_model_json(model_json: string): void;
  clear_models(): void;
  set_analysis_json(analysis_json: string): void;
  clear_dataset(): void;
  cleanup_after_read(): void;
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
  readonly session_set_model_json: (a: number, b: number, c: number) => [number, number];
  readonly session_push_model_json: (a: number, b: number, c: number) => [number, number];
  readonly session_clear_models: (a: number) => void;
  readonly session_set_analysis_json: (a: number, b: number, c: number) => [number, number];
  readonly session_clear_dataset: (a: number) => void;
  readonly session_cleanup_after_read: (a: number) => void;
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
