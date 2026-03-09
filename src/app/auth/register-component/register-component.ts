import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.scss']
})
export class RegisterComponent {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  registerForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.signup(this.registerForm.getRawValue()).subscribe(success => {
        if (success) {
          this.snackBar.open('Inscription réussie !', 'OK', { duration: 3000 });
          this.router.navigate(['/login']);
        } else {
          this.snackBar.open('Erreur lors de l\'inscription.', 'OK', { duration: 3000 });
        }
      });
    }
  }
}
