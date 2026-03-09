import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProfileCard } from './profile-card';
import { AuthService } from '../../../core/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../models/user';

describe('ProfileCard', () => {
  let component: ProfileCard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockUser: User = { id: 1, fullName: 'John Doe', email: 'john@example.com', roles: ['ROLE_USER'] };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        ProfileCard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });

    component = TestBed.inject(ProfileCard);
  });

  // ─── Constructeur ──────────────────────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have user as null by default', () => {
    expect(component.user).toBeNull();
  });

  it('should accept a user via @Input', () => {
    component.user = mockUser;
    expect(component.user).toEqual(mockUser);
  });

  // ─── logout - cas nominal ─────────────────────────────────────────────────

  it('should call authService.logout()', () => {
    authServiceSpy.logout.and.returnValue(of(void 0));

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should open success snackbar on successful logout', () => {
    authServiceSpy.logout.and.returnValue(of(void 0));

    component.logout();

    expect(snackBarSpy.open).toHaveBeenCalledOnceWith(
      'You have been logged out successfully.',
      'OK',
      { duration: 3000 }
    );
  });

  it('should NOT open error snackbar on successful logout', () => {
    authServiceSpy.logout.and.returnValue(of(void 0));

    component.logout();

    expect(snackBarSpy.open).not.toHaveBeenCalledWith(
      'An error occurred during logout. Please try again.',
      jasmine.any(String),
      jasmine.any(Object)
    );
  });

  it('should call snackbar exactly once on success', () => {
    authServiceSpy.logout.and.returnValue(of(void 0));

    component.logout();

    expect(snackBarSpy.open).toHaveBeenCalledTimes(1);
  });

  // ─── logout - cas erreur ──────────────────────────────────────────────────

  it('should open error snackbar when logout fails', () => {
    authServiceSpy.logout.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    component.logout();

    expect(snackBarSpy.open).toHaveBeenCalledOnceWith(
      'An error occurred during logout. Please try again.',
      'Close',
      { duration: 3000 }
    );
  });

  it('should NOT open success snackbar when logout fails', () => {
    authServiceSpy.logout.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    component.logout();

    expect(snackBarSpy.open).not.toHaveBeenCalledWith(
      'You have been logged out successfully.',
      jasmine.any(String),
      jasmine.any(Object)
    );
  });

  it('should call snackbar exactly once on error', () => {
    authServiceSpy.logout.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    component.logout();

    expect(snackBarSpy.open).toHaveBeenCalledTimes(1);
  });
});