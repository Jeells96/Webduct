import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type { CartDto } from '@webduct/shared';
import { ApiService } from '../api/api.service';

/** Client-side cart state + API. Backend endpoints are implemented in Phase 4. */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);
  private readonly _cart = signal<CartDto | null>(null);

  readonly cart = this._cart.asReadonly();
  readonly itemCount = computed(() => this._cart()?.summary.count ?? 0);

  load(): Observable<CartDto> {
    return this.api.get<CartDto>('/cart').pipe(tap((c) => this._cart.set(c)));
  }

  addItem(productId: string, qty: number, selectedAttributes: Record<string, unknown> = {}): Observable<CartDto> {
    return this.api
      .post<CartDto>('/cart/items', { productId, qty, selectedAttributes })
      .pipe(tap((c) => this._cart.set(c)));
  }

  updateItem(itemId: string, qty: number): Observable<CartDto> {
    return this.api
      .patch<CartDto>(`/cart/items/${itemId}`, { qty })
      .pipe(tap((c) => this._cart.set(c)));
  }

  removeItem(itemId: string): Observable<CartDto> {
    return this.api
      .delete<CartDto>(`/cart/items/${itemId}`)
      .pipe(tap((c) => this._cart.set(c)));
  }
}
