import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from 'src/app/editor/models/project';
import { ProjectService } from 'src/app/editor/services/project.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'integra-projects',
  standalone: true,
  imports: [
    SharedModule,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {

  id?: number;
  accountId?: number;
  name?: string;
  creationDate?: Date;
  editingDate?: Date;

  lProject: Project[] = [
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
      accountId: 1,
      name: 'Project 3',
      creationDate: new Date(2024, 11, 3, 15, 30, 45),
      editingDate: new Date(2024, 11, 24, 15, 30, 45),
      metadata: undefined
    },
  ];

  constructor(
    protected projectService: ProjectService,
    protected router: Router
  ) {
  }

  ngOnInit(): void {
    this.projectService.getlProject().subscribe(res => {
      this.lProject = res;
    })
  }

  openProject(projectName: string) {
    this.router.navigate([`/projects/${projectName}`]);
  }
}
