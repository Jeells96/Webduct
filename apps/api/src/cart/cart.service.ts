import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { CartDto, CartItemDto, CartSummaryDto } from '@webduct/shared';
import { CartStatus, ProductOverrideType, ProductType } from '@webduct/shared';
import { PrismaService } from '../prisma/prisma.service';

const CART_INCLUDE = {
  items: { include: { product: true }, orderBy: { id: 'asc' } },
} satisfies Prisma.CartInclude;

type CartRow = Prisma.CartGetPayload<{ include: typeof CART_INCLUDE }>;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the user's active cart, creating one if needed. */
  async getActiveCart(userId: string): Promise<CartRow> {
    const existing = await this.prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: CART_INCLUDE,
    });
    if (existing) {
      return existing;
    }
    return this.prisma.cart.create({
      data: { userId, status: 'ACTIVE' },
      include: CART_INCLUDE,
    });
  }

  async get(userId: string): Promise<CartDto> {
    return this.toDto(await this.getActiveCart(userId));
  }

  async addItem(
    userId: string,
    productId: string,
    qty: number,
    selectedAttributes: Record<string, unknown>,
  ): Promise<CartDto> {
    const cart = await this.getActiveCart(userId);
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        qty,
        unitPrice: product.basePrice,
        unitWeight: product.weight,
        selectedAttributes: selectedAttributes as Prisma.InputJsonValue,
      },
    });
    return this.get(userId);
  }

  async updateItem(userId: string, itemId: string, qty: number): Promise<CartDto> {
    const cart = await this.getActiveCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    await this.prisma.cartItem.update({ where: { id: itemId }, data: { qty } });
    return this.get(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<CartDto> {
    const cart = await this.getActiveCart(userId);
    await this.prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });
    return this.get(userId);
  }

  summarize(cart: CartRow): CartSummaryDto {
    let count = 0;
    let price = 0;
    let weight = 0;
    for (const item of cart.items) {
      count += item.qty;
      price += Number(item.unitPrice) * item.qty;
      weight += Number(item.unitWeight) * item.qty;
    }
    return {
      count,
      price: Math.round(price * 100) / 100,
      weight: Math.round(weight * 1000) / 1000,
    };
  }

  private toDto(cart: CartRow): CartDto {
    const items: CartItemDto[] = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: {
        id: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        description: item.product.description,
        type: item.product.type as ProductType,
        installable: item.product.installable,
        overrideType: item.product.overrideType as ProductOverrideType,
        basePrice: Number(item.product.basePrice),
        weight: Number(item.product.weight),
        unit: item.product.unit,
        catalogId: item.product.catalogId,
        categoryId: item.product.categoryId,
        images: [],
        attributes: [],
        active: item.product.active,
      },
      qty: item.qty,
      unitPrice: Number(item.unitPrice),
      unitWeight: Number(item.unitWeight),
      selectedAttributes: item.selectedAttributes as Record<string, unknown>,
      lineTotal: Math.round(Number(item.unitPrice) * item.qty * 100) / 100,
      lineWeight: Math.round(Number(item.unitWeight) * item.qty * 1000) / 1000,
    }));
    return {
      id: cart.id,
      status: cart.status as CartStatus,
      items,
      summary: this.summarize(cart),
    };
  }
}
