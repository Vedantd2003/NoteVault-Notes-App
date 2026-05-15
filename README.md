# NoteVault — Multi-user Notes App

A production-ready full-stack notes application with user authentication, CRUD operations, note sharing, and smart organisation features.

---

## Tech Stack

| Layer      | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, Tailwind CSS, Framer Motion, React Router |
| Backend   | Node.js, Express.js (ES Modules) |
| Database  | MongoDB + Mongoose |
| Auth      | JWT (7-day tokens) + bcrypt (cost 12) |
| Deploy    | Frontend → Vercel · Backend → Render |

---

## Folder Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Mongoose connection
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT verification middleware
│   │   ├── models/
│   │   │   ├── User.js           # Mongoose User schema
│   │   │   └── Note.js           # Mongoose Note schema (pin/color/tag/sharedWith)
│   │   ├── routes/
│   │   │   ├── auth.js           # POST /register, POST /login
│   │   │   └── notes.js          # CRUD + share endpoints
│   │   └── openapi.js            # OpenAPI 3.0 specification
│   ├── index.js                  # Express app entry point
│   ├── package.json              # "type": "module" for ES6 imports
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/index.js          # Axios instance + all API calls
    │   ├── context/AuthContext   # Global auth state (login/logout/persist)
    │   ├── hooks/useDebounce.js  # Debounce hook for search
    │   ├── utils/helpers.js      # Serializers, color classes, time formatting
    │   ├── components/
    │   │   ├── ui/               # Button, Input, Modal, Skeleton
    │   │   ├── layout/           # Navbar, Sidebar, Layout
    │   │   └── notes/            # NoteCard, NoteModal, ShareModal, EmptyNotes
    │   └── pages/                # Landing, Login, Register, Dashboard, About
    ├── package.json
    └── .env.example
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas (free cloud)

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy `.env.example` to `.env` and fill in:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/notesapp
# OR for Atlas: mongodb+srv://user:pass@cluster.mongodb.net/notesapp
JWT_SECRET=change_this_to_a_long_random_string
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** — copy `.env.example` to `.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev      # uses nodemon for hot-reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Reference

All note endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint              | Description |
|--------|-----------------------|-------------|
| POST   | `/register`           | Register new user |
| POST   | `/login`              | Login → returns `access_token` |
| GET    | `/notes`              | Get all notes (owned + shared). Supports `?page`, `?limit`, `?q`, `?tag` |
| GET    | `/notes/:id`          | Get single note (owner or shared user) |
| POST   | `/notes`              | Create note |
| PUT    | `/notes/:id`          | Update note (owner only) |
| DELETE | `/notes/:id`          | Delete note (owner only) |
| POST   | `/notes/:id/share`    | Share note with another registered user |
| GET    | `/search?q=keyword`   | Full-text search across owned + shared notes |
| GET    | `/openapi.json`       | OpenAPI 3.0 specification |
| GET    | `/about`              | Developer info + features |
| GET    | `/health`             | Health check |

---

## Database Schema (MongoDB)

### User
```
{
  email:     String (unique, required),
  password:  String (bcrypt-hashed, hidden from queries by default),
  name:      String,
  createdAt, updatedAt
}
```

### Note
```
{
  title:      String (required, max 255),
  content:    String (required, max 50 000),
  owner:      ObjectId → User,
  sharedWith: [ObjectId] → [User],   // array of users the note is shared with
  isPinned:   Boolean (default false),
  color:      Enum ['default','red','orange','yellow','green','blue','purple','pink'],
  tag:        String (max 50),
  createdAt, updatedAt
}
```

Sharing is embedded directly on the Note document as `sharedWith: [ObjectId]` — no separate collection needed.

---

## Extra Feature — Smart Note Organisation

Implemented three lightweight extra fields on the Note model:

| Field | Purpose |
|-------|---------|
| `isPinned` | Pinned notes always sort to the top |
| `color` | 8-colour label for visual scanning |
| `tag` | Free-text category for sidebar filtering |

**Why this feature?** It solves the real user problem of "I have 50 notes and can't find anything" without requiring extra API endpoints or database collections. Everything is a field on the existing Note document.

---

## Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Create a new **Web Service** on render.com
3. Set Build Command: `npm install`
4. Set Start Command: `node index.js`
5. Add environment variables in the Render dashboard
6. Set `MONGODB_URI` to your Atlas connection string

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Import project on vercel.com
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy

---

## Security Measures

- **bcrypt cost 12** — ~250 ms per hash, strong against brute force
- **Constant-time login** — bcrypt.compare always runs even for non-existent users (prevents timing-based user enumeration)
- **JWT 7-day expiry** — auto-logout on 401, token stored in localStorage
- **Helmet** — sets secure HTTP headers
- **CORS** — whitelist-only origins
- **Rate limiting** — 200 req/15min global; 20 req/15min on auth routes
- **Input validation** — express-validator on every endpoint
- **select: false** on password field — never returned in DB queries accidentally

---

## Interview Explanation Points

**Why MongoDB?**
MongoDB's document model is a natural fit for notes — a note's `sharedWith` list is just an embedded array of ObjectIds, avoiding the complexity of a JOIN table. Schema flexibility also lets us add `tag`, `color`, and `isPinned` without migrations.

**Why JWT?**
JWTs are stateless — the server doesn't need a session store, which means the API scales horizontally without sticky sessions. The payload contains `userId` and `email` so most requests need zero extra DB lookups for auth.

**Why bcrypt?**
bcrypt's work factor (cost 12 ≈ 250ms per hash) makes offline brute-force attacks computationally expensive. Even if the database leaks, an attacker can try only ~4 passwords/second per machine.

**How sharing works?**
`POST /notes/:id/share` finds the target user by email, then pushes their ObjectId into the note's `sharedWith` array. The `GET /notes` query uses `$or: [{ owner: userId }, { sharedWith: userId }]` so shared notes appear automatically.

**How protected routes work?**
The `authenticateToken` middleware runs before any note handler. It reads the Bearer token, calls `jwt.verify()`, and attaches the decoded payload to `req.user`. If verification fails, it returns 401/403 before the handler ever runs.

**How optimistic UI works?**
On delete, the note is removed from local state immediately so the UI feels instant. If the API call fails, the note is restored from a snapshot and an error toast is shown.
