import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type {
  CrewDto,
  CustomFieldDefDto,
  JobDto,
  UserDto,
  UserGroupDto,
} from '@webduct/shared';
import {
  CustomInputFieldType,
  ShippingOption,
  UserRole,
} from '@webduct/shared';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class LookupsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('jobs')
  async jobs(): Promise<JobDto[]> {
    const rows = await this.prisma.job.findMany({
      include: { address: true },
      orderBy: { number: 'asc' },
    });
    return rows.map((j) => ({
      id: j.id,
      name: j.name,
      number: j.number,
      phase: j.phase,
      address: j.address
        ? {
            id: j.address.id,
            name: j.address.name ?? undefined,
            line1: j.address.line1,
            line2: j.address.line2 ?? undefined,
            city: j.address.city,
            region: j.address.region,
            postal: j.address.postal,
            country: j.address.country,
            phone: j.address.phone ?? undefined,
            instructions: j.address.instructions ?? undefined,
          }
        : null,
    }));
  }

  @Get('users')
  async users(@Query('role') role?: string): Promise<UserDto[]> {
    const rows = await this.prisma.user.findMany({
      where: { active: true, role: role ? (role as UserRole) : undefined },
      orderBy: { name: 'asc' },
    });
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as UserRole,
      userGroupId: u.userGroupId,
    }));
  }

  @Get('user-groups')
  async userGroups(): Promise<UserGroupDto[]> {
    const rows = await this.prisma.userGroup.findMany({ orderBy: { name: 'asc' } });
    return rows.map((g) => ({ id: g.id, name: g.name }));
  }

  @Get('crews')
  async crews(): Promise<CrewDto[]> {
    const rows = await this.prisma.crew.findMany({ orderBy: { name: 'asc' } });
    return rows.map((c) => ({ id: c.id, name: c.name }));
  }

  @Get('shipping-options')
  shippingOptions(): { value: ShippingOption; label: string }[] {
    return Object.values(ShippingOption).map((v) => ({
      value: v,
      label: v
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    }));
  }

  @Get('custom-fields')
  async customFields(
    @Query('scope') scope = 'ORDER',
  ): Promise<CustomFieldDefDto[]> {
    const rows = await this.prisma.customFieldDef.findMany({
      where: { scope },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((f) => ({
      id: f.id,
      label: f.label,
      type: f.type as CustomInputFieldType,
      required: f.required,
      options: f.options,
      sortOrder: f.sortOrder,
    }));
  }
}
