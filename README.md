# Kurius — Short-Form Educational Video Platform

> A production-ready, full-stack monorepo powering the **Kurius** mobile & web ecosystem — a TikTok-style platform for curiosity-driven, educational short-form videos.

---

## 🌐 Live URLs

| Service                | URL                                |
| ---------------------- | ---------------------------------- |
| 📱 Mobile App          | Android / iOS (Flutter)            |
| 🖥️ Admin Dashboard     | https://admin.kuriusapp.cloud      |
| 🌍 Public Website      | https://kuriusapp.cloud            |
| ⚡ REST API            | https://api.kuriusapp.cloud/api/v1 |
| 📖 API Docs (dev only) | https://api.kuriusapp.cloud/docs   |

---

## 📦 Version History

| Version    | Date       | Highlights                                                                                                                         |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **v1.4.0** | 2026-08-30 | Video update validation fix, subtitle optional, merge `asif` branch (legal pages, category videos, motivational messages in app)   |
| **v1.3.0** | 2026-08-29 | Security hardening: Helmet, rate limiting (auth/OTP/general), XSS sanitisation, OTP lockout, CORS hardening, Socket.IO CORS fix    |
| **v1.2.0** | 2026-08-29 | Performance: HTTP/2 Nginx, Gzip level 6, immutable static cache, in-memory auth cache, DB composite indexes, `prisma.$transaction` |
| **v1.1.0** | 2026-08-28 | Admin privacy/terms rich-text editor, CORS fix for `/privacy` & `/terms`, docs router guard scope fix                              |
| **v1.0.0** | 2026-08-27 | Initial production deployment — Next.js admin, Express API, Flutter app, Docker CI/CD pipeline                                     |

---

## 🏗️ Monorepo Structure

```
kurius/
├── apps/
│   ├── api/          ← Express.js + Prisma + PostgreSQL backend
│   ├── web/          ← Next.js 16 admin dashboard & public website
│   └── app/          ← Flutter mobile app (Android & iOS)
├── packages/
│   ├── types/        ← Shared TypeScript types
│   ├── validators/   ← Shared Zod validation schemas
│   ├── ui/           ← Shared React component library
│   ├── tsconfig/     ← Shared TypeScript configs
│   └── eslint-config/← Shared ESLint configs
├── nginx/
│   └── nginx.conf    ← Production Nginx reverse proxy config
├── .github/
│   └── workflows/
│       └── deploy.yml← CI/CD pipeline (GitHub Actions → GHCR → VPS)
├── docker-compose.yml          ← Local development Docker
├── docker-compose.prod.yml     ← Production Docker (pulls from GHCR)
└── .env.example                ← Environment variable template
```

---

## ⚙️ Tech Stack

### Backend — `apps/api`

| Technology         | Version | Purpose                   |
| ------------------ | ------- | ------------------------- |
| Node.js            | ≥ 20.x  | Runtime                   |
| Express.js         | ^4.19   | HTTP server & REST API    |
| Prisma             | ^7.8    | ORM & database migrations |
| PostgreSQL         | 16      | Primary database          |
| Socket.IO          | ^4.7    | Real-time messaging       |
| Zod                | ^3.24   | Input validation          |
| JWT                | ^9.0    | Authentication            |
| Helmet             | ^8.3    | Security headers          |
| express-rate-limit | ^8.7    | Rate limiting             |
| Multer             | ^2.0    | File uploads              |
| Cloudinary         | ^2.5    | Cloud media storage       |
| Nodemailer         | ^8.0    | Email (SMTP)              |
| Winston            | ^3.13   | Structured logging        |
| node-cache         | ^5.1    | In-memory caching         |
| xss                | ^1.0    | XSS sanitisation          |
| compression        | ^1.8    | Gzip response compression |
| Swagger / OpenAPI  | ^5.0    | API documentation         |

### Frontend — `apps/web`

| Technology      | Version | Purpose                      |
| --------------- | ------- | ---------------------------- |
| Next.js         | ^16.0   | React framework (App Router) |
| React           | ^19.2   | UI library                   |
| TypeScript      | ^5.9    | Type safety                  |
| Tailwind CSS    | ^4.0    | Styling                      |
| Radix UI        | ^1.x    | Accessible UI primitives     |
| TanStack Query  | ^5.90   | Server state management      |
| TanStack Table  | ^8.21   | Data tables                  |
| Axios           | ^1.13   | HTTP client                  |
| React Hook Form | ^7.65   | Form handling                |
| Zod             | ^3.24   | Form validation              |
| Sonner          | ^2.0    | Toast notifications          |
| Lucide React    | ^0.548  | Icon library                 |
| react-markdown  | ^10.1   | Markdown rendering           |

