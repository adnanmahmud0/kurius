# Video Platform — Backend Build Plan

**Stack:** Express.js + Prisma · Turborepo Monorepo · `apps/api`
**Derived from:** Admin Dashboard & Project Backend Requirements + Cursor Monorepo Rules

---

## 1. Project Overview

This plan translates the Admin Dashboard & Project Backend Requirements document into a concrete, buildable engineering plan for the existing NextJS + ExpressJS Turborepo monorepo (`apps/web`, `apps/api`, `packages/*`), following the repo's established module pattern, naming conventions, and security rules exactly as defined in the Cursor rules file.

The system is a video-based application with two roles — **Normal User** and **Administrator** — covering authentication, OTP verification, category management, video upload/discovery, engagement (views/likes/comments), and admin analytics.

### 1.1 Roles

| Role | Main Responsibilities |
|---|---|
| Normal User | Register/login, OTP verification, browse videos, view videos, like videos, comment on videos, access personal info. |
| Admin User | Manage categories, upload/manage videos, view users, monitor engagement & analytics. |

### 1.2 Confirmed Tech Stack (per repo conventions)

- **Runtime/Framework:** Node.js + Express.js (`apps/api`)
- **ORM:** Prisma (PostgreSQL recommended for relational integrity + unique constraints)
- **Validation:** Zod (shared via `packages/validators` where applicable)
- **Auth:** JWT (short-lived access + long-lived refresh token), Passport.js for OAuth strategies (optional/future)
- **Password hashing:** bcrypt, ≥ 10 rounds
- **Logging:** Winston (structured) + Morgan (HTTP request logs)
- **API docs:** OpenAPI 3.0 via Zod `.openapi()` + Swagger UI at `/api/docs`
- **File storage:** Object storage service (S3-compatible / Cloudinary) for video files — DB stores URL + metadata only
- **OTP delivery:** Email/SMS provider (finalize provider during setup) via `src/helpers/emailHelper.ts` or a new `smsHelper.ts`

---

## 2. Where Everything Lives (`apps/api`)

Every feature below follows the mandatory 5-file module pattern already defined in the repo rules:

```
<module>.validation.ts   → Zod schemas (create<Action>ZodSchema)
<module>.route.ts        → validateRequest → controller
<module>.controller.ts   → catchAsync + service call + sendResponse
<module>.service.ts      → business logic + Prisma + ApiError throws
<module>.openapi.ts      → OpenAPI registration (mandatory, no JSDoc swagger)
```

### 2.1 Planned modules under `src/app/modules/`

- `auth/` — register, login, send-otp, verify-otp, refresh-token
- `user/` — profile, admin user listing, user detail + engagement stats
- `otp/` — OTP generation, hashing, expiry, verification (used by auth)
- `category/` — CRUD for video categories (admin-only writes)
- `video/` — upload, list, detail, list-by-category, update, delete/deactivate
- `engagement/` — video view tracking, like/unlike
- `comment/` — create/list/moderate comments

### 2.2 Supporting infrastructure to add/confirm

- `src/app/middlewares/auth.ts` — verifies JWT, attaches `req.user`
- `src/app/middlewares/authorizeRoles.ts` — role gate for admin-only routes
- `src/app/middlewares/validateRequest.ts` — Zod request validation
- `src/app/middlewares/uploadFile.ts` — multer/S3 streaming middleware + file type/size checks
- `src/app/middlewares/rateLimiter.ts` — rate limiting for `/auth/login` and `/auth/*-otp`
- `src/util/generateOTP.ts`, `src/util/cryptoToken.ts`
- `src/helpers/jwtHelper.ts`, `src/helpers/emailHelper.ts` (or `smsHelper.ts`)
- `src/DB/` — Prisma client singleton (also exposed as `src/shared/prisma.ts` per rules)
- `src/docs/` — OpenAPI registry + `generate-openapi.ts` + Swagger router at `/api/docs`

---

