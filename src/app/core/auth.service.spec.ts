import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { JWTPayload } from '../models/JWTPayload';

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
                provideHttpClientTesting()
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
});
