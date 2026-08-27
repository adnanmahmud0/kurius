# Kurius Video Platform — Implementation Walkthrough

## Overview

The Kurius Video Platform has been completely built and typechecked across both backend (`apps/api`), frontend admin/public portal (`apps/web`), and shared packages (`@repo/types`, `@repo/validators`).

---

## 1. Backend Architecture & Modules (`apps/api`)

### Database Models (`apps/api/prisma/schema.prisma`)

- **`User`**: Account identity with role (`SUPER_ADMIN`, `ADMIN`, `USER`), OTP verification (`verified`), relations to videos, views, likes, and comments.
- **`Category`**: Video content categories with name, slug, status (`active`/`delete`), and cascade relation to videos.
- **`Video`**: Title, subtitle, video URL, thumbnail URL, storage provider (`local` / `cloudinary`), hashtags, view counts, and cascade relations to likes/comments/views.
- **`VideoView`**: 24-hour calendar window deduplication per user/video pair.
- **`VideoLike`**: Unique constraint on `(userId, videoId)` for spam-free like toggles.
- **`Comment`**: Community discussions linked to user and video.
- **`StorageSetting`**: Dynamic storage provider switch (`local` vs `cloudinary`) with optional Cloudinary credentials.

### Complete REST & OpenAPI Endpoints

1.  **Authentication (`/api/v1/auth`)**:
    - `POST /register`: Registers user with bcrypt password hash & dispatches Gmail OTP.
    - `POST /login`: Validates credentials. If unverified, automatically issues a fresh OTP and responds with `403 requiresVerification: true`.
    - `POST /verify-email`: Verifies 6-digit OTP code.
    - `POST /forget-password` & `POST /reset-password`: Account recovery.
2.  **Category Management (`/api/v1/categories`)**:
    - `GET /`: Public active categories list.
    - `GET /admin/all`: Paginated admin category directory with video counts.
    - `POST /admin`, `PUT /admin/:id`, `DELETE /admin/:id`: Admin category CRUD.
3.  **Video Management (`/api/v1/videos`)**:
    - `GET /`: Cursor-based feed for mobile and web clients.
    - `GET /:id`: Video detail with stats and engagement status.
    - `GET /category/:categoryId`: Category-filtered cursor feed.
    - `GET /admin/all`: Paginated admin video table with filtering by search & category.
    - `POST /admin`: Multipart upload for video files (up to 500MB) and thumbnail images.
    - `PUT /admin/:id` & `DELETE /admin/:id`: Metadata update and deactivation.
4.  **Engagement & Social (`/api/v1/videos`)**:
    - `POST /:id/view`: Records video view (deduplicated by 24-hour window per user).
    - `POST /:id/like` & `DELETE /:id/like`: Video liking and unliking.
    - `POST /:id/comments` & `GET /:id/comments`: Cursor-paginated comment stream.
5.  **Dynamic Storage Settings (`/api/v1/admin/storage`)**:
    - `GET /`: Fetches active storage provider (Local Disk or Cloudinary).
    - `PUT /`: Switches active provider and saves Cloudinary credentials.
    - `POST /test`: Verifies Cloudinary API credentials.
6.  **User Directory & Analytics (`/api/v1/user`)**:
    - `GET /`: Paginated list of users with engagement counts.
    - `GET /:id`: User profile with metrics (videos created, total views, likes, comments).

---

## 2. Frontend Admin & Public Application (`apps/web`)

### Public Pages (`apps/web/src/app/(public)`)

- `GET /login`: Admin authentication form with auto-redirect to OTP verification if unverified.
- `GET /register`: Account registration form.
- `GET /verify-otp?email=...`: 6-digit OTP passcode verification screen with Resend OTP button.
- `GET /privacy`: Comprehensive privacy policy for app store and public compliance.
- `GET /terms`: Platform terms of service and acceptable use guidelines.

### Admin Console (`apps/web/src/app/(admin)`)

- `GET /admin`: Live overview dashboard with stat metric cards, live activity trends, and quick actions.
- `GET /admin/categories`: Category management data table with Add, Edit, and Deactivate dialog modals.
- `GET /admin/videos`: Video library data table with thumbnails, categories, storage badges, engagement metrics, and actions.
- `GET /admin/videos/upload`: Video upload form with drag-and-drop file picker, thumbnail selector, upload progress indicator, and active storage badge.
- `GET /admin/videos/[id]/edit`: Metadata and publishing status editor.
- `GET /admin/users`: User directory data table with role badges, verification badges, engagement counts, and pagination.
- `GET /admin/users/[id]`: User analytics profile with engagement cards.
- `GET /admin/settings/storage`: Dynamic storage selector switching between Local Disk (Default) and Cloudinary CDN with live credential testing.

---

## 3. Dynamic Storage Adapter

- **Local Disk (Default)**: Uploads are stored in the server's `uploads/` directory with UUID naming and served statically.
- **Cloudinary**: Uploads stream to Cloudinary API with dynamic credentials fetched from the `StorageSetting` database model, falling back to environment variables.

---

## 4. Verification & Testing

- **Typecheck Validation**:
  ```bash
  npx turbo typecheck
  # Result: 5 successful, 0 errors across all 7 packages
  ```
- **Prisma Client Generation**: Prisma v7.9.1 generated and synced with full schema.
- **OpenAPI Specifications**: Complete Swagger / OpenAPI documentation registered across all modules.
