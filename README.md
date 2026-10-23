# StudyBuddyHub

Full-stack web application for students — a listings platform for tutoring and collaborative study sessions, with Stripe payments and real-time notifications.

<p align="center">
  <img src="docs/screenshots/home.png" alt="Home page with the list of offers" width="85%"/>
  <br/>
  <em>Home page — list of offers with filtering</em>
</p>

## Tech Stack

- **Backend**: ASP.NET Core 10 Web API, EF Core (Npgsql), ASP.NET Core Identity, JWT, SignalR
- **Frontend**: Angular 19, Angular Material (Indigo/Pink theme), standalone components, lazy loading
- **Database**: PostgreSQL 17
- **Payments**: Stripe Checkout + Webhooks
- **E2E**: Playwright
- **Containerization**: Docker + Docker Compose (Nginx for the frontend)

## Backend Architecture

```
StudyBuddyHub.Api            ← Controllers, DTOs, Hubs, Middleware, Mappings
StudyBuddyHub.Core           ← Entities, Interfaces, Enums
StudyBuddyHub.Infrastructure ← DbContext, Repositories, Services, Migrations
StudyBuddyHub.Tests          ← xUnit Tests
e2e                          ← Playwright end-to-end tests
```

## Entities

| Entity          | Relationships |
|-----------------|---------------|
| ApplicationUser | 1-N StudyOffer, 1-N StudyRequest, N-N StudyOffer (via FavoriteOffer) |
| StudyOffer      | N-1 User, N-1 Subject, 1-N StudyRequest |
| StudyRequest    | N-1 StudyOffer, N-1 User |
| Subject         | 1-N StudyOffer |
| FavoriteOffer   | N-1 User, N-1 StudyOffer |
| Role            | Identity |

## API Controllers

| Controller | Route | Protected |
|---|---|---|
| AuthController | `/api/auth` | partially |
| StudyOffersController | `/api/studyoffers` | partially |
| StudyRequestsController | `/api/studyrequests` | fully |
| SubjectsController | `/api/subjects` | no |
| FavoritesController | `/api/favorites` | fully |
| PaymentsController | `/api/payments` | partially (public webhook) |
| AdminController | `/api/admin` | Admin only |

<p align="center">
  <img src="docs/screenshots/create-offer.png" alt="Create offer form" width="70%"/>
  <br/>
  <em>Create offer form — POST <code>/api/studyoffers</code></em>
</p>

## SignalR Hubs

| Hub | Endpoint | Authentication |
|---|---|---|
| NotificationHub | `/hubs/notifications` | JWT (via `access_token` query) |

Notifications are emitted through `SignalRNotificationService` on events such as receiving or accepting a request.

## Frontend Pages

| Page | Route | Guard |
|---|---|---|
| Home / Offers | `/` | — |
| Login | `/login` | — |
| Register | `/register` | — |
| Offer details | `/offers/:id` | — |
| Create offer | `/offers/create` | Auth |
| Edit offer | `/offers/:id/edit` | Auth |
| Profile | `/profile` | Auth |
| My offers | `/dashboard/my-offers` | Auth |
| My requests | `/dashboard/my-requests` | Auth |
| Payment successful | `/payment/success` | — |
| Payment canceled | `/payment/cancel` | — |
| Admin panel | `/admin` | Admin |

<p align="center">
  <img src="docs/screenshots/offer-details.png" alt="Offer details page" width="80%"/>
  <br/>
  <em>Offer details (<code>/offers/:id</code>) — full information & request submission</em>
</p>

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) and npm
- [PostgreSQL 17](https://www.postgresql.org/download/) (or Docker)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (optional, for containerized runs)

### Environment Variables

Create a `.env` file in the project root (used by `docker-compose`):

```env
POSTGRES_DB=studybuddyhub
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_KEY=superSecretKey@345superSecretKey@345
JWT_ISSUER=StudyBuddyHub
JWT_AUDIENCE=StudyBuddyHub
FRONTEND_URL=http://localhost:4200
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Option 1 — Docker Compose (recommended)

```bash
docker network create studlab_net   # one time only
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
# API:      http://localhost:8080
# Frontend: http://localhost:4200
```

### Option 2 — Manual Run

**Backend:**

```bash
cd StudyBuddyHub.Api
dotnet run
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger
```

The database and seed data are applied automatically on first run. The seed data includes:
- Admin: `admin@studybuddy.com` / `Admin123!`
- 8 predefined subjects

**Frontend:**

```bash
cd study-buddy-hub-frontend
npm install
npm start
# Frontend at http://localhost:4200
```

**E2E Tests (Playwright):**

```bash
cd e2e
npm install
npx playwright install
npm test            # headless
npm run test:headed # with visible browser
npm run test:ui     # UI mode
```

## Default Credentials

| Email | Password | Role |
|---|---|---|
| admin@studybuddy.com | Admin123! | Admin |

## Implemented Features

- JWT authentication with roles (Admin, Student)
- Full CRUD for StudyOffer with filtering
- Sending/accepting/rejecting participation requests
- Favorites (N-N relationship User ↔ StudyOffer)
- Stripe Checkout payments + webhook for confirmation
- Real-time notifications via SignalR (Observer pattern)
- Admin panel (statistics, user management)
- Global exception middleware (JSON 400/403/404/500)
- Logging with `ILogger<T>`
- Protected routes with Angular Guards
- HTTP Interceptor for JWT
- Forms with client-side validation
- Playwright suite for the main flows (auth, offers, dashboard, payment, admin)
