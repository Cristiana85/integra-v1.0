/* tslint:disable */
/* eslint-disable */
export enum JSType {
  Touchstone = 0,
  Netlist = 1,
  NetlistEl = 2,
  Dataset = 3,
  DatasetEl = 4,
}
export class WasmAnalyzer {
  free(): void;
  constructor();
  add(data_type: number, json_data: string): boolean;
  delete(data_type: number, identifier: string): boolean;
  modify(data_type: number, identifier: string, new_json_data: string): boolean;
  progress_operation(callback: Function): void;
  analyze(touchstone: any, netlist: any, dataset: any): any;
  handle_error(error: any): any;
}
export class WasmSolver {
  free(): void;
  constructor();
  init(touchstone: any, netlist: any, dataset: any): void;
  parse_netlist(): void;
  parse_dataset(): void;
  solve(): void;
  clear(): void;
  get_data(): string | undefined;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmsolver_free: (a: number, b: number) => void;
  readonly wasmsolver_new: () => number;
  readonly wasmsolver_init: (a: number, b: any, c: any, d: any) => [number, number];
  readonly wasmsolver_parse_netlist: (a: number) => [number, number];
  readonly wasmsolver_parse_dataset: (a: number) => [number, number];
  readonly wasmsolver_solve: (a: number) => void;
  readonly wasmsolver_clear: (a: number) => void;
  readonly wasmsolver_get_data: (a: number) => [number, number];
  readonly __wbg_wasmanalyzer_free: (a: number, b: number) => void;
  readonly wasmanalyzer_new: () => number;
  readonly wasmanalyzer_add: (a: number, b: number, c: number, d: number) => number;
  readonly wasmanalyzer_delete: (a: number, b: number, c: number, d: number) => number;
  readonly wasmanalyzer_modify: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly wasmanalyzer_progress_operation: (a: number, b: any) => void;
  readonly wasmanalyzer_analyze: (a: number, b: any, c: any, d: any) => any;
  readonly wasmanalyzer_handle_error: (a: number, b: any) => any;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h558a90aad8eb2ec8: (a: number, b: number) => void;
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
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
