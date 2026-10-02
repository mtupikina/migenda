# MiGenda

pnpm workspace: NestJS API, Vite + React web app, shared package.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm dev
```

- Web: http://localhost:5173 (React Router owns all paths except `/api/*`)
- API: http://localhost:3000/api — e.g. `GET /api/auth/me`

In dev, Vite proxies `/api` to the Nest server. In production, serve the SPA for app routes and reverse-proxy `/api` to Nest the same way.

OAuth redirect URIs (Google/GitHub apps) must use **`{WEB_ORIGIN}/api/auth/{google|github}/callback`** (e.g. `http://localhost:5173/api/auth/google/callback`).

Set **`BREVO_API_KEY`** and **`EMAIL_FROM`** (verified sender in Brevo) in `apps/api/.env` — see `.env.example`.

### Password reset email

- Sends via Brevo HTTP API (`POST /v3/smtp/email`) with `BREVO_API_KEY` and `EMAIL_FROM`.
- Works for **email + password** accounts only. Google/GitHub-only users sign in with OAuth.
- Check Brevo **Transactional → Logs** if mail does not arrive.
