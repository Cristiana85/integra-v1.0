import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ottieni il token JWT dal servizio di autenticazione
    const token = this.authService.getToken();

    // Se il token esiste, aggiungi l'header Authorization
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('authToken', `Bearer ${token}`)
      });
      return next.handle(cloned); // Passa la richiesta modificata
    }

    return next.handle(req); // Passa la richiesta senza header Authorization se il token non esiste
  }
}
