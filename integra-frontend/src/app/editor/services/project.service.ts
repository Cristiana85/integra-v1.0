import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Project } from '../../core/models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  basePath = environment.apiRoot;
  apiPath = this.basePath + 'projects';

  lProject: Project[] = [];

  constructor(
    private http: HttpClient
  ) { }

  public getlProject(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiPath);
  }

  public getProject(projectId: number): Observable<Project> {
    const url = `${this.apiPath}/id`;
    const params = { projectId: projectId };
    return this.http.get<Project>(url, { params: params });
  }
}