## 3. Database Schema (Prisma)

Derived from the "Suggested Database Entities" section of the requirements doc, expressed as a Prisma schema. PostgreSQL assumed; adjust types if a different engine is chosen during technical design.

```prisma
model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  passwordHash  String
  isVerified    Boolean  @default(false)
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  videos        Video[]  @relation("CreatedVideos")
  views         VideoView[]
  likes         VideoLike[]
  comments      Comment[]
}
enum Role { USER ADMIN }

model Otp {
  id         String   @id @default(cuid())
  userId     String?
  contact    String              // email or phone used for delivery
  otpHash    String
  purpose    OtpPurpose
  attempts   Int      @default(0)
  expiresAt  DateTime
  verifiedAt DateTime?
  createdAt  DateTime @default(now())
}
enum OtpPurpose { REGISTER_VERIFY LOGIN PASSWORD_RESET }

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  status    Status   @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  videos    Video[]
}

model Video {
  id         String   @id @default(cuid())
  title      String
  subtitle   String
  videoUrl   String
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id])
  hashtags   String[]
  status     Status   @default(ACTIVE)
  createdBy  String
  creator    User     @relation("CreatedVideos", fields: [createdBy], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  views      VideoView[]
  likes      VideoLike[]
  comments   Comment[]
  @@index([categoryId])
}
enum Status { ACTIVE INACTIVE }

model VideoView {
  id       String   @id @default(cuid())
  userId   String
  videoId  String
  viewedAt DateTime @default(now())
  user     User  @relation(fields: [userId], references: [id])
  video    Video @relation(fields: [videoId], references: [id])
  @@index([videoId])
}

model VideoLike {
  id        String   @id @default(cuid())
  userId    String
  videoId   String
  createdAt DateTime @default(now())
  user      User  @relation(fields: [userId], references: [id])
  video     Video @relation(fields: [videoId], references: [id])
  @@unique([userId, videoId])   // prevents duplicate likes
}

model Comment {
  id          String   @id @default(cuid())
  userId      String
  videoId     String
  commentText String
  status      Status   @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User  @relation(fields: [userId], references: [id])
  video       Video @relation(fields: [videoId], references: [id])
  @@index([videoId])
}
```

> Note: `email` is indexed via `@unique`; `categoryId`, `videoId`, and `userId` indexes above satisfy the requirement to index frequently-queried fields.

---

## 4. API Endpoint Structure (`/api/v1`)

Same routes as the requirements doc, adjusted to sit under the repo's mandatory `/api/v1` versioning.

### 4.1 Auth

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user | Public |
| POST | `/api/v1/auth/login` | Login user/admin | Public |
| POST | `/api/v1/auth/send-otp` | Send OTP | Public/User |
| POST | `/api/v1/auth/verify-otp` | Verify OTP | Public/User |
| POST | `/api/v1/auth/refresh-token` | Rotate access token | Authenticated |

### 4.2 Categories

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/v1/categories` | Get categories | User/Admin |
| POST | `/api/v1/admin/categories` | Create category | Admin |
| PUT | `/api/v1/admin/categories/{id}` | Update category | Admin |
| DELETE | `/api/v1/admin/categories/{id}` | Delete/deactivate category | Admin |

### 4.3 Videos

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/v1/videos` | Get videos (paginated) | User/Admin |
| GET | `/api/v1/videos/{id}` | Get video details | User/Admin |
| GET | `/api/v1/videos/category/{categoryId}` | Get videos by category | User/Admin |
| POST | `/api/v1/admin/videos` | Upload/create video | Admin |
| PUT | `/api/v1/admin/videos/{id}` | Update video | Admin |
| DELETE | `/api/v1/admin/videos/{id}` | Delete/deactivate video | Admin |

