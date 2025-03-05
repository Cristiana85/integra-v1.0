export class TouchstoneParser {
  private content: string[] = [];
  private frequency: number[] = [];
  private sMatrix: number[][][] = []; // 3D Matrix: [frequencyIndex][row][col]
  private numPorts: number = 0;
  private frequencyScale: number = 1; // Default to GHz
  private dataFormat: 'RI' | 'DB' | 'MA' = 'RI'; // Real/Imag, dB/Phase, Mag/Angle

  constructor(private fileContent: string, private filename: string) {
    this.content = fileContent.split(/\r?\n/).map(line => line.trim());
    const match = this.filename.match(/\.s(\d+)p$/i);
    this.numPorts = parseInt(match[1], 10);
  }

  // ✅ Extract Frequency & S-Parameter Matrix
  parseData() {
    this.frequency = [];
    this.sMatrix = [];

    const dataLines = this.content.filter(line => !line.startsWith("!") && !line.startsWith("#") && line.length > 0);
    const numParams = this.numPorts ** 2; // N x N S-parameters
    const expectedColumns = 1 + numParams * 2; // Frequency + (N² S-params * 2 values each)

    for (const line of dataLines) {
      const parts = line.split(/\s+/);
      if (parts.length !== expectedColumns) continue;

      const frequencyVal = parseFloat(parts[0]) * this.frequencyScale;
      if (isNaN(frequencyVal)) continue;

      this.frequency.push(frequencyVal);

      let matrixRow: number[][] = Array.from({ length: this.numPorts }, () => Array(this.numPorts).fill(0));

      for (let row = 0; row < this.numPorts; row++) {
        for (let col = 0; col < this.numPorts; col++) {
          const index = 1 + (row * this.numPorts + col) * 2;
          const value1 = parseFloat(parts[index]);
          const value2 = parseFloat(parts[index + 1]);

          let magnitudeLinear = 0;
          if (!isNaN(value1) && !isNaN(value2)) {
            if (this.dataFormat === 'RI') {
              magnitudeLinear = Math.sqrt(value1 ** 2 + value2 ** 2); // Convert Real/Imag to Magnitude
            } else if (this.dataFormat === 'DB') {
              magnitudeLinear = Math.pow(10, value1 / 20); // Convert dB to Linear
            } else if (this.dataFormat === 'MA') {
              magnitudeLinear = value1; // Already in Magnitude
            }
          }
          matrixRow[row][col] = magnitudeLinear;
        }
      }
      this.sMatrix.push(matrixRow);
    }
  }

  // ✅ Convert to JSON for WASM
  toJSON(): string {
    return JSON.stringify({
      frequency: this.frequency,
      sMatrix: this.sMatrix
    });
  }
}
