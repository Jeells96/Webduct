import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CatalogController } from '../catalog/catalog.controller';
import { CatalogService } from '../catalog/catalog.service';

@Module({
  controllers: [ProductsController, CatalogController],
  providers: [ProductsService, CatalogService],
  exports: [ProductsService],
})
export class ProductsModule {}
