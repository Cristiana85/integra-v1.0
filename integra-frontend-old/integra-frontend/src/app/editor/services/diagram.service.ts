import { Injectable } from '@angular/core';
import * as joint from 'jointjs';

@Injectable({
  providedIn: 'root'
})
export class DiagramService {
  public graph: joint.dia.Graph;
  public paper: joint.dia.Paper;

  constructor() {
    this.graph = new joint.dia.Graph();
  }

  // Initialize the diagram canvas
  initialize(container: HTMLElement): void {
    this.paper = new joint.dia.Paper({
      el: container,
      model: this.graph,
      width: container.clientWidth,
      height: container.clientHeight,
      gridSize: 20,
      drawGrid: true,
    });
    //this.resizeCanvas();
  }

  resizeCanvas(): void {
    const boundingBox = this.graph.getBBox(); // Get the bounding box of all elements
    const width = Math.max(boundingBox.width + 200, 2000); // Add padding
    const height = Math.max(boundingBox.height + 200, 2000);

  }

  /**
   * this.graph.on('add remove change', () => {
  this.resizeCanvas();
});
   */

addRectangle(x: number, y: number): void {
  const rect = new joint.shapes.standard.Rectangle();
  rect.position(x, y);
  rect.resize(100, 40);
  rect.attr({
    body: { fill: 'blue' },
    label: { text: 'Rectangle', fill: 'white' },
  });
  this.graph!.addCell(rect);
}

addCircle(x: number, y: number): void {
  const circle = new joint.shapes.standard.Circle();
  circle.position(x, y);
  circle.resize(60, 60);
  circle.attr({
    body: { fill: 'red' },
    label: { text: 'Circle', fill: 'white' },
  });
  this.graph!.addCell(circle);
}

addHexagon(x: number, y: number): void {
  const hexagon = new joint.shapes.standard.Polygon();
  hexagon.position(x, y);
  hexagon.resize(100, 100);
  hexagon.attr({
    body: { refPoints: '50,0 100,25 100,75 50,100 0,75 0,25', fill: 'green' },
    label: { text: 'Hexagon', fill: 'white' },
  });
  this.graph!.addCell(hexagon);
}


  // Undo logic (placeholder for future implementation)
  undo(): void {
    console.log('Undo not implemented yet.');
  }

  // Redo logic (placeholder for future implementation)
  redo(): void {
    console.log('Redo not implemented yet.');
  }
}
