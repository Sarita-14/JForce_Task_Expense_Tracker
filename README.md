git add .
git commit -m "Initial commit"
# Expinse — Expense Tracker

Simple expense-tracking app: React frontend (Vite) + Express backend + MongoDB.

## Requirements
- Node.js 18+ (or compatible LTS)
- npm
- MongoDB (Atlas or local)

## Quick start

1. Clone the repo:

```bash
git clone https://github.com/Sarita-14/JForce_Task_Expense_Tracker.git
cd JForce_Task_Expense_Tracker
```

2. Backend (run in one terminal):

```bash
cd backend
npm install
# create a .env with the values shown below
npm run dev
```

3. Frontend (run in another terminal):

```bash
cd frontend
npm install
npm run dev
# Open: http://localhost:5173
```

## Environment variables
Create a `.env` file in `backend/` with at least:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net
MONGODB_DB=expensedb
# optional: custom DNS resolvers (comma separated)
DNS_SERVERS=1.1.1.1,8.8.8.8
```

Notes:
- `dotenv` loads these values into `process.env` at runtime.
- `DNS_SERVERS` (optional) will call `dns.setServers(...)` in `backend/db.js` to use custom resolvers when connecting to MongoDB.

## Run scripts (project root)
- Backend: `cd backend && npm run dev` (nodemon)
- Frontend: `cd frontend && npm run dev` (Vite)

## API documentation
Base path: `/api`

- `GET /` (backend root)
	- Description: health/test route
	- Response: `{ success: true, message: "Expense Tracker Backend is running" }`

- `POST /api/register`
	- Body (JSON): `{ username, password, email, fullName }`
	- Success: 201 `{ success: true, message: "Registration successful." }`
	- Errors: 400 with `{ success: false, message }` for validation or existing user

- `POST /api/login`
	- Body (JSON): `{ username, password }`
	- Success: 200 `{ success: true, message: "Login successful.", user: { id, username, email, fullName } }`
	- Errors: 400 `{ success: false, message: "Invalid username or password." }`

- `GET /api/expenses/:username`
	- Description: Return expenses for the given `username`.
	- Success: 200 `{ success: true, expenses: [ ... ] }`

- `POST /api/expenses`
	- Body (JSON): `{ username, title, amount, date, description }`
	- Success: 201 `{ success: true, message: "Expense added." }`

- `PUT /api/expenses/:id`
	- Body (JSON): `{ title, amount, date, description }`
	- Success: 200 `{ success: true, message: "Expense updated." }`

- `DELETE /api/expenses/:id`
	- Success: 200 `{ success: true, message: "Expense deleted." }`

Error responses follow the shape: `{ success: false, message: "..." }` and often use HTTP 400 for client errors or 500 for server errors.

## Database schema
The app uses MongoDB with at least two collections:

- `users`
	- `username`: string (unique)
	- `password`: string (bcrypt hash)
	- `email`: string
	- `fullName`: string
	- `createdAt`: Date

- `expenses`
	- `_id`: ObjectId
	- `username`: string (owner)
	- `title`: string
	- `amount`: number
	- `date`: string or Date
	- `description`: string

Notes:
- For production, prefer `userId` (ObjectId) to reference users and add indexes on that field.

## Important libraries and config
- `dotenv`: loads `.env` values into `process.env`. Keeps secrets out of source code.
- `cors`: enabled in `backend/index.js` so the frontend (dev server at `localhost:5173`) can call backend `localhost:4000`.
- `dns` usage: optional custom DNS resolvers are applied before connecting to MongoDB; useful in special network setups.

## Security notes
- Passwords are hashed with `bcrypt` — never store plaintext passwords.
- Avoid storing sensitive tokens in `localStorage` (this project stores user info for demo). Use HttpOnly cookies or JWTs in production.

## Troubleshooting
- If the frontend shows `400 Bad Request` on login, inspect the Network tab and response body for `{ message }` from the backend.
- Verify `backend` is running on port `4000` and that `MONGODB_URI` & `MONGODB_DB` are correct.
- To check DB connectivity, look for `MongoDB connected successfully!` in backend logs.

## Deploying to Vercel

This app is ready to deploy to Vercel as a single project:

1. Push the repo to GitHub.
2. In Vercel, import the repo.
3. Set the project root to the repository root.
4. Set these environment variables in Vercel:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>
MONGODB_DB=expensedb
```

5. Use these build settings:

```bash
Install Command: npm install --prefix frontend
Build Command: npm run build --prefix frontend
Output Directory: frontend/dist
```

6. Deploy.

The frontend uses relative API calls to `/api`, and the Vercel serverless function in `api/index.js` handles those requests.

## Deploying / Next steps
- Replace local MongoDB with MongoDB Atlas and set production env vars.
- Add authentication tokens (JWT) and protect expense routes.
- Add tests and CI (GitHub Actions).

---

If you want, I can also add a short one-paragraph pitch for the repo and update the `README.md` with it.
