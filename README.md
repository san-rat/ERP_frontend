# InsightERP Frontend

## Overview

Frontend for the **InsightERP** system built with **React + Vite + Tailwind CSS v3**.  
Includes full role-based routing (Admin, Manager, Employee), authentication flow, animated loading screen, and multi-module dashboards.  
All API calls are centralised in `src/api/` and driven by the `VITE_API_BASE_URL` environment variable.

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
- ✅ Dark version logo added (`dark_version_logo.png`) — used on the Loading page
- ✅ Frontend connected to API Gateway
- ✅ Toast notifications via `react-hot-toast`
- ✅ React Router v7 with full role-based routing
- ✅ `AuthContext` + `NotificationContext` for global state
- ✅ Role-based route guards (Admin / Manager / Employee)
- ✅ Dedicated layouts per role (`AdminLayout`, `ManagerLayout`, `EmployeeLayout`)
- ✅ Admin module: Dashboard + User Management
- ✅ Employee module: Overview, Orders, Products, Inventory
- ✅ Manager module: Analytics, Product Analytics, Customer Insights, Order History, Churn & Forecast info pages
- ✅ Charts via `recharts`
- ✅ Unit & integration tests via `vitest` + `@testing-library/react`

---

## Tech Stack

| Tool | Version |
|---|---|
| React | 19+ |
| Vite | 7+ |
| Tailwind CSS | 3 |
| react-router-dom | ^7.13 |
| axios | ^1.13 |
| recharts | ^3.8 |
| react-hot-toast | ^2.6 |
| lucide-react | latest |
| vitest | ^4.1 |
| @testing-library/react | ^16.3 |
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

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (vitest) |

---

## Routing

Routes are defined in `src/App.jsx` using `createBrowserRouter`. Access is enforced by role-specific guards.

| Path | Role | Page |
|---|---|---|
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/` | Any (authenticated) | Home Dashboard |
| `/admin` | Admin | Admin Dashboard |
| `/admin/users` | Admin | User Management |
| `/employee/overview` | Employee | Overview |
| `/employee/orders` | Employee | Orders |
| `/employee/products` | Employee | Products |
| `/employee/inventory` | Employee | Inventory |
| `/manager/analytics` | Manager | Analytics |
| `/manager/product-analytics/:productId` | Manager | Product Analytics |
| `/manager/customer-insights` | Manager | Customer Insights |
| `/manager/customer-insights/:customerId/orders` | Manager | Customer Order History |
| `/manager/about/churn` | Manager | Churn Info |
| `/manager/about/forecast` | Manager | Forecast Info |

After login, users are automatically redirected to their role's default route.

---

## API Integration

All API requests are routed through `src/api/` using the `VITE_API_BASE_URL` environment variable.  
No hardcoded URLs exist in the codebase.

### API clients

| File | Responsibility |
|---|---|
| `src/api/client.js` | Base `apiFetch` helper + auth (login / register) |
| `src/api/adminClient.js` | Admin — user management |
| `src/api/ordersClient.js` | Orders data |
| `src/api/productsClient.js` | Products data |
| `src/api/mlClient.js` | ML predictions (churn, etc.) |
| `src/api/forecastingClient.js` | Demand forecasting |
| `src/api/apiUtils.js` | Shared utilities |

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
│       ├── logo.png                        ← primary app logo
│       └── dark_version_logo.png           ← dark variant logo used on Loading page
├── src/
│   ├── api/
│   │   ├── client.js                       ← base apiFetch helper + auth endpoints
│   │   ├── adminClient.js                  ← admin user management
│   │   ├── ordersClient.js                 ← orders API
│   │   ├── productsClient.js               ← products API
│   │   ├── mlClient.js                     ← ML/churn predictions
│   │   ├── forecastingClient.js            ← demand forecasting
│   │   ├── apiUtils.js                     ← shared API utilities
│   │   └── __tests__/                      ← API client unit tests
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminUserModal.jsx
│   │   │   ├── AdminUsersTable.jsx
│   │   │   └── ResetPasswordModal.jsx
│   │   ├── auth/
│   │   │   ├── AdminRouteGuard.jsx         ← redirects non-admins
│   │   │   ├── EmployeeRouteGuard.jsx      ← redirects non-employees
│   │   │   └── ManagerRouteGuard.jsx       ← redirects non-managers
│   │   ├── common/
│   │   │   ├── AlertsMenu.jsx
│   │   │   └── NotificationPanel.jsx
│   │   └── employee/
│   │       ├── DataTable.jsx
│   │       ├── KpiCard.jsx
│   │       ├── PageHeader.jsx
│   │       └── StatusBadge.jsx
│   ├── constants/
│   │   └── productCategories.js
│   ├── context/
│   │   ├── AuthContext.jsx                 ← global auth state (login/logout/user)
│   │   └── NotificationContext.jsx         ← global notification state
│   ├── layouts/
│   │   ├── AdminLayout.jsx
│   │   ├── EmployeeLayout.jsx
│   │   └── ManagerLayout.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── LoadingPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   └── AdminUsersPage.jsx
│   │   ├── employee/
│   │   │   ├── EmployeeOverviewPage.jsx
│   │   │   ├── EmployeeOrdersPage.jsx
│   │   │   ├── EmployeeProductsPage.jsx
│   │   │   └── EmployeeInventoryPage.jsx
│   │   └── manager/
│   │       ├── AnalyticsPage.jsx
│   │       ├── ProductAnalyticsPage.jsx
│   │       ├── CustomerInsightsPage.jsx
│   │       ├── CustomerOrderHistoryPage.jsx
│   │       ├── ChurnInfoPage.jsx
│   │       └── ForecastInfoPage.jsx
│   ├── tests/                              ← integration tests
│   ├── App.jsx                             ← router + role-based route config
│   ├── main.jsx                            ← app entry point
│   └── index.css                           ← global design tokens + reset
├── .env.local                              ← local API URL (not committed)
├── .env.production                         ← production API URL (not committed)
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

## Architecture Status

- ✅ Real API integration (AuthService — login & register)
- ✅ JWT token storage and Bearer header injection
- ✅ Frontend connected to Azure API Gateway
- ✅ Toast notifications for user feedback
- ✅ React Router v7 with `createBrowserRouter`
- ✅ Role-based route guards (Admin / Manager / Employee)
- ✅ Admin module: Dashboard + User Management
- ✅ Employee module: Overview, Orders, Products, Inventory
- ✅ Manager module: Analytics, Product Analytics, Customer Insights, Churn & Forecast
- ✅ Unit & integration tests (vitest)
- 🔄 CI/CD with GitHub Actions
- 🔄 Customer-facing portal
