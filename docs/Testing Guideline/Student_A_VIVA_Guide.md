# SE3112 — Student A: Fixtures & Mocking — Complete VIVA Guide

## Tool: Vitest v4.1.2 | Feature: Fixtures & Mocking

---

## 1. What is Vitest?

Vitest is a **unit testing framework** built specifically for Vite-based projects (like ours — React + Vite). It is fast, modern, and uses the same config as Vite so no separate setup is needed.

**Why Vitest over alternatives?**
- Built into the same Vite ecosystem — no extra config
- Supports React JSX natively with `@vitejs/plugin-react`
- Runs tests in a simulated browser (`jsdom`) so React components can render
- Has first-class mocking with `vi.mock`, `vi.spyOn`, `vi.fn()`
- `globals: true` means you don't need to import `describe/it/expect` manually

---

## 2. Project Setup

**Config in `vite.config.js`:**
```js
test: {
  globals: true,           // describe, it, expect available globally
  environment: 'jsdom',    // simulates a browser DOM in Node.js
  setupFiles: './src/tests/setup.js'  // runs before all tests
}
```

**`src/tests/setup.js`:**
```js
import '@testing-library/jest-dom';
// Adds extra matchers: toBeInTheDocument(), toBeDisabled(), toHaveTextContent() etc.
```

**Run commands:**
```bash
npx vitest run                    # run all tests once
npx vitest run --coverage         # run all tests + generate coverage report
npx vitest run <file> --reporter=verbose  # run one file with detailed output
```

---

## 3. What is Unit Testing?

A **unit test** tests one small, isolated piece of code at a time.

Instead of testing the whole application end-to-end, you isolate one function or component and verify:
- Given this input → does it produce this output?
- Given this mock API response → does the component render correctly?
- Given a button click → does the right function get called?

**Key principle:** Tests must NEVER talk to a real server, real database, or real browser API. Everything external is replaced with a controlled fake — this is **mocking**.

---

## 4. What is Mocking?

**Mocking** replaces a real dependency with a controlled fake version.

### Why mock?
| Problem | Solution |
|---|---|
| Real API calls are slow | Mock returns instantly |
| Server might be offline | Mock always works |
| Can't control what server returns | Mock returns exactly what you specify |
| Hard to trigger error states | `mockRejectedValue(new Error('...'))` |

### Three types of mocking used in this project:

#### `vi.mock('module')` — Replace entire module
```js
vi.mock('../api/adminClient', () => ({
  adminApi: {
    getUsers: vi.fn(),
    createEmployee: vi.fn(),
  }
}));
// Now adminApi.getUsers is a fake function — no real HTTP call
```

#### `vi.spyOn(object, 'method')` — Replace one method
```js
import * as AuthContext from '../context/AuthContext';

vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
  user: { role: 'Admin' },
  loading: false
});
// useAuth now returns our fake data instead of reading real React context
```

#### `vi.fn()` — Standalone fake function
```js
const mockNavigate = vi.fn();
// Use it as a spy — check if it was called, with what args
expect(mockNavigate).toHaveBeenCalledWith('/admin');
```

### Controlling mock return values:
```js
vi.mocked(adminApi.getUsers).mockResolvedValue([...]);   // async success
vi.mocked(adminApi.getUsers).mockRejectedValue(new Error('fail')); // async error
vi.mocked(useAuth).mockReturnValue({ user: null });       // sync return
```

---

## 5. What are Fixtures?

**Fixtures** are setup/teardown functions that run before and after every test to keep tests isolated and clean.

### The problem without fixtures:
```
Test 1: spies on useAuth → fakes Admin user
Test 2: forgets to set its own spy → accidentally inherits Admin user
Test 2 passes for the WRONG reason — silent bug
```

### The solution:
```js
beforeEach(() => {
  vi.clearAllMocks();      // wipe all mock call records
  sessionStorage.clear();  // wipe browser storage
});

afterEach(() => {
  vi.restoreAllMocks();    // restore spied functions to real implementations
});
```

