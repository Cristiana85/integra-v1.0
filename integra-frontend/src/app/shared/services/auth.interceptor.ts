import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Recupera il token dal localStorage o da un servizio dedicato
    const token = localStorage.getItem('authToken'); // Oppure usa un AuthService

    if (token) {
      // Clona la richiesta e aggiungi l'header Authorization
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next.handle(clonedRequest);
    }

    // Se non c'è token, passa la richiesta originale
    return next.handle(req);
  }
}
