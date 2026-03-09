import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login-component';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs/internal/observable/of';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {

    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(), // 👈 mock HttpClient pour standalone
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to register on redirectToRegister call', () => {
    component.redirectToRegister();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/register']);
  });
  
  it('should not submit if form is invalid', () => {
    component.loginForm.setValue({ email: 'invalid', password: '' });
    component.onSubmit();
    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalledWith('Échec de la connexion. Vérifiez vos identifiants.', 'OK', { duration: 3000 });
  });

  it('should login user and redirect to home', () => {
    let loginFormValue = { email: 'john@test.com', password: '123456' }; //NOSONAR
    component.loginForm.setValue(loginFormValue);
    authServiceMock.login.and.returnValue(of(true)); // Simule une connexion réussie

    component.onSubmit();
    expect(authServiceMock.login).toHaveBeenCalledWith(loginFormValue);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
  });
});
