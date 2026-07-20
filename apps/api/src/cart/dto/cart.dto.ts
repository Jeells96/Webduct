import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class AddCartItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  qty!: number;

  @IsOptional()
  @IsObject()
  selectedAttributes?: Record<string, unknown>;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  qty!: number;
}
