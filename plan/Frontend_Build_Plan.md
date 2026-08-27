# Video Platform — Frontend Build Plan

**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query
**App:** `apps/web` in the Turborepo monorepo
**Companion doc:** `Backend_Build_Plan.md` (this plan consumes that API 1:1)

---

## 1. Project Overview

This plan covers the two consumers of the backend defined in the Backend Build Plan:

1. **Public/User-facing app** — registration, OTP verification, login, video discovery/feed, video playback, likes, comments.
2. **Admin Dashboard** — category management, video upload/management, user list & engagement analytics.

Both live in the same `apps/web` Next.js app, split by route group, sharing the same API client, auth/session handling, and `@repo/ui` component library.

### 1.1 Confirmed Tech Stack (per repo conventions)

- **Framework:** Next.js 16 App Router, TypeScript strict mode
- **Styling:** Tailwind CSS v4, no inline styles
- **Components:** shadcn/ui (`components/ui`, off-limits — wrap instead of modifying)
- **Server state:** TanStack Query (`useQuery` / `useMutation`) — no `useState` for server state
- **HTTP client:** Axios via `src/lib/api.ts`
- **Global UI state:** React Context in `src/providers/`
- **Env validation:** `@t3-oss/env-nextjs` + Zod in `src/env.ts`
- **Icons:** `lucide-react` only
- **Notifications:** toast for all data-fetching errors (never silently swallowed)
- **Accessibility:** every interactive element has an accessible label; ARIA where semantic HTML isn't enough

### 1.2 Design Starting Points — shadcn Blocks

Rather than building the admin shell and auth screens from bare components, the two shadcn blocks below are installed as the visual/structural starting point and then wired to our data. Both are installed via the shadcn CLI, land as source files (not npm packages), and are free to edit like any other component in the repo.

```bash
npx shadcn@latest add dashboard-01   # admin dashboard shell
npx shadcn@latest add login-01       # auth card layout
```

- **`dashboard-01`** → the `(admin)` route group shell: collapsible sidebar, top header, metric cards, an interactive area chart, and a data table with sorting/pagination. Ships its own sample data (`data.json`) which is deleted once real API data is wired in via TanStack Query.
- **`login-01`** → a centered card layout (logo, heading, email/password fields, submit button, footer link) used as the base for `/login`, and adapted for `/register` and `/verify-otp` so all three auth screens share one visual language.

Section 2 and Section 5 below show exactly which generated files map to which part of our app.

---

## 2. Where Everything Lives (`apps/web`)

```
src/
  app/                        # Pages, layouts, route handlers (App Router)
    (public)/                 # marketing/auth pages, no sidebar shell
      login/page.tsx
      register/page.tsx
      verify-otp/page.tsx
    (app)/                    # authenticated user-facing shell
      feed/page.tsx
      videos/[id]/page.tsx
      categories/[categoryId]/page.tsx
    (admin)/                  # admin dashboard shell, guarded by role
      admin/
        layout.tsx
        page.tsx              # dashboard overview
        categories/page.tsx
        videos/page.tsx
        videos/upload/page.tsx
        videos/[id]/edit/page.tsx
        users/page.tsx
        users/[id]/page.tsx
  components/
    layouts/                  # Header, Footer — PascalCase
    ui/                       # shadcn/ui — kebab-case, DO NOT modify
    login-form.tsx            # from `login-01` — base card used by all 3 auth pages
    widgets/                  # feature composites — kebab-case folders, PascalCase files
      video-card/
      video-player/
      comment-list/
      category-filter/
      user-table/
      video-table/
      stat-card/
    admin/                    # from `dashboard-01`, adapted — kebab-case files
      app-sidebar.tsx         # nav-main/nav-secondary items → Categories/Videos/Users
      site-header.tsx
      section-cards.tsx       # → StatCard tiles, real metrics from admin analytics
      chart-area-interactive.tsx  # → views/likes/comments trend, real API data
      data-table.tsx          # → base for CategoryTable / VideoTable / UserTable
      nav-user.tsx            # wired to AuthProvider's current admin
    icons/                    # PascalCase + Icon suffix
  config/                     # seo.ts, site.ts
  data/                       # static data — kebab-case, variableName ends with Data
  helpers/                    # domain computation helpers (e.g. formatViewCount)
  hooks/                      # use-*.ts custom hooks (see Section 4)
  lib/
    api.ts                    # Axios instance + interceptors
    date.ts
    cookie-client.ts
  providers/                  # AuthProvider, QueryProvider — PascalCase
  styles/                     # tailwind.css
  types/                      # kebab-case files, mirrors @repo/types where shared
  constants/                  # SCREAMING_SNAKE_CASE constants
  env.ts
```

