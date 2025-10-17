import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SearchComponent } from "../../../shared/components/search/search.component";
import { BASIC, DISTRIBUTED, LUMPED, STENCIL_CATEGORIES } from './stencil-definition';

@Component({
  selector: 'integra-stencil',
  standalone: true,
  imports: [SharedModule, SearchComponent],
  templateUrl: './stencil.component.html',
  styleUrl: './stencil.component.scss'
})
export class StencilComponent {

  parentSearchQuery: string = ''

  public categories = STENCIL_CATEGORIES;
  public activeCategory: string = STENCIL_CATEGORIES[0]; // Set the default active category

  private basicList = BASIC;
  private lumpedList = LUMPED;
  private distributedList = DISTRIBUTED;

  public filteredBasicList = this.basicList;
  public filteredLumpedList = this.lumpedList;
  public filteredDistributedList = this.distributedList;

  public setActiveCategory(category: string): void {
    this.activeCategory = category; // Update the active category
    //this.searchQuery = category;
    //this.filterComponents();
  }

  onClearSearch(): void {
    console.log('Search query cleared');
    // Logica per gestire l'azione di cancellazione
  }

  onSearchChange(query: string): void {
    this.parentSearchQuery = query; // Aggiorna la query
    this.filterComponents(); // Aggiorna i progetti filtrati
  }

  filterComponents(): void {
    const query = this.parentSearchQuery.toLowerCase();
    this.filteredBasicList = this.basicList.filter(chart => chart.label.toLowerCase().includes(query));
    this.filteredLumpedList = this.lumpedList.filter(chart => chart.label.toLowerCase().includes(query));
    this.filteredDistributedList = this.distributedList.filter(chart => chart.label.toLowerCase().includes(query));

  }
}
