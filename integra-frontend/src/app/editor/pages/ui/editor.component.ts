import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Subject } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';
import { DiagramComponent } from '../../components/diagram/diagram.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { StencilComponent } from '../../components/stencil/stencil.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { DiagramService } from '../../services/diagram.service';
import {
  VIEW_PANEL_SIZE
} from '../../utilities/editor-constants';
import { RibbonmenuComponent } from '../../components/ribbonmenu/ribbonmenu.component';

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
    RibbonmenuComponent
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

  constructor(
    private diagramService: DiagramService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.updateFooterSize();
    // Simulate loading state
    setTimeout(() => {
      this.isLoading = false; // Set to false after content is loaded
    }, 50000); // Adjust delay as needed
  }

  ngAfterViewInit(): void {
    this.updateDiagramSize();
  }

  ngOnDestroy(): void {
    this.removeMouseMoveListener();
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

  public switchArea(area: 'diagram' | 'tool' | 'diagram-chart'): void {
    this.activeArea = area;
  }

  isResizing: boolean = false;
  sizes: number[] = []; // Store panel sizes
  private mouseMoveListener: any;

  // Triggered when resizing starts
  public onSplitterResizeStart(): void {
    this.isResizing = true;
    console.log('Resize Started');
    this.addMouseMoveListener();
  }

  // Triggered when resizing ends
  public onSplitterResizeEnd(event: any): void {
    this.isResizing = false;
    this.sizes = event.sizes; // Update sizes after resizing
    console.log('Resize Ended:', event.sizes);
    this.removeMouseMoveListener();
  }

  // Add mousemove listener to detect resizing in real-time
  private addMouseMoveListener(): void {
    this.mouseMoveListener = this.renderer.listen(
      'document',
      'mousemove',
      (event) => {
        if (this.isResizing) {
          console.log('Resizing in progress...', event.screenX); // Handle your logic here
        }
      }
    );
  }
  // Remove the mousemove listener to clean up resources
  private removeMouseMoveListener(): void {
    if (this.mouseMoveListener) {
      this.mouseMoveListener();
      this.mouseMoveListener = null;
    }
  }

}
