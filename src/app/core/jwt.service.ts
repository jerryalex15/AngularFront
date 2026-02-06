import { Injectable } from "@angular/core";
import { jwtDecode } from "jwt-decode";

@Injectable({
    providedIn: 'root'
})
export class JwtService {
    decode(token: string): any {
        return jwtDecode(token);
    }
}