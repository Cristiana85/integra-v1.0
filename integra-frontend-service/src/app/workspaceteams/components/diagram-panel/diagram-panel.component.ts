import {
  AfterViewInit,
  Component,
  ElementRef,
  EffectRef,
  Injector,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WorkspaceState } from '../../workspace.state';

@Component({
  standalone: true,
  selector: 'integra-diagram-panel',
  templateUrl: './diagram-panel.component.html',
  styleUrl: './diagram-panel.component.scss',
})
export class DiagramPanelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('paperHost', { static: true })
  paperHost!: ElementRef<HTMLDivElement>;

  private injector = inject(Injector);
  private platformId = inject(PLATFORM_ID);

  private joint?: typeof import('jointjs');
  private graph?: import('jointjs').dia.Graph;
  private paper?: import('jointjs').dia.Paper;

  private paperReady = false;
  private chatEffect?: EffectRef;
  private resizeObs?: ResizeObserver;
  private currentChatId?: string;
  private winResizeHandler?: () => void;

  constructor(public state: WorkspaceState) {}

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.joint = await import('jointjs');
    this.initPaper();

    // ResizeObserver (container)
    this.resizeObs = new ResizeObserver(() => this.resizePaperRaf());
    this.resizeObs.observe(this.paperHost.nativeElement);

    this.winResizeHandler = () => this.resizePaperRaf();
    window.addEventListener('resize', this.winResizeHandler);

    // render iniziale
    const initId = this.state.selectedChatId();
    if (initId) {
      this.currentChatId = initId;
      queueMicrotask(() => this.renderForChat(initId));
    }

    // render al cambio chat
    this.chatEffect = effect(
      () => {
        const chatId = this.state.selectedChatId();
        if (!chatId || !this.paperReady) return;
        if (chatId === this.currentChatId) return;

        this.currentChatId = chatId;
        queueMicrotask(() => this.renderForChat(chatId));
      },
      { injector: this.injector }
    );
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.chatEffect?.destroy();
    this.resizeObs?.disconnect();

    if (this.winResizeHandler) {
      window.removeEventListener('resize', this.winResizeHandler);
    }

    try {
      (this.paper as any)?.remove?.();
    } catch {}
    try {
      this.graph?.clear();
    } catch {}

    this.paper = undefined;
    this.graph = undefined;
    this.joint = undefined;
  }

  private initPaper(): void {
    const joint = this.joint!;

    this.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

    const isLight = document.documentElement.dataset['theme'] === 'light';

    this.paper = new joint.dia.Paper({
      el: this.paperHost.nativeElement,
      model: this.graph,
      gridSize: 10,
      drawGrid: {
        name: 'mesh',
        args: {
          color: isLight ? 'rgba(15,23,42,0.10)' : 'rgba(255,255,255,0.10)',
        },
      },
      background: { color: 'transparent' },
      cellViewNamespace: joint.shapes,
    });

    this.paperReady = true;

    // ✅ forza subito l’SVG a 100%
    this.forceSvgFill();

    // ✅ resize dopo che il layout è stabile
    this.resizePaperRaf();
  }

  private forceSvgFill(): void {
    if (!this.paper) return;

    const p: any = this.paper;

    // paper.el è un div
    if (p.el) {
      p.el.style.width = '100%';
      p.el.style.height = '100%';
    }

    // paper.svg è l’elemento <svg>
    if (p.svg) {
      p.svg.style.width = '100%';
      p.svg.style.height = '100%';
      p.svg.style.display = 'block';
    }
  }

  private fitTimer: any;

  private resizePaperRaf(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.resizePaper();

        // debounce: fit dopo che l'utente ha finito di ridimensionare
        clearTimeout(this.fitTimer);
        this.fitTimer = setTimeout(() => {
          this.fitToViewport();
        }, 120);
      });
    });
  }

  private resizePaper(): void {
    if (!this.paperReady || !this.paper) return;

    const host = this.paperHost.nativeElement;
    const w = host.clientWidth;
    const h = host.clientHeight;

    if (w <= 0 || h <= 0) return;

    this.paper.setDimensions(w, h);

    // ✅ dopo setDimensions, riforza SVG (fix “zona vuota”)
    this.forceSvgFill();
  }

  private renderForChat(chatId: string): void {
    if (!this.paperReady || !this.paper || !this.graph || !this.joint) return;

    // prima dimensioni giuste
    this.resizePaper();

    const cells = this.buildCellsForUser(chatId);

    const p: any = this.paper;
    p.freeze?.();
    this.graph.resetCells(cells);
    p.unfreeze?.();

    // fit SOLO quando cambi chat (non a ogni resize finestra)
    this.fitToViewport();
  }

  private fitToViewport(): void {
    if (!this.paper || !this.paperReady) return;

    const p: any = this.paper;
    try {
      p.scale?.(1, 1);
      p.translate?.(0, 0);
      p.scaleContentToFit?.({
        padding: 40,
        preserveAspectRatio: true,
        minScale: 0.6,
        maxScale: 1.2,
      });
      p.centerContent?.();
    } catch {}
  }

  private buildCellsForUser(userId: string): import('jointjs').dia.Cell[] {
    const joint = this.joint!;
    const rnd = makeSeededRandom(userId);

    const count = 5 + Math.floor(rnd() * 4);
    const nodes: import('jointjs').dia.Element[] = [];

    for (let i = 0; i < count; i++) {
      const x = 80 + Math.floor(rnd() * 900);
      const y = 80 + Math.floor(rnd() * 420);

      const pick = rnd();
      let el: import('jointjs').dia.Element;

      if (pick < 0.33) el = mkRect(joint, `Block ${i + 1}`, x, y);
      else if (pick < 0.66) el = mkCircle(joint, `Node ${i + 1}`, x, y);
      else el = mkDiamond(joint, `MUX ${i + 1}`, x, y);

      nodes.push(el);
    }

    const links: import('jointjs').dia.Link[] = [];
    const linkCount = Math.max(4, count - 1);

    for (let i = 0; i < linkCount; i++) {
      const a = nodes[Math.floor(rnd() * nodes.length)];
      const b = nodes[Math.floor(rnd() * nodes.length)];
      if (a === b) continue;

      links.push(mkLink(joint, a, b, rnd() > 0.5 ? 'data' : 'ctrl'));
    }

    return [...nodes, ...links];
  }
}

