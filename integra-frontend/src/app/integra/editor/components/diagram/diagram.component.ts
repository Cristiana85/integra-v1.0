import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as joint from 'jointjs';
<<<<<<< HEAD
=======
import { SharedModule } from '../../../../shared/shared.module';
>>>>>>> feature/diagram
import { DiagramService } from '../../services/diagram.service';
import { addElement, redo, undo } from '../../store/actions/diagram.actions';
import { ElementState } from '../../store/states/diagram.state';
import { ZoomPanService } from '../../services/zoompan.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'integra-diagram',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss'],
})
export class DiagramComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) containerRef!: ElementRef;

<<<<<<< HEAD
  constructor(private diagramService: DiagramService, private zoomPanService: ZoomPanService) {}
=======
  constructor(
    private diagramService: DiagramService,
    private zoomPanService: ZoomPanService,
    private store: Store,
  ) {}
>>>>>>> feature/diagram

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.diagramService.initialize(this.containerRef.nativeElement);
    //this.zoomPanService.initialize(this.diagramService);
  }

  ngOnDestroy(): void {}

  resetZoom(): void {}

  addElementToDiagram(element: ElementState): void {
    //this.store.dispatch(addElement({ element }));
  }

  undoLastAction(): void {
<<<<<<< HEAD
  }

  redoLastAction(): void {
=======
    //this.store.dispatch(undo());
  }

  redoLastAction(): void {
    //this.store.dispatch(redo());
>>>>>>> feature/diagram
  }

  allowDrop(event: DragEvent): void {
    console.log('allowDrop');
    event.preventDefault(); // Allow the drop
  }

  onDrop(event): void {
    console.log('onDrop');
    const dragData = { type: 'rectangle' }; // Get the drag data
    if (dragData) {
      const x = event.offsetX;
      const y = event.offsetY;

      switch (dragData.type) {
        case 'rectangle':
          this.addRectangle(x, y);
          break;
        case 'circle':
          this.addCircle(x, y);
          break;
        case 'hexagon':
          this.addHexagon(x, y);
          break;
        default:
          console.warn('Unknown item type:', dragData.type);
      }
    } else {
      console.warn('No drag data available');
    }
  }

  addRectangle(x: number, y: number): void {
    const rect = new joint.shapes.standard.Rectangle();
    rect.position(x, y);
    rect.resize(100, 40);
    rect.attr({
      body: { fill: 'blue' },
      label: { text: 'Rectangle', fill: 'white' },
    });
    // Assuming graph is defined globally or as a class property
    this.diagramService.graph.addCell(rect);
  }

  addCircle(x: number, y: number): void {
    const circle = new joint.shapes.standard.Circle();
    circle.position(x, y);
    circle.resize(60, 60);
    circle.attr({
      body: { fill: 'red' },
      label: { text: 'Circle', fill: 'white' },
    });
    this.diagramService.graph.addCell(circle);
  }

  addHexagon(x: number, y: number): void {
    const hexagon = new joint.shapes.standard.Polygon();
    hexagon.position(x, y);
    hexagon.resize(100, 100);
    hexagon.attr({
      body: { refPoints: '50,0 100,25 100,75 50,100 0,75 0,25', fill: 'green' },
      label: { text: 'Hexagon', fill: 'white' },
    });
    this.diagramService.graph.addCell(hexagon);
  }
}
