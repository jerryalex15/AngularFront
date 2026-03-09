import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { ProfileCard } from '../profile/profile-card/profile-card';
import { AppService } from '../../core/appService';
import { User } from '../../models/user';
import { tap, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { scheduled, asyncScheduler, Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { JWTPayload } from '../../models/JWTPayload';

@Component({
  selector: 'app-home-component',
  imports: [
    MatToolbar,
    MatIcon,
    ProfileCard,
    CommonModule
  ],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent {
  user$!: Observable<User | null>; // Observable pour le profil utilisateur
  isProfileOpen = false;
  user: JWTPayload | null = null;

  constructor(public readonly appService: AppService, public readonly authService: AuthService) {
    this.user = this.authService.currentUserSignalPayload();
  }

  openProfile() {
    this.isProfileOpen = !this.isProfileOpen;

    this.user$ = this.appService.getUserProfile().pipe(
      tap(user => this.appService.setCurrentUser(user)),
      catchError(err => {
        console.error('Erreur lors de la récupération du profil utilisateur', err);
        return scheduled([null], asyncScheduler); // Retourne null en cas d'erreur
      })
    );
  }
}
