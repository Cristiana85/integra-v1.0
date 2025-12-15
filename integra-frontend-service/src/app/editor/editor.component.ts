import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimulationManagerService } from './services/simulation/simulation-manager.service';
import { SimulationJob, SimulationState } from './models/simulation/simulation-job.model';
import { Observable } from 'rxjs';

interface EditorFile {
  id: string;
  name: string;
  type: 'm' | 'json' | 'netlist' | 'ts';
  content: string;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {

  job$: Observable<SimulationJob | null>;
  isRunning$: Observable<boolean>;
  SimulationState = SimulationState;

  constructor(private simManager: SimulationManagerService) {
    this.job$ = this.simManager.currentJob$;
    this.isRunning$ = this.simManager.isSimulationRunning$;
  }

  async onRunClick() {
    try {
      const resp = await this.simManager.runSolverTest('Run from board-editor');
      console.log('Simulation completed', resp);
    } catch (err) {
      console.error('Unable to start simulation', err);
    }
  }

}
