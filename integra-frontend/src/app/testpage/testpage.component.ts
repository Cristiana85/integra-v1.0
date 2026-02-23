import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IntegraSolverService } from './integra-solver.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'integra-testpage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './testpage.component.html',
  styleUrl: './testpage.component.scss',
})
export class TestpageComponent implements OnInit, AfterViewInit {
  running = false;
  progress = 0;
  progressMsg = '';
  log = '';

  tsA = DEFAULT_TS_A;
  tsB = DEFAULT_TS_B;

  loadedFileName = '';
  tsText = '';

  exprOptions = [
    'db(S21)',
    'angle(S21)',
    'mag(S21)',
    're(S21)',
    'im(S21)',
    'db(S11)',
    'angle(S11)',
  ];
  expr1 = 'db(S21)';
  expr2 = '';

  private datasetsByRunId = new Map<string, any>();
  private runIdA: string | null = null;
  private runIdB: string | null = null;

  @ViewChild('plotCanvas') plotCanvas?: ElementRef<HTMLCanvasElement>;

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
            this.appendLog('progress: ' + env.payload.pct + ' -- ' + env.payload.message);
            break;

          case 'done':
            this.running = false;
            this.progress = 100;
            this.appendLog('✔ Solver completed');
            const ds = env.payload.dataset;
            const s1 = extractSeries(ds, this.expr1);
            const s2 = this.expr2 ? extractSeries(ds, this.expr2) : null;

            if (!s1) {
              this.appendLog(`Plot error: missing series ${this.expr1}`);
              break;
            }

            plot1or2(this.plotCanvas.nativeElement, s1, this.expr1, s2, this.expr2 || '');
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

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.loadedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.tsText = String(reader.result ?? '');
      this.appendLog(`Loaded file: ${file.name} (${this.tsText.length} chars)`);
    };
    reader.readAsText(file);
  }

  runUploadedTouchstone() {
    if (!this.tsText.trim()) {
      this.appendLog('No touchstone loaded.');
      return;
    }

    const runId = `run-${Date.now()}`;
    const model = this.makeTouchstoneModelEnvelope(this.tsText);

    const analysis = this.makeSparameterAnalysisEnvelopeWithSpec(
      [this.expr1, this.expr2].filter(Boolean) as string[],
    );

    //this.solver.setAnalysis(analysis);

    this.solver.configureAndRun(model, analysis, runId);
  }

  private makeSparameterAnalysisEnvelopeWithSpec(exprs: string[]) {
    return {
      version: 1,
      common: {
        sweep: { start: 0, stop: 0, points: 0 },
        use_webgpu: false,
        precision: 'fast',
      },
      payload: {
        type: 'sparameter',
        strict: false,
        dataset: {
          independent: { name: 'freq', unit: 'Hz' },
          dependent: exprs.map((expr) => ({
            name: expr, // nome user-facing (finirà in dataset.dependent[].name)
            expr: expr, // stringa interpretata dal solver
            // unit: undefined -> lascia decidere a Rust (dB/deg/...)
          })),
        },
      },
    };
  }

  private appendLog(msg: string) {
    this.log += msg + '\n';
    console.log(msg);
  }

  /*private plotDataset(ds: any) {
    const canvas = this.plotCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s1 = this.extractSeries(ds, this.expr1);
    const s2 = this.expr2 ? this.extractSeries(ds, this.expr2) : null;

    if (!s1) {
      this.appendLog(`Plot error: missing ${this.expr1}`);
      return;
    }
    if (this.expr2 && !s2) {
      this.appendLog(`Plot warn: missing ${this.expr2}`);
    }

    const xs = s2.x ? s1.x.concat(s2.x) : s1.x;
    const ys = s2 ? s1.y.concat(s2.y) : s1.y;

    // ... (stesso tuo codice: bounds + assi)
    // poi:
    ctx.setLineDash([]);
    drawPolyline(ctx, s1.x, s1.y, sx, sy);

    if (s2) {
      ctx.setLineDash([6, 4]);
      drawPolyline(ctx, s2.x, s2.y, sx, sy);
      ctx.setLineDash([]);
    }

    // label: usa expr1/expr2
  }*/

  // -----------------------------------------------------------------------------
  // Helpers (typed envelopes for INTEGRA)
  // -----------------------------------------------------------------------------

  private makeTouchstoneModelEnvelope(content: string) {
    return {
      version: 1,
      payload: {
        type: 'touchstone',
        n_ports: 2,
        param_type: 's',
        format: 'ma',
        freq_unit: 'ghz',
        zref_ohm: 50,
        content,
      },
      meta: {},
    };
  }
}

const DEFAULT_TS_A = `! Example 2-port touchstone A\n# GHZ S MA R 50\n! freq  S11mag S11ang  S21mag S21ang  S12mag S12ang  S22mag S22ang\n1.0  0.60  -10   0.05  30   0.05  30   0.50  -20\n2.0  0.55  -20   0.08  25   0.08  25   0.48  -30\n3.0  0.50  -30   0.10  20   0.10  20   0.45  -40\n`;

const DEFAULT_TS_B = `! Example 2-port touchstone B\n# GHZ S MA R 50\n! freq  S11mag S11ang  S21mag S21ang  S12mag S12ang  S22mag S22ang\n1.0  0.40  -5    0.10  35   0.10  35   0.35  -15\n2.0  0.35  -15   0.14  30   0.14  30   0.32  -25\n3.0  0.30  -25   0.18  25   0.18  25   0.28  -35\n`;

