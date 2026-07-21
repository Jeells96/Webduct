import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { CartDto } from '@webduct/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  get(@CurrentUser() user: AuthUser): Promise<CartDto> {
    return this.cart.get(user.id);
  }

  @Post('items')
  addItem(
    @CurrentUser() user: AuthUser,
    @Body() dto: AddCartItemDto,
  ): Promise<CartDto> {
    return this.cart.addItem(
      user.id,
      dto.productId,
      dto.qty,
      dto.selectedAttributes ?? {},
    );
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartDto> {
    return this.cart.updateItem(user.id, id, dto.qty);
  }

  @Delete('items/:id')
  removeItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<CartDto> {
    return this.cart.removeItem(user.id, id);
  }
}
