# Accessibility Monitor

A self-hosted app that runs weekly accessibility audits on your URLs using **cypress-axe** and presents results in a React dashboard.

## Quick Start (Development)

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Quick Start (Docker)

```bash
docker compose up --build
```

App available at http://localhost:3001

## Usage

1. Open the dashboard and click **Manage URLs**
2. Add URLs you want to monitor
3. Click **Run Now** to trigger an immediate audit
4. View violation counts per URL on the dashboard
5. Click a URL card to see the full violation table and trend chart

Weekly automated runs fire every **Monday at 08:00** via the built-in cron job.

## Project Structure

```
accessibility-monitor/
├── backend/
│   ├── src/              # Express API, DB, cron, Cypress runner
│   └── cypress/          # Cypress spec + config
├── frontend/
│   └── src/              # React + Vite app
└── data/                 # SQLite database (auto-created)
```

## Tech Stack

- **Backend**: Node.js, Express 5, SQLite (better-sqlite3), node-cron
- **Testing**: Cypress + cypress-axe (WCAG 2.0 AA + 2.1 AA)
- **Frontend**: React 19, Vite, React Router 7, Recharts, Tailwind CSS 4
