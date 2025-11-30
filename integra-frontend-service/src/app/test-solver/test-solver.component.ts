import { AfterViewInit, Component, Injectable, OnInit } from '@angular/core';
import { WasmLoaderService } from './wasm-loader.service';

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

  async ngAfterViewInit(): Promise<void> {
    await this.wasmService.init();

    // Ora il wasm è pronto
    const res = this.wasmService.handleRequest('{"ping":1}');
    console.log('RISPOSTA WASM:', res);
  }

}
