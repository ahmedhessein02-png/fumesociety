# Owner dashboard (static deployment)

This repository contains exported Next.js output, not the application source or an order database. `/dashboard/` and `/ar/dashboard/` are standalone owner sign-in pages. Private order records are fetched only after server authentication. See `server/README.md` for backend activation.

Checkout opens a WhatsApp message for +964 750 893 7745 with an FS- reference. It also attempts POST /api/orders; the deployed endpoint returned HTTP 404 during inspection on 2026-10-24 (Baghdad). No orders were submitted during verification. WhatsApp receipt and historical order totals cannot be verified from GitHub.

`owner-footer.js` is appended to the shared 3s6nzrbk-8mnv.js chunk in each locale. It adds one footer link after hydration and client navigation. Full-document links load the standalone dashboard rather than the stale Next.js RSC placeholder. This small compatibility patch is necessary because no source project is present. A future fresh export will overwrite it: integrate the link into the original Footer component and the dashboard into the source project when available.

The private order inbox now has a server implementation under `functions/`, with D1 schema and setup instructions under `server/`; production activation is still required. Do not store passwords, customer orders, or API secrets in this public repository. Obtain the existing Node.js order host and authorized access before claiming to retrieve earlier records.

## Owner workspace v3

The authenticated dashboard at `/dashboard/` now manages website orders, product records, image uploads, visibility and per-product discounts. USD is the existing storefront currency; discounts apply to every size. Delivery remains separately confirmed.

`server/catalog-base.mjs` is the catalogue extracted from the existing product RSC exports (1,654 unique products). D1 `products` holds overrides and new records; `product_images` stores optimized JPEG/PNG/WebP images. These additive tables are initialized automatically, preserving existing orders and sessions. Admin credentials still use the existing `FUME_ADMIN` secret.

`maintenance/catalog-runtime.js` is appended to the English and Arabic shared format chunks and registers module 990001. Product cards, listing and purchase modules use its React hooks for current product data. Edited and new product details use `/shop/?product=<id>`. Search uses `/api/shop`; bag refresh uses `/api/bag`. If regenerating the Next export, port these integrations into the source components rather than overwriting the patched export.

Checkout awaits `/api/orders` before clearing the bag or showing confirmation. WhatsApp is a separate optional link. The API resolves product names, sizes and prices server-side; rejects hidden products and stale submitted prices; saves an immutable price snapshot and deduplicates retries by reference. No order is recorded just from visiting or filling in a form.

Run `node --test server/*.test.mjs` on Node 24. Tests cover authentication, CSRF, throttle, product/discount validation, image access, order snapshots, retry deduplication, statuses, and English/Arabic checkout failure and success.
