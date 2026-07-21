/**
 * Transport interfaces (DTO shapes) shared between frontend and backend.
 * These describe the JSON crossing the API boundary; server-side class-validator
 * DTOs and Angular typed services both conform to these shapes.
 */
import {
  CartStatus,
  CustomInputFieldType,
  NotificationType,
  OrderStatus,
  ProductOverrideType,
  ProductType,
  ShippingOption,
  UserRole,
} from './enums';

export interface AddressDto {
  id?: string;
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  phone?: string;
  instructions?: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  userGroupId?: string | null;
}

export interface UserGroupDto {
  id: string;
  name: string;
}

export interface CrewDto {
  id: string;
  name: string;
}

export interface JobDto {
  id: string;
  name: string;
  number: string;
  phase?: string | null;
  address?: AddressDto | null;
}

export interface CatalogDto {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
}

export interface CategoryDto {
  id: string;
  name: string;
  parentId?: string | null;
  catalogId: string;
}

export interface ProductImageDto {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
}

export interface ProductAttributeDto {
  id?: string;
  name: string;
  type: CustomInputFieldType;
  required: boolean;
  options: string[];
}

export interface Product3DAssetDto {
  id: string;
  gltfUrl?: string | null;
  thumbnailUrl?: string | null;
  /** Procedural duct geometry parameters when no glTF asset exists. */
  meta?: Record<string, unknown> | null;
}

export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  type: ProductType;
  installable: boolean;
  overrideType: ProductOverrideType;
  basePrice: number;
  weight: number;
  unit: string;
  catalogId: string;
  categoryId?: string | null;
  images: ProductImageDto[];
  attributes: ProductAttributeDto[];
  asset3d?: Product3DAssetDto | null;
  active: boolean;
}

export interface CartItemDto {
  id: string;
  productId: string;
  product?: ProductDto;
  qty: number;
  unitPrice: number;
  unitWeight: number;
  selectedAttributes: Record<string, unknown>;
  lineTotal: number;
  lineWeight: number;
}

export interface CartSummaryDto {
  count: number;
  price: number;
  weight: number;
}

export interface CartDto {
  id: string;
  status: CartStatus;
  items: CartItemDto[];
  summary: CartSummaryDto;
}

export interface NotificationRecipientDto {
  type: NotificationType;
  email?: string;
  userId?: string;
  crewId?: string;
}

export interface CustomFieldDefDto {
  id: string;
  label: string;
  type: CustomInputFieldType;
  required: boolean;
  options: string[];
  sortOrder: number;
}

export interface CustomFieldValueDto {
  defId: string;
  value: unknown;
}

export interface AttachmentDto {
  id: string;
  filename: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  note?: string | null;
}

/** Payload assembled by the submit-order wizard. */
export interface CreateOrderDto {
  jobId?: string;
  job?: { name: string; number: string; phase?: string; address?: AddressDto };
  poNumber?: string;
  tag?: string;
  measuredById?: string;
  orderedForId?: string;
  userGroupId?: string;
  orderedDate?: string;
  requestedDate?: string;
  shippingOption: ShippingOption;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  instructions?: string;
  notifications: NotificationRecipientDto[];
  customFields: CustomFieldValueDto[];
  attachmentIds: string[];
}

export interface OrderSummaryDto {
  count: number;
  price: number;
  weight: number;
  pricingMessage?: string;
  deliveryMessage?: string;
}

export interface OrderDto {
  id: string;
  number: string;
  status: OrderStatus;
  shippingOption: ShippingOption;
  summary: OrderSummaryDto;
  createdAt: string;
}

/** Result of POST /orders/validate — per-section error map. */
export interface OrderValidationResultDto {
  valid: boolean;
  errors: Record<string, string[]>;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}
