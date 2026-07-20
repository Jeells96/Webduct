import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { LookupsController } from '../lookups/lookups.controller';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [CartModule],
  controllers: [OrdersController, LookupsController],
  providers: [OrdersService],
})
export class OrdersModule {}
