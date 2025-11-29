import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  files: EditorFile[] = [
    {
      id: 'f1',
      name: 'rf_solver.m',
      type: 'm',
      content: `% RF solver demo
freq = linspace(1e6, 6e9, 1001);
s11 = complex(rand(1, numel(freq)) - 0.5, rand(1, numel(freq)) - 0.5);

plot(freq, 20*log10(abs(s11)));
grid on;
title('S11 vs frequency');`,
    },
    {
      id: 'f2',
      name: 'project.json',
      type: 'json',
      content: `{
  "name": "RF 4-band ADRV9044",
  "type": "s-parameter",
  "solver": "webgpu-wasm",
  "updatedAt": "2025-11-27T10:00:00"
}`,
    },
    {
      id: 'f3',
      name: 'netlist.sp',
      type: 'netlist',
      content: `* Simple RLC netlist
R1 in n1 50
L1 n1 n2 10n
C1 n2 0 1p
.ac dec 201 1e6 6e9
.end`,
    },
  ];

  selectedFile: EditorFile = this.files[0];
  consoleLines: string[] = [
    '[INFO] Editor pronto. Nessuna simulazione in esecuzione.',
    '[HINT] Collega questo editor al tuo motore WebGPU/WASM.',
  ];

  selectFile(file: EditorFile): void {
    this.selectedFile = file;
  }

  run(): void {
    this.consoleLines = [
      `[RUN] Eseguo "${this.selectedFile.name}" con backend GPU…`,
      '[OK] (simulazione mock) risultati disponibili in futuro 😄',
    ];
  }

  stop(): void {
    this.consoleLines = ['[STOP] Simulazione interrotta.'];
  }

  clearConsole(): void {
    this.consoleLines = [];
  }

  get lineNumbers(): number[] {
    const lines = this.selectedFile.content.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  }
}
