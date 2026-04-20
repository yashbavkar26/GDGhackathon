# Mock MongoDB Dummy Files

This folder contains a fake MongoDB setup with dummy models and seed data.

## Purpose

- Demo-only database layer
- Safe to use as sample code
- No dependency on existing app files

## Quick Start

1. Copy `.env.example` to `.env`
2. Update `MONGODB_URI`
3. Run:

```bash
npm install
npm run seed
```

## Folder Structure

- `src/config/db.js`: MongoDB connection helper
- `src/models/*.js`: Dummy Mongoose models
- `src/seed/dummyData.js`: Fake records
- `src/seed/seed.js`: Seeder script
