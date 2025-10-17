import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { MVC_STATE, MVController } from "../../core/mv-controller";
import { ElementProps } from '../../core/element-props';
import { HybridController } from './customrouter/hybrid-controller';
import { DiagramHelper } from '../../util/helpers';
import d3 = require('d3');
import { WiringLink } from '../../library/connectors/wiring-link';
import { Node } from '../../library/junctions/std-node';
import { numberAttribute } from '@angular/core';
import { IntersectionController } from '../intersection/intersection-controller';

enum WiringState {
  PAPER,
  PORT,
  ELEMENT,
  LINK,
}

export class WiringController {
  private mvc: MVController;

  private graph: joint.dia.Graph;

  private paper: joint.dia.Paper;

  private isMounted: boolean = false;

  private isMultiPoint: boolean = false;

  private wiring_state: WiringState;

  private hybrid_ctrl: HybridController;

  private dblClickTimeout: number = 320;

  private mousedownClicks: number = 0;

  public opts: {
    enable: boolean
  } = {
    enable: true
  }

  public wiringInfo: {
    class: string,
    autoscroll: boolean,
    anchor: string,
    padding: number,
    source_marker: string,
    target_marker: string,
  }

  constructor(
    mvc: MVController,
  ) {
    if (mvc) {
      this.mvc = mvc;
      this.paper = mvc.paper;
      this.graph = mvc.graph;
    }
  }

  public mount() {
    this.hybrid_ctrl = new HybridController(this.mvc);
    this.paper.options.defaultLink = (cellView: joint.dia.CellView, magnet: any) => {
      this.startLinkDrawing(cellView, magnet);
      return this.hybrid_ctrl.getLinkReference();
    };
    this.isMounted = true;
  }

  /**
   * Called from defaultink in JJ system
   */
  private startLinkDrawing(cellView: joint.dia.CellView, magnet: any) {
    this.mvc.opts.autoscroll.enable = true;
    if (this.isMounted) {
      if (this.opts.enable) {
        // set wiring state
        this.mvc.setState(MVC_STATE.LINKDRAWING);
        if (this.getCellInfo(cellView)) {
          switch (this.wiringInfo.class) {
            case 'std-hybrid': {
              this.hybrid_ctrl.initLinkDrawing(cellView, magnet);
              this.isMultiPoint = this.hybrid_ctrl.data.multi_point;
              break;
            }
          }
          if (this.isMultiPoint) {
            // stop listening to mouseup to make wiring continous
            this.stopListening('mouseup');
            // start listening to link change to detect if the link is
            // ready to be connected (and in this case with mousedown it remains connected)
            // or if it is actually still dragging (and in this case with mousedown a new point is added)
            this.startListeningValidateConnection();
            // start listening to mousedown to detect either a connection to magnet or a new point to add
            this.startListeningMousedown();
          } else {
            this.startListeningValidateConnection();
          }
        }
      }
    }
  }

  public createWire(): joint.dia.Link {
    var link = this.hybrid_ctrl.createLink();
    return link;
  }

  public drawingDragStart(cellView: joint.dia.CellView, evt: any) {
    if (this.isMounted) {
      if(cellView.model.isLink()) {
        switch (this.wiringInfo.class) {
          case 'std-hybrid': {
            this.hybrid_ctrl.updateLinkDrawing('start', cellView, evt);
            break;
          }
        }
      }
    }
  }

  public drawingDragMove(cellView: joint.dia.CellView, evt: any) {
    if (this.isMounted) {
      if(cellView.model.isLink()) {
        //console.log(cellView.model.hasLoop())
        switch (this.wiringInfo.class) {
          case 'std-hybrid': {
            this.hybrid_ctrl.updateLinkDrawing('move', cellView, evt);
            break;
          }
        }
      }
    }
  }

  public drawingDragEnd(cellView: joint.dia.CellView, evt: any) {
    if (this.isMounted) {
      if(cellView.model.isLink()) {
        if (this.isMultiPoint) {
          this.forceMouseEvent('mousedown');
          switch (this.wiringInfo.class) {
            case 'std-hybrid': {
              this.hybrid_ctrl.updateLinkDrawing('end', cellView, evt);
              break;
            }
          }
          this.mvc.setState(MVC_STATE.SELECTION);
        } else {
          this.stopListeningValidateConnection();
          switch (this.wiring_state) {
            case WiringState.PORT: {
              switch (this.wiringInfo.class) {
                case 'std-hybrid': {
                  this.hybrid_ctrl.updateLinkDrawing('end', cellView, evt);
                  break;
                }
              }
              break;
            }
          }
          this.mvc.setState(MVC_STATE.SELECTION);
        }
      }
    }
  }