Every component folder has an `index.ts` re-export. Route groups `(public)`, `(app)`, `(admin)` keep layouts and access rules separate without affecting the URL path.

---

## 3. Route Map

| Route | Group | Access | Purpose |
|---|---|---|---|
| `/login` | (public) | Public | Login form |
| `/register` | (public) | Public | Registration form |
| `/verify-otp` | (public) | Public | OTP entry after register/login |
| `/feed` | (app) | Authenticated | Video discovery feed, category filter |
| `/videos/[id]` | (app) | Authenticated | Video player, like, comments |
| `/categories/[categoryId]` | (app) | Authenticated | Videos filtered by category |
| `/admin` | (admin) | Admin | Dashboard overview (stat cards) |
| `/admin/categories` | (admin) | Admin | Category CRUD table |
| `/admin/videos` | (admin) | Admin | Video list/manage table |
| `/admin/videos/upload` | (admin) | Admin | Video upload form |
| `/admin/videos/[id]/edit` | (admin) | Admin | Edit/deactivate video |
| `/admin/users` | (admin) | Admin | User list, search/filter/pagination |
| `/admin/users/[id]` | (admin) | Admin | User detail + engagement stats |

`(app)` and `(admin)` layouts each wrap children in a server-side auth check using `cookies()` from `next/headers`, redirecting unauthenticated/unauthorized users to `/login`.

---

## 4. Data Fetching — Hooks per Module

All server state goes through TanStack Query hooks in `src/hooks/`, calling helpers in `src/lib/api.ts`. Every hook surfaces `isLoading`/`isError` for the component to render, and every mutation's `onError` triggers a toast.

### 4.1 Auth (`use-auth.ts`)
- `useRegister()` — mutation → `POST /api/v1/auth/register`
- `useLogin()` — mutation → `POST /api/v1/auth/login`
- `useSendOtp()` — mutation → `POST /api/v1/auth/send-otp`
- `useVerifyOtp()` — mutation → `POST /api/v1/auth/verify-otp`
- `useCurrentUser()` — query, session/profile check

### 4.2 Categories (`use-categories.ts`)
- `useCategories()` — query → `GET /api/v1/categories`
- `useCreateCategory()` — mutation → `POST /api/v1/admin/categories`
- `useUpdateCategory()` — mutation → `PUT /api/v1/admin/categories/{id}`
- `useDeleteCategory()` — mutation → `DELETE /api/v1/admin/categories/{id}`

### 4.3 Videos (`use-videos.ts`)
- `useVideos(params)` — query, paginated → `GET /api/v1/videos`
- `useVideo(id)` — query → `GET /api/v1/videos/{id}`
- `useVideosByCategory(categoryId, params)` — query → `GET /api/v1/videos/category/{categoryId}`
- `useUploadVideo()` — mutation (multipart) → `POST /api/v1/admin/videos`
- `useUpdateVideo()` — mutation → `PUT /api/v1/admin/videos/{id}`
- `useDeleteVideo()` — mutation → `DELETE /api/v1/admin/videos/{id}`

### 4.4 Engagement (`use-engagement.ts`)
- `useRecordView()` — mutation (fired on player mount/threshold) → `POST /api/v1/videos/{id}/view`
- `useLikeVideo()` / `useUnlikeVideo()` — mutation with optimistic update on the video's like count
- `useComments(videoId, params)` — query, paginated → `GET /api/v1/videos/{id}/comments`
- `useCreateComment()` — mutation → `POST /api/v1/videos/{id}/comments`

### 4.5 Admin Users (`use-admin-users.ts`)
- `useAdminUsers(params)` — query, paginated/searchable → `GET /api/v1/admin/users`
- `useAdminUserDetail(id)` — query → `GET /api/v1/admin/users/{id}`

Every list hook accepts `{ page, limit, search?, filters? }` and returns `{ data, meta }`, matching the backend's pagination contract.

---

## 5. Key Screens & Components

### 5.1 Auth flow — built from `login-01`
- `components/login-form.tsx` is the block as installed: centered `Card`, email + password fields, submit `Button`, footer link. It becomes the shared shell for all three auth screens:
  - `/login` — the block almost as-is, fields wired to `useLogin()`.
  - `/register` — same card shell, password field swapped for name + email + password, wired to `useRegister()`.
  - `/verify-otp` — same card shell, fields swapped for a single OTP input (+ "resend OTP" link calling `useSendOtp()` again), wired to `useVerifyOtp()`.
- All three replace the block's plain `<form>` with `react-hook-form` + `@hookform/resolvers/zod`, add a disabled/spinner submit state, and toast on error — the rest of the block's markup and styling stays untouched.
- Access/refresh tokens handled via `src/lib/cookie-client.ts` (client) and `cookies()` (server); never stored in `localStorage`.

