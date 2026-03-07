import { Injectable } from '@angular/core';
import {
    HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private readonly skipUrls = [
        '/auth/login',
        '/auth/register',
        '/auth/refresh'
    ];

    constructor(private readonly authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Vérifie si l'URL doit être ignorée
        const shouldSkip = this.skipUrls.some(url => req.url.includes(url));

        let authReq = req;
        if (!shouldSkip) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                authReq = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
                });
            }
        }

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                // 401 → token expiré → on tente le refresh
                if (error.status === 401 && !shouldSkip) {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) return throwError(() => error);

                    return this.authService.refreshToken(refreshToken).pipe(
                        switchMap((success: boolean) => {
                            if (!success) return throwError(() => error);

                            const newToken = localStorage.getItem('accessToken');
                            return next.handle(req.clone({
                                setHeaders: { Authorization: `Bearer ${newToken}` }
                            }));
                        })
                    );
                }

            return throwError(() => error);
            })
        );
}
}