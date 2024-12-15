import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subject } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';
import { DiagramComponent } from '../../components/diagram/diagram.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { StencilComponent } from '../../components/stencil/stencil.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { Project } from '../../../core/models/project';
import { DiagramService } from '../../services/diagram.service';
import { ProjectService } from '../../services/project.service';
import {
  VIEW_PANEL_SIZE
} from '../../utilities/editor-constants';
import { FooterComponent } from '../../components/footer/footer.component';
import { RibbonmenuComponent } from '../../components/ribbonmenu/ribbonmenu.component';
import { ProjectDialogComponent } from '../dialog/project-dialog/project-dialog.component';

@Component({
  selector: 'integra-editor',
  standalone: true,
  imports: [
    SharedModule,
    DiagramComponent,
    TopbarComponent,
    SidebarComponent,
    StencilComponent,
    FooterComponent,
    ProjectDialogComponent
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {

  public isLoading: boolean = false; // Control loading state

  public sidemenuEvents = new Subject<string>();

  public activeArea: 'diagram' | 'tool' | 'diagram-chart' = 'diagram';

  public splitterOrientation: 'vertical' | 'horizontal' = 'horizontal';

  public selectedTabName: string = '';

  public isPromobarVisible: boolean = false;
  public isLeftbarVisible: boolean = false;
  public isRightbarVisible: boolean = false;

  public promo_height: number = 0;
  public topbar_height: number = VIEW_PANEL_SIZE.TOPBAR_HEIGHT;

  public sidemenu_width: number = VIEW_PANEL_SIZE.SIDEMENU_WIDTH;
  public leftpanel_width: number = VIEW_PANEL_SIZE.LEFTBAR_WIDTH;
  public rightpanel_width: number = VIEW_PANEL_SIZE.RIGHTBAR_WIDTH;

  public footer_left: number = 0;
  public footer_right: number = 0;
  public footer_bottom: number = VIEW_PANEL_SIZE.FOOTER_BOTTOM;
  public footer_height: number = VIEW_PANEL_SIZE.FOOTER_HEIGHT;

  public diagram_width: number = 0;
  public diagram_height: number = 0;

  projectSelected: Project;
  projectName: string;
  lProject: Project[];

  constructor(
    protected diagramService: DiagramService,
    protected projectService: ProjectService,
    protected route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.updateFooterSize();

    this.projectName = this.route.snapshot.paramMap.get('name')!;
    this.load();
  }

  ngAfterViewInit(): void {
    this.updateDiagramSize();
  }

  ngOnDestroy(): void {
    //this.removeMouseMoveListener();
  }

  @HostListener('window:focus', ['$event'])
  onFocused(event: any) {
    event.preventDefault();
  }

  @HostListener('window:blur', ['$event'])
  onBlurred(event: any) {
    event.preventDefault();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    event.preventDefault();
    this.updateFooterSize();
    this.updateDiagramSize();
  }

  load() {
    this.lProject = [
      {
        id: 1,
        accountId: 1,
        name: 'Project 1',
        creationDate: new Date(2024, 11, 3, 15, 30, 45),
        editingDate: new Date(2024, 11, 15, 15, 30, 45),
        metadata: null
      },
      {
        id: 2,
        accountId: 2,
        name: 'Project 2',
        creationDate: new Date(2024, 11, 3, 15, 30, 45),
        editingDate: new Date(2024, 18, 3, 15, 30, 45),
        metadata: undefined
      },
      {
        id: 3,
        accountId: 3,
        name: 'Project 3',
        creationDate: new Date(2024, 11, 3, 15, 30, 45),
        editingDate: new Date(2024, 11, 24, 15, 30, 45),
        metadata: undefined
      },
    ];
  }


  private updateFooterSize() {
    if (this.isLeftbarVisible) {
      this.footer_left = this.sidemenu_width + this.leftpanel_width;
    } else {
      this.footer_left = this.sidemenu_width;
    }
    if (this.isRightbarVisible) {
      this.footer_right = this.rightpanel_width;
    } else {
      this.footer_right = 0;
    }
  }

  private updateDiagramSize() {
    var width = window.innerWidth - this.sidemenu_width;
    var height = window.innerHeight - this.footer_height;
    if (this.isPromobarVisible) {
      height = height - this.promo_height - this.topbar_height;
    } else {
      height = height - this.topbar_height;
    }
    if (this.diagramService) {
      this.diagramService.updateDiagramSize(width, height);
    }
  }

  public onSidemenuAction(event: string) {
    switch (event) {
      case 'dashboard:clicked': {
        this.isLeftbarVisible = true;
        this.selectedTabName = event.split(':')[0];
        this.updateFooterSize();
        break;
      }
      case 'Bookmarks:clicked': {
        this.isLeftbarVisible = true;
        this.selectedTabName = event.split(':')[0];
        this.updateFooterSize();
        break;
      }
      case 'People:clicked': {
        this.isLeftbarVisible = true;
        this.selectedTabName = event.split(':')[0];
        this.updateFooterSize();
        break;
      }
      case 'Comments:clicked': {
        this.isLeftbarVisible = true;
        this.selectedTabName = event.split(':')[0];
        this.updateFooterSize();
        break;
      }
      case 'Calendar:clicked': {
        this.isLeftbarVisible = true;
        this.selectedTabName = event.split(':')[0];
        this.updateFooterSize();
        break;
      }
      case 'Settings:clicked': {
        this.isLeftbarVisible = true;
        this.selectedTabName = event.split(':')[0];
        this.updateFooterSize();
        break;
      }
    }
  }

  public onLeftPanelClose() {
    this.isLeftbarVisible = false;
    this.sidemenuEvents.next('leftpanel:closed');
  }

  private handleError(error: HttpErrorResponse, translationMessageLabel: string) {
    if ([404].includes(error.status)) {
      alert(translationMessageLabel);
    }
    return EMPTY;
  }

  onSplitterResizeStart() {

  }

  onSplitterResizeEnd(event) {

  }
}