/* helpers */
function mkRect(
  joint: typeof import('jointjs'),
  label: string,
  x: number,
  y: number
) {
  const r = new joint.shapes.standard.Rectangle();
  r.position(x, y);
  r.resize(150, 56);
  r.attr({
    body: {
      rx: 14,
      ry: 14,
      stroke: 'rgba(255,255,255,0.18)',
      strokeWidth: 1,
      fill: 'rgba(15,23,42,0.65)',
    },
    label: {
      text: label,
      fill: 'rgba(229,231,235,0.95)',
      fontSize: 12,
      fontFamily: 'Segoe UI, system-ui',
    },
  });
  return r;
}

function mkCircle(
  joint: typeof import('jointjs'),
  label: string,
  x: number,
  y: number
) {
  const c = new joint.shapes.standard.Circle();
  c.position(x, y);
  c.resize(64, 64);
  c.attr({
    body: {
      stroke: 'rgba(255,255,255,0.18)',
      strokeWidth: 1,
      fill: 'rgba(2,132,199,0.25)',
    },
    label: {
      text: label,
      fill: 'rgba(229,231,235,0.92)',
      fontSize: 11,
      fontFamily: 'Segoe UI, system-ui',
    },
  });
  return c;
}

function mkDiamond(
  joint: typeof import('jointjs'),
  label: string,
  x: number,
  y: number
) {
  const p = new joint.shapes.standard.Polygon();
  p.position(x, y);
  p.resize(110, 70);
  p.attr({
    body: {
      refPoints: '0,35 55,0 110,35 55,70',
      stroke: 'rgba(255,255,255,0.18)',
      strokeWidth: 1,
      fill: 'rgba(56,189,248,0.16)',
    },
    label: {
      text: label,
      fill: 'rgba(229,231,235,0.92)',
      fontSize: 12,
      fontFamily: 'Segoe UI, system-ui',
    },
  });
  return p;
}

function mkLink(
  joint: typeof import('jointjs'),
  a: import('jointjs').dia.Element,
  b: import('jointjs').dia.Element,
  label: string
) {
  const l = new joint.shapes.standard.Link();
  l.source(a);
  l.target(b);
  l.attr({
    line: {
      stroke: 'rgba(255,255,255,0.22)',
      strokeWidth: 1,
      targetMarker: { type: 'classic', size: 6 },
    },
  });
  l.labels([
    {
      position: 0.5,
      attrs: {
        text: {
          text: label,
          fill: 'rgba(156,163,175,0.9)',
          fontSize: 10,
          fontFamily: 'Segoe UI, system-ui',
        },
        rect: { fill: 'rgba(2,6,23,0.65)', rx: 6, ry: 6 },
      },
    },
  ]);
  return l;
}

function makeSeededRandom(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
