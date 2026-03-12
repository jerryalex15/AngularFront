import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register-component';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs/internal/observable/of';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;


  beforeEach(async () => {

    authServiceMock = jasmine.createSpyObj('AuthService', ['signup']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule
      ],
      providers: [
        provideHttpClient(), // 👈 mock HttpClient pour standalone
        { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login on redirectToLogin call', () => {
    component.redirectToLogin();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not submit if form is invalid', () => {
    component.registerForm.setValue({ fullName: '', email: 'invalid', password: '' });
    component.onSubmit();
    expect(authServiceMock.signup).not.toHaveBeenCalled();
  });
  
  it('should register user and redirect to login', () => {
    authServiceMock.signup.and.returnValue(of({ success: true, message: 'Inscription réussie !' }));
    component.registerForm.setValue({
      fullName: 'John Doe',
      email: 'john@test.com',
      password: '12345678' //NOSONAR
    });
    component.onSubmit();
    expect(authServiceMock.signup).toHaveBeenCalled();
    expect(snackBarMock.open)
      .toHaveBeenCalledWith('Inscription réussie !', 'OK', { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should show error message on registration failure', () => {
    authServiceMock.signup.and.returnValue(of({ success: false, message: 'Erreur lors de l\'inscription.' }));
    component.registerForm.setValue({
      fullName: 'John Doe',
      email: 'john@test.com',
      password: '12345678' //NOSONAR
    });
    component.onSubmit();
    expect(authServiceMock.signup).toHaveBeenCalled();
    expect(snackBarMock.open)
      .toHaveBeenCalledWith('Erreur lors de l\'inscription.', 'OK', { duration: 3000 });
  });

  it('should show error message when email already exists', () => {
    authServiceMock.signup.and.returnValue(of({ success: false, message: 'Cet email est déjà utilisé.' }));
    component.registerForm.setValue({
      fullName: 'John Doe',
      email: 'john@test.com',
      password: '12345678' //NOSONAR
    });
    component.onSubmit();
    expect(authServiceMock.signup).toHaveBeenCalled();
    expect(snackBarMock.open)
      .toHaveBeenCalledWith('Cet email est déjà utilisé.', 'OK', { duration: 3000 });
  });
});
