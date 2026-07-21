import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { authGuard } from './core/auth/auth.guard';

/**
 * Route tree mirrors the original `#!/main/order` hashbang structure, guarded
 * by JWT auth.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'main',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'order',
        loadChildren: () =>
          import('./features/submit-order/submit-order.routes').then(
            (m) => m.submitOrderRoutes,
          ),
      },
      {
        path: 'catalog',
        loadChildren: () =>
          import('./features/manage-product/manage-product.routes').then(
            (m) => m.manageProductRoutes,
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/cart/cart.component').then((m) => m.CartComponent),
      },
      { path: '', redirectTo: 'order', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'main/order', pathMatch: 'full' },
  { path: '**', redirectTo: 'main/order' },
];
