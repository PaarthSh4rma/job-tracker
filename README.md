![CI](https://github.com/PaarthSh4rma/trackline/actions/workflows/ci.yml/badge.svg)
# Trackline

Trackline is a private job-search workspace for managing applications,
follow-ups, pipeline status, and current-state analytics.

- [Live application](https://job-tracker-eosin-one.vercel.app/)
- [API documentation](https://job-tracker-tzb6.onrender.com/docs)

## Features

- Authenticated create, read, update, and delete flows
- Search, filters, sorting, list view, and accessible pipeline view
- Follow-up dates with overdue, due-today, and upcoming states
- Overview and analytics calculated from the signed-in user's records
- Light, dark, and system appearance preferences
- Keyboard shortcuts for application search (`/`) and creation (`N`)
- Responsive layouts for mobile, tablet, and desktop
- Vercel frontend, Render health service, and GitHub Actions CI

Authenticated application CRUD runs directly from the React client through
Supabase PostgREST. Supabase Row Level Security is the ownership boundary. The
FastAPI service intentionally exposes health endpoints only; it does not provide
a second, unauthenticated CRUD surface.

## Tech Stack

- Frontend: React (Vite) + Tailwind CSS
- Backend: FastAPI + SQLAlchemy
- Database: Supabase Postgres (Transaction Pooler)
- Deploy: Vercel (web), Render (api)

## Architecture

The React application owns the product experience and keeps one shared,
authenticated application collection synchronized across Overview,
Applications, Pipeline, and Analytics. Supabase PostgREST handles application
CRUD, while Row Level Security restricts each query and mutation to the record
owner. FastAPI is deliberately limited to process and database health checks.

The frontend uses a small token-based component system for surfaces, text,
borders, focus states, and light/dark appearance. No client-side analytics or
application data is sent to a separate reporting service.

## Screenshot readiness

The production UI is prepared for representative portfolio captures of:

- Overview on desktop
- Applications list and pipeline on desktop
- Analytics on desktop
- Application details drawer
- Mobile Applications
- Dark mode

Screenshots are intentionally not generated from fake production records.

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

```sh
cd web
npm install
# create web/.env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Validate the frontend with:

```sh
cd web
npm run lint
npm test
npm run build
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

## Security notes

- Application access requires a Supabase-authenticated session.
- Owner-only RLS remains the authorization boundary for every application row.
- Anonymous users cannot access the application table.
- The public frontend contains only the Supabase anon key. Service-role keys,
  database passwords, and JWT secrets must never be placed in `web/`.
- External job links are limited to `http` and `https` URLs and open with
  `noopener noreferrer`.

## Deployment notes

- Vercel builds the React application from `web/`.
- Render runs the FastAPI health service.
- `HEALTHCHECK_URL` powers the scheduled database keep-alive workflow.
- Supabase migrations are reviewed and applied separately; the frontend does
  not run migrations at startup.

## Limitations

- Analytics describe current stored status, not historical stage transitions.
- There is no status-history table, so conversion figures are not a cohort or
  time-to-stage funnel.
- Follow-ups are date-only reminders inside Trackline; the application does not
  send email, calendar, or push notifications.
- Legacy null-owned rows remain intentionally hidden pending manual ownership
  reconciliation.
