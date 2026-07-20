import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { AuthTokensDto, UserDto } from '@webduct/shared';
import { UserRole } from '@webduct/shared';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<AuthTokensDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id, user.email, user.role as UserRole);
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'change-me-refresh'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }
    return this.issueTokens(user.id, user.email, user.role as UserRole);
  }

  async me(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return this.toUserDto(user);
  }

  private async issueTokens(
    id: string,
    email: string,
    role: UserRole,
  ): Promise<AuthTokensDto> {
    const payload: JwtPayload = { sub: id, email, role };
    const accessToken = await this.jwt.signAsync({ ...payload }, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET', 'change-me-access'),
      expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '900s'),
    } as Record<string, unknown>);
    const refreshToken = await this.jwt.signAsync({ ...payload }, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET', 'change-me-refresh'),
      expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '7d'),
    } as Record<string, unknown>);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return { accessToken, refreshToken, user: this.toUserDto(user) };
  }

  private toUserDto(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    userGroupId: string | null;
  }): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      userGroupId: user.userGroupId,
    };
  }
}