### Difference between the three cleanup functions:
| Function | What it clears |
|---|---|
| `vi.clearAllMocks()` | Call history, call count, return values logged |
| `vi.resetAllMocks()` | Everything above + removes mock implementations |
| `vi.restoreAllMocks()` | Restores `vi.spyOn` targets back to their real original function |

**When to use which:**
- Use `vi.clearAllMocks()` in `beforeEach` — clean slate for each test
- Use `vi.restoreAllMocks()` in `afterEach` — undo any `vi.spyOn` changes

---

## 6. Key Assertion Methods

```js
// Check element is in the DOM
expect(screen.getByText('Login Page')).toBeInTheDocument();

// Check element is NOT in the DOM
expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();

// Check a button is disabled
expect(screen.getByText('Confirm Cancel')).toBeDisabled();

// Check a mock function was called
expect(mockNavigate).toHaveBeenCalledWith('/admin');
expect(adminApi.getUsers).toHaveBeenCalledTimes(1);

// Check async error is thrown
await expect(adminApi.getOverview()).rejects.toThrow('Forbidden');

// Check text content of element
expect(screen.getByTestId('user')).toHaveTextContent('alice');

// Check sessionStorage
expect(sessionStorage.getItem('erp_token')).toBeNull();
expect(sessionStorage.getItem('erp_token')).toBe('test-token');
```

---

## 7. What is Test Coverage?

Coverage answers: **"What percentage of your source code was actually executed during tests?"**

```bash
npx vitest run --coverage
```

**Four columns in the report:**

| Column | What it measures |
|---|---|
| `% Stmts` | Lines of code that ran |
| `% Branch` | Both sides of every if/else that were tested |
| `% Funcs` | Functions that were called at least once |
| `% Lines` | Physical lines that were touched |

**Our project's journey:**
```
Start:   73.96% overall
Final:   91.04% overall  ← exceeded the 90% target
```

---

## 8. Files Implemented — Complete List

### 8.1 AdminRouteGuard.test.jsx (6 tests)

**What is AdminRouteGuard?**
A React component that sits in front of admin routes. If you try to visit `/admin` without being an Admin, it redirects you.

**Source code logic:**
```js
if (loading) return <div>Loading...</div>;
if (!user) return <Navigate to="/login" />;
if (user.role !== 'Admin' && user.role !== 'ADMIN') return <Navigate to="/" />;
return <Outlet />;
```

**Mocking approach:** `vi.spyOn(AuthContext, 'useAuth')` — replaces the real hook with a fake one that returns whatever user we want.

**Why `MemoryRouter`?** The component uses `<Navigate>` which needs a Router. `MemoryRouter` simulates one in tests without a real browser.

**Tests written:**
1. `null` user → redirects to `/login`
2. `Employee` role → redirects to `/` (home)
3. `Manager` role → redirects to `/`
4. `Admin` role → shows the page (Outlet renders)
5. `ADMIN` legacy uppercase → shows the page
6. `loading: true` → shows "Loading..."

**Fixtures added:**
```js
beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.restoreAllMocks(); });
```

---

### 8.2 ManagerRouteGuard.test.jsx (5 tests)

**Source code logic:**
```js
if (loading) return null;
const role = user?.role?.toUpperCase();
if (!user || !['MANAGER', 'ADMIN'].includes(role)) return <Navigate to="/login" />;
return <Outlet />;
```

**Key difference from AdminGuard:** Uses `.toUpperCase()` so `"Admin"` becomes `"ADMIN"` — both Admin and Manager can enter Manager routes.

**Tests written:**
1. `null` user → `/login`
2. `Employee` → `/login`
3. `Manager` → allowed
4. `Admin` → allowed (Admins outrank Managers)
5. `loading: true` → renders nothing (`container` is empty DOM element)

