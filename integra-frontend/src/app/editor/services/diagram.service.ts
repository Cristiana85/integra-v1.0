import { HostListener, Injectable } from '@angular/core';
import * as d3 from 'd3';
import * as joint from 'jointjs';

@Injectable({
  providedIn: 'root',
})
export class DiagramService {
  public graph: joint.dia.Graph;
  public paper: joint.dia.Paper;

  constructor() {
    this.graph = new joint.dia.Graph();
  }

  // Initialize the diagram canvas
  initialize(container: HTMLElement): void {
    const lib = joint.shapes;
    // initilize graph
    this.graph = this.graph = new joint.dia.Graph({}, { cellNamespace: lib });
    // initilize paper
    this.paper = new joint.dia.Paper({
      el: container,
      model: this.graph,
      width: '100%',
      height: '100%',
      freeze: true,
      async: true,
      drawGrid: true,
      markAvailable: true,
      sorting: joint.dia.Paper.sorting.APPROX,
      cellViewNamespace: lib,
    } as any);
    this.paper.unfreeze();
    this.paper.setGrid({
      color: 'black',
      thickness: 2,
      name: 'fixedDot' as
        | 'dot'
        | 'fixedDot'
        | 'mesh'
        | 'doubleMesh',
    });
    this.paper.options.drawGridSize = 10;
    this.paper.options.gridSize = 10;
    // grid css update
    this.paper.$grid.css('opacity', 0.05);
    this.paper.$grid.css('filter', 'blur(' + 0.5 + 'px)');
    this.paper.$grid.css('border-bottom-left-radius', 25);
    this.paper.$background.css('border-bottom-left-radius', 25);
    // background update
    this.paper.drawBackground({
      color: 'white',
      opacity: 1,
    });
    // redraw grid to update
    this.paper.drawGrid();
    this.addRectangle(100, 100);
  }

  updateDiagramSize(width: number, height: number): void {
    if (this.paper) {
      this.paper.setDimensions(width, height);
    }
  }

  resizeCanvas(): void {
    const boundingBox = this.graph.getBBox(); // Get the bounding box of all elements
    const width = Math.max(boundingBox.width + 200, 2000); // Add padding
    const height = Math.max(boundingBox.height + 200, 2000);
  }

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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    event.preventDefault();
    //this.sel.getDiagramFromList('test').container_rect.w = window.innerWidth;
    //this.sel.getDiagramFromList('test').container_rect.h = window.innerHeight;
  }

}
