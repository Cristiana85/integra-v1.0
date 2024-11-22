export interface DiagramState {
  elements: ElementState[]; // Represents diagram nodes
  links: LinkState[];       // Represents connections between nodes
  selectedElementId: string | null; // ID of the selected node, if any
}

export interface ElementState {
  id: string;
  type: string; // e.g., rectangle, circle, etc.
  position: { x: number; y: number };
  size: { width: number; height: number };
  attrs: any; // Attributes for rendering in JointJS
}

export interface LinkState {
  id: string;
  sourceId: string;
  targetId: string;
}