---

### 8.3 EmployeeRouteGuard.test.jsx (3 tests)

**Source code logic:**
```js
if (loading) return null;
if (!user || user.role?.toUpperCase() !== 'EMPLOYEE') return <Navigate to="/login" />;
return <Outlet />;
```

**Tests written:**
1. `null` user → `/login`
2. `Admin` → `/login` (even admins cannot enter employee-only routes)
3. `Employee` → allowed

---

### 8.4 adminClient.test.js (9 tests)

**What is adminClient?**
A module of functions that call the backend API (`apiFetch`). No React — pure async JavaScript functions.

**Source code pattern:**
```js
export const adminApi = {
  getUsers: (params) => apiFetch('/api/admin/users?...').then(handleResponse),
  createEmployee: (payload) => apiFetch('/api/admin/users/employees', { method: 'POST', ... }),
  // etc.
}
```

**Mocking approach:** `vi.mock('../client', () => ({ apiFetch: vi.fn() }))` — the entire HTTP layer is replaced.

**Three-state mock pattern:**
```js
const mockOk        = (body)    => Promise.resolve({ ok: true,  status: 200, json: async () => body });
const mockNoContent = ()        => Promise.resolve({ ok: true,  status: 204 });
const mockError     = (s, msg)  => Promise.resolve({ ok: false, status: s,   json: async () => ({ message: msg }) });
```

**Tests written:**
1. `getOverview` → calls correct URL
2. `getUsers()` no params → `/api/admin/users`
3. `getUsers({ role: 'Manager' })` → appends query string, skips empty params
4. `createManager` → POST to `/api/admin/users/managers`
5. `createEmployee` → POST to `/api/admin/users/employees`
6. `updateUser(id, payload)` → PUT to `/api/admin/users/:id`
7. `updateUserStatus(id, false)` → PATCH with `{ isActive: false }`
8. `resetUserPassword(id)` → POST to reset endpoint
9. Server error (403) → throws the error message

---

### 8.5 AuthContext.test.jsx (15 tests) — NEW

**What is AuthContext?**
The global login state manager. Provides `user`, `login()`, `logout()`, and `loading` to the whole app via React Context.

**Why it was at 7.69% coverage before:** The route guard tests spy ON `useAuth` but bypass the real AuthContext entirely. The context itself was never executed.

**Mocking approach:** `vi.mock('react-router-dom', () => ({ useNavigate: vi.fn() }))` — because `useNavigate` only works inside a real Router. We replace it with a spy and check it's called with the right path.

**TestConsumer pattern:**
```js
// Can't test AuthProvider alone — it needs children that read from context
const TestConsumer = () => {
  const { user, login, logout, loading } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'no-user'}</div>
      <button onClick={() => login({ token: 'tok', role: 'Admin' })}>Login Admin</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

**Fixture used:**
```js
beforeEach(() => {
  mockNavigate = vi.fn();
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  sessionStorage.clear(); // critical — prevents session from one test leaking into next
});
```

**Tests written:**
- Session rehydration: valid session, empty storage, orphan token, corrupted JSON, loading=false after
- `login()`: saves token, saves user JSON, Admin→`/admin`, Employee→`/employee/overview`, Manager→`/manager/analytics`, unknown→`/`
- `logout()`: clears token, clears user, clears 3 cache keys, navigates to `/login`

**Coverage result:** `AuthContext.jsx` went from **7.69% → 100%**

---

### 8.6 AdminUsersPage.test.jsx (27 tests) — NEW

**What is AdminUsersPage?**
The admin page for managing staff. It fetches users, filters them, opens modals to create/edit users, toggles active status, and resets passwords.

**Dependencies mocked:**
- `adminApi` — all 6 methods
- `react-hot-toast` — `toast.success`, `toast.error`
- `AdminUsersTable` — lightweight stub with edit/toggle/reset buttons
- `AdminUserModal` — stub that exposes submit buttons
- `ResetPasswordModal` — stub that exposes confirm button

**Why mock child components?**
Each child component is large and has its own test file. For the page tests, we only care about: "does the page pass the right data down and handle the response correctly?" The child's internal rendering is irrelevant here.

**Key patterns:**
```js
// window.confirm for toggle status
vi.spyOn(window, 'confirm').mockReturnValue(true);

