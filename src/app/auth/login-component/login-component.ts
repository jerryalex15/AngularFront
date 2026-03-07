import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.scss'],
})
export class LoginComponent {

  hidePassword = true;
  loginForm!: ReturnType<FormBuilder['group']>;

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService, private readonly router: Router, private readonly snackBar: MatSnackBar) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  redirectToRegister() {
    this.router.navigate(['/register']);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(success => {
        if (success) {
          this.router.navigate(['/home']);
        } else {
          this.snackBar.open('Échec de la connexion. Vérifiez vos identifiants.', 'OK', { duration: 3000 });
        }
      });
    }
  }
}