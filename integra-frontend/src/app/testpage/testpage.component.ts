import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ECharts, EChartsOption } from 'echarts';
import { SharedModule } from '../shared/shared.module';
import { NgxEchartsDirective } from 'ngx-echarts';
import { TouchstoneValidator } from './core/touchstone-validator';
import { MessageService } from 'primeng/api';
import { saveAs } from 'file-saver';
import { TouchstoneParser } from './core/touchstone-parser';
import { async } from 'rxjs';
import { WasmService } from '../editor/services/wasm/libavoid.wasm.service';

@Component({
  selector: 'integra-testpage',
  standalone: true,
  imports: [RouterModule, SharedModule, NgxEchartsDirective],
  templateUrl: './testpage.component.html',
  styleUrl: './testpage.component.scss',
  providers: [MessageService],
})
export class TestpageComponent implements OnInit, AfterViewInit {
  private echartInstance?: ECharts; // ✅ Store ECharts instance
  touchstonePath: string = '';
  netlistPath: string = '';
  touchstoneLog: string = '';
  netlistLog: string = '';
  simulationLog: string = '';
  chartOptions: EChartsOption = {};
  availableSParams: string[] = [];
  selectedSParam: string = 'S11';
  validator?: TouchstoneValidator;
  errorMessages: string[] = [];
  selectedVisualization: string = 'Line Chart'; // Line Chart, Smith Chart, Heatmap
  smithChartOptions: EChartsOption = {};
  heatmapOptions: EChartsOption = {};
  visualizationModes = ['Line Chart', 'Smith Chart', 'Heatmap'];
  jsonData: string = '';

  constructor(
    private messageService: MessageService,
    private wasmService: WasmService
  ) {}
  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.loadChartData();

