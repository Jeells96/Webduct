import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { CatalogDto, CategoryDto } from '@webduct/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CatalogService } from './catalog.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('catalogs')
  catalogs(): Promise<CatalogDto[]> {
    return this.catalog.catalogs();
  }

  @Get('categories')
  categories(@Query('catalogId') catalogId?: string): Promise<CategoryDto[]> {
    return this.catalog.categories(catalogId);
  }
}
