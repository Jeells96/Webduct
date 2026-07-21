import { Routes } from '@angular/router';

/** Manage-product feature routes: list, create, and edit. */
export const manageProductRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./product-form/product-form.component').then(
        (m) => m.ProductFormComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./product-form/product-form.component').then(
        (m) => m.ProductFormComponent,
      ),
  },
];
