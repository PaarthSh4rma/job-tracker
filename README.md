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

## Analytics definitions

Dashboard and analytics values are calculated in the browser from the signed-in
user's application collection. The collection is loaded once through Supabase
PostgREST and remains protected by the existing owner-only RLS policies.

- **Total:** all application records in the authenticated user's collection.
- **Active:** current status is Saved, Applied, Screening, Interview, or Offer.
- **Closed:** current status is Rejected or Withdrawn.
- **Responses:** current status is Screening, Interview, Offer, or Rejected.
- **Interviews:** current status is Interview or Offer.
- **Offers, rejections, and withdrawn:** the count currently at that exact status.
- **Response rate:** responses divided by applications whose current status is
  beyond Saved.
- **Interview conversion:** applications currently at Interview or Offer divided
  by applications whose current status is beyond Saved.
- **Offer conversion:** applications currently at Offer divided by applications
  whose current status is beyond Saved.
- **Applications per week:** valid application dates counted in Monday-starting
  calendar weeks.
- **Average applications per active week:** dated applications divided by the
  number of calendar weeks containing at least one application.
- **Status, work-mode, and employment-type distributions:** exact counts for each
  centralized option value.
- **Source distribution and common roles:** non-empty values grouped
  case-insensitively, ordered by count and then label.
- **Recent applications:** the five records with the latest `created_at` values.
- **Follow-ups:** active applications grouped as overdue, due today, upcoming, or
  unscheduled by comparing `next_follow_up_date` with the user's local day.

Rates are reported as unavailable when their denominator is zero. These are
current-state summaries, not a historical funnel: an application is counted once
according to its current stored status because status-history data does not exist.

Weekly activity uses Monday-starting calendar weeks and only valid
`application_date` values. Date-only application and follow-up values are treated
as local calendar dates instead of UTC timestamps, preventing date changes around
timezone boundaries. Records without a valid application date remain in all
non-date metrics and are explicitly reported as excluded from weekly charts.
