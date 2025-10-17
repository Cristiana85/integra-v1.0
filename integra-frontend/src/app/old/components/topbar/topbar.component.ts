import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { VIEW_PANEL_SIZE } from '../../utilities/editor-constants';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'integra-topbar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {

  public topbar_height: number = VIEW_PANEL_SIZE.TOPBAR_HEIGHT;

  @Input() projectName: string;
  @Input() subscription: string;

  public subscriptionBadge: string = ''

  public editorTabSwitchLabel: string = 'Editor';
  public chartTabSwitchLabel: string = 'Chart';
  public splitHorzTabSwitchLabel: string = 'Split Horz';
  public splitVertTabSwitchLabel: string = 'Split Vert';

  public editorTabSwitch: string = 'layout-tab-switch-btn-selected'
  public chartTabSwitch: string = 'layout-tab-switch-btn-unselected'
  public splitHorzTabSwitch: string = 'layout-tab-switch-btn-unselected'
  public splitVertTabSwitch: string = 'layout-tab-switch-btn-unselected'

  constructor(private dialogService: DialogService) {

  }

  ngOnInit(): void {
    switch (this.subscription) {
      case 'Free': {
        this.subscriptionBadge = 'free-badge';
        break;
      }
      case 'Pro': {
        this.subscriptionBadge = 'pro-badge';
        break;
      }
    }
  }

  public projectRename() {
    this.dialogService.openDialog();
  }

  public layoutTabSwitch(selectedTab: string) {
    this.editorTabSwitch = 'layout-tab-switch-btn-unselected';
    this.chartTabSwitch = 'layout-tab-switch-btn-unselected';
    this.splitHorzTabSwitch = 'layout-tab-switch-btn-unselected';
    this.splitVertTabSwitch = 'layout-tab-switch-btn-unselected';
    switch (selectedTab) {
      case this.editorTabSwitchLabel: {
        this.editorTabSwitch = 'layout-tab-switch-btn-selected';
        break;
      }
      case this.chartTabSwitchLabel: {
        this.chartTabSwitch = 'layout-tab-switch-btn-selected';
        break;
      }
      case this.splitHorzTabSwitchLabel: {
        this.splitHorzTabSwitch = 'layout-tab-switch-btn-selected';
        break;
      }
      case this.splitVertTabSwitchLabel: {
        this.splitVertTabSwitch = 'layout-tab-switch-btn-selected';
        break;
      }
    }
  }

}
