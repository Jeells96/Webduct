import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div class="wd-page">
      <h1>Cart</h1>
      <mat-card>
        <mat-card-content>The cart is built in Phase 4.</mat-card-content>
      </mat-card>
    </div>
  `,
})
export class CartComponent {}
