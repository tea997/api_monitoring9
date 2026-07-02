# API Monitoring System — Plan

## What We Have
- Backend API server (Express, MongoDB, PostgreSQL, RabbitMQ)
- Dashboard (React/Vite)
- Auth system (super_admin, client_admin, client_viewer roles)
- API hit monitoring middleware
- Client management

---

## TODO

- [ ] **Onboarding & Authentication Enhancements**
  - Optimize the Login page to match the clean "Clearfreight" layout with visual side illustrations and a crisp sign-in card.
  - Implement a check/route for First-Time Super Admin Onboarding if the database has zero users, allowing easy setup via a visual form instead of raw API requests.

- [ ] **Client Onboarding Page (Super Admin)**
  - Form for Super Admins to onboard new Clients (`POST /admin/clients`).
  - Add missing backend endpoint `GET /admin/clients` to list onboarded clients and display them in the UI.

- [ ] **Create Client User Page**
  - Page to manage client users and create client-specific admins/viewers (`POST /admin/clients/:clientId/users`).
  - Provide role and permission toggles.

- [ ] **API Key Page with Secure One-Time Display**
  - Page to list and create API keys for clients.
  - Show a secure one-time-view modal with copy-to-clipboard functionality when a new API key is created.

- [ ] **Optimize Dashboard UI (Premium Mockup Match) & Client Switcher**
  - Redesign dashboard to match the beautiful, sleek, modern layout from the provided mockup (MoonRow theme).
  - Include cards for Today's Increase, Billing & Transactions, Top Performing Countries, User Retention Cohorts, and Target Sales Breakdown/API hits breakdown.
  - Add a Client Switcher dropdown for Super Admins to filter analytics by client.
  - Implement Time-Range Analytics filtering (Daily, Weekly, Monthly, Annually tabs) that updates the dashboard queries dynamically.
  - Implement dynamic charts, clean HSL colors, polished typography (Inter/Outfit), and subtle micro-animations.

---

## Notes
- We will write clean code following existing API route schemas.
- Add client onboarding, user creation, and API key management routes to the frontend React Router navigation.
- Ensure the user's role is respected in the UI (e.g., hiding Super Admin pages from Client Viewers).
- do not alter the backend logic