  private lRewiringLink: joint.dia.Link[] = [];
  private lLinkAddedToHalo: joint.dia.Link[] = [];

  public redrawingDragStart(cellView: joint.dia.CellView, haloenabled: boolean) {
    if (this.isMounted) {
      this.lRewiringLink = [];
      this.lLinkAddedToHalo = [];
    }
  }

  public redrawingDragMove(cellView: joint.dia.CellView, haloenabled: boolean) {
    console.log('moving...')
    if (this.isMounted) {
      // link filtering for rewiring
      if (haloenabled) {

        console.log('multi selection...')
        console.log('looking for connected links from selected elements...')

        const lSelectedElems = this.mvc.halo.getEmbeddedElements();
        const lSelectedLinks = this.mvc.halo.getEmbeddedLink();

        // first check links connected to elements
        lSelectedElems.forEach(el => {

          const props = DiagramHelper.getElementModelProp(el);

          if (props) {

            const cfg = DiagramHelper.getModelConfig(
              this.mvc,
              props.cfgName
            );

            if (cfg && cfg.class === 'model') {

              const connectedLinks = this.mvc.graph.getConnectedLinks(el);

              connectedLinks.forEach(lk => {

                if (lSelectedLinks.find(link => link.id === lk.id)) {
                  // TBD
                } else {

                  const sourceId = lk.source().id;
                  const targetId = lk.target().id;

                  const source = lSelectedElems.find(el_ => el_.id === sourceId);
                  const target = lSelectedElems.find(el_ => el_.id === targetId);

                  if (source && target) {

                    console.log('n.1 between link detected...')

                    this.lRewiringLink.push(lk);

                  } else {

                    console.log('n.1 link added to valid list...')

                    this.lRewiringLink.push(lk);

                  }
                }

              });

            }
          }
        });
        // second check elements connected to links
        lSelectedLinks.forEach(lk => {

          console.log('multi selection...')
          console.log('looking for connected links from selected links...')

          const props = DiagramHelper.getLinkModelProp(lk);

          if (props) {

            const cfg = DiagramHelper.getModelConfig(
              this.mvc,
              props.cfgName
            );

            if (cfg && cfg.class === 'model') {

              const sourceId = lk.source().id;
              const targetId = lk.target().id;

              const checkSource = lSelectedElems.find(el_ => el_.id === sourceId);
              const checkTarget = lSelectedElems.find(el_ => el_.id === targetId);

              if (checkSource && checkTarget) {
                // do nothin here
              } else {

                console.log('n.1 link added to valid list...')
                this.lRewiringLink.push(lk);

              }
            }
          }
        });
      } else {
        if (cellView.model.isElement()) {

          console.log('single selection...')
          console.log('looking for connected links from element...')

          const props = DiagramHelper.getElementModelProp(cellView.model);

          if (props) {

            const cfg = DiagramHelper.getModelConfig(
              this.mvc,
              props.cfgName
            );

            if (cfg && cfg.class === 'model') {

              const selectedElem = cellView.model as joint.dia.Element;

              const connectedLinks = this.mvc.graph.getConnectedLinks(selectedElem);

              connectedLinks.forEach(lk => {
                this.lRewiringLink.push(lk);
                console.log('n.1 link added to valid list...')
              });

            }
          }
        } else if (cellView.model.isLink()) {

          console.log('single selection...')
          console.log('looking for connected links from link...')

          const props = DiagramHelper.getLinkModelProp(cellView.model);

          if (props) {

            const cfg = DiagramHelper.getModelConfig(
              this.mvc,
              props.cfgName
            );

            if (cfg && cfg.class === 'model') {

              const link = cellView.model as joint.dia.Link;

              this.lRewiringLink.push(link);

              console.log('n.1 link added to valid list...')
            }
          }
        }
      }

      // assign router to links
      this.lRewiringLink.forEach(lk => {

        console.log('assign router to valid link list...')

        const props = DiagramHelper.getLinkModelProp(lk);

        if (props) {

          const cfg = DiagramHelper.getModelConfig(
            this.mvc,
            props.cfgName
          );

          if (cfg) {
            // reroute
            switch (cfg.wiring.router) {

              case 'orthogonal': {
                lk.router('orthogonal', {elementPadding: 0, padding: 0});
                break;
              }

              case 'rightAngle': {
                lk.router('rightAngle', {margin: 0, useVertices: false});
                break;
              }

              case 'normal': {
                lk.router('normal');
                break;
              }

              case 'std-hybrid:rewiring': {
                this.hybrid_ctrl.setRewiringRouter(lk);
                break;
              }

            }
          }
        }
      });
      this.mvc.paper.updateViews();
    }
  }

