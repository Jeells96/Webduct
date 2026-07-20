import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ProductDto } from '@webduct/shared';
import {
  CustomInputFieldType,
  ProductOverrideType,
  ProductType,
} from '@webduct/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

const PRODUCT_INCLUDE = {
  images: { orderBy: { sortOrder: 'asc' } },
  attributes: { orderBy: { sortOrder: 'asc' } },
  asset3d: true,
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof PRODUCT_INCLUDE }>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: {
    catalogId?: string;
    categoryId?: string;
    q?: string;
  }): Promise<ProductDto[]> {
    const rows = await this.prisma.product.findMany({
      where: {
        active: true,
        catalogId: filter.catalogId,
        categoryId: filter.categoryId,
        OR: filter.q
          ? [
              { name: { contains: filter.q, mode: 'insensitive' } },
              { sku: { contains: filter.q, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: PRODUCT_INCLUDE,
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => this.toDto(r));
  }

  async findOne(id: string): Promise<ProductDto> {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
    if (!row) {
      throw new NotFoundException('Product not found');
    }
    return this.toDto(row);
  }

  async create(dto: CreateProductDto): Promise<ProductDto> {
    const row = await this.prisma.product.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        installable: dto.installable,
        overrideType: dto.overrideType,
        basePrice: new Prisma.Decimal(dto.basePrice),
        weight: new Prisma.Decimal(dto.weight),
        unit: dto.unit,
        catalogId: dto.catalogId,
        categoryId: dto.categoryId,
        attributes:
          dto.type === ProductType.WithAttributes && dto.attributes
            ? {
                create: dto.attributes.map((a, i) => ({
                  name: a.name,
                  type: a.type,
                  required: a.required,
                  options: a.options,
                  sortOrder: i,
                })),
              }
            : undefined,
      },
      include: PRODUCT_INCLUDE,
    });
    return this.toDto(row);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    await this.findOne(id);
    // Replace attributes wholesale to keep the edit simple and predictable.
    const row = await this.prisma.$transaction(async (tx) => {
      await tx.productAttribute.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          sku: dto.sku,
          name: dto.name,
          description: dto.description,
          type: dto.type,
          installable: dto.installable,
          overrideType: dto.overrideType,
          basePrice: new Prisma.Decimal(dto.basePrice),
          weight: new Prisma.Decimal(dto.weight),
          unit: dto.unit,
          catalogId: dto.catalogId,
          categoryId: dto.categoryId,
          attributes:
            dto.type === ProductType.WithAttributes && dto.attributes
              ? {
                  create: dto.attributes.map((a, i) => ({
                    name: a.name,
                    type: a.type,
                    required: a.required,
                    options: a.options,
                    sortOrder: i,
                  })),
                }
              : undefined,
        },
        include: PRODUCT_INCLUDE,
      });
    });
    return this.toDto(row);
  }

  private toDto(row: ProductRow): ProductDto {
    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      description: row.description,
      type: row.type as ProductType,
      installable: row.installable,
      overrideType: row.overrideType as ProductOverrideType,
      basePrice: Number(row.basePrice),
      weight: Number(row.weight),
      unit: row.unit,
      catalogId: row.catalogId,
      categoryId: row.categoryId,
      active: row.active,
      images: row.images.map((im) => ({
        id: im.id,
        url: im.url,
        alt: im.alt,
        sortOrder: im.sortOrder,
      })),
      attributes: row.attributes.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type as CustomInputFieldType,
        required: a.required,
        options: a.options,
      })),
      asset3d: row.asset3d
        ? {
            id: row.asset3d.id,
            gltfUrl: row.asset3d.gltfUrl,
            thumbnailUrl: row.asset3d.thumbnailUrl,
            meta: row.asset3d.meta as Record<string, unknown> | null,
          }
        : null,
    };
  }
}
