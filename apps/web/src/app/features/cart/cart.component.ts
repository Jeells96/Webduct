import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { CartDto } from '@webduct/shared';
import { CartService } from '../../core/services/cart.service';

/** Cart page — line items, quantity editing, totals, and order navigation. */
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private readonly cartSvc = inject(CartService);

  readonly cart = signal<CartDto | null>(null);
  readonly loading = signal(true);
  readonly columns = ['product', 'unitPrice', 'qty', 'lineTotal', 'lineWeight', 'actions'];
  readonly isEmpty = computed(() => (this.cart()?.items.length ?? 0) === 0);

  ngOnInit(): void {
    this.cartSvc.load().subscribe({
      next: (c) => {
        this.cart.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changeQty(itemId: string, qty: number): void {
    if (qty < 1) {
      return;
    }
    this.cartSvc.updateItem(itemId, qty).subscribe((c) => this.cart.set(c));
  }

  remove(itemId: string): void {
    this.cartSvc.removeItem(itemId).subscribe((c) => this.cart.set(c));
  }
}
