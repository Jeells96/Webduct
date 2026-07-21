import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { OrderDto } from '@webduct/shared';
import { OrdersService } from '../../core/services/orders.service';

/** Order confirmation screen (app-complete-order). */
@Component({
  selector: 'app-complete-order',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="wd-page">
      @if (order(); as o) {
        <mat-card class="confirm">
          <div class="check"><mat-icon>check_circle</mat-icon></div>
          <h1>Thank you for placing your order</h1>
          <p class="num">Your order number is <strong>{{ o.number }}</strong></p>
          <div class="messages">
            @if (o.summary.pricingMessage) {
              <p>{{ o.summary.pricingMessage }}</p>
            }
            @if (o.summary.deliveryMessage) {
              <p>{{ o.summary.deliveryMessage }}</p>
            }
          </div>
          <div class="totals">
            <div><span>Items</span><strong>{{ o.summary.count }}</strong></div>
            <div><span>Weight</span><strong>{{ o.summary.weight }} lb</strong></div>
            <div><span>Total</span><strong>{{ o.summary.price | currency }}</strong></div>
          </div>
          <a mat-raised-button color="primary" routerLink="/main/catalog">
            <mat-icon>add</mat-icon> Start a new order
          </a>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .confirm {
        max-width: 560px;
        margin: 24px auto;
        text-align: center;
        padding: 32px;
      }
      .check mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #28a745;
      }
      .num {
        font-size: 18px;
        margin: 8px 0 16px;
      }
      .messages p {
        color: rgba(0, 0, 0, 0.6);
        margin: 4px 0;
      }
      .totals {
        display: flex;
        justify-content: center;
        gap: 32px;
        margin: 24px 0;
        div {
          display: flex;
          flex-direction: column;
          span {
            color: rgba(0, 0, 0, 0.54);
            font-size: 13px;
          }
          strong {
            font-size: 18px;
          }
        }
      }
    `,
  ],
})
export class CompleteOrderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersSvc = inject(OrdersService);
  readonly order = signal<OrderDto | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ordersSvc.get(id).subscribe((o) => this.order.set(o));
    }
  }
}
