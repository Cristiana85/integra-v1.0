export interface ProgressUpdate {
  job_id: string;
  phase: string;    // "start" | "building_matrix" | "solving" | ...
  percent: number;  // 0 .. 100
  message: string;
}
