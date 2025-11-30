import { AfterViewInit, Component, inject, Injectable, OnInit, PLATFORM_ID } from '@angular/core';
import { WasmLoaderService } from './wasm-loader.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-test-solver',
  imports: [],
  templateUrl: './test-solver.component.html',
  styleUrl: './test-solver.component.scss',
})

@Injectable({
  providedIn: 'root'
})
export class TestSolverComponent implements AfterViewInit {
  constructor(private wasmService: WasmLoaderService) {}

  private wasmLoader = inject(WasmLoaderService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) {
      // Siamo su SSR: NON chiamare il wasm
      return;
    }
    await this.wasmService.init();

    // Ora il wasm è pronto
    const res = this.wasmService.handleRequest('{"ping":1}');
    console.log('RISPOSTA WASM:', res);
  }

}
