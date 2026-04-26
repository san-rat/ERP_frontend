# SE3112 – Advanced Software Engineering
## Take-Home Assessment: Testing Implementation Report
### Tool: Vitest (Unit Testing Framework)

---

## Table of Contents
1. [Overview](#overview)
2. [Tool Setup](#tool-setup)
3. [Student B — Parameterized Testing](#student-b--parameterized-testing)
   - [What is Parameterized Testing?](#what-is-parameterized-testing)
   - [Syntax Forms Used](#syntax-forms-used)
   - [Files Implemented](#files-implemented)
   - [How to Run Live](#how-to-run-live)
4. [Student A — Fixtures and Mocking](#student-a--fixtures-and-mocking)
   - [What is Mocking?](#what-is-mocking)
   - [What are Fixtures?](#what-are-fixtures)
   - [Tools Used](#tools-used)
   - [Files Implemented](#files-implemented-1)
   - [How to Run Live](#how-to-run-live-1)

---

## Overview

This report documents the unit testing implementation for the **InsightERP** frontend application — a React/Vite ERP system. The testing tool used is **Vitest v4.1.2**, paired with **@testing-library/react** for component rendering and interaction.

The team implemented two distinct testing features:

| Student | Feature |
|---|---|
| Student B | Parameterized Testing (`it.each`, `describe.each`) |
| Student A | Fixtures and Mocking (`vi.mock`, `vi.spyOn`, `beforeEach`) |

---

## Tool Setup

**Framework:** Vitest v4.1.2  
**Environment:** jsdom (simulates browser DOM in Node.js)  
**Config file:** `vite.config.js`

```js
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/tests/setup.js'
}
```

**Install dependencies:**
```bash
npm install
```

**Run all tests:**
```bash
npx vitest run
```

**Run in watch mode (re-runs on file save):**
```bash
npx vitest
```

---

---

# Student B — Parameterized Testing

## What is Parameterized Testing?

Parameterized testing is a technique where a **single test body** is executed against **multiple sets of input data** automatically. Instead of writing one `it()` block per case, you declare a data table and the framework expands it into separate test cases.

**Without parameterization (repetitive):**
```js
it('shows Active badge for isActive=true', () => { ... });
it('shows Inactive badge for isActive=false', () => { ... });
it('shows Inactive badge when status=Inactive', () => { ... });
```

**With parameterization (clean):**
```js
it.each([
  { isActive: true,  expected: 'Active'   },
  { isActive: false, expected: 'Inactive' },
  { isActive: true, status: 'Inactive', expected: 'Inactive' },
])('shows $expected badge', ({ isActive, status, expected }) => {
  // one test body, runs 3 times
});
```

**Benefits:**
- Adding a new test case = adding one row to the table
- Test names are auto-generated and descriptive
- Failures pinpoint exactly which input combination failed
- Eliminates copy-paste test code

---

## Syntax Forms Used

Vitest supports three parameterization syntaxes, all demonstrated in this project:

### 1. `it.each` with array of objects — `$label` format
```js
it.each([
  { label: 'unwraps envelope', body: { success: true, data: [1] }, expected: [1] },
  { label: 'returns raw payload', body: { id: 42 }, expected: { id: 42 } },
])('$label', ({ body, expected }) => {
  // runs once per row
});
```

### 2. `describe.each` — entire group repeated per parameter set
```js
describe.each([
  { role: 'Admin',    isAdmin: true  },
  { role: 'Manager',  isAdmin: false },
  { role: 'Employee', isAdmin: false },
])('user with role "$role"', ({ role, isAdmin }) => {
  it('renders the role badge', () => { ... });
  it('disables buttons when isAdmin', () => { ... });
  // Both its run for Admin, Manager, and Employee
});
```

### 3. Template literal `` it.each`...` `` — backtick table syntax
```js
it.each`
  title           | subtitle          | expectsSubtitle
  ${'Dashboard'}  | ${'Welcome back'} | ${true}
  ${'Orders'}     | ${undefined}      | ${false}
`('renders title "$title"', ({ title, subtitle, expectsSubtitle }) => {
  // Most readable for many columns
});
```

### 4. `toMatchSnapshot()` — baseline snapshot testing
```js
it.each(propCombinations)('$label renders correctly', (props) => {
  const { container } = render(<KpiCard {...props} />);
  expect(container.firstChild).toMatchSnapshot();
});
```

---

## Files Implemented

### 1. StatusBadge — `src/components/employee/__tests__/StatusBadge.test.jsx`
**29 tests**

Tests that every order/stock status string maps to the correct CSS class and display text.

```js
describe('StatusBadge — parameterized status mapping', () => {
  const statusCases = [
    ['completed',  'bg-emerald-100 text-emerald-800', 'Completed'],
    ['pending',    'bg-amber-100 text-amber-800',     'Pending'  ],
    ['cancelled',  'bg-red-100 text-red-800',         'Cancelled'],
    // 8 more statuses...
  ];

  it.each(statusCases)(
    'status "%s" maps to the correct CSS class and label',
    (status, expectedClass, expectedLabel) => { ... }
  );
});
```

**What it covers:** 11 status values, label overrides, unknown/empty fallback.

---

### 2. KpiCard Snapshot — `src/components/employee/__tests__/KpiCard.snapshot.test.jsx`
**6 tests**

Captures a snapshot baseline for 6 prop combinations. Future changes that alter the rendered HTML are caught automatically.

```js
it.each([
  { label: 'basic card',       props: { title: 'Revenue', value: '$1,200' } },
  { label: 'with alert state', props: { title: 'Stock',   value: 3, alert: true } },
  { label: 'with trend up',    props: { title: 'Orders',  value: 50, trend: 'up' } },
  // 3 more combinations...
])('$label renders correctly', ({ props }) => {
  const { container } = render(<KpiCard {...props} />);
  expect(container.firstChild).toMatchSnapshot();
});
```

**Demo tip:** Change a class name in `KpiCard.jsx`, re-run — the snapshot diff shows exactly what changed.

---

### 3. fetchWithAuth Utility — `src/api/__tests__/apiUtils.parameterized.test.js`
**15 tests**

Tests the core HTTP utility across response shapes, error codes, auth headers, and URL resolution.

```js
// 6 response normalisation cases
it.each(normalisationCases)('$label', async ({ body, expected }) => {
  global.fetch.mockResolvedValue(makeResponse({ body }));
  const result = await fetchWithAuth('/test');
  expect(result).toEqual(expected);
});

// 5 error status codes: 400, 403, 404, 500, 502
it.each(errorCases)('$label', async ({ status, expectedMessage }) => {
  global.fetch.mockResolvedValue(makeResponse({ ok: false, status, body }));
  await expect(fetchWithAuth('/test')).rejects.toThrow(expectedMessage);
});
```

---

### 4. DataTable — `src/components/employee/__tests__/DataTable.test.jsx`
**24 tests**

Demonstrates all three `it.each`/`describe.each` syntax forms in one file.

```js
// describe.each — runs header + cell tests for every column
describe.each(columns)('column "$title"', ({ title, key }) => {
  it('renders the column header', () => { ... });
  it('renders cell values from data rows', () => { ... });
});

// describe.each — same its run for loading / empty / populated states
describe.each([
  { label: 'loading state',   loading: true,  data: []   },
  { label: 'empty state',     loading: false, data: []   },
  { label: 'populated state', loading: false, data: rows },
])('$label', ({ loading, data }) => { ... });

// Template literal it.each — custom cell renderers
it.each`
  colTitle   | renderFn                        | expected
  ${'Badge'} | ${r => <span>{r.status}</span>} | ${'ACTIVE'}
  ${'Price'} | ${r => <span>${r.price}</span>} | ${'$9.90'}
`('renders $colTitle via render() correctly', ...)
```

---

### 5. PageHeader — `src/components/employee/__tests__/PageHeader.test.jsx`
**14 tests**

Showcases the backtick template literal syntax — the most human-readable form.

```js
it.each`
  title                  | subtitle            | expectsSubtitle
  ${'Dashboard'}         | ${'Welcome back'}   | ${true}
  ${'Inventory Monitor'} | ${'Real-time stock'}| ${true}
  ${'Orders'}            | ${undefined}        | ${false}
  ${'Analytics'}         | ${''}               | ${false}
`('renders title "$title" and subtitle visibility=$expectsSubtitle', ...)
```

---

### 6. AdminUsersTable — `src/components/admin/__tests__/AdminUsersTable.test.jsx`
**20 tests**

```js
// Roles — describe.each runs 4 its per role
describe.each([
  { role: 'Admin',    isAdmin: true  },
  { role: 'Manager',  isAdmin: false },
  { role: 'Employee', isAdmin: false },
])('user with role "$role"', ({ role, isAdmin }) => { ... });

// Username fallback — it.each
it.each([
  { username: 'johndoe',  email: 'john@x.com', expectedDisplay: 'johndoe' },
  { username: undefined,  email: 'jane@x.com', expectedDisplay: 'jane'    },
  { username: '',         email: 'bob@x.com',  expectedDisplay: 'bob'     },
])('displays "$expectedDisplay"', ...)
```

---

### 7. AdminUserModal — `src/components/admin/__tests__/AdminUserModal.test.jsx`
**25 tests**

```js
// describe.each — create mode vs edit mode
describe.each([
  { label: 'create mode',           user: null,                          expectedTitle: 'Add New Staff'        },
  { label: 'edit mode — Manager',   user: { role: 'Manager', id: 1 },    expectedTitle: 'Edit User Properties' },
  { label: 'edit mode — Employee',  user: { role: 'Employee', id: 2 },   expectedTitle: 'Edit User Properties' },
])('$label', ({ user, expectedTitle }) => { ... });
```

---

### 8. ResetPasswordModal — `src/components/admin/__tests__/ResetPasswordModal.test.jsx`
**24 tests**

```js
// Confirmation token derived from user shape — describe.each
describe.each([
  { label: 'full username',     user: { username: 'alice' },              expectedText: 'alice'   },
  { label: 'email prefix',      user: { username: undefined, email: 'bob@x.com' }, expectedText: 'bob' },
  { label: '"confirm" fallback',user: { username: undefined, email: undefined },   expectedText: 'confirm' },
])('confirmation prompt for $label', ({ user, expectedText }) => { ... });
```

---

### 9. AlertsMenu — `src/components/common/__tests__/AlertsMenu.test.jsx`
**12 tests**

```js
// Badge count — describe.each
describe.each([
  { count: 0, expectsBadge: false },
  { count: 1, expectsBadge: true  },
  { count: 3, expectsBadge: true  },
])('bell badge when there are $count alert(s)', ...)

// Alert row fields — it.each
it.each([
  { productName: 'Widget Alpha', sku: 'SKU-001', qty: 4,  threshold: 10 },
  { productName: 'Gadget Beta',  sku: 'SKU-002', qty: 1,  threshold: 20 },
])('renders all fields for "$productName"', ...)
```

---

### 10. NotificationPanel — `src/components/common/__tests__/NotificationPanel.test.jsx`
**23 tests**

```js
// Role-specific label and hint — describe.each
describe.each([
  { role: 'ADMIN',    expectedLabel: 'Notification Centre', expectedHint: 'System activity will appear here'          },
  { role: 'MANAGER',  expectedLabel: 'Manager Alerts',      expectedHint: 'Low stock alerts requiring your attention' },
  { role: 'EMPLOYEE', expectedLabel: 'Notifications',       expectedHint: 'Items needing attention in your workspace' },
])('role-specific header for $role', ...)

// Unread badge including 9+ cap — it.each
it.each([
  { unreadCount: 0,  badgeText: null  },
  { unreadCount: 5,  badgeText: '5'   },
  { unreadCount: 10, badgeText: '9+'  },
  { unreadCount: 12, badgeText: '9+'  },
])('shows badge "$badgeText" for unreadCount=$unreadCount', ...)
```

---

### 11. productsClient — `src/api/__tests__/productsClient.test.js`
**27 tests**

```js
// Endpoint URL per method — describe.each
describe.each([
  { method: 'getById',      args: [42],  expectedUrl: '/api/products/42'              },
  { method: 'getStock',     args: [],    expectedUrl: '/api/products/stock'            },
  { method: 'resolveAlert', args: [5],   expectedUrl: '/api/products/alerts/5/resolve' },
])('$method($args)', ...)

// getList query filtering — it.each (empty/null/undefined excluded)
it.each([
  { params: { name: 'widget' },          expectedSearch: 'name=widget'  },
  { params: { name: '' },                expectedSearch: ''             },
  { params: { name: null },              expectedSearch: ''             },
])('builds correct query string for $params', ...)
```

---

### 12. ordersClient — `src/api/__tests__/ordersClient.test.js`
**13 tests**

```js
// Status transitions — it.each
it.each([
  { id: 1, status: 'Processing' },
  { id: 2, status: 'Shipped'    },
  { id: 3, status: 'Delivered'  },
  { id: 4, status: 'Cancelled'  },
])('sends PUT to /api/orders/$id/status with status="$status"', ...)
```

---

### 13. forecastingClient — `src/api/__tests__/forecastingClient.test.js`
**22 tests**

```js
// Product-ID URL mapping — it.each
it.each([
  { method: 'getSingleProductMetrics',  productId: 'PROD-001', expectedUrl: '...metrics'  },
  { method: 'getSingleProductAnalysis', productId: 'PROD-002', expectedUrl: '...analysis' },
  { method: 'getLatestForecast',        productId: 'PROD-003', expectedUrl: '...latest'   },
])('$method($productId) → $expectedUrl', ...)

// generateForecast forecastDays default — describe.each
describe.each([
  { days: undefined, expectedDays: 30 },
  { days: 7,         expectedDays: 7  },
  { days: 90,        expectedDays: 90 },
])('generateForecast(P1, days=$days)', ...)
```

---

### 14. RegisterPage — `src/pages/__tests__/RegisterPage.test.jsx`
**20 tests**

```js
// Password strength (0–4 criteria) — describe.each
describe.each([
  { password: 'abcdefgh',  expectedLabel: 'Weak'   }, // length only
  { password: 'Abcdefgh',  expectedLabel: 'Fair'   }, // + uppercase
  { password: 'Abcdefg1',  expectedLabel: 'Good'   }, // + number
  { password: 'Abcdefg1!', expectedLabel: 'Strong' }, // + special char
])('password "$password"', ({ password, expectedLabel }) => {
  it('shows the correct strength label', () => { ... });
});

// Required field validation — it.each
it.each([
  { field: 'firstName', errorText: 'First name is required.'  },
  { field: 'lastName',  errorText: 'Last name is required.'   },
  { field: 'email',     errorText: 'Email is required.'       },
  { field: 'password',  errorText: 'Password is required.'    },
])('shows "$errorText" when $field is empty', ...)
```

---

## Summary Table — Student B

| # | File | Tests | Primary Technique |
|---|---|---|---|
| 1 | StatusBadge.test.jsx | 29 | `it.each` array of tuples |
| 2 | KpiCard.snapshot.test.jsx | 6 | `it.each` + `toMatchSnapshot()` |
| 3 | apiUtils.parameterized.test.js | 15 | `it.each` with `$label` objects |
| 4 | DataTable.test.jsx | 24 | `describe.each` + template literal |
| 5 | PageHeader.test.jsx | 14 | Template literal `` it.each`...` `` |
| 6 | AdminUsersTable.test.jsx | 20 | `describe.each` (roles + statuses) |
| 7 | AdminUserModal.test.jsx | 25 | `describe.each` (create vs edit) |
| 8 | ResetPasswordModal.test.jsx | 24 | `describe.each` (token fallbacks) |
| 9 | AlertsMenu.test.jsx | 12 | `describe.each` + `it.each` |
| 10 | NotificationPanel.test.jsx | 23 | `describe.each` (role-specific UI) |
| 11 | productsClient.test.js | 27 | `describe.each` + `it.each` (URL + params) |
| 12 | ordersClient.test.js | 13 | `describe.each` + `it.each` (status) |
| 13 | forecastingClient.test.js | 22 | `describe.each` + `it.each` (product IDs) |
| 14 | RegisterPage.test.jsx | 20 | `describe.each` (strength + validation) |
| | **Total** | **274** | |

---

## How to Run Live

### Run all Student B tests at once
```bash
npx vitest run \
  src/components/employee/__tests__/StatusBadge.test.jsx \
  src/components/employee/__tests__/KpiCard.snapshot.test.jsx \
  src/api/__tests__/apiUtils.parameterized.test.js \
  src/components/employee/__tests__/DataTable.test.jsx \
  src/components/employee/__tests__/PageHeader.test.jsx \
  src/components/admin/__tests__/AdminUsersTable.test.jsx \
  src/components/admin/__tests__/AdminUserModal.test.jsx \
  src/components/admin/__tests__/ResetPasswordModal.test.jsx \
  src/components/common/__tests__/AlertsMenu.test.jsx \
  src/components/common/__tests__/NotificationPanel.test.jsx \
  src/api/__tests__/productsClient.test.js \
  src/api/__tests__/ordersClient.test.js \
  src/api/__tests__/forecastingClient.test.js \
  src/pages/__tests__/RegisterPage.test.jsx \
  --reporter=verbose
```

### Run a single file
```bash
npx vitest run src/components/employee/__tests__/StatusBadge.test.jsx --reporter=verbose
```

### Demo: introduce a bug and show parameterized failure
```bash
# 1. Open StatusBadge.jsx and change 'Active' to 'active' (lowercase)
# 2. Run the test — multiple rows fail, each showing the exact input
npx vitest run src/components/admin/__tests__/AdminUsersTable.test.jsx --reporter=verbose
# 3. Revert the change and re-run — all green
```

### Demo: snapshot diff
```bash
# 1. Run once to create snapshots
npx vitest run src/components/employee/__tests__/KpiCard.snapshot.test.jsx

# 2. Change a class or value in KpiCard.jsx

# 3. Run again — snapshot diff is shown
npx vitest run src/components/employee/__tests__/KpiCard.snapshot.test.jsx

# 4. Update snapshots (after intentional change)
npx vitest run src/components/employee/__tests__/KpiCard.snapshot.test.jsx -u
```

---
---

# Student A — Fixtures and Mocking

## What is Mocking?

Mocking replaces real dependencies (API calls, database connections, browser APIs, React contexts) with **controlled fake versions** that return predictable data. This means:

- Tests never make real network requests
- Tests run fast and offline
- You can simulate error states that are hard to trigger in real life (server down, 500 error, network timeout)

**Without mocking (problem):**
```js
// This would hit the real API — slow, unreliable, needs a running server
it('shows users', async () => {
  render(<AdminUsersPage />);
  // might fail if server is down
});
```

**With mocking (solution):**
```js
vi.mock('../api/adminClient');
adminApi.getUsers.mockResolvedValue([{ id: 1, username: 'alice' }]);
// always fast, always returns what we tell it to
```

---

## What are Fixtures?

Fixtures are **setup and teardown functions** that run before and after each test to create a consistent, clean environment. They prevent test pollution — where one test's side effects cause another to fail.

```js
beforeEach(() => {
  vi.clearAllMocks();       // reset all mock call counts
  sessionStorage.clear();   // clean browser storage
});

afterEach(() => {
  vi.restoreAllMocks();     // restore spied methods to real implementation
});
```

---

## Tools Used

| Tool | Purpose |
|---|---|
| `vi.mock('module')` | Replace an entire module with stubs |
| `vi.spyOn(obj, 'method')` | Partially mock one method on a real object |
| `vi.fn()` | Create a standalone mock function |
| `mockResolvedValue(data)` | Make async mock return success data |
| `mockRejectedValue(error)` | Make async mock throw an error |
| `beforeEach` | Fixture — runs before every test |
| `afterEach` | Teardown — runs after every test |
| `vi.clearAllMocks()` | Reset mock call history |
| `vi.restoreAllMocks()` | Restore spies to real implementation |

---

## Files Implemented

### 1. AdminRouteGuard — `src/components/auth/__tests__/AdminRouteGuard.test.jsx`
**6 tests**

Tests the Admin role guard using `vi.spyOn` on the AuthContext.

```js
import * as AuthContext from '../../../context/AuthContext';

it('redirects to /login when user is null', () => {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: null, loading: false });
  render(<MemoryRouter>...</MemoryRouter>);
  expect(screen.getByText('Login Page')).toBeInTheDocument();
});

it('grants access for Admin role', () => {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: { role: 'Admin' }, loading: false });
  // outlet renders
});
```

**Roles tested:** null, Employee, Manager, Admin, ADMIN (legacy uppercase), loading state.

---

### 2. ManagerRouteGuard — `src/components/auth/__tests__/ManagerRouteGuard.test.jsx`
**5 tests**

```js
it('allows Admin users into Manager routes', () => {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: { role: 'Admin' }, loading: false });
  // Admins can access manager-level pages
});

it('blocks Employee users', () => {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: { role: 'Employee' }, loading: false });
  expect(screen.getByText('Login Page')).toBeInTheDocument();
});
```

---

### 3. EmployeeRouteGuard — `src/components/auth/__tests__/EmployeeRouteGuard.test.jsx`
**3 tests**

```js
it('redirects non-Employee roles to /login', () => {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: { role: 'Admin' }, loading: false });
  expect(screen.getByText('Login Page')).toBeInTheDocument();
});
```

---

### 4. adminClient — `src/api/__tests__/adminClient.test.js`
**9 tests**

Mocks the entire `client` module, tests all 7 `adminApi` methods.

```js
vi.mock('../client', () => ({
  apiFetch: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks(); // fixture — fresh mock before every test
});

it('getUsers appends non-empty query params', async () => {
  vi.mocked(client.apiFetch).mockReturnValue(mockOk([]));
  await adminApi.getUsers({ role: 'Manager', search: '' });
  expect(client.apiFetch).toHaveBeenCalledWith('/api/admin/users?role=Manager');
});

it('throws when the server returns an error', async () => {
  vi.mocked(client.apiFetch).mockReturnValue(mockError(403, 'Forbidden'));
  await expect(adminApi.getOverview()).rejects.toThrow('Forbidden');
});
```

**The three-state mock pattern used:**
```js
const mockOk       = (body)            => Promise.resolve({ ok: true,  status: 200, ... });
const mockNoContent = ()               => Promise.resolve({ ok: true,  status: 204, ... });
const mockError    = (status, message) => Promise.resolve({ ok: false, status, ...      });
```

---

## How to Run Live

### Run all Student A tests
```bash
npx vitest run \
  src/components/auth/__tests__/AdminRouteGuard.test.jsx \
  src/components/auth/__tests__/ManagerRouteGuard.test.jsx \
  src/components/auth/__tests__/EmployeeRouteGuard.test.jsx \
  src/api/__tests__/adminClient.test.js \
  --reporter=verbose
```

### Demo: mock success vs error
```bash
# In adminClient.test.js, the same API call is tested with mockOk and mockError.
# Run and show the two test cases:
npx vitest run src/api/__tests__/adminClient.test.js --reporter=verbose
```

### Demo: what happens without mocking
Temporarily comment out `vi.mock('../client')` in `adminClient.test.js` and re-run — the test will fail because `apiFetch` is not a function, proving the mock is essential for isolation.

---

## Key Difference Between Both Features

| | Parameterized Testing (Student B) | Fixtures & Mocking (Student A) |
|---|---|---|
| **Core question** | Does the component handle every input correctly? | Does the component handle real-world API states correctly? |
| **Main tools** | `it.each`, `describe.each` | `vi.mock`, `vi.spyOn`, `beforeEach` |
| **Data source** | Table of inputs defined in the test | Fake return values from mocked modules |
| **Target** | Pure/prop-driven components and utilities | Pages and components that call APIs |
| **What varies** | Rows in the data table | `mockResolvedValue` vs `mockRejectedValue` |
| **Total tests** | 274 | 23 |
