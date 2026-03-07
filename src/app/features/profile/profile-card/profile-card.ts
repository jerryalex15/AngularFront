import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../../models/user';
import { AuthService } from '../../../core/auth.service';

import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile-card',
  imports: [
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.scss',
})
export class ProfileCard {
  
  @Input() user: User | null = null;
  
  constructor(private readonly authService: AuthService, private readonly router: Router, private readonly snackBar: MatSnackBar) {}

  logout(){
    this.authService.logout().subscribe({
      next: () => {
        this.snackBar.open('You have been logged out successfully.', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('An error occurred during logout. Please try again.', 'Close', { duration: 3000 });
        console.error('Error during logout:', err);
      } 
    });
  }
}
