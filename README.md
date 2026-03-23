# Literacy Leaders Community

A platform connecting literacy leaders across districts to share best practices, find mentors, and collaborate on reading initiatives.

## Tech Stack

- **Backend:** Django 4.2 + Django REST Framework
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Database:** PostgreSQL 16
- **Containerization:** Docker Compose

## Project Structure

```
literacy-leaders-community/
├── backend/          Django API server
│   ├── apps/         Django applications
│   │   ├── accounts/     User management & authentication
│   │   ├── districts/    School district profiles
│   │   ├── taxonomy/     Tags, categories, skill areas
│   │   ├── matching/     Mentor-mentee matching engine
│   │   └── messaging/    In-app messaging system
│   └── config/       Django project settings
├── frontend/         React single-page application
│   └── src/
│       ├── components/   Reusable UI components
│       ├── pages/        Route-level page components
│       ├── api/          API client and service layer
│       ├── hooks/        Custom React hooks
│       └── context/      React context providers
└── data/             Data files and seed scripts
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)

### Database Setup

```bash
docker compose up -d
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # edit with your settings
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173/`.

## Development

Run both the backend and frontend dev servers simultaneously. The Vite dev server proxies `/api` requests to the Django backend automatically.
