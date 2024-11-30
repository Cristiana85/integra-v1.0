import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  basePath = environment.apiRoot;
  apiPath = this.basePath + 'auth';

  private tokenKey = 'authToken';
  private accountIdKey = 'accountId';

  constructor(private http: HttpClient) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiPath}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.accountIdKey, response.accountId.toString());
      })
    );
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

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getAccountId(): number | null {
    const accountId = localStorage.getItem(this.accountIdKey);
    return accountId ? +accountId : null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.accountIdKey);
  }
}
