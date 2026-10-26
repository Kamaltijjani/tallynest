# Account system activation

Implemented: email/password signup and login, mandatory email verification, password reset with session revocation, Google OAuth, database-backed sessions and rate limiting, per-user business ownership. Passwords are handled by Better Auth 1.7.10. Automatic email-based account linking is disabled.

Production runtime configuration:
- BETTER_AUTH_URL: canonical HTTPS app URL (configured).
- BETTER_AUTH_SECRET: random server-only signing secret (configured securely in hosting).
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET: from an owner-controlled Google Cloud OAuth web application.
- RESEND_API_KEY: server-only Resend sending key.
- AUTH_EMAIL_FROM: an address on a verified sending domain, such as Tallynest <accounts@your-domain>.

Google authorized redirect URI for the current deployment:
https://tallynest-business-books.honestbow64.chatgpt.site/api/auth/callback/google

Do not paste secrets into chat or commit them. Store them using hosting environment secret settings. Verify the sending domain in Resend. Google consent configuration and publishing must permit the intended audience.

The Site is currently public (confirmed during the 25 October 2026 investigation). Application-level authentication still protects account records. No audience change was made during that investigation.

Current availability: Google credentials are configured and the redirect to Google has been verified. A complete production Google account round trip remains unverified. Email registration/reset are blocked until email provider settings are present. Existing books are preserved at /legacy and remain protected by their original platform identity. New accounts use a separate account-prefixed ownership identifier. Never migrate existing records just by matching an email address. To move existing books, export a backup from the old workspace and restore it into the verified new account.

Verification completed: production build; local memory-backed account flow covering signup, blocked unverified login, email verification, login/session, wrong password rejection, password reset, session revocation, reset-token replay rejection and sign-out; five bookkeeping calculation checks. Actual Google consent, external email delivery and production account roundtrip remain unverified until provider setup.

## Signup investigation — 25 October 2026

At the time of the initial investigation, production contained BETTER_AUTH_SECRET and BETTER_AUTH_URL only. RESEND_API_KEY and AUTH_EMAIL_FROM are absent, so the API deliberately returns 503 before creating an email account. Google credentials were subsequently configured and the redirect to Google was verified. This is a provider-configuration blocker, not evidence that live signup works.

Updated the account screens to name the specific unavailable operation, disable form fields when submission cannot succeed, and preserve email sign-in availability independently of Google. UI and API now share tested availability rules. Ten local tests pass, including the memory-adapter account lifecycle and bookkeeping checks. Browser checks cover the unavailable signup screen. Actual provider delivery and production account creation still require a configured sender and end-to-end verification.
