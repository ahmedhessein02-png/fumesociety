# Owner dashboard (static deployment)

This repository contains exported Next.js output, not the application source or an order database. `/dashboard/` and `/ar/dashboard/` are standalone public status pages. They intentionally do not show an order count of zero or expose customer data.

Checkout opens a WhatsApp message for +964 750 893 7745 with an FS- reference. It also attempts POST /api/orders; the deployed endpoint returned HTTP 404 during inspection on 2026-10-24 (Baghdad). No orders were submitted during verification. WhatsApp receipt and historical order totals cannot be verified from GitHub.

`owner-footer.js` is appended to the shared 3s6nzrbk-8mnv.js chunk in each locale. It adds one footer link after hydration and client navigation. Full-document links load the standalone dashboard rather than the stale Next.js RSC placeholder. This small compatibility patch is necessary because no source project is present. A future fresh export will overwrite it: integrate the link into the original Footer component and the dashboard into the source project when available.

A real private order inbox requires a server/database and server-side owner authentication. Do not store passwords, customer orders, or API secrets in this public repository. Obtain the existing Node.js order host and authorized access before claiming to retrieve earlier records.
