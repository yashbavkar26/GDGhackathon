# CropGuard SQL Dashboard API

This service stores frontend dashboard scan results in a SQL database (SQLite).

## Tech

- Node.js + Express
- SQLite (`sqlite3` + `sqlite`)

## Setup

1. Copy `.env.example` to `.env`
2. Install dependencies:

```bash
npm install
```

3. Start the API:

```bash
npm start
```

By default, API runs on `http://localhost:5050` and creates DB file at:

- `./data/cropguard_dashboard.db`

## Endpoints

- `GET /health`
- `POST /api/results` (store a scan result from Flutter dashboard)
- `GET /api/results` (fetch all saved dashboard scan results)

## Flutter Integration

The Flutter app is configured to call:

- `http://10.140.93.83:5050/api/results`

Update `_dashboardSqlApiBaseUrl` in `lib/main.dart` if your backend host differs.
