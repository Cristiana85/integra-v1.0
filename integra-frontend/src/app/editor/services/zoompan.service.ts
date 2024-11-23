import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { DiagramService } from './diagram.service';

@Injectable({
  providedIn: 'root',
})
export class ZoomPanService {

  public d3Zoom: d3.ZoomBehavior<any, any>;

  private paper: joint.dia.Paper;

  private graph: joint.dia.Graph;

  private paper_svg_obj: any;

  /**
   * Diagram options
   */
  public opts: {
    allowProgramaticZoomPan: boolean;
    zoom: {
      enable: boolean; // dynamic enable zoom
      wheel: boolean;
      ctrl: boolean;
    };
    pan: {
      enable: boolean;
      step: number;
    };
    zoom_cursor: string;
    pan_cursor: string;
    extent_limit: [[number, number], [number, number]];
    translate_limit: [[number, number], [number, number]];
    scale_limit: [number, number];
    scale_factor: number; // [0 1]
    zoom_fit: {
      enable: boolean;
      padding: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
      interpolation: boolean;
      duration: number;
    };
    zoom_inout: {
      enable: boolean;
      step_in: number;
      step_out: number;
      interpolation: boolean;
      duration: number;
    };
  } = {
    allowProgramaticZoomPan: false,
    zoom: {
      enable: true,
      wheel: true,
      ctrl: false,
    },
    pan: {
      enable: true,
      step: 0,
    },
    zoom_cursor: 'grabbing',
    pan_cursor: 'grabbing',
    extent_limit: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    ],
    translate_limit: [
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    ],
    scale_limit: [0.05, 10],
    scale_factor: 0.3,
    zoom_fit: {
      enable: true,
      padding: {
        top: 200,
        right: 200,
        bottom: 200,
        left: 200,
      },
      interpolation: true,
      duration: 50,
    },
    zoom_inout: {
      enable: true,
      step_in: 1.2,
      step_out: 0.8,
      interpolation: true,
      duration: 50,
    },
  };

  public initialize(diagramService: DiagramService): void {

    this.paper = diagramService.paper;
    this.graph = diagramService.graph;
    this.paper_svg_obj = d3.select('#' + this.paper.svg.id);

    this.d3Zoom = d3.zoom();

    // zoom event binding
    this.d3Zoom
      .on('start', (evt: any) => {
        //  start zoom
        this.d3_zoomstart_handler(evt);
      })
      .on('zoom', (evt: any) => {
        //  zoom zoom
        this.d3_zoommove_handler(evt);
      })
      .on('end', (evt: any) => {
        //  end zoom
        this.d3_zoomend_handler(evt);
      });

    // zoom definition
    this.d3Zoom
      .filter((evt: any) => {
        return this.zoomFilter(evt);
      })
      .wheelDelta((evt: any) => {
        return this.zoomWheelDelta(evt);
      })
      //.extent([]) // feature
      .scaleExtent(this.opts.scale_limit)
      .translateExtent(this.opts.translate_limit);
      //.constrain((transform, extent, translateExtent) => { return undefined}) // feature

    this.setZoomPan();
    //this.rubberbandView = new ZoomRubberBand(this.paper, this.graph);

  }

  private setZoomPan() {
    this.paper_svg_obj!.on('.zoom', null);
    if (this.opts.zoom.enable) {
      if (this.opts.pan.enable) {
        this.paper_svg_obj.call(this.d3Zoom).on('dblclick.zoom', null);
      } else {
        this.paper_svg_obj
          .call(this.d3Zoom)
          .on('dblclick.zoom', null)
          .on('mousedown.zoom', null)
          .on('touchstart.zoom', null)
          .on('touchmove.zoom', null)
          .on('touchend.zoom', null);
      }
    } else if (this.opts.pan.enable) {
      this.paper_svg_obj
        .call(this.d3Zoom)
        .on('wheel.zoom', null)
        .on('mousewheel.zoom', null)
        .on('MozMousePixelScroll.zoom', null);
    }
  }

  private resetZoom(container: HTMLElement): void {}

  private zoomFilter(event: any): boolean {
    switch (event.type) {
      case 'mousedown': {
        return event.which === 3;
      }
      case 'wheel': {
        if (this.opts.zoom.ctrl) {
          return event.ctrlKey;
        } else {
          return event.button === 0;
        }
      }
      default:
        return this.opts.allowProgramaticZoomPan;
    }
  }

  private zoomWheelDelta(event: any): number {
    const deltaY = event.deltaY;
    const norm_delta = event.deltaMode ? 120 : 1;
    return (-deltaY * norm_delta) / (1000 * this.opts.scale_factor);
  }

  public d3_zoomstart_handler(evt: any) {
      if (evt.sourceEvent) {
        if (evt.sourceEvent.type === 'mousedown') {
          if (this.paper.el.style.cursor.length > 0 && this.opts.pan.enable) {
          } else {
          }
          this.paper.el.style.cursor = this.opts.pan_cursor;
        }
      }
  }

  public d3_zoommove_handler(evt: any) {
      if (evt.sourceEvent) {
        if (this.opts.zoom.enable && !this.opts.pan.enable) {
          if (evt.sourceEvent.type === 'wheel') {
            this.paper.scale(evt.transform.k, evt.transform.k, 0, 0);
            this.paper.translate(evt.transform.x, evt.transform.y);
          }
        } else if (!this.opts.zoom.enable && this.opts.pan.enable) {
          if (evt.sourceEvent.type === 'mousemove') {
            this.paper.translate(evt.transform.x, evt.transform.y);
          }
        } else if (this.opts.zoom.enable && this.opts.pan.enable) {
          if (evt.sourceEvent.type === 'wheel') {
            if (this.opts.zoom.wheel) {
              console.log(evt.transform)
              this.paper.scale(evt.transform.k, evt.transform.k, 0, 0);
              this.paper.translate(evt.transform.x, evt.transform.y);
            }
          } else if (evt.sourceEvent.type === 'mousemove') {
            this.paper.scale();
            this.paper.translate(evt.transform.x, evt.transform.y);
          }
        }
      } else {
        this.paper.scale(evt.transform.k, evt.transform.k, 0, 0);
        this.paper.translate(evt.transform.x, evt.transform.y);
      }
  }

  public d3_zoomend_handler(evt: any) {
      if (this.opts.zoom.enable && this.opts.pan.enable) {
        if (evt.sourceEvent) {
          if (evt.sourceEvent.type === 'mouseup') {
          }
        }
      }
  }

}
