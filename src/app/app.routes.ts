import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './auth/login-component/login-component';
import { HomeComponent } from './features/home-component/home-component';

export const routes: Routes = [
    { path: 'login', component : LoginComponent },
    { path: 'home', canActivate: [authGuard], component: HomeComponent },
    { path: '**', redirectTo: '/login' }
];
