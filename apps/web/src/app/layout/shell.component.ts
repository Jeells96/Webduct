import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../core/auth/auth.service';

/**
 * Application shell — toolbar + side navigation that hosts the ordering
 * micro-app views. Replaces the legacy AngularJS host frame.
 */
@Component({
  selector: 'wd-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="drawer.toggle()" aria-label="Menu">
        <mat-icon>menu</mat-icon>
      </button>
      <span>Webduct</span>
      <span class="wd-spacer"></span>
      <button mat-button routerLink="/main/cart">
        <mat-icon>shopping_cart</mat-icon> Cart
      </button>
      <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="Account">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <div class="user-info" mat-menu-item disabled>
          {{ auth.user()?.name }}
        </div>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Sign out</span>
        </button>
      </mat-menu>
    </mat-toolbar>

    <mat-sidenav-container class="wd-shell">
      <mat-sidenav #drawer mode="side" opened class="wd-sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/main/order" routerLinkActive="active-link">
            <mat-icon matListItemIcon>assignment</mat-icon>
            <span matListItemTitle>Submit Order</span>
          </a>
          <a mat-list-item routerLink="/main/catalog" routerLinkActive="active-link">
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>Products</span>
          </a>
          <a mat-list-item routerLink="/main/cart" routerLinkActive="active-link">
            <mat-icon matListItemIcon>shopping_cart</mat-icon>
            <span matListItemTitle>Cart</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .wd-shell {
        height: calc(100vh - 64px);
      }
      .wd-sidenav {
        width: 240px;
      }
      .active-link {
        background: rgba(103, 58, 183, 0.1);
      }
      .user-info {
        font-weight: 500;
        opacity: 1 !important;
      }
    `,
  ],
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