### Mobile App — `apps/app`

| Technology         | Version | Purpose                         |
| ------------------ | ------- | ------------------------------- |
| Flutter            | ^3.x    | Cross-platform mobile framework |
| Dart               | ^3.12   | Language                        |
| GetX               | ^4.6    | State management & routing      |
| Dio                | ^5.7    | HTTP networking                 |
| video_player       | ^2.9    | Video playback                  |
| google_fonts       | ^6.2    | Typography                      |
| shared_preferences | ^2.3    | Local storage                   |
| image_picker       | ^1.1    | Media selection                 |
| connectivity_plus  | ^6.1    | Network detection               |

### Infrastructure

| Tool           | Purpose                                           |
| -------------- | ------------------------------------------------- |
| Turborepo      | Monorepo build orchestration & caching            |
| Docker         | Containerised services                            |
| GitHub Actions | CI/CD (typecheck → build → push → deploy)         |
| GHCR           | Docker image registry (GitHub Container Registry) |
| Nginx          | Reverse proxy, SSL termination, HTTP/2, Gzip      |
| Let`s Encrypt  | Free SSL certificates via Certbot                 |
| Hostinger VPS  | Production server                                 |

---

## 🚀 Local Development Setup

### Prerequisites

Make sure you have these installed:

| Tool              | Minimum Version | Check               |
| ----------------- | --------------- | ------------------- |
| Node.js           | 20.x            | `node -v`           |
| npm               | 9.x             | `npm -v`            |
| PostgreSQL        | 15+             | `psql --version`    |
| Git               | 2.x             | `git --version`     |
| Flutter SDK       | 3.x             | `flutter --version` |
| Docker (optional) | 24+             | `docker -v`         |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/adnanmahmud0/kurius.git
cd kurius
```

---

### Step 2 — Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Then open `.env` and update these required values:

```env
# Database — must match your local PostgreSQL setup
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kurius_db?schema=public"

# JWT secrets — use any long random string
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars

# Email — use a Gmail App Password (not your real password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Super admin seed credentials
SUPER_ADMIN_EMAIL=admin@kurius.com
SUPER_ADMIN_PASSWORD=Password123!

# Frontend
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

> **Gmail App Password:** Go to Google Account → Security → App Passwords to generate one.

---

### Step 3 — Install Dependencies

From the project root (installs all workspaces):

```bash
npm install
```

---

### Step 4 — Set Up the Database

Make sure PostgreSQL is running locally, then run migrations and seed the database:

```bash
# Generate Prisma client
cd apps/api
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed the database (creates super admin + sample data)
npm run prisma:seed

# Return to root
cd ../..
```

After seeding, log into the admin dashboard with:

- Email: `admin@kurius.com`
- Password: `Password123!`

---

### Step 5 — Start the Development Servers

From the project root, start all apps simultaneously:

```bash
npm run dev
```

This launches:

| App                | URL                        |
| ------------------ | -------------------------- |
| Next.js Admin/Web  | http://localhost:3000      |
| Express API        | http://localhost:5000      |
| API Docs (Swagger) | http://localhost:5000/docs |

To run only specific apps:

```bash
npm run dev:api   # API only
npm run dev:web   # Web only
```

---

### Step 6 — Run the Flutter Mobile App

```bash
cd apps/app

# Get dependencies
flutter pub get

# Run on a connected device or emulator
flutter run
```

> **Note:** By default the app points to the production API (`https://api.kuriusapp.cloud`). To use your local API, update `productionBaseUrl` in `apps/app/lib/core/constants/api_endpoints.dart` to `http://10.0.2.2:5000/api/v1` (Android emulator) or `http://localhost:5000/api/v1` (iOS simulator).

---

## 🐳 Docker Development Setup (Optional)

If you prefer Docker for the backend services:

```bash
# Start PostgreSQL + API + Web in Docker
docker compose up -d

# Check logs
docker compose logs -f api
docker compose logs -f web

# Stop everything
docker compose down
```

---

## 🔑 Environment Variables Reference

