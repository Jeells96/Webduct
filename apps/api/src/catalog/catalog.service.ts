import { Injectable } from '@nestjs/common';
import type { CatalogDto, CategoryDto } from '@webduct/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async catalogs(): Promise<CatalogDto[]> {
    const rows = await this.prisma.catalog.findMany({ orderBy: { name: 'asc' } });
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      active: c.active,
    }));
  }

  async categories(catalogId?: string): Promise<CategoryDto[]> {
    const rows = await this.prisma.category.findMany({
      where: { catalogId },
      orderBy: { name: 'asc' },
    });
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      parentId: c.parentId,
      catalogId: c.catalogId,
    }));
  }
}
