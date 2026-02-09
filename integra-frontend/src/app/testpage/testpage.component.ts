import { AfterViewInit, Component, OnInit } from '@angular/core';
import { IntegraSolverService } from './integra-solver.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'integra-testpage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testpage.component.html',
  styleUrl: './testpage.component.scss',
})
export class TestpageComponent implements OnInit, AfterViewInit {
  running = false;
  progress = 0;
  progressMsg = '';
  log = '';

  constructor(private solver: IntegraSolverService) {}
  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.solver.init();

    this.solver.stream().subscribe((evt) => {
      if (evt.type === 'worker_ready') {
        this.appendLog(`Worker ready (session ${evt.sessionId})`);
      }

      if (evt.type === 'wasm_message') {
        const env = evt.envelope;

        switch (env.type) {
          case 'progress':
            this.running = true;
            this.progress = env.payload.pct;
            this.progressMsg = env.payload.message;
            break;

          case 'done':
            this.running = false;
            this.progress = 100;
            this.appendLog('✔ Solver completed');
            this.appendLog(JSON.stringify(env.payload.dataset, null, 2));
            break;

          case 'error':
            this.running = false;
            this.appendLog(`✖ ERROR: ${env.payload.code} – ${env.payload.message}`);
            break;
        }
      }

      if (evt.type === 'worker_error') {
        this.running = false;
        this.appendLog(`Worker error: ${evt.message}`);
      }
    });
  }

  runDemo() {
    this.appendLog('--- runDemo() ---');
    this.running = true;
    this.progress = 0;
    this.progressMsg = 'Starting...';

    const model = {
      kind: 'tline',
      data: {
        substrate: {
          er: 4.2,
          h: 1.6,
          unit: 'mm',
        },
        trace: {
          w: 3.0,
          t: 0.035,
          unit: 'mm',
        },
      },
    };

    const analysis = {
      sweep: {
        name: 'freq',
        unit: 'Hz',
        values: [1e9, 2e9, 3e9, 4e9, 5e9],
      },
      settings: {
        use_webgpu: false,
      },
    };

    //this.solver.setModel(model);
    //this.solver.setAnalysis(analysis);
    //this.solver.run(`run-${Date.now()}`);

    const runId = `run-${Date.now()}`;
    this.solver.configureAndRun(model, analysis, runId);
  }

  private appendLog(msg: string) {
    this.log += msg + '\n';
  }
}
