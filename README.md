# MiGenda

pnpm workspace: NestJS API, Vite + React web app, shared package.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3000 — `GET /auth/me`

Set **`BREVO_API_KEY`** and **`EMAIL_FROM`** (verified sender in Brevo) in `apps/api/.env` — see `.env.example`.

### Password reset email

- Sends via Brevo HTTP API (`POST /v3/smtp/email`) with `BREVO_API_KEY` and `EMAIL_FROM`.
- Works for **email + password** accounts only. Google/GitHub-only users sign in with OAuth.
- Check Brevo **Transactional → Logs** if mail does not arrive.