### 5.2 User-facing feed & player
- `VideoCard` (widget) — thumbnail, title, category badge, view/like/comment counts.
- `CategoryFilter` (widget) — pill list sourced from `useCategories()`.
- `VideoPlayer` (widget) — native `<video>` or a player lib; calls `useRecordView()` once per the agreed dedupe rule.
- `LikeButton` — optimistic like/unlike, disables during mutation to prevent double-fire.
- `CommentList` + `CommentForm` — paginated list, "load more", inline post form.

### 5.3 Admin dashboard — built from `dashboard-01`
The block's own shell (`app-sidebar.tsx`, `site-header.tsx`, `section-cards.tsx`, `chart-area-interactive.tsx`, `data-table.tsx`, `nav-user.tsx`) becomes the `(admin)` layout and overview page; we swap its sample data for our API data without changing its structure or styling:

- `app-sidebar.tsx` — the block's `nav-main`/`nav-secondary` items are replaced with **Dashboard, Categories, Videos, Users**; `nav-documents` section is removed (not needed here). Active-state highlighting is built in.
- `site-header.tsx` — kept as-is for the page title bar; add a `Link` to view the public feed.
- `nav-user.tsx` — the block's footer user menu, wired to `AuthProvider` (shows the logged-in admin's name/email, "Log out" calls the auth logout flow).
- `section-cards.tsx` on `/admin` — the block's 4 metric cards, repointed to `useAdminUsers()`/analytics totals: **Total Users, Total Videos, Total Views, Total Likes**.
- `chart-area-interactive.tsx` on `/admin` — the block's interactive area chart, repointed to a time-series admin analytics endpoint (views/likes/comments over time); if the backend doesn't expose this yet, ship the block with a "coming soon" placeholder rather than fake data, and revisit in Phase 5.
- `data-table.tsx` — the block's sortable/paginated `TanStack Table` is the base for three separate instances, each with its own columns and row actions:
  - **`CategoryTable`** (`/admin/categories`) — name, status, created date; inline edit + delete (shadcn `Dialog`/`AlertDialog`), "Add Category" button.
  - **`VideoTable`** (`/admin/videos`) — title, category, status badge, views/likes/comments, edit/deactivate actions, filter by category/status.
  - **`UserTable`** (`/admin/users`) — name, email, verified badge, videos viewed, likes, comments, joined date; row click → `/admin/users/[id]`.
- `VideoUploadForm` (new, not from the block) — title, subtitle, category select, hashtag input, file picker with client-side type/size validation mirroring the backend's rules, progress indicator during upload.
- `UserDetailPanel` (new, not from the block) — full engagement profile for `/admin/users/[id]`, styled to match the block's `Card` conventions.

### 5.4 Shared UX rules
- Every `useQuery`/`useMutation` renders a loading state (skeleton for tables/cards) and an error state (toast + inline retry where relevant) — never a blank screen.
- Meaningful images wrapped in `<figure>`/`<figcaption>`.
- All destructive actions (delete category, delete video) go through a shadcn `AlertDialog` confirmation.

---

## 6. State & Auth Handling

- **Server state:** 100% TanStack Query — no manual `useState`/`useEffect` fetching.
- **Global UI state:** `AuthProvider` (current user, role) and `ThemePresetProvider` in `src/providers/`.
- **Route protection:**
  - `(app)` layout: redirect to `/login` if no valid session.
  - `(admin)` layout: redirect to `/login` if no session, redirect to `/feed` (with toast) if session role ≠ `ADMIN`.
- **Token refresh:** Axios response interceptor in `src/lib/api.ts` calls `/api/v1/auth/refresh-token` on a 401, retries the original request once, then forces logout on repeated failure.

---

## 7. Build Plan — Phased Roadmap

Mirrors the backend phases so frontend work can start as soon as each API slice is available; adjust in parallel with `Backend_Build_Plan.md`.

### Phase 0 — Setup & Shell (2–3 days)
- Confirm `apps/web` scaffold, Tailwind v4, shadcn/ui installed, `@repo/ui` wired in
- Run `npx shadcn@latest add dashboard-01` and `npx shadcn@latest add login-01`; move generated files into `components/admin/` and `components/login-form.tsx` per Section 2's layout
- Strip `dashboard-01`'s sample `data.json` and `nav-documents` section; relabel `nav-main`/`nav-secondary` to Dashboard/Categories/Videos/Users
- `src/env.ts` with `@t3-oss/env-nextjs` (API base URL, etc.)
- `src/lib/api.ts` Axios instance + interceptors (auth header, 401 refresh flow)
- `QueryProvider`, `AuthProvider`, root `layout.tsx`, toast provider
- Base layouts for `(public)`, `(app)`, `(admin)` route groups — `(admin)/layout.tsx` renders the adapted `app-sidebar.tsx` + `site-header.tsx`

