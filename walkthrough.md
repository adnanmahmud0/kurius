# Kurius Video Platform — Implementation Walkthrough

## Summary of Completed Work

The full Kurius Video Platform has been constructed according to the master plan:

### 1. Database & Prisma (`apps/api/prisma/schema.prisma`)

- Added models: `Category`, `Video`, `VideoView`, `VideoLike`, `Comment`, `StorageSetting`, `LegalPolicy`.
- User relations updated to track created videos, views, likes, and comments.
- Generated Prisma Client v7.9.1.
- Applied migrations and seeded default Super Admin, categories, storage settings, privacy policy, and terms of service.

### 2. Backend Modules (`apps/api/src/app/modules/`)

- **Auth Module**: Registration with OTP email (Gmail SMTP: `owwp qtnh onww dwed`), auto-resend OTP on unverified login attempts (`403` with `requiresVerification`), OTP verification, password reset.
- **Category Module**: Public active list, admin paginated directory, create, update, deactivate.
- **Video Module**: Cursor-based public & category feed, admin video table with filtering, multipart file uploads (up to 500MB), thumbnail cover handling, edit, and delete.
- **Engagement Module**: Views tracking with 24-hour calendar window deduplication per user/video, and likes toggling with unique constraints.
- **Comment Module**: Add comments, delete comments, and cursor-paginated comment list.
- **Storage Setting Module**: Switch dynamically between Local Disk (`uploads/`) and Cloudinary, with real-time credential testing endpoint.
- **Legal Policy Module**: Public endpoints to fetch Privacy Policy / Terms of Service (`GET /legal/:type`) and admin update endpoints (`PUT /legal/:type`).
- **User Module**: Paginated user directory with live engagement counts and user profile detail.
- **OpenAPI Documentation**: Fully documented in Swagger/OpenAPI registry for all routes.

### 3. Frontend Portal & Admin Console (`apps/web/`)

- **Public Pages**:
  - `/login`: Admin login with verification redirect.
  - `/register`: User registration.
  - `/verify-otp`: 6-digit OTP verification screen with resend function.
  - `/privacy`: Dynamically renders database-stored Privacy Policy.
  - `/terms`: Dynamically renders database-stored Terms of Service.
- **Admin Console**:
  - `/admin`: Dashboard with live metrics (users, videos, views, likes), activity trend chart, quick actions.
  - `/admin/categories`: Category management with Add, Edit, and Delete modals.
  - `/admin/videos`: Video library with thumbnail preview, category filter, storage badges, engagement metrics.
  - `/admin/videos/upload`: Video upload form with drag-and-drop file picker, progress bar, and storage destination indicator.
  - `/admin/videos/[id]/edit`: Metadata and status editor.
  - `/admin/users`: User directory with verification and role badges, metrics, and pagination.
  - `/admin/users/[id]`: User profile and engagement analytics breakdown.
  - `/admin/settings/storage`: Dynamic storage selector (Local Disk vs Cloudinary) with live connection test.
  - `/admin/settings/privacy`: Markdown editor with live preview for Privacy Policy.
  - `/admin/settings/terms`: Markdown editor with live preview for Terms of Service.

### 4. Git Repositories & Dual-Push Setup

- **Personal Repo**: `https://github.com/adnanmahmud0/kurius.git`
- **Client Repo**: `https://github.com/lav283/kuriusapp_fiverr.git`
- **Dual-Push**: Configured on `origin`. Running `git push origin main` pushes to both repositories simultaneously.
