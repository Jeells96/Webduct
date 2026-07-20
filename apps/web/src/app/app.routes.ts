import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';

/**
 * Route tree mirrors the original `#!/main/order` hashbang structure.
 */
export const routes: Routes = [
  {
    path: 'main',
    component: ShellComponent,
    children: [
      {
        path: 'order',
        loadComponent: () =>
          import('./features/submit-order/submit-order.component').then(
            (m) => m.SubmitOrderComponent,
          ),
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./features/manage-product/manage-product.component').then(
            (m) => m.ManageProductComponent,
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
