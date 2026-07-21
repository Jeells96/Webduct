import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { ProductDto } from '@webduct/shared';
import { ApiService } from '../api/api.service';

export interface ProductFilter {
  catalogId?: string;
  categoryId?: string;
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly api = inject(ApiService);

  list(filter: ProductFilter = {}): Observable<ProductDto[]> {
    return this.api.get<ProductDto[]>('/products', {
      catalogId: filter.catalogId,
      categoryId: filter.categoryId,
      q: filter.q,
    });
  }

  get(id: string): Observable<ProductDto> {
    return this.api.get<ProductDto>(`/products/${id}`);
  }

  create(body: unknown): Observable<ProductDto> {
    return this.api.post<ProductDto>('/products', body);
  }

  update(id: string, body: unknown): Observable<ProductDto> {
    return this.api.patch<ProductDto>(`/products/${id}`, body);
  }
}
