import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { OrderDto, OrderSummaryDto, OrderValidationResultDto } from '@webduct/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('validate')
  validate(@Body() dto: CreateOrderDto): OrderValidationResultDto {
    return this.orders.validate(dto);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderDto> {
    return this.orders.create(user.id, dto);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<OrderDto> {
    return this.orders.findOne(user.id, id);
  }

  @Get(':id/summary')
  summary(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<OrderSummaryDto> {
    return this.orders.summary(user.id, id);
  }
}
