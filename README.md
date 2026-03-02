# InsightERP Frontend

## Overview

Frontend for the **InsightERP** system built with **React + Vite + Tailwind CSS v3**.  
Includes authentication flow (Login, Register), animated loading screen, and a role-based dashboard.

---

## Repo Status

- ✅ Docs + structure initialized
- ✅ React + Vite scaffold complete
- ✅ Tailwind CSS v3 configured with InsightERP design tokens
- ✅ Login, Register, Loading, and Home pages implemented
- 🔄 Backend API integration ready (mock mode active until AuthService is running)

---

## Tech Stack

| Tool | Version |
|---|---|
| React | 18+ |
| Vite | 5+ |
| Tailwind CSS | 3 |
| lucide-react | latest |
| Node.js | 18+ |
| npm | 9+ |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd ERP_frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install required packages

> Skip this step if `lucide-react` and `tailwindcss` are already in `package.json`

```bash
npm install lucide-react
npm install -D tailwindcss@3 postcss autoprefixer
```

### 4. Start the development server

```bash
npm run dev
```

App runs at → **http://localhost:5173**

---

## Test the App (No Backend Needed)

The app runs in **mock mode** by default — no backend required to test the UI.

| Page | How to reach it |
|---|---|
| Login | App starts here |
| Register | Click **"Create account"** on the login page |
| Loading screen | Appears for ~2.4s after login |
| Home dashboard | Loads after the loading screen |

**Test login:** enter any email + any password (6+ characters) → click Sign In  
**Test login error:** use password `wrong` → error banner appears  
**Test register:** fill all fields, password must be 8+ chars with 1 uppercase + 1 number

---

## Connect to Backend

When **AuthService** is running on `http://localhost:5000`, uncomment the real API calls:

**In `src/pages/LoginPage.jsx`** — find the comment block:
```js
// ── Replace this block with your real API call ──
```
Uncomment the `fetch()` block and delete the mock below it.

**In `src/pages/RegisterPage.jsx`** — same pattern, same comment.

### Expected API endpoints

```
POST http://localhost:5000/api/auth/login
Body:    { "email": "", "password": "" }
Returns: { "accessToken": "", "role": "" }

POST http://localhost:5000/api/auth/register
Body:    { "firstName": "", "lastName": "", "email": "", "role": "", "password": "" }
Returns: 200 OK
```

---

## Project Structure

```
ERP_frontend/
├── public/
│   └── logo/
│       └── logo.png          ← app logo used across all pages
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx     ← login form with validation
│   │   ├── LoginPage.css
│   │   ├── RegisterPage.jsx  ← registration with strength meter
│   │   ├── RegisterPage.css
│   │   ├── LoadingPage.jsx   ← animated brand splash screen
│   │   ├── LoadingPage.css
│   │   ├── HomePage.jsx      ← dashboard with sidebar + KPIs
│   │   └── HomePage.css
│   ├── App.jsx               ← screen transition controller
│   ├── main.jsx              ← app entry point
│   └── index.css             ← global design tokens + reset
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## Build for Production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Planned Architecture

- 🔄 CI/CD with GitHub Actions
- 🔄 React Router for multi-page navigation
- 🔄 Axios interceptor with JWT token injection
- 🔄 Role-based route guards (Admin / Manager / Employee / Customer)
- 🔄 Full module pages: Customers, Orders, Products, Reports, Settings