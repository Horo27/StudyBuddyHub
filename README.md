# StudyBuddyHub

Aplicație web full-stack pentru studenți — platformă de anunțuri pentru meditații și sesiuni de studiu colaborativ.

## Stack tehnic

- **Backend**: ASP.NET Core 10 Web API, EF Core, ASP.NET Core Identity, JWT
- **Frontend**: Angular 19, Angular Material (tema Indigo/Pink)
- **Baza de date**: SQL Server (LocalDB pentru development)

## Arhitectură backend

```
StudyBuddyHub.Api         ← Controllers, DTOs, Middleware, Mappings
StudyBuddyHub.Core        ← Entities, Interfaces, Enums
StudyBuddyHub.Infrastructure ← DbContext, Repositories, Services, Migrations
StudyBuddyHub.Tests       ← xUnit Tests
```

## Entități

| Entitate        | Relații |
|-----------------|---------|
| ApplicationUser | 1-N StudyOffer, 1-N StudyRequest, N-N StudyOffer (prin FavoriteOffer) |
| StudyOffer      | N-1 User, N-1 Subject, 1-N StudyRequest |
| StudyRequest    | N-1 StudyOffer, N-1 User |
| Subject         | 1-N StudyOffer |
| FavoriteOffer   | N-1 User, N-1 StudyOffer |
| Role            | Identity |

## Controllere API

| Controller | Route | Protejat |
|---|---|---|
| AuthController | `/api/auth` | parțial |
| StudyOffersController | `/api/studyoffers` | parțial |
| StudyRequestsController | `/api/studyrequests` | complet |
| SubjectsController | `/api/subjects` | nu |
| FavoritesController | `/api/favorites` | complet |
| AdminController | `/api/admin` | Admin only |

## Pagini frontend

| Pagină | Rută | Guard |
|---|---|---|
| Home / Oferte | `/` | — |
| Login | `/login` | — |
| Register | `/register` | — |
| Detalii ofertă | `/offers/:id` | — |
| Creare ofertă | `/offers/create` | Auth |
| Editare ofertă | `/offers/:id/edit` | Auth |
| Profil | `/profile` | Auth |
| Ofertele mele | `/dashboard/my-offers` | Auth |
| Cererile mele | `/dashboard/my-requests` | Auth |
| Admin panel | `/admin` | Admin |

## Pași de rulare

### Prerequisite

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) și npm
- SQL Server LocalDB (inclus cu Visual Studio) sau SQL Server Express

### Backend

```bash
# Restaurează pachetele și rulează
cd StudyBuddyHub.Api
dotnet run
# API disponibil la http://localhost:5117
# Swagger UI la http://localhost:5117/swagger
```

Baza de date se creează automat la prima rulare. Datele seed includ:
- Admin: `admin@studybuddy.com` / `Admin123!`
- 8 materii predefinite

### Frontend

```bash
cd study-buddy-hub-frontend
npm install
ng serve
# Frontend la http://localhost:4200
```

## Credențiale implicite

| Email | Parolă | Rol |
|---|---|---|
| admin@studybuddy.com | Admin123! | Admin |

## Funcționalități implementate

- ✅ Autentificare JWT cu roluri (Admin, Student)
- ✅ CRUD complet StudyOffer cu filtrare
- ✅ Trimitere/acceptare/respingere cereri de participare
- ✅ Favorite (relație N-N User ↔ StudyOffer)
- ✅ Panou admin (statistici, gestiune utilizatori)
- ✅ Middleware global de excepții (JSON 400/403/404/500)
- ✅ Logging cu ILogger<T>
- ✅ Protected routes cu Angular Guards
- ✅ HTTP Interceptor pentru JWT
- ✅ Formulare cu validare client-side
