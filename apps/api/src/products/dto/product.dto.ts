import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CustomInputFieldType,
  ProductOverrideType,
  ProductType,
} from '@webduct/shared';

export class ProductAttributeInput {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name!: string;

  @IsEnum(CustomInputFieldType)
  type!: CustomInputFieldType;

  @IsBoolean()
  required!: boolean;

  @IsArray()
  @IsString({ each: true })
  options!: string[];
}

export class CreateProductDto {
  @IsString()
  sku!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProductType)
  type!: ProductType;

  @IsBoolean()
  installable!: boolean;

  @IsEnum(ProductOverrideType)
  overrideType!: ProductOverrideType;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsNumber()
  @Min(0)
  weight!: number;

  @IsString()
  unit!: string;

  @IsString()
  catalogId!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeInput)
  attributes?: ProductAttributeInput[];
}

export class UpdateProductDto extends CreateProductDto {}
