import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'integra-stencil',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './stencil.component.html',
  styleUrl: './stencil.component.scss'
})
export class StencilComponent {
  searchQuery = '';

  lineCharts = [
    { label: 'Baseline Chart', image: 'assets/icons/placeholder.jpg' },
    { label: 'Smooth Baseline Chart', image: 'assets/icons/placeholder.jpg' },
    { label: 'Baseline Chart', image: 'assets/icons/placeholder.jpg' },
    { label: 'Smooth Baseline Chart', image: 'assets/icons/placeholder.jpg' },
    { label: 'Baseline Chart', image: 'assets/icons/placeholder.jpg' },
    { label: 'Smooth Baseline Chart', image: 'assets/icons/placeholder.jpg' },
    { label: 'Baseline Chart', image: 'assets/icons/placeholder.jpg' },
    { label: 'Smooth Baseline Chart', image: 'assets/icons/placeholder.jpg' },
  ];

  barCharts = [
    { label: 'Background Color Bar', image: 'assets/icons/placeholder.jpg' },
    { label: 'Vertical Stacked Bar', image: 'assets/icons/placeholder.jpg' },
  ];

  pieCharts = [
    { label: 'Pie Chart with Rings', image: 'assets/icons/placeholder.jpg' },
    { label: 'Half Pie Chart', image: 'assets/icons/placeholder.jpg' },
  ];

  filteredLineCharts = this.lineCharts;
  filteredBarCharts = this.barCharts;
  filteredPieCharts = this.pieCharts;

  sidebarWidth = 285; // Initial width

  filterComponents() {
    const query = this.searchQuery.toLowerCase();
    this.filteredLineCharts = this.lineCharts.filter(chart => chart.label.toLowerCase().includes(query));
    this.filteredBarCharts = this.barCharts.filter(chart => chart.label.toLowerCase().includes(query));
    this.filteredPieCharts = this.pieCharts.filter(chart => chart.label.toLowerCase().includes(query));
  }

  /*startResizing(event: MouseEvent) {
    document.addEventListener('mousemove', this.resizeSidebar);
    document.addEventListener('mouseup', this.stopResizing);
  }

  resizeSidebar = (event: MouseEvent) => {
    this.sidebarWidth = Math.max(200, event.clientX); // Minimum width of 200px
  };

  stopResizing = () => {
    document.removeEventListener('mousemove', this.resizeSidebar);
    document.removeEventListener('mouseup', this.stopResizing);
  };

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.calculateColumns();
  }

  calculateColumns() {
    const columns = Math.floor(this.sidebarWidth / 150); // Each column ~150px wide
    document.documentElement.style.setProperty('--sidebar-columns', columns.toString());
  }*/
}
