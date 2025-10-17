import * as joint from '../../../../node_modules/jointjs/dist/joint';
import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import { ElementProps } from '../core/element-props';
import { MVController } from '../core/mv-controller';
import { ModelConfig } from '../core/model-config';
import { LinkProps } from '../core/link-props';

export class DiagramHelper {

  public static transformToSVG(paper: joint.dia.Paper, x: number, y: number): [number, number] {
    var p = paper.svg.createSVGPoint();
    p.x = x;
    p.y = y;
    var p_transformed = p.matrixTransform(paper.viewport.getCTM().inverse());
    return [p_transformed.x, p_transformed.y];
  }

  public static getElementViewModelProp(cellView: joint.dia.CellView): ElementProps {
    return cellView.model.prop('custom/devInfo') as ElementProps;
  }

  public static getLinkViewModelProp(cellView: joint.dia.CellView): LinkProps {
    return cellView.model.prop('custom/devInfo') as LinkProps;
  }

  public static getElementModelProp(element: joint.dia.Element): ElementProps {
    return element.prop('custom/devInfo') as ElementProps;
  }

  public static getLinkModelProp(link: joint.dia.Link): LinkProps {
    return link.prop('custom/devInfo') as LinkProps;
  }

  public static getModelConfig(mvc: MVController, modelName: string): ModelConfig {
    return mvc.lModelConfig.find(el => el.cfgName === modelName)
  }

}
