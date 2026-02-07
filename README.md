# TaskLedger

TaskLedger is a group todo application where friends can make a coworking space and see tasks of everyone to keep the fire of healthy competition lit. + some accountability.

## Features
- Personal todos + optional workspace sharing
- Team page to see each other’s shared tasks
- Roles: admin / manager / user
- Invite‑code workspaces (create, join, leave)
- Dark mode by default

## Setup (local)

### 1) Firebase
Create a Firebase project and enable Email/Password + Google.

### 2) Frontend env
Create `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### 3) Backend env
Create `backend/.env`:
```
PORT=5000
MONGO_URI=YOUR_MONGO_URI
JWT_SECRET=unused_for_firebase
FIREBASE_SERVICE_ACCOUNT={...}
FRONTEND_URL=http://localhost:5173
```
For `FIREBASE_SERVICE_ACCOUNT`, paste the service account JSON as one line (escape newlines with `\n`).

### 4) Run
Frontend:
```
cd frontend
npm install
npm run dev
```

Backend:
```
cd backend
npm install
npm run dev
```

## Quick usage
1. Create a workspace and share the invite code.
2. Join from another account.
3. Share a todo to the workspace to make it visible on Team.

---
Built by Anurag Verma

If you want to contribute or improve anything, feel free. I’m happy to take PRs.
