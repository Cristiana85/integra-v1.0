import { MVController } from '../../core/mv-controller';
import { ElementProps } from '../../core/element-props';
import { DiagramHelper } from '../../util/helpers';
import { HierarchyManager } from '../hierarchy/Hierarchy-manager';
import { ModelConfig } from '../../core/model-config';
import { ModelInterface } from '../../core/model-interface';

export class Hovers {
  public mvc: MVController;

  private paper: joint.dia.Paper;

  private graph: joint.dia.Graph;

  private isMounted: boolean = false;

  private hierarchyManager: HierarchyManager;

  constructor(
    mvc: MVController
  ) {
    if (mvc) {
      this.mvc = mvc;
      this.paper = mvc.paper;
      this.graph = mvc.graph;
      this.hierarchyManager = new HierarchyManager(
        this.mvc,
        this.paper,
        this.graph
      );
    }
  }

  public mount() {
    this.isMounted = true;
  }

  public elementHover(cellView: joint.dia.CellView, config: ModelConfig, prop: ElementProps, value: string) {
    if (this.isMounted) {
      if (cellView) {
        if (!this.isIntoToolList(cellView)) {
          // Composite element: Parent/Child management
          const composite = config.isComposite;
          const group = config.group.isIntoGroup;
          if (composite && group) {
            // composite element and group
          } else if (composite && !group) {
            // composite element no group
            const list = this.hierarchyManager.manageCellHover(cellView);
            if (list) {
              list.forEach((el) => {
                (el.model as unknown as ModelInterface).setModelProp('hover', value);
              });
            }
          } else if (!composite && group) {
            // No composite element, only group
          } else if (!composite && !group) {
            // No composite element, No group
            (cellView.model as unknown as ModelInterface).setModelProp('hover', value);
          }
        }
      }
    }
  }

  /**
   *
   * FILTERING METHODS
   */
  private isIntoToolList(cellView: joint.dia.CellView): boolean {
    const type = cellView.model.prop('custom/devInfo/type');
    if (type) {
      if (this.mvc.selection.innerFilterList.get(type)) {
        return true;
      }
    }
    return false;
  }

  private isIntoFilterList(cellView: joint.dia.CellView): boolean {
    /**
     * define on which basis the filtering must be done
     * i.e.: model type, other param?
     * single-attribute/multi-attribute
     */
    return false;
  }
}
