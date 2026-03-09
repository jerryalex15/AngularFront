import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { User } from "../models/user";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AppService {

    private readonly urlApi = environment.apiUrl;
    private currentUser!: User;

    private readonly http = inject(HttpClient);

    getUserProfile(): Observable<User> {
        const token = localStorage.getItem('accessToken');
        return this.http.get<User>(`${this.urlApi}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    getCurrentUser(): User {
        return this.currentUser;
    }

    setCurrentUser(user: User): void {
        this.currentUser = user;
    }
}