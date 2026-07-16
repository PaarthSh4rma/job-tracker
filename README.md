![CI](https://github.com/PaarthSh4rma/job-tracker/actions/workflows/ci.yml/badge.svg)
# Job Tracker (Full Stack)

Live App: https://job-tracker-eosin-one.vercel.app/ 

API Docs: https://job-tracker-tzb6.onrender.com/docs

## Features
- Create / read / update / delete job applications
- Status updates (Applied → Interview → Offer → Rejected)
- Deployed full stack (Vercel + Render)
- CI pipeline (GitHub Actions)

Authenticated application CRUD runs directly from the React client through
Supabase PostgREST. Supabase Row Level Security is the ownership boundary. The
FastAPI service intentionally exposes health endpoints only; it does not provide
a second, unauthenticated CRUD surface.

## Tech Stack
- Frontend: React (Vite) + Tailwind CSS
- Backend: FastAPI + SQLAlchemy
- Database: Supabase Postgres (Transaction Pooler)
- Deploy: Vercel (web), Render (api)

## Local Development

### Backend
```
cd api
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# create api/.env with DATABASE_URL=...
# optionally set CORS_ORIGINS as a comma-separated list
uvicorn app.main:app --reload
```

If an existing macOS virtual environment contains wheels for the wrong CPU
architecture, rebuild it rather than copying or selectively reusing it:

```sh
cd api
python3.11 -m venv --clear .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

Run backend tests with:

```sh
cd api
pip install -r requirements-dev.txt
pytest
```

### Frontend
```
cd web
npm install
# create web/.env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Only the public Supabase anon key belongs in the frontend environment. Never
place a Supabase service-role key, database password, or JWT secret in `web/`.

## API health endpoints

- `GET /health` checks that the API process is running.
- `GET /health/database` runs `select 1` and returns HTTP 503 with a sanitized
  response when PostgreSQL cannot be reached.

The scheduled database keep-alive workflow calls `/health/database` through the
GitHub secret `HEALTHCHECK_URL`. The secret must contain the complete endpoint
URL.

## Supabase migration

Review and apply migrations from `supabase/migrations/` in filename order. The
Milestone 2 migration adds the extended application model, copies legacy
`applied_date` and `link` values into `application_date` and `job_url`, adds the
database `updated_at` trigger, and replaces broad policies with explicit
authenticated-owner RLS policies.

Legacy rows without a `user_id` are preserved and remain invisible. See
`supabase/README.md` for the manual reconciliation procedure. Never assign a
legacy row to a user unless ownership can be proven.
