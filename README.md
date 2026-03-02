# InsightERP Frontend

## Overview

Frontend for the **InsightERP** system built with **React + Vite + Tailwind CSS v3**.  
Includes authentication flow (Login, Register), animated loading screen, and a role-based dashboard.  
All API calls are centralised in `src/api/client.js` and driven by the `VITE_API_BASE_URL` environment variable.

---

## Repo Status

- ✅ Docs + structure initialized
- ✅ React + Vite scaffold complete
- ✅ Tailwind CSS v3 configured with InsightERP design tokens
- ✅ Login, Register, Loading, and Home pages implemented
- ✅ Login uses **username-based** authentication (not email)
- ✅ Real API calls connected via `src/api/client.js`
- ✅ JWT token stored in `sessionStorage` (`erp_token`)
- ✅ Centralized API client with Bearer token injection
- ✅ Environment-based API URL (`.env.local` / `.env.production`)

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

### 3. Configure the API base URL

Create a `.env.local` file in the project root (already present in repo for local dev):

```env
VITE_API_BASE_URL=http://localhost:5000
```

> For production deployments, set `VITE_API_BASE_URL` to your Azure API Gateway URL in `.env.production` or your hosting provider's environment variable settings.

### 4. Start the development server

```bash
npm run dev
```

App runs at → **http://localhost:5173**

---

## API Integration

All API requests are routed through **`src/api/client.js`** using the `VITE_API_BASE_URL` environment variable.  
No hardcoded URLs exist in the codebase.

### Environment files

| File | Purpose |
|---|---|
| `.env.local` | Local development (points to `http://localhost:5000`) |
| `.env.production` | Production (points to Azure API Gateway URL) |

### Auth endpoints

```
POST {VITE_API_BASE_URL}/api/auth/login
Body:    { "username": "", "password": "" }
Returns: { "token": "", "role": "", "userId": "", "expiresAt": "" }

POST {VITE_API_BASE_URL}/api/auth/register
Body:    { "username": "firstname.lastname", "password": "", "role": "" }
Returns: 200 OK
```

> **Login note:** The login form uses `username` (e.g. `admin`). The register form builds the username automatically as `firstname.lastname` from the First / Last name fields.

### Token storage

On successful login, the JWT is saved to:

```js
sessionStorage.setItem("erp_token", data.token);
```

All subsequent authenticated requests automatically attach the token via the `Authorization: Bearer <token>` header — handled inside `apiFetch()` in `src/api/client.js`.

---

## Project Structure

```
ERP_frontend/
├── public/
│   └── logo/
│       └── logo.png           ← app logo used across all pages
├── src/
│   ├── api/
│   │   └── client.js          ← centralized API client (auth + apiFetch helper)
│   ├── pages/
│   │   ├── LoginPage.jsx      ← username + password login with real API call
│   │   ├── LoginPage.css
│   │   ├── RegisterPage.jsx   ← registration form with password strength meter
│   │   ├── RegisterPage.css
│   │   ├── LoadingPage.jsx    ← animated brand splash screen
│   │   ├── LoadingPage.css
│   │   ├── HomePage.jsx       ← dashboard with sidebar + KPIs
│   │   └── HomePage.css
│   ├── App.jsx                ← screen transition controller
│   ├── main.jsx               ← app entry point
│   └── index.css              ← global design tokens + reset
├── .env.local                 ← local API URL (not committed)
├── .env.production            ← production API URL (not committed)
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

- ✅ Real API integration (AuthService — login & register)
- ✅ JWT token storage and Bearer header injection
- 🔄 CI/CD with GitHub Actions
- 🔄 React Router for multi-page navigation
- 🔄 Role-based route guards (Admin / Manager / Employee / Customer)
- 🔄 Full module pages: Customers, Orders, Products, Reports, Settings