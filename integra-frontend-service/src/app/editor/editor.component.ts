import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as joint from 'jointjs';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements AfterViewInit {
  @ViewChild('paper', { static: false }) paperRef!: ElementRef<HTMLDivElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const element = this.paperRef.nativeElement;

    const graph = new joint.dia.Graph();

    const paper = new joint.dia.Paper({
      el: element,
      model: graph,
      width: element.clientWidth || 1000,
      height: element.clientHeight || 600,
      gridSize: 10,
    });

    const rect = new joint.shapes.standard.Rectangle();
    rect.position(100, 100);
    rect.resize(140, 50);
    rect.attr('label/text', 'Hello JointJS');
    rect.addTo(graph);

    const rect2 = new joint.shapes.standard.Rectangle();
    rect2.position(350, 200);
    rect2.resize(160, 60);
    rect2.attr('label/text', 'Block 2');
    rect2.addTo(graph);

    const link = new joint.shapes.standard.Link();
    link.source(rect);
    link.target(rect2);
    link.addTo(graph);
  }
}
