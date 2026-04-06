# Employee Dashboard MVP Integration Notes

## Screen Map
* `/employee/overview`: KPI dashboard, quick recent orders view, actionable low-stock items.
* `/employee/orders`: URL-driven order search/filtering. Detailed lifecycle actions mapping to `/api/orders/{id}/status`.
* `/employee/products`: Paginated, scalable catalog interface. Integrated Creation & Edit modal using `/api/products`.
* `/employee/inventory`: Low-stock oriented grid. Adjusts stock utilizing the master Product editing endpoint.

## API Map
* **Orders**:
  * `getAll()` -> `GET /api/orders`
  * `updateStatus(id, payload)` -> `PUT /api/orders/{id}/status`
* **Products**:
  * `getList(params)` -> `GET /api/products` 
  * `getById(id)` -> `GET /api/products/{id}`
  * `create(payload)` -> `POST /api/products`
  * `update(id, payload)` -> `PUT /api/products/{id}`
  * `getStock()` -> `GET /api/products/stock`

## Deferred Features (MVP Gaps)
* **Customer List**: Backend `/api/customers` does not currently support generic employee needs. Withheld from UI.
* **Product Deletion**: Due to inconsistent commenting authorization, the soft/hard delete endpoints are hidden from the employee UI.
* **Order Creation Screen**: Building orders from the UI was deferred due to API limitations matching products with manual quantity reservations.
* **Stock Deductions on Ordering**: Currently decoupled. Must adjust stock manually until OrderService automatically handles deductions.

## Regression Notes & Hardcoded Elements

### 1. Product Categories (`src/constants/productCategories.js`)
Currently, InsightERP backend lacks a `/api/categories` endpoint that exposes the actual categories available in the database. To unblock the MVP development for `EmployeeProductsPage`, we have hardcoded the seeded constants directly onto the frontend.

**Impacted Areas:**
- `EmployeeProductsPage` category filter dropdown.
- Add/Edit Product modal category selection.
- Table rendering (mapping `categoryId` to its human-readable `name`).

**Current Hardcoded Shape:**
```javascript
export const PRODUCT_CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Office Supplies" },
  { id: 3, name: "Furniture" },
  { id: 4, name: "Maintenance Equipment" },
];
```

**Next Steps / Required API:** 
Once the backend exposes an endpoint (e.g., `GET /api/categories`), `src/constants/productCategories.js` should be deleted. We will need to either fetch the active categories globally inside `App.jsx` on load, or specifically within the pages that need them, and map the dropdowns dynamically.

### 2. API Response Normalization (`src/api/apiUtils.js`)
We rely on a global `apiUtils` to standardize and handle `{ success, data, message }` wrappings since OrderService structures its responses this way, but ProductService generally returns naked DTO arrays or objects directly.
