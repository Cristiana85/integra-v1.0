import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Project } from '../models/project';

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

  public getlProject(accountId: number): Observable<Project[]> {
    const params = { accountId: accountId };
    return this.http.get<Project[]>(this.apiPath, { params: params });
  }

  public getProject(token: string, accountId: number, projectId: number): Observable<Project> {
    const url = `${this.apiPath}/id`;
    const params = { projectId: projectId };


    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<Project>(url, { headers: headers, params: params });
  }
}
