# ShiftSync

Production-ready employee shift scheduling and attendance SaaS.

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, Axios, React Router, Socket.io client
- Backend: Node.js, Express.js, MongoDB (Mongoose), JWT (access+refresh), Socket.io, Nodemailer, node-cron, express-validator
- AI: Claude API (Anthropic)
- Deployment: Frontend (Vercel/Netlify), Backend (Railway/Render/Fly.io), MongoDB Atlas

## Monorepo Scripts
- `npm run dev` – runs backend and frontend concurrently
- `npm run build` – builds frontend and preps backend
- `npm start` – starts backend only

## Environment Variables

Create backend `.env` from [backend/.env.example](backend/.env.example):
- MONGODB_URI
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- FRONTEND_URL
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
- CLAUDE_API_KEY, CLAUDE_MODEL
- APP_NAME
- DISABLE_CRON

Create frontend `.env` from [frontend/.env.example](frontend/.env.example):
- VITE_API_BASE_URL
- VITE_SOCKET_URL

## Local Setup
1. Install Node 18+ and npm.
2. `npm install` at repo root to install tooling.
3. `cd backend && npm install`
4. `cd ../frontend && npm install`
5. Set environment variables as above.
6. `npm run dev` from repo root.
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

## Authentication & Roles
- Invite-only onboarding.
- Access token (15m) via Authorization header.
- Refresh token (7d) via secure HTTP-only cookie.
- Roles: `manager` and `employee`.

## Core Endpoints

Auth
- POST /api/auth/register-manager
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/invite (manager)
- POST /api/auth/accept-invite

Users
- GET /api/users/me
- GET /api/users/employees (manager)

Shifts
- POST /api/shifts (manager) – create draft shift
- GET /api/shifts/week?weekId=YYYY-Www – list shifts and assignments
- POST /api/shifts/publish (manager) – publish week (transaction)
- POST /api/shifts/assign (manager)
- POST /api/shifts/auto (manager) – AI auto-scheduler (transaction)

Attendance
- POST /api/attendance/clock-in
- POST /api/attendance/clock-out
- GET /api/attendance/report?startDate&endDate
- GET /api/attendance/export – CSV download

Requests
- POST /api/requests/swap – create swap request
- POST /api/requests/swap/respond – employee accept/reject
- POST /api/requests/swap/approve – manager approval (transaction)
- POST /api/requests/leave – create leave request
- POST /api/requests/leave/approve – manager approve/reject

Notices
- GET /api/notices
- POST /api/notices (manager)

Health
- GET /api/health

## Deployment Notes
- Configure CORS and cookies for production (`secure: true`, `sameSite: 'none'`).
- MongoDB Atlas connection string in `MONGODB_URI`.
- Socket.io configured with CORS to `FRONTEND_URL`.
- Cron executes daily at 7AM server time.

## Security & Quality
- All routes protected with JWT where applicable.
- Input validation using `express-validator`.
- Centralized error handling.
- MongoDB indexes on businessId, userId, shiftDate.
- UUID string IDs for all documents.

## AI Scheduler
Backend integrates with Claude API to generate JSON-only assignments:
```json
{ "assignments": [ { "userId": "uuid", "shiftId": "uuid" } ] }
```
Transactions persist the plan safely.

