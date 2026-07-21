import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { ProductDto } from '@webduct/shared';
import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';

/** Product catalog / manage-product landing — table of products with edit + add-to-cart. */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  templateUrl: './product-list.component.html',
  styles: [
    `
      table {
        width: 100%;
      }
      .num {
        text-align: right;
      }
      .actions {
        text-align: right;
      }
    `,
  ],
})
export class ProductListComponent implements OnInit {
  private readonly products = inject(ProductsService);
  private readonly cart = inject(CartService);

  readonly rows = signal<ProductDto[]>([]);
  readonly loading = signal(true);
  readonly columns = ['sku', 'name', 'type', 'price', 'weight', 'actions'];

  ngOnInit(): void {
    this.products.list().subscribe({
      next: (r) => {
        this.rows.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addToCart(p: ProductDto): void {
    this.cart.addItem(p.id, 1).subscribe();
  }
}