### 4.4 Engagement

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/v1/videos/{id}/view` | Record video view | Authenticated |
| POST | `/api/v1/videos/{id}/like` | Like video | Authenticated |
| DELETE | `/api/v1/videos/{id}/like` | Unlike video | Authenticated |
| POST | `/api/v1/videos/{id}/comments` | Create comment | Authenticated |
| GET | `/api/v1/videos/{id}/comments` | Get comments (paginated) | User/Admin |

### 4.5 Admin — Users & Analytics

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/v1/admin/users` | Get users (paginated, searchable) | Admin |
| GET | `/api/v1/admin/users/{id}` | User details + engagement stats | Admin |

---

## 5. Standard Response Contract

Enforced everywhere via `sendResponse` / `globalErrorHandler` — no endpoint may deviate.

```ts
// Success
{ success: true, statusCode: 200, message: "...", data: {...} | null }

// Error
{ success: false, message: "...", errorMessages: [{ path, message }], stack?: "..." }
```

---

## 6. Build Plan — Phased Roadmap

Sequenced so each phase produces a testable, demoable slice. Suggested pace assumes one backend developer; compress phases if working in parallel with the frontend team.

### Phase 0 — Project Setup & Foundations (2–3 days)
- Confirm Turborepo scaffold matches cursor rules (`apps/api`, `apps/web`, `packages/*`)
- Init Prisma + choose PostgreSQL provider; write initial `schema.prisma` (Section 3)
- Set up `src/config/index.ts` + `.env.example`; wire `@t3-oss/env` or equivalent validation on the API side
- Set up `shared/prisma.ts`, `shared/logger.ts` (Winston), `shared/sendResponse.ts`, `shared/catchAsync.ts`
- Set up `errors/ApiError.ts`, `handleZodError.ts`, `handleValidationError.ts`, `globalErrorHandler`
- Set up `src/routes/v1/index.ts` mounted at `/api/v1`; health check route
- Set up `src/docs` (OpenAPI registry + `generate-openapi.ts`) and Swagger UI at `/api/docs`

### Phase 1 — Auth, OTP & Role Middleware (4–6 days)
- `auth` module: register, login (bcrypt ≥ 10 rounds), JWT access + refresh tokens (`jwtHelper`)
- `otp` module: generateOTP, hash + store with expiry, send-otp, verify-otp, attempt/rate limits
- `middlewares/auth.ts` (JWT verify → `req.user`), `middlewares/authorizeRoles.ts`
- `middlewares/rateLimiter.ts` applied to login + otp routes
- OpenAPI docs for every auth/otp endpoint
- Acceptance check: user can register → receive OTP → verify → log in securely

### Phase 2 — Category Management (2 days)
- `category` module: create/list/get-by-id/update/delete-deactivate
- Admin-only writes via `auth` + `authorizeRoles('ADMIN')`
- Unique category name constraint + status field
- OpenAPI docs; acceptance check: admin creates a category, user/admin can list it

### Phase 3 — Video Upload & Management (4–5 days)
- `middlewares/uploadFile.ts`: validate file type/size before hitting storage
- Integrate object storage (S3-compatible or Cloudinary); store returned URL + metadata in DB
- `video` module: create (admin), list, get-by-id, list-by-category, update, delete/deactivate
- Validate category existence and required fields (title, subtitle, file, category) at the Zod layer
- OpenAPI docs; acceptance check: admin uploads a video with title/subtitle/category/hashtags, and it is retrievable via `GET /videos`

### Phase 4 — Engagement — Views, Likes, Comments (3–4 days)
- `engagement` module: record view (dedupe per business rule, e.g. one counted view per user per 24h), like, unlike
- DB unique constraint `(userId, videoId)` on `VideoLike` to block duplicate likes
- `comment` module: create comment (sanitized/validated input), list comments (paginated), admin moderation/delete
- OpenAPI docs; acceptance check: user can view/like/unlike/comment, and duplicate likes are rejected

