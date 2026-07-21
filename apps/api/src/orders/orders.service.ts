import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import DOMPurify from 'isomorphic-dompurify';
import type {
  OrderDto,
  OrderSummaryDto,
  OrderValidationResultDto,
} from '@webduct/shared';
import { OrderStatus, ShippingOption } from '@webduct/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { validateOrder } from './order-validation';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
  ) {}

  validate(dto: CreateOrderDto): OrderValidationResultDto {
    const errors = validateOrder(dto);
    return { valid: Object.keys(errors).length === 0, errors };
  }

  async create(userId: string, dto: CreateOrderDto): Promise<OrderDto> {
    const errors = validateOrder(dto);
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({ message: 'Validation failed', errors });
    }

    const cart = await this.cart.getActiveCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    const summary = this.cart.summarize(cart);

    const number = await this.nextOrderNumber();
    const cleanInstructions = dto.instructions
      ? DOMPurify.sanitize(dto.instructions)
      : null;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          number,
          status: 'SUBMITTED',
          createdById: userId,
          cartId: cart.id,
          jobId: dto.jobId,
          poNumber: dto.poNumber,
          tag: dto.tag,
          measuredById: dto.measuredById,
          orderedForId: dto.orderedForId,
          userGroupId: dto.userGroupId,
          orderedDate: dto.orderedDate ? new Date(dto.orderedDate) : null,
          requestedDate: dto.requestedDate ? new Date(dto.requestedDate) : null,
          shippingOption: dto.shippingOption,
          instructions: cleanInstructions,
          totalCount: summary.count,
          totalPrice: new Prisma.Decimal(summary.price),
          totalWeight: new Prisma.Decimal(summary.weight),
          pricingMessage: `Estimated total ${summary.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} for ${summary.count} item(s).`,
          deliveryMessage: this.deliveryMessage(dto),
          lines: {
            create: cart.items.map((it) => ({
              productId: it.productId,
              qty: it.qty,
              unitPrice: it.unitPrice,
              unitWeight: it.unitWeight,
              lineTotal: new Prisma.Decimal(Number(it.unitPrice) * it.qty),
              lineWeight: new Prisma.Decimal(Number(it.unitWeight) * it.qty),
              selectedAttributes: it.selectedAttributes as Prisma.InputJsonValue,
            })),
          },
          shipment: {
            create: {
              shippingOption: dto.shippingOption,
              windowStart: dto.deliveryWindowStart
                ? new Date(dto.deliveryWindowStart)
                : null,
              windowEnd: dto.deliveryWindowEnd
                ? new Date(dto.deliveryWindowEnd)
                : null,
            },
          },
          notifications: dto.notifications?.length
            ? {
                create: dto.notifications.map((n) => ({
                  type: n.type,
                  email: n.email,
                  userId: n.userId,
                  crewId: n.crewId,
                })),
              }
            : undefined,
          customValues: dto.customFields?.length
            ? {
                create: dto.customFields.map((c) => ({
                  defId: c.defId,
                  value: c.value as Prisma.InputJsonValue,
                })),
              }
            : undefined,
        },
      });

      // Attach any uploaded attachments and mark the cart converted.
      if (dto.attachmentIds?.length) {
        await tx.attachment.updateMany({
          where: { id: { in: dto.attachmentIds } },
          data: { orderId: created.id },
        });
      }
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: 'CONVERTED' },
      });
      return created;
    });

    return this.findOne(userId, order.id);
  }

  async findOne(userId: string, id: string): Promise<OrderDto> {
    const order = await this.prisma.order.findFirst({
      where: { id, createdById: userId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return {
      id: order.id,
      number: order.number,
      status: order.status as OrderStatus,
      shippingOption: order.shippingOption as ShippingOption,
      summary: this.orderSummary(order),
      createdAt: order.createdAt.toISOString(),
    };
  }

  async summary(userId: string, id: string): Promise<OrderSummaryDto> {
    const order = await this.prisma.order.findFirst({
      where: { id, createdById: userId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.orderSummary(order);
  }

  private orderSummary(order: {
    totalCount: number;
    totalPrice: Prisma.Decimal;
    totalWeight: Prisma.Decimal;
    pricingMessage: string | null;
    deliveryMessage: string | null;
  }): OrderSummaryDto {
    return {
      count: order.totalCount,
      price: Number(order.totalPrice),
      weight: Number(order.totalWeight),
      pricingMessage: order.pricingMessage ?? undefined,
      deliveryMessage: order.deliveryMessage ?? undefined,
    };
  }

  private deliveryMessage(dto: CreateOrderDto): string {
    if (dto.shippingOption === ShippingOption.Pickup) {
      return 'Your order will be available for pickup once fabricated.';
    }
    if (dto.requestedDate) {
      const d = new Date(dto.requestedDate).toLocaleDateString('en-US');
      return `Requested delivery on or around ${d}.`;
    }
    return 'Delivery will be scheduled after fabrication.';
  }

  private async nextOrderNumber(): Promise<string> {
    const count = await this.prisma.order.count();
    const seq = (count + 1).toString().padStart(5, '0');
    return `WD-${seq}`;
  }
}
