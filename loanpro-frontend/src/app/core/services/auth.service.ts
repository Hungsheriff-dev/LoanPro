import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UserInfo } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  currentUser = signal<UserInfo | null>(this.getUserFromStorage());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(data: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, data)
      .pipe(
        tap((res) => {
          localStorage.setItem(this.TOKEN_KEY, res.access_token);
          localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
          this.currentUser.set(res.user);
        }),
      );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null { //Lấy access token đang lưu trong trình duyệt
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean { //Kiểm tra có access token hay không
    return !!this.getToken();
  }

  getUserRole(): string | null {
    return this.currentUser()?.role ?? null;
  }

  /** Kiểm tra user có đúng 1 role cụ thể không */
  hasRole(role: string): boolean {
    const currentRole = this.getUserRole();
    return !!currentRole && currentRole === role;
  }

  /** Kiểm tra user có một trong các role được cho phép không */
  hasAnyRole(roles: string[]): boolean {
    const currentRole = this.getUserRole();
    if (!currentRole) return false;
    return roles.includes(currentRole);
}

  private getUserFromStorage(): UserInfo | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw); //Chuyển JSON string thành object
    } catch {
      return null;
    }
  }
}