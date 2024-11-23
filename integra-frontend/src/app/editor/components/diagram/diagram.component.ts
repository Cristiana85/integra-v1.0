import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import * as joint from 'jointjs';
import { SharedModule } from '../../../shared/shared.module';
import { DiagramService } from '../../services/diagram.service';
import { addElement, redo, undo } from '../../store/actions/diagram.actions';
import { ElementState } from '../../store/states/diagram.state';
import { ZoomPanService } from '../../services/zoompan.service';
import { debounceTime, fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'integra-diagram',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('diagramContainer', { static: true }) containerRef!: ElementRef;

  private resizeSubscription: Subscription;

  constructor(private diagramService: DiagramService, private zoomPanService: ZoomPanService, private store: Store) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.diagramService.initialize(this.containerRef.nativeElement);
    this.zoomPanService.initialize(this.diagramService);

    // Listen for window resize events
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(200)) // Debounce to avoid excessive calls
      .subscribe(() => this.onResize());

    // Perform initial sizing
    this.onResize();
  }

  ngOnDestroy(): void {
    // Clean up the resize subscription to avoid memory leaks
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  private onResize(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Update the size of the diagram
    this.diagramService.updateDiagramSize(width, height);
  }

  resetZoom(): void {

  }

  addElementToDiagram(element: ElementState): void {
    //this.store.dispatch(addElement({ element }));
  }

  undoLastAction(): void {
    this.store.dispatch(undo());
  }

  redoLastAction(): void {
    this.store.dispatch(redo());
  }

  allowDrop(event: DragEvent): void {
    console.log('allowDrop')
    event.preventDefault(); // Allow the drop
  }

  onDrop(event): void {
    console.log('onDrop')
    const dragData = {type: 'rectangle'}; // Get the drag data
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