// Three-state mock for API
vi.mocked(adminApi.getUsers).mockResolvedValue([makeUser()]);       // success
vi.mocked(adminApi.getUsers).mockRejectedValue(new Error('fail')); // error
```

**Tests written:** 27 across initial load, paged responses, error toast, search/filter/status, pagination, modal open/close, create Employee, create Manager, edit user, error on create, toggle status yes/no, open reset modal, confirm reset, show generated password, error on reset.

**Coverage result:** `pages/admin` went from **52.94% → 90.19%**

---

### 8.7 ManagerLayout.test.jsx (17 tests) — EXPANDED

**What is ManagerLayout?**
The sidebar + topbar layout for Manager users. Has a hamburger menu, nav links, logout button, and user info chip.

**Mocking approach:**
```js
vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
// Then in beforeEach:
vi.mocked(AuthContext.useAuth).mockReturnValue({
  user: { email: 'manager@example.com' },
  logout: mockLogout,
});
```

**Tests written:** Nav links exist, no removed links, user email shown, email first letter as avatar, fallback email when null, fallback "M" avatar, Manager label, brand name, Outlet renders child, NotificationPanel stub renders, sidebar default state, no overlay by default, hamburger opens sidebar, hamburger shows overlay, overlay click closes sidebar, logout button calls `logout()`.

**Coverage result:** `layouts` went from **66.66% → 88.88%**

---

### 8.8 EmployeeOrdersPage.test.jsx (21 tests) — EXPANDED

**What is EmployeeOrdersPage?**
A complex page where employees manage customer orders. Has a data table, a detail drawer (slides in from the right), and a cancellation modal.

**State machine (order status flow):**
```
PENDING → PROCESSING → SHIPPED → DELIVERED (terminal)
PENDING → CANCELLED  (terminal)
PROCESSING → CANCELLED (terminal)
```

**Mocking approach:**
```js
vi.mock('../../../api/ordersClient');
// Auto-mocks entire module — all exports become vi.fn()
// Then in beforeEach:
ordersClient.getAll.mockResolvedValue([makeOrder()]);
ordersClient.updateStatus.mockResolvedValue({});
```

**Key test for error case:**
```js
vi.spyOn(window, 'alert').mockImplementation(() => {});
ordersClient.updateStatus.mockRejectedValue(new Error('Update failed'));
// ... trigger the action
expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Update failed'));
```

**Tests written:** Heading/search/filter/refresh render, getAll on mount, error message display, refresh re-fetches, cancel disabled without reason, shipped hides invalid buttons, drawer opens/closes, terminal order "no actions" message, cancellation reason shown, PENDING shows Start Processing, Start Processing calls updateStatus(PROCESSING), Mark Delivered calls updateStatus(DELIVERED), Confirm Cancel sends reason, updateStatus failure shows alert, Go Back closes modal without calling API, PROCESSING shows Mark Shipped + Cancel.

**Coverage result:** `pages/employee` went from **68.61% → 88.32%**

---

## 9. Overall Coverage Journey

| Stage | % Statements | What was done |
|---|---|---|
| Start | 73.96% | Existing tests only |
| +Fixtures added | ~73.96% | Added `beforeEach`/`afterEach` to 3 guard files |
| +AuthContext tests | 79.93% | 15 new tests, AuthContext 7.69%→100% |
| +AdminUsersPage tests | 86.23% | 27 new tests |
| +ManagerLayout expanded | 86.56% | 17 tests |
| +EmployeeOrdersPage | **91.04%** | 21 tests — **TARGET ACHIEVED** |

---

## 10. VIVA Q&A — Master This

### Conceptual Questions

**Q: What is mocking?**
> Replacing a real dependency (API call, React hook, browser API) with a controlled fake so tests are fast, offline, and predictable.

**Q: What is `vi.mock` vs `vi.spyOn`?**
> `vi.mock` replaces an entire module — every export becomes a fake. `vi.spyOn` replaces just one method on a real object while keeping the rest real. I used `vi.mock` for API modules and `vi.spyOn` for React context hooks.

**Q: Why is `vi.mock` hoisted?**
> Vitest automatically moves `vi.mock()` calls to the top of the file before any imports. This ensures the mock is in place before any module tries to import the real version.

**Q: What is a fixture?**
> Setup/teardown code in `beforeEach`/`afterEach` that runs before and after every test to prevent test pollution — where one test's side effects cause another test to fail.

**Q: What does `vi.clearAllMocks()` do?**
> Resets the call history (how many times a mock was called, what arguments it received) without removing the mock implementation.

**Q: What does `vi.restoreAllMocks()` do?**
> Takes any function that was spied on with `vi.spyOn` and restores it back to its original real implementation. Critical for cleanup after each test.

**Q: Why do you need `sessionStorage.clear()` in `beforeEach`?**
> AuthContext reads from `sessionStorage` on mount. If Test 1 writes a token and Test 2 doesn't clear it, Test 2 will see that token and behave differently than expected — causing a false pass or false fail.

**Q: What is test coverage?**
> A metric showing what percentage of source code lines, branches, and functions were executed during tests. We achieved 91.04% overall, exceeding the 90% minimum.

**Q: What is branch coverage?**
> Specifically measures if/else paths. If you have `if (role === 'Admin') { ... } else { ... }`, branch coverage is only 100% if you test BOTH the true and false cases.

**Q: Why not aim for 100% coverage always?**
> Some code paths are impractical to test (CSS files, certain error boundaries). 90% is a meaningful industry target that covers all important logic paths.

### Code-Specific Questions

**Q: Why do you wrap route guards in `MemoryRouter`?**
> `AdminRouteGuard` uses `<Navigate>` from React Router, which only works inside a Router context. `MemoryRouter` provides that context without needing a real browser URL.

**Q: Why did you mock `react-router-dom` for AuthContext tests?**
> `AuthContext` calls `useNavigate()` which only works inside a Router. Since we're testing `AuthProvider` directly (not inside a Router), we mock `useNavigate` to return a `vi.fn()` spy, then check that spy was called with the correct path.

**Q: What is the `TestConsumer` component in AuthContext tests?**
> It's a minimal helper component we wrote just for testing. `AuthProvider` needs children that consume the context. `TestConsumer` reads `user`, `login`, `logout` from `useAuth()` and exposes buttons so tests can trigger context actions.

**Q: Why did you mock child components in AdminUsersPage tests?**
> `AdminUsersTable`, `AdminUserModal`, and `ResetPasswordModal` each have their own individual test files. In `AdminUsersPage` tests, we only care about page-level behavior — does it pass the right props, handle responses correctly? We don't want the child's complex internal rendering to interfere with or slow down the page tests.

**Q: What is `mockResolvedValue` vs `mockRejectedValue`?**
> `mockResolvedValue(data)` makes an async mock function return a resolved Promise (success). `mockRejectedValue(error)` makes it return a rejected Promise (throws an error). This lets us test both the happy path and error handling.

**Q: What is `vi.spyOn(window, 'confirm')`?**
> `AdminUsersPage` calls `window.confirm(...)` before toggling a user's status. In tests, this would freeze execution waiting for user input. We spy on it and make it return `true` or `false` instantly, letting us test both the "user confirms" and "user cancels" branches.

**Q: What does `waitFor` do?**
> `waitFor` from `@testing-library/react` retries an assertion multiple times until it passes or times out. It's used when we click a button that triggers an async API call — we wait for the component to re-render with the new data.

**Q: What is `fireEvent`?**
> A function from `@testing-library/react` that simulates DOM events (click, change, etc.) programmatically in tests. `fireEvent.click(button)` is equivalent to a user clicking that button.

**Q: Why does `vi.mock` go OUTSIDE the `describe` block?**
> `vi.mock` is hoisted to the file's top level automatically. Putting it inside a `describe` would be misleading — it runs at module load time, not at describe time. For clarity and correctness, always declare it at the top of the file.

---

## 11. Demonstration Script (Your 2-Minute Demo)

### Option A — Route Guard Demo
```bash
npx vitest run src/components/auth/__tests__/AdminRouteGuard.test.jsx --reporter=verbose
```
**Say:** *"Here I'm using `vi.spyOn` on the AuthContext to fake different user states. The `beforeEach` fixture clears mock state before each test so they don't interfere. All 6 role scenarios pass."*

### Option B — AuthContext Demo (Most impressive)
```bash
npx vitest run src/context/__tests__/AuthContext.test.jsx --reporter=verbose
```
**Say:** *"This tests login and logout directly. I mocked `useNavigate` from react-router-dom because it only works inside a real Router. The `beforeEach` clears sessionStorage before each test. We went from 7.69% to 100% coverage on this file."*

### Option C — AdminClient Demo (Show error handling)
```bash
npx vitest run src/api/__tests__/adminClient.test.js --reporter=verbose
```
**Say:** *"I mock the entire HTTP layer with `vi.mock`. I use three mock states — success, no-content (204), and error — to test all response paths. The `beforeEach` calls `vi.clearAllMocks()` so each test starts fresh."*

### Wow Moment — Comment out `vi.mock` to prove it's needed
```bash
# 1. Open adminClient.test.js and comment out vi.mock('../client')
# 2. Run the test — it fails with "apiFetch is not a function"
# 3. Restore the mock — all green again
```
**Say:** *"This proves that mocking is not optional — without it, the code tries to call the real `apiFetch` which fails in a Node environment."*

### Coverage Report
```bash
npx vitest run --coverage
```
**Say:** *"We started at 73.96% overall. By writing fixtures and mocking tests for AuthContext, AdminUsersPage, ManagerLayout, and EmployeeOrdersPage, we reached 91.04% — above the 90% target."*

---

## 12. Quick Reference Card

```
vi.mock('module')              → replace entire module
vi.spyOn(obj, 'method')        → replace one method on an object
vi.fn()                        → create a standalone fake function
.mockReturnValue(val)          → return val synchronously
.mockResolvedValue(val)        → return resolved Promise(val)
.mockRejectedValue(err)        → return rejected Promise(err)
vi.mocked(fn)                  → get the typed mock version of fn

beforeEach(() => { ... })      → runs BEFORE every it() block
afterEach(() => { ... })       → runs AFTER every it() block
vi.clearAllMocks()             → wipe call history
vi.restoreAllMocks()           → restore spied functions

render(<Component />)          → render in jsdom
screen.getByText('...')        → find element by text (throws if not found)
screen.queryByText('...')      → find element (returns null if not found)
screen.getByTestId('...')      → find by data-testid attribute
fireEvent.click(element)       → simulate a click
fireEvent.change(el, { target: { value: 'x' } }) → simulate input change
waitFor(() => expect(...))     → retry assertion until async update settles

expect(el).toBeInTheDocument()
expect(el).not.toBeInTheDocument()
expect(el).toBeDisabled()
expect(fn).toHaveBeenCalledWith('/admin')
expect(fn).toHaveBeenCalledTimes(1)
expect(val).toBeNull()
await expect(promise).rejects.toThrow('message')
```
