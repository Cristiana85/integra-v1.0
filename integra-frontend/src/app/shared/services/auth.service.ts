import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { tap } from 'rxjs/operators';
import { Account } from 'src/app/core/models/account';
import { Result } from 'src/app/core/models/result';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  basePath = environment.apiRoot;
  apiPath = this.basePath + 'auth';

  private tokenKey = 'authToken';
  private accountIdKey = 'accountId';
  private accountNameKey = 'accountName';

  constructor(private http: HttpClient) { }

  login(credentials: { email: string; password: string }): Observable<Result<Account>> {
    return this.http.post<Result<Account>>(`${this.apiPath}/login`, credentials).pipe(
      tap((response) => {
        let account = response.content;
        localStorage.setItem(this.tokenKey, account.token);
        localStorage.setItem(this.accountIdKey, account.id.toString());
      })
    );
  }

  register(account: Account): Observable<Result<Account>> {
    return this.http.post<Result<Account>>(`${this.apiPath}/register`, account).pipe(
      tap((response) => {
        // localStorage.setItem(this.tokenKey, response.token);
        // localStorage.setItem(this.accountIdKey, response.accountId.toString());
        //localStorage.setItem(this.accountNameKey, response.accountName.toString());
      })
    );
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
