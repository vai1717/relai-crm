# RelAI CRM 

A lightweight internal CRM for capturing leads, tracking follow-ups, adding notes, and viewing interaction history.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Backend | Node.js + Express |
| Database | SQLite (via `better-sqlite3`) |
| Auth | JWT (email + password, bcrypt) |
| API Protection | `x-api-key` header |

---

## Project Structure

```
relai task/
├── backend/          # Express + SQLite backend (port 4000)
│   ├── routes/
│   │   ├── auth.js   # POST /auth/login, /auth/register
│   │   ├── leads.js  # CRUD /api/leads
│   │   ├── notes.js  # /api/leads/:id/notes
│   │   └── export.js # GET /api/export (CSV)
│   ├── middleware/
│   │   └── auth.js   # JWT + x-api-key middleware
│   ├── db.js         # SQLite schema + connection
│   ├── server.js     # Express app entry point
│   └── .env
└── crm-app/          # Next.js frontend (port 3000)
    ├── app/
    │   ├── login/    # Auth page
    │   └── (dashboard)/leads/
    │       ├── page.jsx        # Leads list
    │       ├── new/page.jsx    # Create lead
    │       └── [id]/page.jsx   # Lead detail + notes
    ├── lib/
    │   ├── api.js    # Centralized API client (JWT)
    │   └── utils.js  # Formatters
    └── .env.local
```

---

## Setup Instructions

### 1. Clone / Open the project

```bash
cd "relai task"
```

### 2. Start the Backend

```bash
cd backend
npm install
npm start
# Server runs on http://localhost:4000
```

The SQLite database (`crm.db`) is created automatically on first run.

### 3. Start the Frontend

```bash
cd crm-app
npm install
npm run dev
# App runs on http://localhost:3000
```

### 4. Environment Variables

#### `backend/.env`
```
JWT_SECRET=supersecret_crm_jwt_key_change_in_production
API_SECRET_KEY=my_secret_key
PORT=4000
```

#### `crm-app/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_KEY=my_secret_key
```

### 5. Create your first account

Visit `http://localhost:3000/login`, click **Register**, and create an account.  
Or use the register API:

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}'
```

---

## API Reference

### Authentication

```bash
# Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
# → returns { token: "..." }
```

### Leads (automation-ready — uses x-api-key)

```bash
# Create a lead
curl -X POST http://localhost:4000/api/leads \
  -H "x-api-key: my_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tharun Sharma",
    "phone": "+91 99555 52671",
    "city": "Hyderabad",
    "source": "website",
    "status": "new"
  }'

# Create another lead
curl -X POST http://localhost:4000/api/leads \
  -H "x-api-key: my_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Kumar",
    "phone": "+91 99555 52672",
    "city": "Warangal",
    "source": "whatsapp",
    "status": "new"
  }'

# Duplicate phone test (returns 409 with existing_lead)
curl -X POST http://localhost:4000/api/leads \
  -H "x-api-key: my_secret_key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Other Person","phone":"+91 99555 52671"}'

# Missing API key (returns 401)
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"+91 00000 00000"}'
```

### Leads (JWT auth — for authenticated users)

```bash
TOKEN="your_jwt_token_here"

# List all leads
curl http://localhost:5000/api/leads \
  -H "Authorization: Bearer $TOKEN"

# Search by name or phone
curl "http://localhost:5000/api/leads?search=Priya" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl "http://localhost:5000/api/leads?status=follow_up" \
  -H "Authorization: Bearer $TOKEN"

# Filter by source
curl "http://localhost:5000/api/leads?source=whatsapp" \
  -H "Authorization: Bearer $TOKEN"

# Get single lead
curl http://localhost:5000/api/leads/{lead_id} \
  -H "Authorization: Bearer $TOKEN"

# Update lead status
curl -X PUT http://localhost:5000/api/leads/{lead_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"follow_up"}'

# Delete lead
curl -X DELETE http://localhost:5000/api/leads/{lead_id} \
  -H "Authorization: Bearer $TOKEN"

# Export CSV
curl http://localhost:5000/api/export \
  -H "Authorization: Bearer $TOKEN" \
  -o leads.csv
```

### Notes (automation-ready — uses x-api-key)

```bash
# Add a note
curl -X POST http://localhost:5000/api/leads/{lead_id}/notes \
  -H "x-api-key: my_secret_key" \
  -H "Content-Type: application/json" \
  -d '{"note_text":"Customer asked for pricing details"}'

# List notes
curl http://localhost:5000/api/leads/{lead_id}/notes \
  -H "Authorization: Bearer $TOKEN"
```

---

## Database Schema (SQLite)

```sql
CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL UNIQUE,
  city       TEXT,
  source     TEXT CHECK(source IN ('website','whatsapp','referral','ads') OR source IS NULL),
  status     TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','follow_up','closed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lead_notes (
  id         TEXT PRIMARY KEY,
  lead_id    TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  note_text  TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Features Implemented

- ✅ Email + password authentication with JWT
- ✅ Lead CRUD (create, read, update, delete)
- ✅ Leads list with search (name/phone) + filter (status/source)
- ✅ Lead detail page with info card + inline status updater
- ✅ Notes timeline in reverse chronological order
- ✅ REST API endpoints protected by `x-api-key`
- ✅ Duplicate phone detection (409 + redirect to existing lead)
- ✅ CSV export of all leads
- ✅ Responsive, premium dark UI
