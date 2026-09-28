# Usman Laser Eye Clinic — Patient Registration & Token Management System

A MERN (MongoDB, Express, React, Node) app for clinic reception and doctor workflows:

- **Receptionist**: search for existing patients or register new ones (no duplicates), and issue a daily queue token for each visit.
- **Doctor**: see today's patient queue in token order, advance each patient's status, and open full patient details during consultation.

## Prerequisites

- Node.js (v18+)
- A local MongoDB instance running on `mongodb://127.0.0.1:27017` (default port)

## Project layout

```
server/   Express API (MongoDB via Mongoose)
client/   React app (Vite + Tailwind CSS)
```

## Setup

1. Install dependencies (from the project root):

   ```bash
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

2. Configure environment variables:

   - `server/.env` — copy `server/.env.example` and adjust if needed (Mongo URI, JWT secret, seed credentials).
   - `client/.env` — already set to `VITE_API_BASE_URL=http://localhost:5000/api` for local dev.

3. Make sure MongoDB is running locally, then seed the receptionist and doctor accounts:

   ```bash
   npm run seed
   ```

   Default credentials (override via `server/.env` before seeding):

   | Role         | Username      | Password        |
   |--------------|---------------|-----------------|
   | Receptionist | `receptionist`| `Reception@123` |
   | Doctor       | `doctor`      | `Doctor@123`    |

   There is no in-app password change/reset in v1 — to change a password, update the env vars and re-run `npm run seed` after removing the corresponding user document from MongoDB.

## Running

From the project root, start both server and client together:

```bash
npm run dev
```

- API: http://localhost:5000 (health check at `/api/health`)
- App: http://localhost:5173

Or run each independently:

```bash
npm --prefix server run dev
npm --prefix client run dev
```

## How it works

- **MR Numbers** (e.g. `MR-000001`) are permanent and unique per patient, generated atomically on first registration — searching by name, phone, or MR number lets reception reuse an existing record instead of creating a duplicate.
- **Token numbers** reset daily and start at 1, generated atomically per calendar day so concurrent requests never collide or skip a number.
- Every token is linked to a patient and shows up immediately on the doctor's dashboard for the current date, sorted by token number, with a status of `waiting` → `in-progress` → `done`.