| Variable                | Required | Default                        | Description                           |
| ----------------------- | -------- | ------------------------------ | ------------------------------------- |
| `NODE_ENV`              | ✅       | `development`                  | Environment mode                      |
| `PORT`                  | ✅       | `5000`                         | Express API port                      |
| `DATABASE_URL`          | ✅       | —                              | PostgreSQL connection string          |
| `JWT_SECRET`            | ✅       | —                              | JWT signing secret (min 32 chars)     |
| `JWT_EXPIRE_IN`         | ✅       | `7d`                           | Access token expiry                   |
| `JWT_REFRESH_SECRET`    | ✅       | —                              | Refresh token secret                  |
| `JWT_REFRESH_EXPIRE_IN` | ✅       | `90d`                          | Refresh token expiry                  |
| `BCRYPT_SALT_ROUNDS`    | ✅       | `10`                           | Password hashing rounds               |
| `EMAIL_FROM`            | ✅       | —                              | Sender email address                  |
| `EMAIL_USER`            | ✅       | —                              | SMTP username                         |
| `EMAIL_PASS`            | ✅       | —                              | SMTP password / App password          |
| `EMAIL_PORT`            | ✅       | `587`                          | SMTP port                             |
| `EMAIL_HOST`            | ✅       | `smtp.gmail.com`               | SMTP host                             |
| `SESSION_SECRET`        | ✅       | —                              | Express session secret                |
| `SUPER_ADMIN_EMAIL`     | ✅       | —                              | Seed: super admin email               |
| `SUPER_ADMIN_PASSWORD`  | ✅       | —                              | Seed: super admin password            |
| `NEXT_PUBLIC_SITE_URL`  | ✅       | `http://localhost:3000`        | Public website URL                    |
| `NEXT_PUBLIC_API_URL`   | ✅       | `http://localhost:5000/api/v1` | API URL for Next.js                   |
| `ENABLE_API_DOCS`       | ❌       | `true`                         | Enable Swagger docs (disable in prod) |
| `IP_ADDRESS`            | ❌       | `localhost`                    | API bind address                      |

---

## 📝 Available Scripts

From the project root:

```bash
npm run dev          # Start all apps in dev mode
npm run build        # Build all apps for production
npm run typecheck    # TypeScript type check all packages
npm run lint         # Lint all packages
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without writing
```

From `apps/api`:

```bash
npm run dev              # Start API with hot-reload
npm run build            # Compile TypeScript
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed initial data
npm run prisma:studio    # Open Prisma database GUI
```

From `apps/web`:

```bash
npm run dev      # Start Next.js dev server
npm run build    # Build Next.js for production
npm run lint     # Lint Next.js files
```

From `apps/app`:

```bash
flutter pub get      # Install dependencies
flutter run          # Run on device/emulator
flutter build apk    # Build Android APK
flutter build ios    # Build iOS archive
```

---

## 🔐 API Overview

Base URL: `https://api.kuriusapp.cloud/api/v1`

| Module           | Endpoints                                                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**         | `POST /auth/register`, `POST /auth/login`, `POST /auth/verify-email`, `POST /auth/forget-password`, `POST /auth/reset-password`, `POST /auth/change-password`, `POST /auth/resend-otp` |
| **User**         | `GET /user/profile`, `PATCH /user/profile`, `POST /user/profile/image`, `DELETE /user/profile`                                                                                         |
| **Videos**       | `GET /videos`, `POST /videos`, `GET /videos/:id`, `PATCH /videos/:id`, `DELETE /videos/:id`, `GET /videos/category/:categoryId`                                                        |
| **Engagement**   | `POST /videos/:id/like`, `DELETE /videos/:id/like`, `POST /videos/:id/view`                                                                                                            |
| **Comments**     | `GET /videos/:id/comments`, `POST /videos/:id/comments`, `DELETE /comments/:id`                                                                                                        |
| **Categories**   | `GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`                                                                                               |
| **Legal**        | `GET /legal/privacy`, `GET /legal/terms`, `PUT /legal/privacy`, `PUT /legal/terms`                                                                                                     |
| **Motivational** | `GET /motivational-messages`, `GET /motivational-messages/random`, `POST /motivational-messages`                                                                                       |
| **Storage**      | `GET /storage/settings`, `PUT /storage/settings`                                                                                                                                       |
| **Health**       | `GET /health`, `GET /api/v1/health`                                                                                                                                                    |

> Full interactive docs available at `/docs` when `ENABLE_API_DOCS=true`.

---

## 🚢 CI/CD Pipeline

Every push to `main` automatically triggers:

```
1. ✅ Type Check     → npx turbo typecheck (all packages)
2. 🐳 Build & Push  → Docker multi-stage build → push to GHCR
3. 🌐 Deploy        → SSH into VPS → pull new images → restart containers → reload Nginx
```

### Required GitHub Secrets

Go to **GitHub → Settings → Secrets → Actions** and add:

