# Admin Dashboard Internal Documentation

## Environment Setup
To ensure the Admin Dashboard correctly interfaces with the backend services, the gateway/backend URL must be properly configured in your `.env.local` or respective environment file:

```env
VITE_API_BASE_URL=http://localhost:5000
```
*Note: Depending on production, `VITE_API_BASE_URL` will point to the Azure Gateway or Production backend URI.*

## Admin Route Access
The route `http://localhost:5173/admin` requires specific authentication states.
- The `AuthContext` relies on `sessionStorage.getItem("erp_token")` which expects a JWT token payload.
- The `AdminRouteGuard` intercepts all traffic to `/admin/*`. If the user role resolved in state is anything other than `Admin` or `ADMIN`, it ejects them back to the `/` user dashboard or `/login` landing page.

## Staff Management Flows

### Creating Staff
Available roles are strictly partitioned to `Employee` and `Manager` via the unified modal UI. The Admin client determines the proper endpoint (`POST /api/admin/users/managers` vs `POST /api/admin/users/employees`) based on the dropdown selection context rather than passing the role generic parameter. Admin accounts are inherently write-protected by the system and backend.

### Passwords & Resets
The ERP system operates without explicit forced password resets flows per user log in. 
Consequently, Admin-initiated password resets execute `POST /api/admin/users/{id}/reset-password`. The UI intercepts the generated response strings and exposes the temporary password in an unrepeatable, one-time visibility Modal (with one-click clipboard copying), emphasizing the strict security policy.

### Status Toggling (Deactivation)
"Delete" functionality maps visually to status deactivation via `PATCH /api/admin/users/{id}/status`. No rows are dropped from the database allowing historical auditing of actions. Deactivated accounts remain visible within the portal, retaining filtering capabilities but denying platform access implicitly via the downstream API.

## Testing Architecture
Tests are implemented using `vitest` mapping `jsdom`. 
Execute test sequences explicitly using:
```bash
npm run test
```
*Note: Add `"test": "vitest"` into your `package.json` scripts if omitted.*
