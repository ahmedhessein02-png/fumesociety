# Activate secure owner login

The footer opens `/dashboard/` (English) or `/ar/dashboard/` (Arabic). The login UI can be served by GitHub Pages, but authentication and database storage require the Cloudflare Worker backend in this repository. No account or password has been created in production.

The implementation follows Nagi Book Store's server-side approach: PBKDF2 password hashes, secure HttpOnly cookies, database sessions, login throttling and same-origin mutation checks. It does not share Nagi credentials or customer data.

## Deployment (keep GitHub Pages for the storefront)

1. Add the domain to your Cloudflare account if needed. Keep its existing GitHub Pages DNS target; the hostname must be proxied through Cloudflare so a Worker route can handle `/api/*`. Verify GitHub Pages HTTPS remains healthy.
2. Create a D1 database dedicated to FumeSociety. Execute `server/schema.sql` in its SQL console.
3. Copy `server/wrangler.example.json` to `server/wrangler.local.json`, replacing the database ID with the real D1 database ID. The route handles only `fumesociety.com/api/*`; the storefront remains on GitHub Pages. If you use a www hostname, add an equivalent route for it.
4. Choose an owner username and a unique password of at least 16 characters. Supply JSON `{ "username": "your-name", "password": "your-private-password" }` through stdin to `node server/create-admin.mjs` using a secure local input method. Store its generated JSON as encrypted Worker secret `FUME_ADMIN`, using the Cloudflare dashboard or `npx wrangler secret put FUME_ADMIN --config server/wrangler.local.json`. Never commit the input or output. A new generated secret invalidates old sessions.
5. Deploy the Worker using `npx wrangler deploy --config server/wrangler.local.json` with the authorized Cloudflare account. Bindings are configured by the file. Check the secret exists before testing login. For staging use a separate Worker route and database first.
6. Verify HTTPS login, logout, incorrect password, and that `/api/admin/orders` returns 401 without a valid cookie. Submit one clearly labeled test checkout, confirm it appears, and remove that test record from D1 afterwards.

Alternatively the `functions/` entry point can run under Cloudflare Pages with a `DB` binding and the same secret; this repository's large static export may require a higher asset allowance. The Worker route avoids migrating those assets. Cloudflare documentation: https://developers.cloudflare.com/workers/configuration/routing/routes/ and https://developers.cloudflare.com/pages/functions/bindings/.

Checkout already posts to `/api/orders` as well as opening WhatsApp. The new handler saves new requests, with an idempotent reference, when the backend is active. Historic WhatsApp messages cannot be imported by this code. Existing checkout opens WhatsApp independently of database availability; saving a request does not confirm payment or message delivery. No payment amount supplied by a visitor is treated as authoritative. The inbox displays product identifiers, sizes and quantities for manual confirmation.

Orders are accessible only through authenticated `/api/admin/orders`, in pages of 100. The HTML login shell is intentionally public and contains no customer records. Credentials are never checked in frontend JavaScript. Sessions expire after 12 hours. Login allows 10 attempts per IP per 15-minute window; orders allow 30 per IP per window. For a busy public shop add edge bot controls. Back up D1 before future changes.

Run integration tests with `node --test server/admin.test.mjs` (Node 22+). These exercise the real SQL statements through an in-memory SQLite adapter, not production customer data. No Cloudflare deployment or domain change is performed by these tests.
