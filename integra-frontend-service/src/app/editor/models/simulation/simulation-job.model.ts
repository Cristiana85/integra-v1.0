import { ProgressUpdate } from '../protocol/progress-update.model';

export type SimulationId = string;

export enum SimulationState {
  Idle = 'Idle',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
}

export interface SimulationJob {
  id: SimulationId;
  state: SimulationState;
  lastProgress?: ProgressUpdate;
  error?: string;
}
