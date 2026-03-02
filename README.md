![CI](https://github.com/PaarthSh4rma/job-tracker/actions/workflows/ci.yml/badge.svg)
# Job Tracker (Full Stack)

Live App: https://job-tracker-eosin-one.vercel.app/ 

API Docs: https://job-tracker-tzb6.onrender.com/docs

## Features
- Create / read / update / delete job applications
- Status updates (Applied → Interview → Offer → Rejected)
- Deployed full stack (Vercel + Render)
- CI pipeline (GitHub Actions)

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
uvicorn app.main:app --reload
```

### Frontend
```
cd web
npm install
# create web/.env with VITE_API_BASE_URL=http://127.0.0.1:8000
npm run dev
```
