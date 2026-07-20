import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import type {
  CreateOrderDto,
  JobDto,
  UserDto,
  UserGroupDto,
} from '@webduct/shared';
import { CartService } from '../../core/services/cart.service';
import { LookupsService, ShippingOptionDto } from '../../core/services/lookups.service';
import { OrdersService } from '../../core/services/orders.service';

/** Delivery window: start must be before end. */
function deliveryWindowValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('deliveryWindowStart')?.value;
  const end = group.get('deliveryWindowEnd')?.value;
  if (start && end && start >= end) {
    return { deliveryWindow: true };
  }
  return null;
}

/**
 * Submit-order wizard container (app-submit-order / manage-order-container).
 * Orchestrates the order form sections and converts the cart into an order.
 */
@Component({
  selector: 'app-submit-order',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './submit-order.component.html',
  styleUrl: './submit-order.component.scss',
})
export class SubmitOrderComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cartSvc = inject(CartService);
  private readonly lookups = inject(LookupsService);
  private readonly ordersSvc = inject(OrdersService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly jobs = signal<JobDto[]>([]);
  readonly users = signal<UserDto[]>([]);
  readonly userGroups = signal<UserGroupDto[]>([]);
  readonly shippingOptions = signal<ShippingOptionDto[]>([]);
  readonly submitting = signal(false);

  readonly summary = computed(() => this.cartSvc.cart()?.summary);
  readonly cartEmpty = computed(() => (this.cartSvc.cart()?.items.length ?? 0) === 0);

  readonly form = this.fb.nonNullable.group(
    {
      // Job
      jobId: [''],
      // Details
      poNumber: [''],
      tag: [''],
      measuredById: [''],
      orderedForId: [''],
      userGroupId: [''],
      // Dates
      orderedDate: [null as Date | null],
      requestedDate: [null as Date | null],
      // Shipping
      shippingOption: ['STANDARD', Validators.required],
      deliveryWindowStart: [''],
      deliveryWindowEnd: [''],
    },
    { validators: deliveryWindowValidator },
  );

  ngOnInit(): void {
    this.cartSvc.load().subscribe();
    this.lookups.jobs().subscribe((j) => this.jobs.set(j));
    this.lookups.users().subscribe((u) => this.users.set(u));
    this.lookups.userGroups().subscribe((g) => this.userGroups.set(g));
    this.lookups.shippingOptions().subscribe((s) => this.shippingOptions.set(s));
  }

  get hasWindowError(): boolean {
    return this.form.hasError('deliveryWindow');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Please fix the highlighted fields.', 'OK', { duration: 3000 });
      return;
    }
    if (this.cartEmpty()) {
      this.snack.open('Your cart is empty.', 'OK', { duration: 3000 });
      return;
    }
    this.submitting.set(true);
    const v = this.form.getRawValue();
    const body: CreateOrderDto = {
      jobId: v.jobId || undefined,
      poNumber: v.poNumber || undefined,
      tag: v.tag || undefined,
      measuredById: v.measuredById || undefined,
      orderedForId: v.orderedForId || undefined,
      userGroupId: v.userGroupId || undefined,
      orderedDate: v.orderedDate ? v.orderedDate.toISOString() : undefined,
      requestedDate: v.requestedDate ? v.requestedDate.toISOString() : undefined,
      shippingOption: v.shippingOption as CreateOrderDto['shippingOption'],
      deliveryWindowStart: this.combineWindow(v.requestedDate, v.deliveryWindowStart),
      deliveryWindowEnd: this.combineWindow(v.requestedDate, v.deliveryWindowEnd),
      notifications: [],
      customFields: [],
      attachmentIds: [],
    };
    this.ordersSvc.create(body).subscribe({
      next: (order) => {
        this.submitting.set(false);
        this.router.navigate(['/main/order/complete', order.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.errors
          ? Object.values(err.error.errors).flat().join(' ')
          : 'Order submission failed.';
        this.snack.open(msg, 'Dismiss', { duration: 5000 });
      },
    });
  }

  /** Combine the requested date with an HH:mm time string into an ISO timestamp. */
  private combineWindow(date: Date | null, time: string): string | undefined {
    if (!date || !time) {
      return undefined;
    }
    const [h, m] = time.split(':').map(Number);
    const d = new Date(date);
    d.setHours(h ?? 0, m ?? 0, 0, 0);
    return d.toISOString();
  }
}