### Phase 5 — Admin User Listing & Analytics (2–3 days)
- `user` module (admin side): `GET /admin/users` with pagination + search/filter
- `GET /admin/users/{id}`: name, email, verification status, created date, videos viewed, videos liked, comments created
- Use Prisma aggregate/count queries (or a materialized/denormalized counter strategy if scale requires it)
- OpenAPI docs; acceptance check: admin retrieves user list and a single user's full engagement profile

### Phase 6 — Cross-Cutting Hardening (3–4 days)
- Pass over every endpoint: HTTPS-only in prod, CORS allowlist, httpOnly/secure/sameSite cookies
- Confirm no sensitive fields (passwords, otpHash, tokens) ever leave the API in responses or logs
- Add remaining rate limits, standardize pagination across all list endpoints
- Full ESLint/Prettier/typecheck pass across `apps/api`; remove `console.log` and unused imports
- Fill out remaining OpenAPI gaps so `/api/docs` fully reflects the live API

### Phase 7 — Testing & QA (3–5 days)
- Unit tests for services (business logic, especially OTP expiry and like-dedupe)
- Integration tests per module hitting real routes against a test database
- Manual pass against every item in the Acceptance Criteria checklist (Section 8)
- Load-check paginated endpoints (videos, comments, users) with representative data volumes

### Phase 8 — Deployment (2–3 days)
- Finalize environment variables in `.env.example`; configure secrets in the hosting platform
- Run `prisma migrate deploy` against production DB
- Configure production logging level (warn/error only) and object storage bucket/CDN
- Smoke test all `/api/v1` routes and `/api/docs` in the deployed environment

---

## 7. Security Checklist

- [ ] Passwords hashed with bcrypt (≥ 10 rounds); never stored or logged in plaintext
- [ ] JWT secrets loaded only from environment variables via `src/config`
- [ ] Access token short-lived, refresh token long-lived, both verified server-side
- [ ] `authorizeRoles(...)` enforced on every admin-only route, layered on top of `auth`
- [ ] OTP hashed at rest, time-limited, with attempt and rate limits
- [ ] Duplicate likes blocked by a DB-level unique constraint, not just application logic
- [ ] Comment input sanitized/validated before persistence
- [ ] Uploaded video files validated for type and size before storage
- [ ] CORS restricted to an explicit allowlist — no wildcard in production
- [ ] Cookies set with `httpOnly`, `secure`, `sameSite`
- [ ] HTTPS enforced in production
- [ ] Stack traces and internal error details never returned in production API responses
- [ ] Indexes applied to `email`, `categoryId`, `videoId`, `userId`
- [ ] Rate limiting applied to `/auth/login` and OTP endpoints

---

## 8. Acceptance Criteria (Definition of Done)

- [ ] A user can register and receive an OTP
- [ ] A user can verify the OTP and become verified
- [ ] A user can log in securely
- [ ] An admin can create a video category
- [ ] An admin can upload a video with title, subtitle, category, and hashtags
- [ ] Users can retrieve videos through the video APIs
- [ ] Users can retrieve categories through the category API
- [ ] A user can view a video and the backend records the view
- [ ] A user can like/unlike a video
- [ ] A user can create and retrieve comments
- [ ] An admin can retrieve users and see name, email, verification status, video views, likes, and comments
- [ ] Admin-only APIs cannot be accessed by normal users
- [ ] All major APIs provide validation, authentication where required, and consistent responses

---

## 9. Open Decisions for Technical Design

Per the requirements doc's Scope Note, the following must be finalized before/during Phase 0–1:

- Database engine (PostgreSQL recommended) and hosting provider
- Object/video storage provider (e.g. AWS S3, Cloudflare R2, Cloudinary) and CDN strategy
- OTP delivery provider (email vs SMS vs both) and vendor (e.g. SES, Twilio)
- Exact view de-duplication rule (per session, per 24h, per user-per-video-lifetime, etc.)
- Pagination convention (page/limit vs cursor-based) applied consistently across list endpoints
- Deployment target (e.g. Docker + a cloud provider, or a PaaS) and CI/CD pipeline
