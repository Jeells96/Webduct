/**
 * Domain enums — single source of truth shared by the Angular frontend and the
 * NestJS backend. Names mirror the enums observed in the original Webduct
 * ordering-ui bundle (EOrderShippingOptions, ECustomInputFieldType,
 * EOrderNotificationsType, product override-type).
 */

/** Shipping / fulfillment method for an order (original: EOrderShippingOptions). */
export enum ShippingOption {
  Standard = 'STANDARD',
  Pickup = 'PICKUP',
  Delivery = 'DELIVERY',
  Freight = 'FREIGHT',
  WillCall = 'WILL_CALL',
}

/** Recipient target type for order notifications (original: EOrderNotificationsType). */
export enum NotificationType {
  Email = 'EMAIL',
  User = 'USER',
  Crew = 'CREW',
}

/** Input types available to dynamic custom form fields (original: ECustomInputFieldType). */
export enum CustomInputFieldType {
  Text = 'TEXT',
  TextArea = 'TEXTAREA',
  Number = 'NUMBER',
  Date = 'DATE',
  Select = 'SELECT',
  MultiSelect = 'MULTISELECT',
  Boolean = 'BOOLEAN',
}

/** Whether a product is a plain item or one configured through attributes. */
export enum ProductType {
  Simple = 'SIMPLE',
  WithAttributes = 'WITH_ATTRIBUTES',
}

/** Product override-type field observed in manage-product. */
export enum ProductOverrideType {
  None = 'NONE',
  Price = 'PRICE',
  Weight = 'WEIGHT',
  PriceAndWeight = 'PRICE_AND_WEIGHT',
}

/** User roles for auth / recipient resolution. */
export enum UserRole {
  User = 'USER',
  Crew = 'CREW',
  Admin = 'ADMIN',
}

/** Lifecycle status of an order. */
export enum OrderStatus {
  Draft = 'DRAFT',
  Submitted = 'SUBMITTED',
  InProduction = 'IN_PRODUCTION',
  Shipped = 'SHIPPED',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

/** Lifecycle status of a cart. */
export enum CartStatus {
  Active = 'ACTIVE',
  Converted = 'CONVERTED',
}
