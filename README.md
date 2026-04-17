# Literacy Leaders Community

A matching engine for district literacy leaders. Connects educators based on demographic similarity and shared problem statements — powered by real NCES data.

## Tech Stack

- **Backend:** Django 4.2 + Django REST Framework
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Database:** PostgreSQL 16
- **Containerization:** Docker Compose

## Features

- **District Explorer** — Browse 20 ingested NCES districts with enrollment, FRL%, and ELL% data. Filter by state, locale type, or search by name.
- **Problem Statement Taxonomy** — 15 curated literacy problem statements across 6 categories. Finite pre-set list used for matching.
- **User Registration & Profiles** — Users select their district and self-select problem statements during signup.
- **Matching Engine** — Composite scoring algorithm ranks members by shared problem statements, locale type, state, enrollment size similarity, FRL% similarity, and ELL% similarity.
- **Community Directory** — Browse all members or toggle to "My Matches" for algorithmic results. Sort by match score, shared statements, or district size.
- **Messaging** — Threaded one-to-one conversations initiated from match cards. Read tracking and conversation list.
- **Company-Side Moderation** — In-app moderation dashboard (moderator/admin role only). View all conversations, read full threads, send visually flagged moderation messages.

## Project Structure

```
literacy-leaders-community/
├── backend/              Django API server
│   ├── apps/
│   │   ├── accounts/     User management & authentication
│   │   ├── districts/    School district data & NCES ingestion
│   │   ├── taxonomy/     Problem statement categories & statements
│   │   ├── matching/     Matching algorithm & community directory
│   │   └── messaging/    Conversations & moderation
│   └── config/           Django settings
├── frontend/             React single-page application
│   └── src/
│       ├── pages/        Route-level components (DistrictExplorer, TaxonomyBrowser, Community, Messages, Moderation, etc.)
│       ├── api/          Axios API client
│       └── context/      Auth context provider
├── data/                 NCES sample CSV (20 districts)
└── docker-compose.yml
```

## Getting Started

### Quick Start (Docker — recommended)

```bash
docker compose up --build
```

This starts all three services:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:8000/api/
- **Database:** PostgreSQL on port 5432

On first run, the backend automatically:
1. Runs database migrations
2. Ingests NCES district data from `data/sample_nces_data.csv`
3. Seeds the problem statement taxonomy (6 categories, 15 statements)

### Create an Admin/Moderator User

```bash
# Create a Django superuser (for /admin access)
docker compose exec backend python manage.py createsuperuser

# Promote an existing user to moderator role (enables in-app Moderation page)
docker compose exec backend python manage.py shell -c \
  "from apps.accounts.models import User; u = User.objects.get(username='YOUR_USERNAME'); u.role = 'moderator'; u.save()"
```

### Demo Accounts

These accounts are created during the demo walkthrough or may be pre-seeded:

| Username | Password | Role | District |
|----------|----------|------|----------|
| `testuser` | `testpass123` | moderator | Los Angeles Unified (CA) |
| `sarah_chen` | `demo1234` | member | Chicago Public Schools (IL) |
| `marcus_j` | `demo1234` | member | Boston Public Schools (MA) |

### Reset Everything

```bash
docker compose down -v && docker compose up --build
```

This destroys all data (including user accounts) and re-seeds districts and taxonomy from scratch.

### Manual Setup (without Docker)

#### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 16

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # edit with your database settings
python manage.py migrate
python manage.py ingest_nces_data
python manage.py seed_taxonomy
python manage.py createsuperuser
python manage.py runserver
```

API available at `http://localhost:8000/api/`

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173/`

The Vite dev server proxies `/api` requests to the Django backend.

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/accounts/register/` | POST | User registration |
| `/api/accounts/login/` | POST | Authentication |
| `/api/accounts/logout/` | POST | End session |
| `/api/accounts/profile/` | GET, PATCH | View/update profile |
| `/api/accounts/me/` | GET | Current user check |
| `/api/districts/` | GET | List districts (filterable by state, locale_type) |
| `/api/districts/search/` | GET | Search districts by name |
| `/api/taxonomy/categories/` | GET | Problem statement categories with nested statements |
| `/api/taxonomy/statements/` | GET | All problem statements |
| `/api/matching/directory/` | GET | Community directory (all members) |
| `/api/matching/find/` | GET | Algorithmic matching (requires district + problem statements) |
| `/api/matching/saved/` | GET, POST, DELETE | Saved matches |
| `/api/messaging/conversations/` | GET, POST | List conversations / start new |
| `/api/messaging/conversations/<id>/` | GET, POST | View thread / send message |

## Matching Algorithm

The matching engine computes a composite score for each candidate:

| Factor | Points | Description |
|--------|--------|-------------|
| Shared problem statements | 3.0 each | Primary matching signal |
| Enrollment size similarity | 0–1.5 | Ratio of smaller/larger enrollment |
| FRL% similarity | 0–1.0 | 1 minus percentage-point difference / 100 |
| ELL% similarity | 0–1.0 | 1 minus percentage-point difference / 100 |
| Same locale type | 1.0 | Both urban, both rural, etc. |
| Same state | 0.5 | Geographic proximity bonus |

Results are sorted by composite score (highest first). Users must have a district and at least one problem statement selected to use matching.

## User Roles

| Role | Access |
|------|--------|
| `member` | Community directory, matching, messaging, profile |
| `moderator` | Everything above + Moderation page (view all conversations, send moderation messages) |
| `admin` | Everything above + Django admin panel |
