import { TestBed } from '@angular/core/testing';

import { HomeComponent } from './home-component';
import { AppService } from '../../core/appService';
import { AuthService } from '../../core/auth.service';
import { User } from '../../models/user';
import { JWTPayload } from '../../models/JWTPayload';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let appServiceSpy: jasmine.SpyObj<AppService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser: User = { id: 1, fullName: 'John Doe', email: 'john@example.com', roles: ['ROLE_USER'] };
  const mockPayload: JWTPayload = { sub: '1', iat: 1600000000, exp: 9999999999 };

  beforeEach(() => {
    appServiceSpy = jasmine.createSpyObj('AppService', [
      'getUserProfile',
      'setCurrentUser'
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'currentUserSignalPayload'
    ]);

    // Valeur par défaut pour le constructeur
    authServiceSpy.currentUserSignalPayload.and.returnValue(mockPayload);

    TestBed.configureTestingModule({
      providers: [
        HomeComponent,
        { provide: AppService, useValue: appServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    component = TestBed.inject(HomeComponent);
  });

  // ─── Constructeur ──────────────────────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call currentUserSignalPayload on init and assign user', () => {
    expect(authServiceSpy.currentUserSignalPayload).toHaveBeenCalled();
    expect(component.user).toEqual(mockPayload);
  });

  it('should set user to null if currentUserSignalPayload returns null', () => {
    authServiceSpy.currentUserSignalPayload.and.returnValue(null);

    // Recréer le composant avec la nouvelle valeur
    component = new HomeComponent(appServiceSpy, authServiceSpy);

    expect(component.user).toBeNull();
  });

  // ─── Toggle isProfileOpen ──────────────────────────────────────────────────

  it('should toggle isProfileOpen from false to true', () => {
    appServiceSpy.getUserProfile.and.returnValue(of(mockUser));

    component.isProfileOpen = false;
    component.openProfile();

    expect(component.isProfileOpen).toBeTrue();
  });

  it('should toggle isProfileOpen from true to false', () => {
    appServiceSpy.getUserProfile.and.returnValue(of(mockUser));

    component.isProfileOpen = true;
    component.openProfile();

    expect(component.isProfileOpen).toBeFalse();
  });

  // ─── openProfile - cas nominal ────────────────────────────────────────────

  it('should assign user$ after openProfile is called', () => {
    appServiceSpy.getUserProfile.and.returnValue(of(mockUser));

    component.openProfile();

    expect(component.user$).toBeDefined();
  });

  it('should emit the user through user$', (done) => {
    appServiceSpy.getUserProfile.and.returnValue(of(mockUser));
    appServiceSpy.setCurrentUser.and.stub();

    component.openProfile();

    component.user$.subscribe({
      next: (user) => {
        expect(user).toEqual(mockUser);
        done();
      },
      error: () => done.fail('Expected success but got error')
    });
  });

  it('should call setCurrentUser with the fetched user', (done) => {
    appServiceSpy.getUserProfile.and.returnValue(of(mockUser));
    appServiceSpy.setCurrentUser.and.stub();

    component.openProfile();

    component.user$.subscribe({
      next: () => {
        expect(appServiceSpy.setCurrentUser).toHaveBeenCalledOnceWith(mockUser);
        done();
      }
    });
  });

  // ─── openProfile - cas erreur ─────────────────────────────────────────────

  it('should emit null when getUserProfile fails', (done) => {
    appServiceSpy.getUserProfile.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    component.openProfile();

    component.user$.subscribe({
      next: (user) => {
        expect(user).toBeNull();
        done();
      },
      error: () => done.fail('catchError should have swallowed the error')
    });
  });

  it('should NOT call setCurrentUser when getUserProfile fails', (done) => {
    appServiceSpy.getUserProfile.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    component.openProfile();

    component.user$.subscribe({
      next: () => {
        expect(appServiceSpy.setCurrentUser).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should still toggle isProfileOpen even when getUserProfile fails', () => {
    appServiceSpy.getUserProfile.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    component.isProfileOpen = false;
    component.openProfile();

    expect(component.isProfileOpen).toBeTrue();
  });
});
