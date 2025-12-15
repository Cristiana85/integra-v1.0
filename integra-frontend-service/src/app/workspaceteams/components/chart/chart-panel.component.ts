import {
  AfterViewInit,
  Component,
  ElementRef,
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
  selector: 'integra-chart-panel',
  templateUrl: './chart-panel.component.html',
  styleUrl: './chart-panel.component.scss',
})
export class ChartPanelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);
  private injector = inject(Injector);
  private state = inject(WorkspaceState);

  private echarts?: any;
  private chart?: any;

  private ro?: ResizeObserver;
  private winResizeHandler?: () => void;

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.echarts = await import('echarts');
    this.chart = this.echarts.init(this.host.nativeElement, undefined, {
      renderer: 'canvas',
    });

    // ✅ resize automatico sul container (slider + resize browser)
    this.ro = new ResizeObserver(() => this.resizeChartRaf());
    this.ro.observe(this.host.nativeElement);

    // ✅ fallback: resize finestra
    this.winResizeHandler = () => this.resizeChartRaf();
    window.addEventListener('resize', this.winResizeHandler);

    // ✅ render iniziale / cambio chat
    effect(
      () => {
        const chatId = this.state.selectedChatId();
        if (!chatId || !this.chart) return;
        this.setOptionForChat(chatId);
        this.resizeChartRaf(); // importantissimo dopo setOption
      },
      { injector: this.injector }
    );
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.ro?.disconnect();
    } catch {}
    try {
      if (this.winResizeHandler)
        window.removeEventListener('resize', this.winResizeHandler);
    } catch {}

    try {
      this.chart?.dispose();
    } catch {}
    this.chart = undefined;
  }

  private resizeChartRaf(): void {
    requestAnimationFrame(() => {
      // doppio RAF: evita resize con dimensioni ancora “non stabili”
      requestAnimationFrame(() => {
        try {
          this.chart?.resize();
        } catch {}
      });
    });
  }

  private setOptionForChat(chatId: string) {
    const rnd = makeSeededRandom(chatId);

    const xs = Array.from({ length: 20 }, (_, i) => `T${i + 1}`);
    let v = 50 + Math.floor(rnd() * 20);
    const ys = xs.map(() => {
      v += Math.floor((rnd() - 0.5) * 12);
      return v;
    });

    this.chart.setOption(
      {
        backgroundColor: 'transparent',
        grid: { left: 42, right: 16, top: 18, bottom: 28 },
        xAxis: {
          type: 'category',
          data: xs,
          axisLabel: { color: 'rgba(229,231,235,0.75)', fontSize: 10 },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.14)' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: 'rgba(229,231,235,0.75)', fontSize: 10 },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.14)' } },
        },
        tooltip: { trigger: 'axis' },
        series: [
          {
            type: 'line',
            data: ys,
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 2 },
            areaStyle: { opacity: 0.08 },
          },
        ],
      },
      true
    );
  }
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
