import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { AuthService } from "./auth.service";
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { AuthInterceptor } from "./auth.interceptor";
import { of } from "rxjs/internal/observable/of";

describe("AuthInterceptor", () => {

    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    let authServiceMock: jasmine.SpyObj<AuthService>;

    beforeEach(() => {

        authServiceMock = jasmine.createSpyObj('AuthService', ['refreshToken']);

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authServiceMock },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthInterceptor,
                    multi: true
                }
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    // ─── Token injection tests ───────────────────────────────────────────────────────────────

    it('should add Authorization header when accessToken exists', () => {
        localStorage.setItem('accessToken', 'my-token');

        httpClient.get('/api/data').subscribe();

        const req = httpMock.expectOne('/api/data');
        expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
        req.flush({});
    });

    it('should NOT add Authorization header when no accessToken', () => {
        httpClient.get('/api/data').subscribe();

        const req = httpMock.expectOne('/api/data');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({});
    });

    // ─── Skip URLs ─────────────────────────────────────────────────────────────

    it('should skip /auth/login and not add Authorization header', () => {
        localStorage.setItem('accessToken', 'my-token');

        httpClient.post('/auth/login', {}).subscribe();

        const req = httpMock.expectOne('/auth/login');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({});
    });

    it('should skip /auth/register and not add Authorization header', () => {
        localStorage.setItem('accessToken', 'my-token');

        httpClient.post('/auth/register', {}).subscribe();

        const req = httpMock.expectOne('/auth/register');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({});
    });

    it('should skip /auth/refresh and not add Authorization header', () => {
        localStorage.setItem('accessToken', 'my-token');

        httpClient.post('/auth/refresh', {}).subscribe();

        const req = httpMock.expectOne('/auth/refresh');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({});
    });

    // ─── 401 + token refresh ───────────────────────────────────────────────────

    it('should retry request with new token after successful refresh', () => {
        localStorage.setItem('accessToken', 'old-token');
        localStorage.setItem('refreshToken', 'refresh-token');

        authServiceMock.refreshToken.and.callFake(() => {
            localStorage.setItem('accessToken', 'new-token');
            return of(true);
        });

        httpClient.get('/api/data').subscribe({
            next: (res) => expect(res).toEqual({ ok: true })
        });

        const firstReq = httpMock.expectOne('/api/data');
        expect(firstReq.request.headers.get('Authorization')).toBe('Bearer old-token');
        firstReq.flush(null, { status: 401, statusText: 'Unauthorized' });

        const retryReq = httpMock.expectOne('/api/data');
        expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
        retryReq.flush({ ok: true });
    });

    it('should throw error if refresh returns false', () => {
        localStorage.setItem('accessToken', 'old-token');
        localStorage.setItem('refreshToken', 'refresh-token');

        authServiceMock.refreshToken.and.returnValue(of(false));

        httpClient.get('/api/data').subscribe({
            error: (err: HttpErrorResponse) => expect(err.status).toBe(401)
        });

        const req = httpMock.expectOne('/api/data');
        req.flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('should throw error if no refreshToken in localStorage', () => {
        localStorage.setItem('accessToken', 'old-token');

        httpClient.get('/api/data').subscribe({
            error: (err: HttpErrorResponse) => expect(err.status).toBe(401)
        });

        const req = httpMock.expectOne('/api/data');
        req.flush(null, { status: 401, statusText: 'Unauthorized' });

        expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
    });

    it('should NOT attempt refresh on 401 for skip URLs', () => {
        localStorage.setItem('refreshToken', 'refresh-token');

        httpClient.post('/auth/login', {}).subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(401)
        });

        const req = httpMock.expectOne('/auth/login');
        req.flush(null, { status: 401, statusText: 'Unauthorized' });

        expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
    });

    // ─── Autres erreurs HTTP ───────────────────────────────────────────────────

    it('should propagate non-401 errors without attempting refresh', () => {
        localStorage.setItem('accessToken', 'my-token');
        localStorage.setItem('refreshToken', 'refresh-token');

        httpClient.get('/api/data').subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(500)
        });

        const req = httpMock.expectOne('/api/data');
        req.flush(null, { status: 500, statusText: 'Server Error' });

        expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
    });

    it('should propagate 403 errors without attempting refresh', () => {
        localStorage.setItem('accessToken', 'my-token');

        httpClient.get('/api/data').subscribe({
        error: (err: HttpErrorResponse) => expect(err.status).toBe(403)
        });

        const req = httpMock.expectOne('/api/data');
        req.flush(null, { status: 403, statusText: 'Forbidden' });

        expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
    });
});
