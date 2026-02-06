import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { tap, map, catchError, of } from 'rxjs';
import { JwtService } from "./jwt.service";


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isAuthenticated = false;

    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8000/api/login';
    private jwtService = inject(JwtService);

    // Signal pour un état réactif dans toute l'app
    currentUser = signal<string | null>(localStorage.getItem('token'));

    login(credentials: { email: string; password: string }) {
        return this.http.post<{ token: string }>(this.API_URL, credentials).pipe(
            tap(response => {
                localStorage.setItem('token', response.token);
                this.isAuthenticated = true;

                // Décoder le token pour récupérer les infos (ex: { username: 'admin', roles: ['ROLE_USER'] })
                const decoded: any = this.jwtService.decode(response.token);
                this.currentUser.set(decoded); 
            }),
            map(() => true),
            catchError(() => of(false))
        );
    }

    logout(): void {
        this.isAuthenticated = false;
        this.currentUser.set(null);
        localStorage.removeItem('token');
    }

    isLoggedIn(): boolean {
        return this.isAuthenticated;
    }
}