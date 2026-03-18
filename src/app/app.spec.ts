import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/auth.service';
import { JwtService } from './core/jwt.service';
import { of } from 'rxjs';

describe('App', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let jwtServiceMock: jasmine.SpyObj<JwtService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['refreshToken'], {
      currentUserSignalPayload: jasmine.createSpy('set')
    });
    jwtServiceMock = jasmine.createSpyObj('JwtService', ['decode']);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: JwtService, useValue: jwtServiceMock }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should decode token and set user when accessToken exists', () => {
    localStorage.setItem('accessToken', 'fake-token');
    const mockPayload = { sub: '1', iat: 1600000000, exp: 9999999999 };
    jwtServiceMock.decode.and.returnValue(mockPayload);
    authServiceMock.currentUserSignalPayload.set = jasmine.createSpy();

    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.ngOnInit();

    expect(jwtServiceMock.decode).toHaveBeenCalledWith('fake-token');
    expect(authServiceMock.currentUserSignalPayload.set).toHaveBeenCalledWith(mockPayload);
  });

  it('should call refreshToken when only refreshToken exists', () => {
    localStorage.removeItem('accessToken');
    localStorage.setItem('refreshToken', 'fake-refresh-token');
    authServiceMock.refreshToken.and.returnValue(of(false));

    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.ngOnInit();

    expect(authServiceMock.refreshToken).toHaveBeenCalledWith('fake-refresh-token');
  });

  it('should do nothing when no token exists', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.ngOnInit();

    expect(jwtServiceMock.decode).not.toHaveBeenCalled();
    expect(authServiceMock.refreshToken).not.toHaveBeenCalled();
  });
});