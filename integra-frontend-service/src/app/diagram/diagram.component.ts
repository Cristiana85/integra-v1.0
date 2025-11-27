import { Component, AfterViewInit } from '@angular/core';
import * as joint from 'jointjs';

@Component({
  selector: 'app-diagram',
  template: `<div id="paper" style="width:100%; height:600px;"></div>`,
})
export class DiagramComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const graph = new joint.dia.Graph();

    const paper = new joint.dia.Paper({
      el: document.getElementById('paper')!,
      model: graph,
      width: 1000,
      height: 600,
      gridSize: 10,
    });

    const rect = new joint.shapes.standard.Rectangle();
    rect.position(100, 100);
    rect.resize(120, 40);
    rect.attr('label/text', 'Hello JointJS');
    rect.addTo(graph);
  }
}
