import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { JwtService } from './core/jwt.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('frontend-ang');

  constructor(private readonly authService: AuthService, private readonly jwtService: JwtService) {}

  ngOnInit() {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token) {
      // Token présent → restaurer l'utilisateur
      const decoded = this.jwtService.decode(token);
      
      this.authService.currentUserSignalPayload.set(decoded);
    } else if (refreshToken) {
      // Pas d'access token mais refresh token → renouveler silencieusement
      this.authService.refreshToken(refreshToken).subscribe();
    }
  }
}
