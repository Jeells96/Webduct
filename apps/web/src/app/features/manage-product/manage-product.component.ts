import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-manage-product',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div class="wd-page">
      <h1>Products</h1>
      <mat-card>
        <mat-card-content>Catalog & manage-product is built in Phase 3.</mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ManageProductComponent {}
