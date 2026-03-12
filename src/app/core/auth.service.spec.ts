import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { JWTPayload } from '../models/JWTPayload';
import { Router } from '@angular/router';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let jwtService: JwtService;

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            providers: [
                AuthService, 
                JwtService, 
                provideHttpClient(), 
                provideHttpClientTesting(),
                provideHttpClientTesting(),
                { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
            ]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        jwtService = TestBed.inject(JwtService);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should login and store token, set current user and auth state', (done) => {
        const accessToken = 'fake.jwt.token';
        const refreshToken = 'fake.refresh.token';
        const decoded: JWTPayload = {  sub: 'user@test.com', exp: 1234567890, iat: 1234567890 };

        spyOn(jwtService, 'decode').and.returnValue(decoded);

        service.login({ email: 'test@gmail.com', password: 'pass' }).subscribe((result) => { //NOSONAR
            expect(result).toBeTrue();
            expect(localStorage.getItem('accessToken')).toBe(accessToken);
            expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
            expect(service.isLoggedIn()).toBeTrue();
            expect(service.currentUserSignalPayload()).toEqual(decoded);
            done();
        });

        const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
        expect(req.request.method).toBe('POST');
        req.flush({ accessToken, refreshToken });
    });

    it('should return false on login error and keep unauthenticated', (done) => {
        service.login({ email: 'test@gmail.com', password: 'pass' }).subscribe((result) => {//NOSONAR
            expect(result).toBeFalse();
            expect(service.isLoggedIn()).toBeFalse();
            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
            expect(service.currentUserSignalPayload()).toBeNull();
            done();
        });

        const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should logout and set auth state to false', () => {
        localStorage.setItem('accessToken', 'token');

        service.currentUserSignalPayload.set({
            sub: 'user@test.com',
            exp: 1234567890,
            iat: 1234567890
        } as JWTPayload);

        service.logout().subscribe();

        const req = httpMock.expectOne('http://localhost:8080/api/auth/logout');
        expect(req.request.method).toBe('POST');

        req.flush({}); // simule réponse backend

        expect(service.isLoggedIn()).toBeFalse();
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(service.currentUserSignalPayload()).toBeNull();
    });

    // ─── signup ───────────────────────────────────────────────────────────────

    it('should return success true on successful signup', (done) => {
        service.signup({ fullName: 'John Doe', email: 'john@test.com', password: 'Password1' }).subscribe((result) => {
            expect(result.success).toBeTrue();
            expect(result.message).toBe('Inscription réussie !');
            done();
        });
        const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
        expect(req.request.method).toBe('POST');
        req.flush({ email: 'john@test.com' });
    });

    it('should return email already exists message on 400', (done) => {
        service.signup({ fullName: 'John Doe', email: 'john@test.com', password: 'Password1' }).subscribe((result) => {
            expect(result.success).toBeFalse();
            expect(result.message).toBe('Cet email est déjà utilisé.');
            done();
        });
        const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
        req.flush('Email exists already!', { status: 400, statusText: 'Bad Request' });
    });

    it('should return generic error message on other signup error', (done) => {
        service.signup({ fullName: 'John Doe', email: 'john@test.com', password: 'Password1' }).subscribe((result) => {
            expect(result.success).toBeFalse();
            expect(result.message).toBe('Erreur lors de l\'inscription.');
            done();
        });
        const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
        req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    // ─── refreshToken ─────────────────────────────────────────────────────────

    it('should refresh token, store accessToken and set user', (done) => {
        const newAccessToken = 'new.access.token';
        const decoded: JWTPayload = { sub: 'user@test.com', exp: 9999999999, iat: 1234567890 };
        spyOn(jwtService, 'decode').and.returnValue(decoded);

        service.refreshToken('fake-refresh-token').subscribe((result) => {
            expect(result).toBeTrue();
            expect(localStorage.getItem('accessToken')).toBe(newAccessToken);
            expect(service.currentUserSignalPayload()).toEqual(decoded);
            done();
        });

        const req = httpMock.expectOne('http://localhost:8080/api/auth/refresh_token');
        expect(req.request.method).toBe('POST');
        req.flush({ accessToken: newAccessToken });
    });

    it('should call forceLogout and return false on refreshToken error', (done) => {
        spyOn(service, 'forceLogout');

        service.refreshToken('expired-refresh-token').subscribe((result) => {
            expect(result).toBeFalse();
            expect(service.forceLogout).toHaveBeenCalled();
            done();
        });

        const req = httpMock.expectOne('http://localhost:8080/api/auth/refresh_token');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    // ─── forceLogout ──────────────────────────────────────────────────────────

    it('should clear session on forceLogout', () => {
        localStorage.setItem('accessToken', 'token');
        localStorage.setItem('refreshToken', 'refresh');
        service.currentUserSignalPayload.set({ sub: 'user@test.com', exp: 9999999999, iat: 1234567890 });

        service.forceLogout();

        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(service.isLoggedIn()).toBeFalse();
    });

    it('should clear session and navigate to login on clearSession', () => {
        const router = TestBed.inject(Router);
        localStorage.setItem('accessToken', 'token');
        localStorage.setItem('refreshToken', 'refresh');
        service.currentUserSignalPayload.set({ sub: 'user@test.com', exp: 9999999999, iat: 1234567890 });

        service.clearSession();

        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(service.isLoggedIn()).toBeFalse();
        expect(service.currentUserSignalPayload()).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
});
