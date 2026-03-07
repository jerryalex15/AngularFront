import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';

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
        const token = 'fake.jwt.token';
        const decoded = { email: 'test@gmail.com', roles: ['ROLE_USER'] };
        const TEST_PASSWORD = 'test-password'; //NOSONAR

        spyOn(jwtService, 'decode').and.returnValue(decoded as any);
        const loginRequest = { email: 'test@gmail.com', password: TEST_PASSWORD };

        service.login(loginRequest).subscribe((result) => {
            expect(result).toBeTrue();
            expect(localStorage.getItem('accesstoken')).toBe(token);
            expect(service.isLoggedIn()).toBeTrue();
            expect(service.currentUser()).toEqual(decoded as any);
            done();
        });

        const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
        expect(req.request.method).toBe('POST');
        req.flush({ token });
    });

    it('should return false on login error and keep unauthenticated', (done) => {
        service.login({ email: 'test@gmail.com', password: 'pass' }).subscribe((result) => {
            expect(result).toBeFalse();
            expect(service.isLoggedIn()).toBeFalse();
            expect(localStorage.getItem('token')).toBeNull();
            expect(service.currentUser()).toBeNull();
            done();
        });

        const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should logout and set auth state to false', () => {
        localStorage.setItem('token', 'existing.token');
        service.currentUser.set('existing.token');
        service.logout();
        expect(service.isLoggedIn()).toBeFalse();
        expect(localStorage.getItem('token')).toBeNull();
        expect(service.currentUser()).toBeNull();
    });
});