  public redrawingDragEnd(cellView: joint.dia.CellView, haloenabled: boolean) {
    if (this.isMounted) {

      this.mvc.paper.updateViews();

      this.lRewiringLink.forEach(lk => {
        //console.log(lk)
        const path = (lk.findView(this.mvc.paper) as joint.dia.LinkView).getConnection();
        const n_segments = path.getSegmentSubdivisions();

        var vertices = [];
        for (var i = 0; i < n_segments.length; i++) {
          vertices.push(path.getSegment(i).end);
        }
        vertices = this.hybrid_ctrl.pathRefactoring(vertices, undefined, undefined, false, false);

        lk.router('normal');

        if (vertices.length > 0) {
          lk.set('vertices', vertices.slice(1, vertices.length - 1));
        }

      });

      this.lLinkAddedToHalo.forEach(lk => {
        this.mvc.halo.setLinkToHalo(lk, false);
      });
    }
  }

  /**
   * Useful to create locally a copy of the wiring setttings
   */
  private getCellInfo(cellView: joint.dia.CellView): boolean {
    const prop = DiagramHelper.getElementViewModelProp(cellView);
    if (prop) {
      const cfg = DiagramHelper.getModelConfig(this.mvc, prop.cfgName);
      if (cfg) {
        if (cfg.type === 'diagram') {
          if (cfg.wiring.class) {
            this.wiringInfo = cfg.wiring;
            return true;
          }
        }
      }
    }
    return false;
  }

  private triggerRedrawing(element: joint.dia.Element) {
    if (element.isElement()) {

      console.log('redrawing triggered...')
      console.log('looking for connected links from element...')

      const props = DiagramHelper.getElementModelProp(element);

      if (props) {

        const cfg = DiagramHelper.getModelConfig(
          this.mvc,
          props.cfgName
        );

        if (cfg && cfg.class === 'model') {

          const selectedElem = element;
          const connectedLinks = this.mvc.graph.getConnectedLinks(selectedElem);

          connectedLinks.forEach(lk => {
            this.lRewiringLink.push(lk);
            console.log('n.1 link added to valid list...')
          });

        }
      }
    }
  }

  public keyboardEsc() {
    if (this.isMounted) {
      if (this.isMultiPoint) {
        this.forceMouseEvent('mouseup');
        this.startListening('mouseup');
        this.stopListeningValidateConnection();
        this.stopListeningMousedown();
        this.mvc.setState(MVC_STATE.SELECTION);
      } else {
        this.forceMouseEvent('mouseup');
        this.mvc.setState(MVC_STATE.SELECTION);
      }
    }

    this.hybrid_ctrl.stopLinkDrawing('ESC');
  }

  public setTool(cellView: joint.dia.CellView, enable: boolean) {
    // Eliminate getCellInfo!!
    if (this.getCellInfo(cellView)) {
      switch (this.wiringInfo.class) {
        case 'std-hybrid': {
          this.hybrid_ctrl.setTool(cellView.model as joint.dia.Link, enable);
          break;
        }
      }
    }
  }

  private startListening(event: string) {
    (this.paper.$el as any).off(event, 'svg', null);
    // disable mouseup listening outside the window
    d3.select('*').on("mouseup", null);
  }

  private stopListening(event: string) {
    (this.paper.$el as any).on(event, 'svg', (evt: MouseEvent) => {
      this.mvc.opts.autoscroll.enable = false;
      evt.stopPropagation();
    });
    // disable mouseup listening outside the window
    d3.select('*').on("mouseup", (evt: MouseEvent) => {
        evt.stopPropagation();
    });
  }

  private startListeningValidateConnection() {
    this.hybrid_ctrl.getLinkReference().on('change', (linkEvt) => {
      if (linkEvt) {
        if (linkEvt.target().x && linkEvt.target().y) {
          this.wiring_state = WiringState.PAPER;
        } else if (linkEvt.target().id) {
          if (linkEvt.target().magnet) {
            this.wiring_state = WiringState.PORT;
          } else {
            this.wiring_state = WiringState.ELEMENT;
          }
        }
      }
    });
  }

