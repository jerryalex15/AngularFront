import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { tap, map, catchError, of, Observable } from 'rxjs';
import { JwtService } from "./jwt.service";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly router = inject(Router);
    private isAuthenticated = false;

    private readonly http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8080/api/auth/';
    private readonly jwtService = inject(JwtService);

    // Signal pour un état réactif dans toute l'app
    currentUser = signal<string | null>(localStorage.getItem('accessToken'));

    login(credentials: { email: string; password: string }): Observable<boolean> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http.post<{ accessToken: string, refreshToken: string }>(
            `${this.API_URL}login`,
            credentials,
            { headers }
        ).pipe(
            tap(response => {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            this.isAuthenticated = true;
            const decoded: any = this.jwtService.decode(response.accessToken);
            this.currentUser.set(decoded);
            }),
            map(() => true),
            catchError(() => of(false))
        );
    }

    signup(userData: { fullName: string | null; email: string | null ; password: string | null }): Observable<boolean> {
        return this.http.post<{ email: string }>(`${this.API_URL}register`, userData).pipe(
            tap((response) => {
                console.log(`User with email ${response.email} has been registered.`);
            }),
            map(() => true),
            catchError(() => of(false))
        );
    }

    refreshToken(refreshToken: string): Observable<boolean> {
        return this.http.post<{accessToken: string }>(`${this.API_URL}refresh_token`, {refreshToken}).pipe(
            tap(response => {
                localStorage.setItem('accessToken', response.accessToken);
                const decoded: any = this.jwtService.decode(response.accessToken);
                this.currentUser.set(decoded); 
            }),
            map(() => true),
            catchError(() => {
                // Refresh token expiré → déconnexion propre
                this.forceLogout();
                return of(false);
            })
        );
    }

    // Logout forcé (token expiré) → pas d'appel HTTP
    forceLogout(): void {
        this.clearSession();
    }

    clearSession(): void {
        this.isAuthenticated = false;
        this.currentUser.set(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/login']);
    }

    logout(): Observable<void> {
        return this.http.post(`${this.API_URL}logout`,{}).pipe(
            tap(() => {
                this.clearSession();
            }),
            map(() => void 0),
            catchError(() => of(void 0))
        )
    }

    isLoggedIn(): boolean {
        return this.isAuthenticated;
    }
}