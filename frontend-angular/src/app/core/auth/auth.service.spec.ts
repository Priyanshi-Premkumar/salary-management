import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize unauthenticated if no stored token', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  it('should login, set signals, and store token in localStorage', () => {
    const mockResponse = {
      token: 'jwt-mock-token-xyz',
      user: {
        id: 1,
        email: 'hrmanager@acme.com',
        role: 'ROLE_HR_MANAGER'
      }
    };

    service.login({ email: 'hrmanager@acme.com', password: 'Password123' }).subscribe((res) => {
      expect(res.token).toBe('jwt-mock-token-xyz');
      expect(res.user.email).toBe('hrmanager@acme.com');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.isHrManager()).toBeTrue();
    expect(service.token()).toBe('jwt-mock-token-xyz');
    expect(localStorage.getItem('token')).toBe('jwt-mock-token-xyz');
  });

  it('should logout, clear state and navigate to /login', () => {
    localStorage.setItem('token', 'active-token');
    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