type Series = { x: number[]; y: number[] };

function extractSeries(dataset: any, depName: string): Series | null {
  const x: number[] | undefined = dataset?.independent?.values;
  const dep = (dataset?.dependent || []).find((d: any) => d.name === depName);
  const y: number[] | undefined = dep?.values;

  if (!x || !y || x.length === 0 || y.length === 0) return null;

  // Se lunghezze diverse, taglia alla minima per evitare crash
  const n = Math.min(x.length, y.length);
  return { x: x.slice(0, n), y: y.slice(0, n) };
}

function drawPolyline(
  ctx: CanvasRenderingContext2D,
  s: Series,
  sx: (v: number) => number,
  sy: (v: number) => number,
) {
  if (s.x.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(sx(s.x[0]), sy(s.y[0]));
  for (let i = 1; i < s.x.length; i++) {
    ctx.lineTo(sx(s.x[i]), sy(s.y[i]));
  }
  ctx.stroke();
}

function safeMinMax(arr: number[]): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const v of arr) {
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 };
  if (min === max) return { min: min - 1, max: max + 1 };
  return { min, max };
}

function padRange(min: number, max: number, frac = 0.05): { min: number; max: number } {
  const span = max - min;
  return { min: min - span * frac, max: max + span * frac };
}

function niceTicks(min: number, max: number, ticks = 5): number[] {
  // Tick “semplice”: lineare in [min,max]
  const out: number[] = [];
  for (let i = 0; i <= ticks; i++) out.push(min + (i / ticks) * (max - min));
  return out;
}

/**
 * Plot di 1-2 serie su un canvas.
 * - s2 opzionale: se presente viene tratteggiata.
 */
export function plot1or2(
  canvas: HTMLCanvasElement,
  s1: Series,
  label1: string,
  s2: Series | null,
  label2: string,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // Margini
  const left = 60;
  const right = 20;
  const top = 20;
  const bottom = 45;

  // Background
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  // Bounds X: assumo stessa X, ma in caso diverso uso unione
  const xAll = s2 ? s1.x.concat(s2.x) : s1.x.slice();
  const yAll = s2 ? s1.y.concat(s2.y) : s1.y.slice();

  let { min: xmin, max: xmax } = safeMinMax(xAll);
  let { min: ymin, max: ymax } = safeMinMax(yAll);

  ({ min: xmin, max: xmax } = padRange(xmin, xmax, 0.02));
  ({ min: ymin, max: ymax } = padRange(ymin, ymax, 0.08));

  const plotW = W - left - right;
  const plotH = H - top - bottom;

  // ✅ Definizioni richieste: sx, sy
  const sx = (x: number) => left + ((x - xmin) / (xmax - xmin)) * plotW;
  const sy = (y: number) => top + (1 - (y - ymin) / (ymax - ymin)) * plotH;

  // Griglia + tick
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;

  const xTicks = niceTicks(xmin, xmax, 5);
  const yTicks = niceTicks(ymin, ymax, 5);

  // vertical grid
  for (const xt of xTicks) {
    const X = sx(xt);
    ctx.beginPath();
    ctx.moveTo(X, top);
    ctx.lineTo(X, top + plotH);
    ctx.stroke();
  }
  // horizontal grid
  for (const yt of yTicks) {
    const Y = sy(yt);
    ctx.beginPath();
    ctx.moveTo(left, Y);
    ctx.lineTo(left + plotW, Y);
    ctx.stroke();
  }

  // Assi
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.2;

  // x-axis
  ctx.beginPath();
  ctx.moveTo(left, top + plotH);
  ctx.lineTo(left + plotW, top + plotH);
  ctx.stroke();

  // y-axis
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, top + plotH);
  ctx.stroke();

  // Labels ticks
  ctx.fillStyle = '#222';
  ctx.font = '12px sans-serif';

  for (const xt of xTicks) {
    const X = sx(xt);
    const txt = formatNumber(xt);
    ctx.fillText(txt, X - ctx.measureText(txt).width / 2, top + plotH + 18);
  }
  for (const yt of yTicks) {
    const Y = sy(yt);
    const txt = formatNumber(yt);
    ctx.fillText(txt, 8, Y + 4);
  }

  // Serie 1
  ctx.strokeStyle = '#0066cc';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([]);
  drawPolyline(ctx, s1, sx, sy);

  // Serie 2 (opzionale, tratteggiata)
  if (s2) {
    ctx.strokeStyle = '#cc3300';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    drawPolyline(ctx, s2, sx, sy);
    ctx.setLineDash([]);
  }

  // Legend semplice
  const legendY = 14;
  let legendX = left;

  ctx.font = '12px sans-serif';

  ctx.strokeStyle = '#0066cc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(legendX, legendY);
  ctx.lineTo(legendX + 18, legendY);
  ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.fillText(label1, legendX + 24, legendY + 4);

  legendX += 24 + ctx.measureText(label1).width + 24;

  if (s2) {
    ctx.strokeStyle = '#cc3300';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 18, legendY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#222';
    ctx.fillText(label2, legendX + 24, legendY + 4);
  }
}

function formatNumber(v: number): string {
  // formato compatto per Hz e dB/deg
  const a = Math.abs(v);
  if (a >= 1e9) return (v / 1e9).toFixed(3) + 'G';
  if (a >= 1e6) return (v / 1e6).toFixed(3) + 'M';
  if (a >= 1e3) return (v / 1e3).toFixed(3) + 'k';
  if (a >= 1) return v.toFixed(3);
  return v.toExponential(2);
}