| Secret                  | Description                               |
| ----------------------- | ----------------------------------------- |
| `VPS_HOST`              | VPS IP address                            |
| `VPS_USER`              | SSH username (e.g. `root`)                |
| `VPS_PASSWORD`          | SSH password                              |
| `VPS_PORT`              | SSH port (usually `22`)                   |
| `DATABASE_URL`          | Production PostgreSQL URL                 |
| `POSTGRES_PASSWORD`     | PostgreSQL root password                  |
| `JWT_SECRET`            | JWT signing secret                        |
| `JWT_EXPIRE_IN`         | e.g. `7d`                                 |
| `JWT_REFRESH_SECRET`    | Refresh token secret                      |
| `JWT_REFRESH_EXPIRE_IN` | e.g. `90d`                                |
| `EMAIL_FROM`            | SMTP sender address                       |
| `EMAIL_USER`            | SMTP username                             |
| `EMAIL_PASS`            | SMTP password                             |
| `EMAIL_PORT`            | `587`                                     |
| `EMAIL_HOST`            | `smtp.gmail.com`                          |
| `SESSION_SECRET`        | Express session secret                    |
| `SUPER_ADMIN_EMAIL`     | First admin account email                 |
| `SUPER_ADMIN_PASSWORD`  | First admin account password              |
| `NEXT_PUBLIC_SITE_URL`  | e.g. `https://kuriusapp.cloud`            |
| `NEXT_PUBLIC_API_URL`   | e.g. `https://api.kuriusapp.cloud/api/v1` |

---

## 🛡️ Security Features

- **Helmet** — HTTP security headers on every response
- **Rate Limiting** — General: 300 req/min · Auth: 20 req/15min · OTP: 10 req/15min
- **XSS Sanitisation** — Recursive input sanitisation on all request bodies
- **OTP Brute-force Protection** — Account locked for 15 min after 5 failed OTP attempts
- **JWT Refresh Tokens** — 7-day access + 90-day refresh token rotation
- **bcrypt** — Password hashing with configurable salt rounds
- **CORS** — Allowlist of permitted origins per environment
- **HTTPS enforced** — Nginx redirects all HTTP → HTTPS (HSTS enabled)
- **Socket.IO CORS** — Strict origin validation for WebSocket connections

---

## 📂 Database Models

| Model                 | Description                                        |
| --------------------- | -------------------------------------------------- |
| `User`                | Platform users (SUPER_ADMIN / ADMIN / USER roles)  |
| `Video`               | Educational short-form videos with metadata        |
| `Category`            | Video categories with slugs and thumbnails         |
| `VideoView`           | Per-user video view tracking                       |
| `VideoLike`           | Per-user video likes (unique constraint)           |
| `Comment`             | Video comments with soft-delete status             |
| `StorageSetting`      | Configurable storage provider (local / Cloudinary) |
| `LegalPolicy`         | Privacy policy & terms of service content          |
| `MotivationalMessage` | Daily motivational quotes shown in app             |
| `ResetToken`          | Password reset tokens with expiry                  |

---

## 📁 Key Feature Files

### API

- `apps/api/src/app.ts` — Express app setup (security, middleware, routes)
- `apps/api/src/server.ts` — HTTP + Socket.IO server
- `apps/api/prisma/schema.prisma` — Database schema
- `apps/api/src/app/middlewares/rateLimiter.ts` — Multi-tier rate limiting
- `apps/api/src/app/middlewares/sanitize.ts` — XSS sanitisation
- `apps/api/src/helpers/storageAdapter.ts` — Local / Cloudinary storage adapter

### Web

- `apps/web/src/app/(admin)/` — Protected admin dashboard pages
- `apps/web/src/middleware.ts` — Route authentication middleware
- `apps/web/src/app/(admin)/admin/settings/` — Storage, Privacy, Terms settings

### App (Flutter)

- `apps/app/lib/features/user/video_scroll/` — TikTok-style video feed
- `apps/app/lib/data/repositories/` — API repository layer
- `apps/app/lib/core/constants/api_endpoints.dart` — API endpoint constants

---

## 🤝 Contributing

1. Create a branch: `git checkout -b feat/your-feature`
2. Make commits using Conventional Commits format:
   ```
   feat: add new feature
   fix: fix a bug
   chore: update dependencies
   docs: update documentation
   refactor: refactor code
   perf: performance improvement
   ```
3. Push and open a Pull Request against `main`

> Husky pre-commit hooks enforce Prettier formatting and commitlint rules automatically.

---

## 📄 License

Private — All Rights Reserved © 2026 Kurius
