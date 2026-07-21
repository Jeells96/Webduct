import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

/** Thin typed wrapper over HttpClient scoped to the Webduct API base. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(
    path: string,
    params?: Record<string, string | number | undefined | null>,
  ): Observable<T> {
    return this.http.get<T>(`${API_BASE_URL}${path}`, {
      params: this.toParams(params),
    });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${API_BASE_URL}${path}`, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${API_BASE_URL}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${API_BASE_URL}${path}`);
  }

  private toParams(
    params?: Record<string, string | number | undefined | null>,
  ): HttpParams {
    let p = new HttpParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') {
          p = p.set(k, String(v));
        }
      }
    }
    return p;
  }
}