    setTimeout(() => {
      this.testWasm();
    }, 3000);
  }

  onChartInit(chart: any) {
    this.echartInstance = chart as ECharts;
  }

  testWasm() {
    const jsonData = JSON.stringify({
      name: 'example.s2p',
      frequencies: [1.0, 2.0, 3.0],
      s_matrix: [
        [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
        [
          [0.5, 0.6],
          [0.7, 0.8],
        ],
      ],
    });

    console.log(
      '✅ Aggiunta di un Touchstone:',
      this.wasmService.add(jsonData)
    );

    /*console.log(
      '✅ Lista di tutti i Touchstone:',
      this.wasmService.getTouchstones()
    );*/

    console.log(
      '✅ Eliminazione di "example.s2p":',
      this.wasmService.delete('example.s2p')
    );

    /*console.log(
      '✅ Lista aggiornata di Touchstone:',
      this.wasmService.getTouchstones()
    );*/

    this.wasmService.progressOperation((progress) => {
      console.log(`🚀 Progresso aggiornato: ${progress}%`);
    });
  }

  onFileSelect(event: any) {
    /*const buffer = this.wasmService.allocateMemory(10, 2);

    const MAX_TOTAL_SIZE_MB = 500; // Total import limit (across all files)
    const MAX_SINGLE_FILE_MB = 100; // Limit for a single file
    let totalUploadedSizeMB = 0; // Tracks total uploaded file size

    const file = event.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB

    // ✅ Check if individual file exceeds 100MB
    if (fileSizeMB > MAX_SINGLE_FILE_MB) {
      this.touchstoneLog += ` Error: ${
        file.name
      } is too large (${fileSizeMB.toFixed(
        2
      )}MB). Max allowed: ${MAX_SINGLE_FILE_MB}MB.\n`;
      return;
    }

    // ✅ Check if total file size exceeds 500MB
    if (totalUploadedSizeMB + fileSizeMB > MAX_TOTAL_SIZE_MB) {
      this.touchstoneLog += `Error: Importing ${file.name} would exceed the total 500MB limit.\n`;
      return;
    }

    // ✅ File is valid, proceed with import
    totalUploadedSizeMB += fileSizeMB; // Update total uploaded size
    this.touchstoneLog += `✅ File accepted: ${file.name} (${fileSizeMB.toFixed(
      2
    )}MB)\n`;

    this.readFileToArrayBuffer(file); // Process file*/
  }

  readFileToArrayBuffer(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const fileBuffer = e.target.result;
      this.sendFileToWasm(fileBuffer, file.name);
    };

    reader.readAsArrayBuffer(file); // ✅ Read full file as binary data
  }

  sendFileToWasm(fileBuffer: ArrayBuffer, filename: string) {
    /*if (!this.wasmInstance) {
        this.touchstoneLog += "❌ Error: WASM module is not loaded.\n";
        return;
    }

    const fileSize = fileBuffer.byteLength;
    const bufferPtr = this.wasmInstance._allocate_memory(fileSize); // ✅ Allocate memory in WASM

    if (!bufferPtr) {
        this.touchstoneLog += ` Error: Failed to allocate memory in WASM for ${filename}.\n`;
        return;
    }

    const wasmMemory = new Uint8Array(this.wasmInstance.HEAPU8.buffer, bufferPtr, fileSize);
    wasmMemory.set(new Uint8Array(fileBuffer)); // ✅ Copy file into WASM memory

    this.wasmInstance._import_touchstone(bufferPtr, fileSize, filename.length);
    this.touchstoneLog += `✅ Successfully uploaded ${filename} (${(fileSize / (1024 * 1024)).toFixed(2)}MB) to WASM.\n`;*/
  }

  printWasmImportedFiles() {
    /*if (!this.wasmInstance) {
        this.touchstoneLog += " Error: WASM module is not loaded.\n";
        return;
    }

    this.wasmInstance._print_imported_files();
    this.touchstoneLog += "✅ Imported files printed in WASM console.\n";*/
  }

  processTouchstoneFile(fileContent: string, filename: string) {
    this.touchstoneLog += 'Validating file...\n';

    this.validator = new TouchstoneValidator(fileContent, filename);

    if (!this.validator.validate()) {
      this.errorMessages = this.validator.getErrors();
      this.showErrorMessages();
      return;
    }

    this.touchstoneLog += 'File format is valid. Extracting S-parameters...\n';
    this.validator.extractData();
    this.availableSParams = this.validator.getAvailableSParameters();
    this.selectedSParam = this.availableSParams[0] || 'S11';

    this.plotSelectedSParam();

    const parser = new TouchstoneParser(fileContent, filename);

    parser.parseData();
    this.jsonData = parser.toJSON();
    this.touchstoneLog += 'Successfully parsed S-matrix to JSON.\n';
  }

  plotSelectedSParam() {
    if (!this.validator) return;

    const freqData = this.validator.getFrequencyData();
    const sParamData = this.validator.getSParameterData(this.selectedSParam);

    if (this.selectedVisualization === 'Line Chart') {
      this.chartOptions = {
        title: { text: `${this.selectedSParam} vs Frequency (GHz)` },
        tooltip: { trigger: 'axis' },
        dataZoom: [{ type: 'inside' }, { type: 'slider' }],
        xAxis: { type: 'category', data: freqData, name: 'Frequency (GHz)' },
        yAxis: { type: 'value', name: '|S| (dB)' },
        series: [{ data: sParamData, type: 'line', smooth: true }],
      };
    } else if (this.selectedVisualization === 'Smith Chart') {
      this.smithChartOptions = {
        title: { text: `Smith Chart - ${this.selectedSParam}` },
        tooltip: {
          trigger: 'item',
          formatter: (params) =>
            `Freq: ${params.value[1]} GHz<br>Mag: ${params.value[0]}`,
        },
        polar: { radius: '80%' },
        angleAxis: { type: 'value', startAngle: 0 },
        radiusAxis: { type: 'value' },
        series: [
          {
            type: 'scatter',
            coordinateSystem: 'polar',
            data: sParamData.map((mag, i) => [
              Math.pow(10, mag / 20),
              freqData[i],
            ]),
            symbolSize: 8,
          },
        ],
      };
    } else if (this.selectedVisualization === 'Heatmap') {
      this.heatmapOptions = {
        title: { text: `${this.selectedSParam} Heatmap` },
        tooltip: {
          position: 'top',
          formatter: (params) =>
            `Freq: ${params.value[0]} GHz<br>|S|: ${params.value[2]} dB`,
        },
        dataZoom: [{ type: 'inside' }, { type: 'slider' }],
        xAxis: { type: 'category', data: freqData, name: 'Frequency (GHz)' },
        yAxis: { type: 'category', name: 'Ports' },
        visualMap: {
          min: -40,
          max: 0,
          calculable: true,
          orient: 'vertical',
          left: 'right',
        },
        series: [
          {
            type: 'heatmap',
            data: sParamData.map((value, i) => [freqData[i], 0, value]), // Simulating single-row heatmap
            label: { show: true },
          },
        ],
      };
    }
  }

  showErrorMessages() {
    this.errorMessages.forEach((error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: error,
      });
    });
  }

  importFile(type: string) {
    if (type === 'touchstone' && this.touchstonePath) {
      this.touchstoneLog += 'Importing Touchstone file...\n';
      this.loadChartData();
    } else if (type === 'netlist' && this.netlistPath) {
      this.netlistLog += 'Importing Netlist file...\n';
    } else {
      this.touchstoneLog += 'Error: No file selected.\n';
    }
  }

  loadChartData() {
    this.chartOptions = {
      title: { text: 'Touchstone Data' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ data: [], type: 'line' }],
    };
  }

  runSimulation() {
    this.simulationLog += 'Running simulation...\n';
    setTimeout(() => {
      this.simulationLog += 'Simulation completed successfully!\n';
    }, 2000);
  }

  /** ✅ Export Chart as Image */
  exportChartAsImage() {
    if (this.echartInstance) {
      const dataURL = this.echartInstance.getDataURL({ type: 'png' });
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${this.selectedSParam}.png`;
      link.click();
    }
  }

  /** ✅ Export S-parameter data as CSV */
  exportDataAsCSV() {
    if (!this.validator) return;

    const freqData = this.validator.getFrequencyData();
    const sParamData = this.validator.getSParameterData(this.selectedSParam);

    let csvContent = 'Frequency (GHz), |S| (dB)\n';
    for (let i = 0; i < freqData.length; i++) {
      csvContent += `${freqData[i]}, ${sParamData[i]}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${this.selectedSParam}.csv`);
  }

  /** ✅ Export JSON */
  exportJson() {
    const blob = new Blob([this.jsonData], {
      type: 'application/json;charset=utf-8;',
    });
    saveAs(blob, 's_parameters.json');
  }
}
