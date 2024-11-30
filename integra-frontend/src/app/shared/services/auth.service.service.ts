import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  basePath = environment.apiRoot;
  apiPath = this.basePath + 'auth';

  constructor(private http: HttpClient) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiPath}/login`, credentials);
  }

  register(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiPath}/register`, credentials);
  }

  forgotPassword(credentials: { email: string }): Observable<any> {
    return this.http.post(`${this.apiPath}/forgot-password`, credentials);
  }

  resetPassword(credentials: { token: string, newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiPath}/reset-password`, credentials);
  }
}
