import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type { AuthTokensDto, LoginRequestDto, UserDto } from '@webduct/shared';
import { API_BASE_URL } from '../api/api.config';

const ACCESS_KEY = 'wd_access';
const REFRESH_KEY = 'wd_refresh';
const USER_KEY = 'wd_user';

/** Holds auth state and talks to the API auth endpoints. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(
    localStorage.getItem(ACCESS_KEY),
  );
  private readonly _user = signal<UserDto | null>(this.readUser());

  readonly accessToken = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequestDto): Observable<AuthTokensDto> {
    return this.http
      .post<AuthTokensDto>(`${API_BASE_URL}/auth/login`, payload)
      .pipe(tap((res) => this.store(res)));
  }

  refresh(): Observable<AuthTokensDto> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    return this.http
      .post<AuthTokensDto>(`${API_BASE_URL}/auth/refresh`, { refreshToken })
      .pipe(tap((res) => this.store(res)));
  }

  logout(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  setToken(token: string | null): void {
    this._token.set(token);
  }

  private store(res: AuthTokensDto): void {
    localStorage.setItem(ACCESS_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._token.set(res.accessToken);
    this._user.set(res.user);
  }

  private readUser(): UserDto | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserDto) : null;
  }
}
