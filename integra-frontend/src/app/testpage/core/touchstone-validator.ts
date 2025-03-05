export class TouchstoneValidator {
  private content: string[] = [];
  private errors: string[] = [];
  private frequencyData: number[] = [];
  private sParameters: { [key: string]: number[] } = {}; // Store S-parameters dynamically
  private frequencyScale: number = 1; // Default to GHz
  private dataFormat: 'RI' | 'DB' | 'MA' = 'RI'; // Real/Imag, dB/Phase, Mag/Angle
  private numPorts: number = 0; // Extracted from file
  private fileExtensionPorts: number = 0; // Extracted from filename

  constructor(private fileContent: string, private filename: string) {
    this.content = fileContent.split(/\r?\n/).map(line => line.trim());
  }

  getErrors(): string[] {
    return this.errors;
  }

  // ✅ Validate Touchstone File Format
  validate(): boolean {
    if (!this.content.length) {
      this.errors.push("Error: Empty file.");
      return false;
    }

    // Remove comments (lines starting with '!')
    const dataLines = this.content.filter(line => !line.startsWith("!") && line.length > 0);

    if (dataLines.length < 2) {
      this.errors.push("Error: File does not contain valid data.");
      return false;
    }

    // ✅ Extract File Extension and Expected Ports
    const match = this.filename.match(/\.s(\d+)p$/i);
    if (!match) {
      this.errors.push("Error: Invalid file extension. Expected .sNp (e.g., .s2p, .s3p).");
      return false;
    }

    this.fileExtensionPorts = parseInt(match[1], 10);
    if (isNaN(this.fileExtensionPorts) || this.fileExtensionPorts < 1) {
      this.errors.push("Error: Invalid port number in file extension.");
      return false;
    }

    // ✅ Extract Header Information
    const headerParts = dataLines[0].split(/\s+/);
    /*if (headerParts.length < 4 || !headerParts[1].match(/^[0-9]+(Hz|kHz|MHz|GHz)$/)) {
      console.error("Error: Invalid header format.");
      return false;
    }*/

    // ✅ Extract Frequency Unit
    const freqUnit = headerParts[1];
    if (freqUnit.endsWith("Hz")) this.frequencyScale = 1e-9;
    else if (freqUnit.endsWith("kHz")) this.frequencyScale = 1e-6;
    else if (freqUnit.endsWith("MHz")) this.frequencyScale = 1e-3;
    else if (freqUnit.endsWith("GHz")) this.frequencyScale = 1;
    else {
      this.errors.push("Error: Unsupported frequency scale.");
      return false;
    }

    // ✅ Extract Data Format
    this.dataFormat = headerParts[3].toUpperCase() as 'RI' | 'DB' | 'MA';
    if (!['RI', 'DB', 'MA'].includes(this.dataFormat)) {
      this.errors.push("Error: Unsupported data format.");
      return false;
    }

    // ✅ Determine Expected Number of Columns
    const expectedColumns = 1 + this.fileExtensionPorts ** 2 * 2; // Freq + (N^2 S-params * 2 values each)
    console.log(`Expected columns: ${expectedColumns}`);

    const dataLines_0 = this.content.filter(line => !line.startsWith("!") && !line.startsWith("#") && line.length > 0);

    // ✅ Check Column Count & Numeric Data
    for (const line of dataLines_0) {
      const parts = line.split(/\s+/);
      if (parts.length !== expectedColumns) {
        this.errors.push(`Error: Invalid column count in data row. Expected ${expectedColumns}, found ${parts.length}`);
        return false;
      }

      // Ensure all values are numeric
      if (!parts.every(value => /^-?\d+(\.\d+)?(e[-+]?\d+)?$/i.test(value))) {
        this.errors.push(`Error: Non-numeric value found in line: ${line}`);
        return false;
      }
    }

    return this.errors.length === 0;
  }

  // ✅ Extract Frequency & S11 Data
  extractData() {
    this.frequencyData = [];
    this.sParameters = {}; // Reset dictionary

    const dataLines = this.content.filter(line => !line.startsWith("!") && !line.startsWith("#") && line.length > 0);
    const numParams = this.fileExtensionPorts ** 2; // N^2 S-parameters
    const expectedColumns = 1 + numParams * 2; // Freq + (N^2 S-params * 2 values)

    for (const line of dataLines) {
      const parts = line.split(/\s+/);
      if (parts.length !== expectedColumns) continue;

      const frequency = parseFloat(parts[0]) * this.frequencyScale;
      if (isNaN(frequency)) continue;

      this.frequencyData.push(frequency);

      for (let row = 0; row < this.fileExtensionPorts; row++) {
        for (let col = 0; col < this.fileExtensionPorts; col++) {
          const paramName = `S${row + 1}${col + 1}`;
          const value1 = parseFloat(parts[1 + (row * this.fileExtensionPorts + col) * 2]);
          const value2 = parseFloat(parts[2 + (row * this.fileExtensionPorts + col) * 2]);

          if (!this.sParameters[paramName]) this.sParameters[paramName] = [];

          if (!isNaN(value1) && !isNaN(value2)) {
            let magnitudeDB = 0;
            if (this.dataFormat === 'RI') {
              magnitudeDB = 20 * Math.log10(Math.sqrt(value1 ** 2 + value2 ** 2));
            } else if (this.dataFormat === 'DB') {
              magnitudeDB = value1;
            } else if (this.dataFormat === 'MA') {
              magnitudeDB = 20 * Math.log10(value1);
            }
            this.sParameters[paramName].push(magnitudeDB);
          }
        }
      }
    }
  }

  getFrequencyData(): number[] {
    return this.frequencyData;
  }

  getSParameterData(param: string): number[] {
    return this.sParameters[param] || [];
  }

  getAvailableSParameters(): string[] {
    return Object.keys(this.sParameters);
  }

}
