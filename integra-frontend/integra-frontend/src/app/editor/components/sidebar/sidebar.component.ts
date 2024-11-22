import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'integra-sidebar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  searchText: string = ''; // Bind to the search input

  sections = [
    {
      label: 'Freestanding configurations',
      collapsed: false,
      items: [
        { label: 'Zig-zag', icon: 'pi pi-shapes', type: 'zigzag' },
        { label: 'Six sided', icon: 'pi pi-square', type: 'sixsided' },
        { label: 'Back to Back 3', icon: 'pi pi-book', type: 'backtoback3' },
      ],
    },
    {
      label: 'Wall configurations',
      collapsed: false,
      items: [
        { label: 'Zig-zag', icon: 'pi pi-columns', type: 'zigzag' },
        { label: 'U-Wall', icon: 'pi pi-th-large', type: 'uwall' },
        { label: '13 ft wall', icon: 'pi pi-border', type: '13ftwall' },
      ],
    },
    {
      label: 'Individual modules',
      collapsed: false,
      items: [
        { label: 'Corner', icon: 'pi pi-directions', type: 'corner' },
        { label: 'Bookcase', icon: 'pi pi-book', type: 'bookcase' },
        { label: '30 in', icon: 'pi pi-box', type: '30in' },
      ],
    },
    {
      label: 'Miscellaneous',
      collapsed: false,
      items: [
        { label: 'Custom Item', icon: 'pi pi-cog', type: 'custom' },
      ],
    },
  ];

  filteredSections = [...this.sections]; // For filtering

  toggleSection(section: any): void {
    section.collapsed = !section.collapsed;
  }

  filterItems(): void {
    const lowerSearch = this.searchText.toLowerCase();
    this.filteredSections = this.sections.map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(lowerSearch)
      ),
    }));
  }

  dragData: any = null; // Local variable to store drag data

  onDragStart(event: DragEvent, node: any): void {
    this.dragData = node; // Save the dragged node data
  }

  getDragData(): any {
    return this.dragData;
  }

}
