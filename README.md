# Webduct

A full-parity, from-scratch rebuild of the **Buildcentrix Webduct ordering UI** —
a B2B ordering platform for HVAC / sheet-metal ductwork fabrication.

This repository reproduces every workflow observed in the original
`ordering-ui` single-page app: the multi-section **submit-order wizard**,
**product/catalog management**, the **cart**, and the **3D part viewer** — with
a clean, modern, fully-owned backend.

## Architecture

Monorepo (npm workspaces):

| Package | Path | Stack |
| --- | --- | --- |
| `@webduct/web` | `apps/web` | Angular 17 (standalone) + Angular Material (deep-purple `#673ab7` theme), CKEditor 5, ng-select, Three.js, moment, Transloco. Hash routing (`#!/main/order`) mirrors the original. |
| `@webduct/api` | `apps/api` | NestJS + class-validator, Prisma + PostgreSQL, JWT/Passport auth. |
| `@webduct/shared` | `libs/shared` | Enums, DTO shapes, and validation constants — the single source of truth shared by frontend and backend. |

## Prerequisites

- Node 20+ / npm 10+
- PostgreSQL 14+ (Phase 1+)
- An S3-compatible store such as MinIO (Phase 3+, for attachments/images)

## Getting started

```bash
npm install
npm --workspace @webduct/shared run build   # build shared types/enums first

# API
cp apps/api/.env.example apps/api/.env        # set DATABASE_URL, JWT secrets
npm run prisma:migrate                        # Phase 1+
npm run prisma:seed                           # Phase 1+

# Run both apps (api :3000, web :4200 with /api proxy → :3000)
npm run dev
```

Open <http://localhost:4200/#!/main/order>.

## Demo login

Seeded users (password `password123`): `admin@webduct.test` (admin),
`foreman@webduct.test`, `measurer@webduct.test`.

## What's implemented

The full ordering workflow is built and verified end-to-end:

- **Auth** — JWT login/refresh, route guard, role-based admin actions.
- **Catalog / manage-product** — simple & configurable products, CKEditor
  descriptions, dynamic attributes, images, catalogs/categories.
- **Cart** — line items, quantity editing, live count/price/weight totals.
- **Submit-order wizard** — job, order details, dates, shipping (with
  delivery-window validation), instructions (CKEditor), dynamic custom form,
  notifications (email/user/crew with uniqueness + ≤255 email), and attachments
  (size/type-limited uploads). Converts the cart into an order.
- **Complete-order** — confirmation with order number and pricing/delivery
  messages.
- **3D viewer** — Three.js/WebGL duct preview with orbit controls.
- **Hardening** — server-side HTML sanitization (DOMPurify), shared client/server
  validation constants, and a committed end-to-end smoke test
  (`node tests/e2e/smoke.mjs`).

## Testing

```bash
# with the API + web dev servers running and the DB seeded:
node tests/e2e/smoke.mjs
```

## Provenance

Rebuilt by reverse-engineering the **publicly served static assets** of the
original app (component selectors, enums, i18n keys, framework fingerprints).
No original source code, backend, or authenticated data was used; the data model
and API are an independent clean-room design inferred from the UI structure.
