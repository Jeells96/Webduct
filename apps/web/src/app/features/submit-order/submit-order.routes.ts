import { Routes } from '@angular/router';

/** Submit-order feature routes: the wizard and the completion screen. */
export const submitOrderRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./submit-order.component').then((m) => m.SubmitOrderComponent),
  },
  {
    path: 'complete/:id',
    loadComponent: () =>
      import('./complete-order.component').then((m) => m.CompleteOrderComponent),
  },
];
