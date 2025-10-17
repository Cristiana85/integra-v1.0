import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { AccordionModule } from 'primeng/accordion';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'integra-sidebar',
  standalone: true,
  imports: [SharedModule, AccordionModule, CommonModule, TabViewModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy  {

  @Input() events!: Subject<string>;
  @Output() action = new EventEmitter<string>();

  private destroy$ = new Subject<void>();

  public activeTab = -1;

  visibleSidebar: boolean = true;

  public ngOnInit(): void {

  }

  toggleSidebar() {
    this.visibleSidebar = !this.visibleSidebar;
  }

  public ngAfterViewInit(): void {
    this.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      switch (event) {
        case 'leftpanel:closed': {
          this.onTabClose();
          break;
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onTabClick() {
    switch (this.activeTab) {
      case 0: {
        this.action.emit('dashboard:clicked');
        break;
      }
      case 1: {
        this.action.emit('Bookmarks:clicked');
        break;
      }
      case 2: {
        this.action.emit('People:clicked');
        break;
      }
      case 3: {
        this.action.emit('Comments:clicked');
        break;
      }
      case 4: {
        this.action.emit('Calendar:clicked');
        break;
      }
      case 5: {
        this.action.emit('Settings:clicked');
        break;
      }
    }
  }

  public onTabClose() {
    this.activeTab = -1;
  }

}