### Phase 1 — Auth Screens (3–4 days)
- `/login` wired directly to the adapted `login-form.tsx`; `/register` and `/verify-otp` built from the same shell with swapped fields
- `use-auth.ts` hooks wired to backend Phase 1 endpoints
- Route protection in `(app)` and `(admin)` layouts
- Acceptance check: user can register → verify OTP → log in → land on `/feed`

### Phase 2 — Category UI (2 days)
- `CategoryFilter` widget (user-facing)
- Admin `CategoryTable` + create/edit dialog + delete confirmation
- `use-categories.ts` hooks
- Acceptance check: admin creates a category and it immediately appears in the user-facing filter

### Phase 3 — Video Feed, Player & Admin Upload (5–6 days)
- `VideoCard`, `VideoPlayer`, feed page with pagination/infinite scroll
- `/videos/[id]` detail page with player + metadata
- `/categories/[categoryId]` filtered listing
- Admin `VideoUploadForm` (multipart upload, client-side validation, progress)
- Admin `VideoTable` with edit/deactivate
- Acceptance check: admin uploads a video → it appears in the feed and category page; user can open and play it

### Phase 4 — Engagement UI (3 days)
- `LikeButton` with optimistic update + rollback on error
- View recording hook fired from the player per the agreed dedupe rule
- `CommentList` + `CommentForm`, paginated "load more"
- Acceptance check: user can like/unlike, comment, and see counts update without a full page reload

### Phase 5 — Admin Users & Analytics (3 days)
- `UserTable` (from `dashboard-01`'s `data-table.tsx`) with search + pagination
- `UserDetailPanel` (`/admin/users/[id]`) showing verification status, joined date, views/likes/comments
- `section-cards.tsx` on `/admin` repointed from placeholder to real totals
- `chart-area-interactive.tsx` repointed to the admin analytics time-series endpoint, replacing the Phase 0 placeholder
- Acceptance check: admin can search users, drill into a full engagement profile, and see live totals/chart on the overview page

### Phase 6 — Polish & Accessibility Pass (2–3 days)
- Loading skeletons + error states on every data view
- Keyboard navigation and ARIA labels audit
- Empty states (no videos, no comments, no users match search)
- Responsive check (mobile feed, mobile admin tables → card view)

### Phase 7 — QA & Deployment (2–3 days)
- Cross-browser/device smoke test of every route in Section 3
- Verify no server state lives in `localStorage`/`sessionStorage`
- Lighthouse pass (performance, accessibility) on `/feed` and `/admin`
- Production env vars (`NEXT_PUBLIC_*`) confirmed against `.env.example`

---

## 8. Acceptance Criteria (Definition of Done)

- [ ] A user can register, verify via OTP, and log in through the UI
- [ ] The feed displays videos with category filtering and pagination/infinite scroll
- [ ] A user can open a video, watch it, and the view is recorded once per the dedupe rule
- [ ] A user can like/unlike a video with immediate visual feedback
- [ ] A user can post and view comments on a video
- [ ] An admin can create, edit, and delete/deactivate categories from the dashboard
- [ ] An admin can upload a video with title, subtitle, category, hashtags, and file, with validation feedback
- [ ] An admin can edit or deactivate an existing video
- [ ] An admin can search/paginate the user list and view a single user's full engagement profile
- [ ] Non-admins cannot reach any `/admin/*` route
- [ ] Every data view has a loading state, an error state (toast), and an empty state
- [ ] No sensitive tokens are stored in `localStorage`/`sessionStorage`

---

## 9. Open Decisions for Technical Design

- Video player: native `<video>` vs a library (e.g. video.js, hls.js) — depends on whether adaptive streaming is needed
- Feed pagination style: infinite scroll vs numbered pages (should match the backend's chosen pagination convention)
- Upload UX: direct-to-storage presigned URL upload vs proxy-through-API upload (affects `VideoUploadForm` implementation and progress reporting)
- Whether admin tables need CSV export or bulk actions in v1
- What real metric feeds `chart-area-interactive.tsx` on `/admin` — needs a time-series admin analytics endpoint from the backend team (not in the current API list); until then it ships as a placeholder
- The public-facing `(app)` screens (feed, video detail, category page) have no equivalent shadcn block yet and still need original design direction — coordinate with `frontend-design` guidance before building `components/widgets/*` for those routes
