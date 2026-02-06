import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./auth/login-component/login-component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./auth/register-component/register-component').then(m => m.RegisterComponent) },
    { path: 'home', canActivate: [authGuard], loadComponent: () => import('./features/home-component/home-component').then(m => m.HomeComponent) },
    { path: '**', redirectTo: '/login' }
];
