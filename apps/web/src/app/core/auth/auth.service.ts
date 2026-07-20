import { Injectable, signal } from '@angular/core';

/**
 * Auth state holder. Phase 0 stub — real JWT login/refresh wired in Phase 2.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(null);

  readonly accessToken = this._token.asReadonly();

  setToken(token: string | null): void {
    this._token.set(token);
  }
}
