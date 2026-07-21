/**
 * Validation constants — encoded ONCE here and consumed by both the Angular
 * reactive-form validators and the NestJS DTO validators, so client and server
 * rules can never drift. Values mirror rules observed in the original bundle
 * (e.g. notification email max length 255).
 */

/** Maximum length of a notification email address (original: MAX_EMAIL_LENGTH). */
export const MAX_EMAIL_LENGTH = 255;

/** Attachment upload limits. */
export const ATTACHMENT_LIMITS = {
  /** Maximum size of a single file, in bytes (25 MB). */
  maxFileSizeBytes: 25 * 1024 * 1024,
  /** Maximum number of attachments per order. */
  maxFileCount: 20,
  /** Allowed MIME types for order attachments. */
  allowedMimeTypes: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/dxf',
    'image/vnd.dxf',
    'text/plain',
  ] as const,
} as const;

/** Product image upload limits. */
export const PRODUCT_IMAGE_LIMITS = {
  maxFileSizeBytes: 10 * 1024 * 1024,
  maxImageCount: 12,
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'] as const,
} as const;

/** Free-text length caps used across forms. */
export const TEXT_LIMITS = {
  shortText: 255,
  richText: 20000,
  instructions: 20000,
  note: 1000,
} as const;