  private stopListeningValidateConnection() {
    this.hybrid_ctrl.getLinkReference().off('change', null);
  }

  private startListeningMousedown() {
    (this.paper.$el as any).on('mousedown', 'svg', (evt: any) => {
      if (this.isMultiPoint) {
        this.mvc.opts.autoscroll.enable = true;
        switch (this.wiring_state) {

          case WiringState.PAPER: {
            this.mousedownClicks += 1;
            if (this.mousedownClicks === 1 ) {
              setTimeout(() => {
                this.mousedownClicks = 0;
              }, this.dblClickTimeout);
            }
            if (this.mousedownClicks === 1) {
              switch (this.wiringInfo.class) {
                case 'std-hybrid': {
                  //const junctionInfo = this.junction_ctrl.validateEvent(evt, this.wiringInfo.class);
                  if (/*junctionInfo.targetLink*/false) {
                    this.stopListeningValidateConnection();
                    this.stopListeningMousedown();

                    /*const junction = this.junction_ctrl.createJunction(junctionInfo, evt);
                    this.junction_ctrl.splitLink(junctionInfo, junctionInfo.targetLink, junction);
                    this.junction_ctrl.connectoToJunction(this.hybrid_ctrl.getLinkReference(), junctionInfo);
                    this.hybrid_ctrl.connectLink('Junction', junction.id);
                    const lLinks = this.junction_ctrl.validateJunctionConnections(junction, junctionInfo);
                    lLinks.forEach(link => {
                      this.hybrid_ctrl.pathRefactoring(undefined, link, undefined, false, true);
                    });*/

                    this.forceMouseEvent('mouseup');
                    this.startListening('mouseup');
                    this.mvc.setState(MVC_STATE.SELECTION);
                  } else {
                    this.hybrid_ctrl.insertVertexToLink(evt);
                    this.isMultiPoint = true;
                  }
                  break;
                }
              }
            } else if (this.mousedownClicks === 2) {
              this.stopListeningValidateConnection();
              this.stopListeningMousedown();
              switch (this.wiringInfo.class) {
                case 'std-hybrid': {
                  if (/*this.validateLinkJunction(evt)*/false) {
                    console.debug('JUNCTION END')
                  } else {
                    this.hybrid_ctrl.stopLinkDrawing('DBLCLICK');
                    this.isMultiPoint = true;
                  }
                  break;
                }
              }
              this.forceMouseEvent('mouseup');
              this.startListening('mouseup');
              this.mvc.setState(MVC_STATE.SELECTION);
              this.mousedownClicks = 0;
            }
            break;
          }

          case WiringState.PORT: {
            this.stopListeningValidateConnection();
            this.stopListeningMousedown();
            switch (this.wiringInfo.class) {
              case 'std-hybrid': {
                const link = this.hybrid_ctrl.connectLink('Port');

                // ----------------------------------
                //this.mvc.intersection.resolveIntersection([link], this.mvc.halo.isHaloEnabled());

                // GET ACTIVE AREA
                //this.mvc.intersection.resolveIntersection([link]);
                // GET PASSIVE LINKS AND ELEMENTS

                //const lLink = this.junction_ctrl.getSelectedLinks(link);
                //const lElement = this.junction_ctrl.getSelectedElements(link);
                //const lJunction = this.junction_ctrl.getSelectedJunctions(link);

                // RESOLVE FOR LINKS AND JUNCTIONS

                //this.junction_ctrl.resolveIntersections(link, lLink, lElement, lJunction);

                // RESOLVE FOR PORTS

                // ----------------------------------

                this.isMultiPoint = true;
                break;
              }
            }
            this.forceMouseEvent('mouseup');
            this.startListening('mouseup');
            this.mvc.setState(MVC_STATE.SELECTION);
            break;
          }

          case WiringState.ELEMENT: {
            break;
          }

        }
      }
    });
  }

  private stopListeningMousedown() {
    (this.paper.$el as any).off('mousedown', 'svg', undefined);
  }

  private forceMouseEvent(event: string) {
    const evt = new MouseEvent(event, {
      bubbles: true,
      cancelable: true,
      view: window
    });
    this.paper.el.dispatchEvent(evt);
  }

  private validateIntersection(evt: any): joint.dia.Link {

    var targetLink: joint.dia.Link = undefined;

    this.mvc.graph.getLinks().forEach(lk => {
      var child = lk.findView(this.mvc.paper).vel.children();
      if (child.find((el) => el.id === evt.target.id)) {
        targetLink = lk;
      }
    });

    return targetLink;
  }

}
