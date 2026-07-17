# Trackline frontend

The Trackline frontend is a React 19 and Vite application styled with Tailwind
CSS. It communicates directly with Supabase PostgREST using the authenticated
user session; application ownership is enforced by database RLS.

## Environment

Create `.env` with:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Only the public anon key belongs in this environment. Never add a service-role
key, database password, or JWT secret.

## Commands

```sh
npm install
npm run dev
npm run lint
npm test
npm run build
```

## Frontend architecture

- `src/components/ui/` contains the token-driven UI primitives.
- `src/features/appearance/` owns light, dark, and system theme selection.
- `src/features/applications/` owns CRUD, workspace state, list, and pipeline.
- `src/features/insights/` contains pure current-state analytics calculations.
- `src/pages/` composes Overview and Analytics from the shared application data.

Analytics use each application's current stored status. They do not represent a
historical funnel because Trackline has no status-history data.
