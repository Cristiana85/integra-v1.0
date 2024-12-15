export interface Element {
  id: string;
  type: string; // e.g., "rectangle", "circle", "custom-node"
  position: { x: number; y: number };
  size: { width: number; height: number };
  label?: string;
  properties?: Record<string, any>;
}

export interface Link {
  id: string;
  source: string;
  target: string;
  style?: { color?: string; dashed?: boolean; width?: number };
}
