import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-submit-order',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div class="wd-page">
      <h1>Submit Order</h1>
      <mat-card>
        <mat-card-content>
          The submit-order wizard is built in Phase 5–7.
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class SubmitOrderComponent {}
