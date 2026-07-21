import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormArray,
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CustomInputFieldType,
  MAX_EMAIL_LENGTH,
  NotificationType,
} from '@webduct/shared';
import type {
  AttachmentDto,
  CreateOrderDto,
  CrewDto,
  CustomFieldDefDto,
  JobDto,
  NotificationRecipientDto,
  UserDto,
  UserGroupDto,
} from '@webduct/shared';
import { CartService } from '../../core/services/cart.service';
import { LookupsService, ShippingOptionDto } from '../../core/services/lookups.service';
import { OrdersService } from '../../core/services/orders.service';
import { AttachmentsService } from '../../core/services/attachments.service';
import { RichTextEditorComponent } from '../../shared-ui/ckeditor/rich-text-editor.component';

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
 * Orchestrates every order section — job, details, dates, shipping,
 * instructions, notifications, custom form, attachments — and converts the
 * cart into an order.
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
    MatCheckboxModule,
    MatListModule,
    RichTextEditorComponent,
  ],
  templateUrl: './submit-order.component.html',
  styleUrl: './submit-order.component.scss',
})
export class SubmitOrderComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cartSvc = inject(CartService);
  private readonly lookups = inject(LookupsService);
  private readonly ordersSvc = inject(OrdersService);
  private readonly attachmentsSvc = inject(AttachmentsService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly NotificationType = NotificationType;
  readonly CustomInputFieldType = CustomInputFieldType;

  readonly jobs = signal<JobDto[]>([]);
  readonly users = signal<UserDto[]>([]);
  readonly userGroups = signal<UserGroupDto[]>([]);
  readonly crews = signal<CrewDto[]>([]);
  readonly shippingOptions = signal<ShippingOptionDto[]>([]);
  readonly customFieldDefs = signal<CustomFieldDefDto[]>([]);
  readonly attachments = signal<AttachmentDto[]>([]);
  readonly submitting = signal(false);
  readonly uploading = signal(false);

  readonly summary = computed(() => this.cartSvc.cart()?.summary);
  readonly cartEmpty = computed(() => (this.cartSvc.cart()?.items.length ?? 0) === 0);

  readonly form = this.fb.nonNullable.group(
    {
      jobId: [''],
      poNumber: [''],
      tag: [''],
      measuredById: [''],
      orderedForId: [''],
      userGroupId: [''],
      orderedDate: [null as Date | null],
      requestedDate: [null as Date | null],
      shippingOption: ['STANDARD', Validators.required],
      deliveryWindowStart: [''],
      deliveryWindowEnd: [''],
      instructions: [''],
      notifications: this.fb.array<ReturnType<SubmitOrderComponent['newNotification']>>([]),
      customFields: this.fb.array<ReturnType<SubmitOrderComponent['newCustomField']>>([]),
    },
    { validators: deliveryWindowValidator },
  );

  get notifications(): FormArray {
    return this.form.get('notifications') as FormArray;
  }
  get customFields(): FormArray {
    return this.form.get('customFields') as FormArray;
  }
  get hasWindowError(): boolean {
    return this.form.hasError('deliveryWindow');
  }

  ngOnInit(): void {
    this.cartSvc.load().subscribe();
    this.lookups.jobs().subscribe((j) => this.jobs.set(j));
    this.lookups.users().subscribe((u) => this.users.set(u));
    this.lookups.userGroups().subscribe((g) => this.userGroups.set(g));
    this.lookups.crews().subscribe((c) => this.crews.set(c));
    this.lookups.shippingOptions().subscribe((s) => this.shippingOptions.set(s));
    this.lookups.customFields().subscribe((defs) => {
      this.customFieldDefs.set(defs);
      for (const def of defs) {
        this.customFields.push(this.newCustomField(def));
      }
    });
  }

  // --- Notifications ---
  newNotification() {
    return this.fb.nonNullable.group({
      type: [NotificationType.Email, Validators.required],
      email: ['', [Validators.email, Validators.maxLength(MAX_EMAIL_LENGTH)]],
      userId: [''],
      crewId: [''],
    });
  }
  addNotification(): void {
    this.notifications.push(this.newNotification());
  }
  removeNotification(i: number): void {
    this.notifications.removeAt(i);
  }

  // --- Custom fields (dynamic) ---
  newCustomField(def: CustomFieldDefDto) {
    const validators = def.required ? [Validators.required] : [];
    return this.fb.nonNullable.group({
      defId: [def.id],
      label: [def.label],
      type: [def.type],
      options: [def.options],
      value: [
        def.type === CustomInputFieldType.Boolean ? (false as unknown as string) : '',
        validators,
      ],
    });
  }

  // --- Attachments ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.attachmentsSvc.upload(file).subscribe({
      next: (att) => {
        this.attachments.update((list) => [...list, att]);
        this.uploading.set(false);
        input.value = '';
      },
      error: () => {
        this.uploading.set(false);
        this.snack.open('Upload failed — check file type and size.', 'Dismiss', {
          duration: 4000,
        });
      },
    });
  }
  removeAttachment(id: string): void {
    this.attachmentsSvc.remove(id).subscribe(() =>
      this.attachments.update((list) => list.filter((a) => a.id !== id)),
    );
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

    const notifications: NotificationRecipientDto[] = v.notifications.map((n) => ({
      type: n.type,
      email: n.type === NotificationType.Email ? n.email || undefined : undefined,
      userId: n.type === NotificationType.User ? n.userId || undefined : undefined,
      crewId: n.type === NotificationType.Crew ? n.crewId || undefined : undefined,
    }));

    const customFields = v.customFields
      .filter((c) => c.value !== '' && c.value !== null && c.value !== undefined)
      .map((c) => ({ defId: c.defId, value: c.value }));

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
      instructions: v.instructions || undefined,
      notifications,
      customFields,
      attachmentIds: this.attachments().map((a) => a.id),
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
