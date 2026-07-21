import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { Product3DAssetDto } from '@webduct/shared';
import {
  CatalogDto,
  CategoryDto,
  CustomInputFieldType,
  ProductOverrideType,
  ProductType,
} from '@webduct/shared';
import { CatalogService } from '../../../core/services/catalog.service';
import { ProductsService } from '../../../core/services/products.service';
import { RichTextEditorComponent } from '../../../shared-ui/ckeditor/rich-text-editor.component';
import { ThreeViewerComponent } from '../../../shared-ui/three-viewer/three-viewer.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    RichTextEditorComponent,
    ThreeViewerComponent,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogSvc = inject(CatalogService);
  private readonly productsSvc = inject(ProductsService);
  private readonly snack = inject(MatSnackBar);

  readonly catalogs = signal<CatalogDto[]>([]);
  readonly categories = signal<CategoryDto[]>([]);
  readonly saving = signal(false);
  readonly asset3d = signal<Product3DAssetDto | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly isEdit = computed(() => this.editingId() !== null);

  readonly ProductType = ProductType;
  readonly overrideTypes = Object.values(ProductOverrideType);
  readonly fieldTypes = Object.values(CustomInputFieldType);

  readonly form = this.fb.nonNullable.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    type: [ProductType.Simple, Validators.required],
    installable: [false],
    overrideType: [ProductOverrideType.None, Validators.required],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    weight: [0, [Validators.required, Validators.min(0)]],
    unit: ['EA', Validators.required],
    catalogId: ['', Validators.required],
    categoryId: [''],
    attributes: this.fb.array<ReturnType<ProductFormComponent['newAttribute']>>([]),
  });

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  get isWithAttributes(): boolean {
    return this.form.controls.type.value === ProductType.WithAttributes;
  }

  ngOnInit(): void {
    this.catalogSvc.catalogs().subscribe((c) => {
      this.catalogs.set(c);
      if (c.length && !this.form.controls.catalogId.value) {
        this.form.controls.catalogId.setValue(c[0].id);
        this.loadCategories(c[0].id);
      }
    });

    this.form.controls.catalogId.valueChanges.subscribe((id) =>
      this.loadCategories(id),
    );

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.editingId.set(id);
      this.productsSvc.get(id).subscribe((p) => {
        this.asset3d.set(p.asset3d ?? null);
        this.form.patchValue({
          sku: p.sku,
          name: p.name,
          description: p.description ?? '',
          type: p.type,
          installable: p.installable,
          overrideType: p.overrideType,
          basePrice: p.basePrice,
          weight: p.weight,
          unit: p.unit,
          catalogId: p.catalogId,
          categoryId: p.categoryId ?? '',
        });
        this.attributes.clear();
        for (const a of p.attributes) {
          this.attributes.push(
            this.newAttribute(a.name, a.type, a.required, a.options.join(', ')),
          );
        }
      });
    }
  }

  newAttribute(
    name = '',
    type: CustomInputFieldType = CustomInputFieldType.Text,
    required = false,
    options = '',
  ) {
    return this.fb.nonNullable.group({
      name: [name, Validators.required],
      type: [type, Validators.required],
      required: [required],
      options: [options],
    });
  }

  addAttribute(): void {
    this.attributes.push(this.newAttribute());
  }

  removeAttribute(i: number): void {
    this.attributes.removeAt(i);
  }

  private loadCategories(catalogId: string): void {
    if (!catalogId) {
      this.categories.set([]);
      return;
    }
    this.catalogSvc.categories(catalogId).subscribe((c) => this.categories.set(c));
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const body = {
      ...raw,
      categoryId: raw.categoryId || undefined,
      attributes: this.isWithAttributes
        ? raw.attributes.map((a) => ({
            name: a.name,
            type: a.type,
            required: a.required,
            options: a.options
              ? a.options.split(',').map((o) => o.trim()).filter(Boolean)
              : [],
          }))
        : [],
    };
    const req = this.isEdit()
      ? this.productsSvc.update(this.editingId()!, body)
      : this.productsSvc.create(body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open('Product saved', 'OK', { duration: 2500 });
        this.router.navigateByUrl('/main/catalog');
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Save failed', 'Dismiss', { duration: 3500 });
      },
    });
  }
}
