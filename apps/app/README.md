# Kurius Mobile App (Flutter)

This directory is designated for the **Kurius Flutter Mobile Application**.

---

## Folder Structure

Place all Flutter project files directly inside this `apps/app/` folder:

```
apps/app/
├── android/
├── ios/
├── lib/
│   ├── main.dart
│   ├── core/
│   ├── features/
│   └── ...
├── assets/
├── test/
├── pubspec.yaml
├── pubspec.lock
└── README.md
```

---

## API Endpoints Reference

The mobile app should connect to the Kurius Backend API running on `apps/api`:

- **Base URL (Local/Emulator)**:
  - Android Emulator: `http://10.0.2.2:5000/api/v1`
  - iOS Simulator / Physical Device on local Wi-Fi: `http://<YOUR_LOCAL_IP>:5000/api/v1`
- **Swagger / OpenAPI Documentation**: `http://localhost:5000/api-docs`

### Key Mobile Endpoints:

1. **Authentication**:
   - `POST /api/v1/auth/register` (Registration + dispatches OTP email)
   - `POST /api/v1/auth/login` (Login — returns token or `403 requiresVerification` with fresh OTP)
   - `POST /api/v1/auth/verify-email` (Verify 6-digit OTP passcode)
   - `POST /api/v1/auth/forget-password` & `POST /api/v1/auth/reset-password`
2. **Video Feeds (Cursor-based infinite scroll)**:
   - `GET /api/v1/videos?cursor=<id>&limit=10` (Main video feed)
   - `GET /api/v1/videos/category/:categoryId?cursor=<id>&limit=10` (Category video feed)
   - `GET /api/v1/videos/:id` (Single video details)
3. **Engagement & Social**:
   - `POST /api/v1/videos/:id/view` (Record view with 24h dedup)
   - `POST /api/v1/videos/:id/like` & `DELETE /api/v1/videos/:id/like` (Toggle like)
   - `GET /api/v1/videos/:id/comments?cursor=<id>&limit=15` (Comment stream)
   - `POST /api/v1/videos/:id/comments` (Post comment)
4. **Categories**:
   - `GET /api/v1/categories` (Active categories list)
5. **Legal & Policies**:
   - `GET /api/v1/legal/privacy` (Live Privacy Policy)
   - `GET /api/v1/legal/terms` (Live Terms of Service)
