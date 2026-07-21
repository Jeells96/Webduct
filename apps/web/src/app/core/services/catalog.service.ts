import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { CatalogDto, CategoryDto } from '@webduct/shared';
import { ApiService } from '../api/api.service';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiService);

  catalogs(): Observable<CatalogDto[]> {
    return this.api.get<CatalogDto[]>('/catalogs');
  }

  categories(catalogId?: string): Observable<CategoryDto[]> {
    return this.api.get<CategoryDto[]>('/categories', { catalogId });
  }
}
