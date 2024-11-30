import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { LUMPED, DISTRIBUTED, BASIC, STENCIL_CATEGORIES } from './stencil-library';

@Component({
  selector: 'integra-stencil',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './stencil.component.html',
  styleUrl: './stencil.component.scss'
})
export class StencilComponent {

  public searchQuery = '';

  public categories = STENCIL_CATEGORIES;
  public activeCategory: string = STENCIL_CATEGORIES[0]; // Set the default active category

  private basicList = BASIC;
  private lumpedList = LUMPED;
  private distributedList = DISTRIBUTED;

  public filteredBasicList = this.basicList;
  public filteredLumpedList = this.lumpedList;
  public filteredDistributedList = this.distributedList;

  public filterComponents() {
    const query = this.searchQuery.toLowerCase();
    this.filteredBasicList = this.basicList.filter(chart => chart.label.toLowerCase().includes(query));
    this.filteredLumpedList = this.lumpedList.filter(chart => chart.label.toLowerCase().includes(query));
    this.filteredDistributedList = this.distributedList.filter(chart => chart.label.toLowerCase().includes(query));
  }

  public clearSearch() {
    this.searchQuery = '';
    this.filterComponents();
  }

  public setActiveCategory(category: string): void {
    this.activeCategory = category; // Update the active category
    //this.searchQuery = category;
    //this.filterComponents();
  }

}
