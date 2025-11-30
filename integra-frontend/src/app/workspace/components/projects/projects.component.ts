import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Project } from 'src/app/core/models/project';
<<<<<<< HEAD
//import { ProjectService } from 'src/app/editor/services/project.service';
=======
import { ProjectService } from 'src/app/integra/editor/services/project.service';
>>>>>>> feature/diagram
import { SharedModule } from 'src/app/shared/shared.module';
import { SearchComponent } from "../../../shared/components/search/search.component";
import { AddProjectsComponent } from "../add-projects/add-projects.component";
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'integra-projects',
  standalone: true,
  imports: [
    SharedModule,
    SearchComponent,
    AddProjectsComponent
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  @ViewChild('menu') menu!: OverlayPanel;

  parentSearchQuery: string = ''; // Stato locale della query di ricerca
  filteredProjects: any[] = []; // Progetti filtrati (modifica in base alla tua struttura)

  //Add Project
  visiblePopUp: boolean = false;
  projectEmpty: Project;

  id?: number;
  accountId?: number;
  name?: string;
  creationDate?: Date;
  editingDate?: Date;

  activeTabAction: any;

  lProject: Project[] = [
    {
      id: 1,
      accountId: 1,
      name: 'Project 1',
      image: 'https://via.placeholder.com/200x150.png?text=Block+Diagram+1',
      creationDate: new Date(2024, 11, 3, 15, 30, 45),
      editingDate: new Date(2024, 11, 15, 15, 30, 45),
      metadata: null
    },
    {
      id: 2,
      accountId: 2,
      name: 'Project 2',
      image: 'https://via.placeholder.com/200x150.png?text=Block+Diagram+2',
      creationDate: new Date(2024, 11, 3, 15, 30, 45),
      editingDate: new Date(2024, 18, 3, 15, 30, 45),
      metadata: undefined
    },
    {
      id: 3,
      accountId: 1,
      name: 'Project 3',
      image: 'https://via.placeholder.com/200x150.png?text=Block+Diagram+3',
      creationDate: new Date(2024, 11, 3, 15, 30, 45),
      editingDate: new Date(2024, 11, 24, 15, 30, 45),
      metadata: undefined
    },
  ];

  constructor(
    //protected projectService: ProjectService,
    protected router: Router,
    protected authService: AuthService
  ) {
  }

  ngOnInit(): void {
    /*this.projectService.getlProject().subscribe(res => {
      this.lProject = res;
    })*/
    this.filteredProjects = [...this.lProject];
  }

  onMenuItemClick(action: string, project: Project, menu: OverlayPanel): void {
    // Nasconde il menu
    menu.hide();

    // Gestisce l'azione selezionata
    switch (action) {
      case 'open':
        this.openProject(project);
        break;
      case 'openInNewTab':
        this.openInNewTab(project);
        break;
      default:
        console.log('Azione non riconosciuta:', action);
    }
  }

  openProject(project: Project) {
    this.router.navigate([`/projects/${project.name}`]);
    this.hideMenu();
  }

  editProject(projectName: string) {
    console.log('Edit project:', projectName);
  }

  deleteProject(projectName: string) {
    console.log('Delete project:', projectName);
  }

  duplicateProject(projectName: string) {
    console.log('Duplicate project:', projectName);
  }

  moveProject(projectName: string) {
    console.log('Move project to folder:', projectName);
  }

  shareProject(projectName: string) {
    console.log('Share project:', projectName);
  }

  inviteToCollaborate(projectName: string) {
  }

  makeCopy(projectName: string) {
  }

  rename(projectName: string) {
  }

  moveTo(projectName: string) {
  }

  downloadSource(projectName: string) {
  }

  openInNewTab(project: Project) {
    window.open(`/projects/${project.name}`, '_blank');
    this.hideMenu();
  }

  delete(projectName: string) {
  }

  hideMenu(): void {
    this.menu.hide();
  }

  onClearSearch(): void {
    console.log('Search query cleared');
    // Logica per gestire l'azione di cancellazione
  }

  onSearchChange(query: string): void {
    this.parentSearchQuery = query; // Aggiorna la query
    this.filterProjects(); // Aggiorna i progetti filtrati
  }

  filterProjects(): void {
    if (!this.parentSearchQuery) {
      // Se la query è vuota, mostra tutti i progetti
      this.filteredProjects = [...this.lProject];
    } else {
      // Filtra i progetti basandosi sulla query
      this.filteredProjects = this.lProject.filter(project =>
        project.name.toLowerCase().includes(this.parentSearchQuery.toLowerCase())
      );
    }
  }

  openPopup(): void {
    this.projectEmpty = {
      id: undefined,
      accountId: this.authService.getAccountId(),
      name: '',
      image: '',
      creationDate: new Date(2024, 11, 3, 15, 30, 45),
      editingDate: new Date(2024, 11, 24, 15, 30, 45),
      metadata: undefined
    };
    this.visiblePopUp = true;
  }

  createProject(project: any) { //FIXME
    console.log('Project Created:', project);
    this.filteredProjects.push(project);
    this.closePopup();
  }

  closePopup(): void {
    this.visiblePopUp = false;
  }
}
