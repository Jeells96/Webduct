import {
  IsArray,
  IsEmail,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  Allow,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MAX_EMAIL_LENGTH,
  NotificationType,
  ShippingOption,
} from '@webduct/shared';

export class NotificationRecipientInput {
  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  email?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  crewId?: string;
}

export class CustomFieldValueInput {
  @IsString()
  defId!: string;

  @Allow()
  value!: unknown;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  poNumber?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  measuredById?: string;

  @IsOptional()
  @IsString()
  orderedForId?: string;

  @IsOptional()
  @IsString()
  userGroupId?: string;

  @IsOptional()
  @IsISO8601()
  orderedDate?: string;

  @IsOptional()
  @IsISO8601()
  requestedDate?: string;

  @IsEnum(ShippingOption)
  shippingOption!: ShippingOption;

  @IsOptional()
  @IsISO8601()
  deliveryWindowStart?: string;

  @IsOptional()
  @IsISO8601()
  deliveryWindowEnd?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationRecipientInput)
  notifications?: NotificationRecipientInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldValueInput)
  customFields?: CustomFieldValueInput[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];
}
