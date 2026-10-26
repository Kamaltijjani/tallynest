# Tallynest

**Business books, made clear.** A multi-business bookkeeping web app by Kamal Tijjani.

[Open the live app](https://tallynest-business-books.honestbow64.chatgpt.site/)

## Features

- Separate business workspaces with account-scoped records.
- Inventory, purchases, sales and expenses.
- Receivables, payables and payment recording.
- Profit calculations separated from cash flow, with Nigerian naira formatting.
- Data backup and restore, responsive layouts and installable web-app assets.
- Better Auth email/password and Google authentication, database sessions and rate limits.

## Current status

The app is deployed on Sites using Cloudflare Workers and D1. Google credentials are configured and the redirect to Google's sign-in screen has been verified; a complete production sign-in/account-creation round trip has not yet been verified. Email/password registration and password-reset delivery remain unavailable until a Resend sending domain and credentials are configured. Existing email users can sign in.

Ten local tests cover bookkeeping calculations, authentication availability and a memory-backed account lifecycle. These tests do not prove production email delivery or Google account creation. This is an actively developed project, not a certified accounting or tax product.

## Stack

React · TypeScript · Vinext · Vite · Cloudflare Workers · Cloudflare D1 · Drizzle ORM · Better Auth · Resend

## Development

Use Node.js 22.13 or later and the pnpm version specified in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm build
node --experimental-strip-types --test tests/auth-availability.test.mjs tests/auth.test.mjs tests/books.test.mjs
```

The build generates `dist/server/wrangler.json`. For a new local database, apply the migrations in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_shocking_red_wolf.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_lying_hobgoblin.sql
pnpm start
```

Configure server environment values using the key names in `.env.example`. Local Wrangler secrets belong in an ignored `.dev.vars` file; production secrets belong in the hosting environment. Set `BETTER_AUTH_URL` to the actual origin used by your deployment and register its `/api/auth/callback/google` URL in Google Cloud.

This repository preserves the Sites runtime integration. Independent hosting needs its own D1 database and deployment configuration. The original Site's project identity, runtime secrets, user records and database files are not included. The `/legacy` route relies on Sites-provided ChatGPT identity and is not a standalone authentication service.

See [AUTH_SETUP.md](AUTH_SETUP.md) for provider configuration and [STARTER.md](STARTER.md) for the retained runtime guidance.

## Security

Never commit API keys, OAuth client secrets, local environment files, database exports or user records. Email verification remains required for email/password signup. Automatic account linking by matching email is disabled. Authentication and ownership checks must remain server-side.
