# 📱 Kurius Mobile App Integration Guide (Flutter)

Welcome to the **Kurius Mobile App** integration documentation. This guide contains everything you need to connect your Flutter application to the live Kurius backend.

---

## 🌐 1. Environment & Base URLs

| Environment                       | Base URL                             | Swagger / Interactive Docs             |
| --------------------------------- | ------------------------------------ | -------------------------------------- |
| **Production (Live)**             | `https://api.kuriusapp.cloud/api/v1` | `https://api.kuriusapp.cloud/api/docs` |
| **Android Emulator**              | `http://10.0.2.2:5000/api/v1`        | `http://localhost:5000/api-docs`       |
| **iOS Simulator**                 | `http://localhost:5000/api/v1`       | `http://localhost:5000/api-docs`       |
| **Physical Device (Local Wi-Fi)** | `http://<YOUR_LOCAL_IP>:5000/api/v1` | `http://<YOUR_LOCAL_IP>:5000/api-docs` |

---

## 📋 2. Standard API Response Formats

All API responses follow a consistent JSON envelope:

### ✅ Success Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully.",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 54,
    "totalPage": 6
  }
}
```

### ❌ Error Response:

```json
{
  "success": false,
  "message": "Invalid credentials or validation error",
  "errorMessages": [
    {
      "path": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

---

## 🔐 3. Authentication & User Flow

All protected endpoints require the Bearer token in the request header:

```http
Authorization: Bearer <accessToken>
```

### 3.1 Register User

- **Endpoint**: `POST /auth/register`
- **Auth**: Public
- **Request Body**:

```json
{
  "name": "Alex Smith",
  "email": "alex@example.com",
  "password": "Password123!"
}
```

- **Response**: Triggers a 6-digit OTP email to the user.

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered. Please check your email for the verification code.",
  "data": { "email": "alex@example.com" }
}
```

---

### 3.2 Verify Email OTP

- **Endpoint**: `POST /auth/verify-email`
- **Auth**: Public
- **Request Body**:

```json
{
  "email": "alex@example.com",
  "oneTimeCode": 123456
}
```

- **Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully.",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

---

### 3.3 Login

- **Endpoint**: `POST /auth/login`
- **Auth**: Public
- **Request Body**:

```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```

- **Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully.",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

> ⚠️ **Note**: If the user has not verified their email yet, login returns HTTP `403` with a fresh OTP sent to their email.

---

### 3.4 Forgot & Reset Password

1. **Request Reset OTP**: `POST /auth/forget-password`
   ```json
   { "email": "alex@example.com" }
   ```
2. **Submit New Password**: `POST /auth/reset-password`
   - **Header**: `Authorization: Bearer <resetTokenFromOtp>`
   ```json
   {
     "email": "alex@example.com",
     "newPassword": "NewPassword123!",
     "confirmPassword": "NewPassword123!"
   }
   ```

---

## 🎬 4. Video Feed & Exploration

### 4.1 Get Main Video Feed (Cursor-based infinite scroll)

- **Endpoint**: `GET /videos`
- **Auth**: Optional (Providing Bearer token includes `isLiked` status for the logged-in user)
- **Query Parameters**:
  - `limit` _(optional, default: 10)_
  - `cursor` _(optional, video ID from previous batch for next page)_
  - `categoryId` _(optional, filter by category UUID)_
  - `searchTerm` _(optional, search in title/subtitle/hashtags)_

- **Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Videos retrieved successfully.",
  "data": [
    {
      "id": "c39b81ea-729b-4652-...",
      "title": "Amazing Mountain Biking",
      "subtitle": "Extreme descent in the Alps #biking #nature",
      "videoUrl": "https://res.cloudinary.com/.../video.mp4",
      "thumbnailUrl": "https://res.cloudinary.com/.../thumb.jpg",
      "hashtags": ["biking", "nature"],
      "createdAt": "2026-08-28T12:00:00.000Z",
      "creator": {
        "id": "usr-123",
        "name": "Alex Smith",
        "avatar": "https://..."
      },
      "category": {
        "id": "cat-456",
        "name": "Sports",
        "slug": "sports"
      },
      "_count": {
        "views": 1420,
        "likes": 389,
        "comments": 42
      },
      "isLiked": true
    }
  ]
}
```

---

### 4.2 Get Videos by Category

- **Endpoint**: `GET /videos/category/:categoryId`
- **Auth**: Optional

---

### 4.3 Get Single Video Details

- **Endpoint**: `GET /videos/:id`
- **Auth**: Optional

---

### 4.4 Upload Video

- **Endpoint**: `POST /videos`
- **Auth**: Required (`Bearer <token>`)
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `video` _(File, required)_: MP4, MOV, etc.
  - `thumbnail` _(File, optional)_: JPG, PNG
  - `title` _(string, required)_
  - `subtitle` _(string, optional)_
  - `categoryId` _(string, UUID, required)_
  - `hashtags` _(JSON string or comma-separated)_: `["gaming", "fun"]`

---

## ❤️ 5. Engagement (Views, Likes, Comments)

### 5.1 Record Video View (24-Hour Deduplicated)

- **Endpoint**: `POST /videos/:id/view`
- **Auth**: Required (`Bearer <token>`)
- **Response**: Automatically increments the view count once per 24 hours per user.

---

### 5.2 Like & Unlike Video

- **Like Video**: `POST /videos/:id/like`
- **Unlike Video**: `DELETE /videos/:id/like`
- **Auth**: Required (`Bearer <token>`)

---

### 5.3 Comments Stream

- **Get Video Comments**: `GET /videos/:id/comments?page=1&limit=20`
  - **Auth**: Public
- **Post Comment**: `POST /videos/:id/comments`
  - **Auth**: Required (`Bearer <token>`)
  - **Body**: `{ "commentText": "Great video!" }`
- **Delete Comment**: `DELETE /comments/:commentId`
  - **Auth**: Required (Owner or Admin)

---

## 👤 6. User Profile Management

### 6.1 Get Current User Profile

- **Endpoint**: `GET /user/profile`
- **Auth**: Required (`Bearer <token>`)
- **Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile data retrieved successfully",
  "data": {
    "id": "usr-12345",
    "name": "Alex Smith",
    "firstName": "Alex",
    "lastName": "Smith",
    "email": "alex@example.com",
    "contact": "+1 (555) 234-5678",
    "location": "San Francisco, CA",
    "image": "https://api.kuriusapp.cloud/uploads/users/avatar-123.jpg",
    "avatar": "https://api.kuriusapp.cloud/uploads/users/avatar-123.jpg",
    "role": "USER",
    "status": "active",
    "verified": true,
    "provider": "local",
    "createdAt": "2026-08-20T10:00:00.000Z",
    "updatedAt": "2026-08-29T15:00:00.000Z",
    "stats": {
      "videosCreated": 5,
      "viewsCount": 142,
      "likesCount": 38,
      "commentsCount": 12
    }
  }
}
```

---

### 6.2 Update User Profile

Users can update their personal information either via **JSON** (text updates) or **Multipart Form Data** (with avatar photo upload).

- **Endpoint**: `PATCH /user/profile`
- **Auth**: Required (`Bearer <token>`)

#### Option A: JSON Body (Text Fields Only)

- **Content-Type**: `application/json`

```json
{
  "name": "Alex Smith",
  "firstName": "Alex",
  "lastName": "Smith",
  "contact": "+1 (555) 987-6543",
  "location": "New York, NY"
}
```

#### Option B: Multipart Form-Data (With Avatar Image Upload)

- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image` _(File, optional)_: User avatar image file (`.jpg`, `.png`, `.webp`)
  - `name` _(string, optional)_: Full display name
  - `firstName` _(string, optional)_
  - `lastName` _(string, optional)_
  - `contact` _(string, optional)_: Phone number
  - `location` _(string, optional)_: City, Country

#### 📱 Flutter / Dart Example (with Dio):

```dart
import 'package:dio/dio.dart';

Future<Map<String, dynamic>> updateUserProfile({
  String? name,
  String? contact,
  String? location,
  String? avatarFilePath, // e.g. from ImagePicker
}) async {
  final formData = FormData.fromMap({
    if (name != null) 'name': name,
    if (contact != null) 'contact': contact,
    if (location != null) 'location': location,
    if (avatarFilePath != null)
      'image': await MultipartFile.fromFile(
        avatarFilePath,
        filename: 'avatar.jpg',
      ),
  });

  final response = await dio.patch(
    '/user/profile',
    data: formData,
    options: Options(headers: {'Authorization': 'Bearer $token'}),
  );

  return response.data['data'];
}
```

---

### 6.3 Upload / Update Profile Image Only (Dedicated Endpoint)

Use this dedicated endpoint when you want to let users pick and upload an avatar immediately without touching any other profile fields.

- **Endpoint**: `POST /user/profile/image` _(also available at `POST /user/avatar` and `PATCH /user/profile/image`)_
- **Auth**: Required (`Bearer <token>`)
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image` _(File, required)_: Avatar image file (`.jpg`, `.png`, `.webp`)

#### 📱 Flutter / Dart Example (with Dio):

```dart
import 'package:dio/dio.dart';

Future<String> uploadProfileAvatar({
  required String imagePath, // Path from ImagePicker
  required String authToken,
}) async {
  final dio = Dio(BaseOptions(baseUrl: 'https://api.kuriusapp.cloud/api/v1'));

  final formData = FormData.fromMap({
    'image': await MultipartFile.fromFile(
      imagePath,
      filename: 'avatar.jpg',
    ),
  });

  final response = await dio.post(
    '/user/profile/image',
    data: formData,
    options: Options(headers: {'Authorization': 'Bearer $authToken'}),
  );

  // Returns updated profile data with the new avatar image URL
  final updatedUser = response.data['data'];
  return updatedUser['image']; // e.g. "https://api.kuriusapp.cloud/uploads/users/..."
}
```

---

### 6.4 Delete / Close User Account

- **Endpoint**: `DELETE /user/profile`
- **Auth**: Required (`Bearer <token>`)
- **Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User deleted successfully"
}
```

---

## 🏷️ 7. Categories & Motivational Quotes

### 7.1 Get Categories (with Thumbnails)

- **Endpoint**: `GET /categories`
- **Auth**: Public
- **Response**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categories retrieved successfully.",
  "data": [
    {
      "id": "cat-123",
      "name": "Motivation",
      "slug": "motivation",
      "thumbnail": "/uploads/categories/motivation-cover.jpg",
      "status": "active",
      "_count": { "videos": 12 }
    }
  ]
}
```

### 7.2 Get Random Motivational Message

- **Endpoint**: `GET /motivational-messages/random`
- **Auth**: Optional / Public
- **Response**: Returns a single random inspiring quote for displaying in the app feed or home banner.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Random motivational message retrieved successfully.",
  "data": {
    "id": "5893ecb2-3211-4099-881a-cfa68b753a8d",
    "message": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "status": "active",
    "createdAt": "2026-08-29T20:30:00.000Z"
  }
}
```

---

## 📜 8. Legal Policies

- **Get Privacy Policy**: `GET /legal/privacy` (Public)
- **Get Terms of Service**: `GET /legal/terms` (Public)

---

## 🚀 8. Flutter Implementation Reference (Dio Client)

Here is a recommended Dio client setup for automatic Bearer token injection and error handling:

```dart
import 'package:dio/dio.dart';

class ApiClient {
  static const String baseUrl = 'https://api.kuriusapp.cloud/api/v1';
  late final Dio dio;

  ApiClient({String? authToken}) {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          if (authToken != null) 'Authorization': 'Bearer $authToken',
        },
      ),
    );

    dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
      ),
    );
  }

  // Example: Fetch main video feed
  Future<List<dynamic>> fetchVideos({String? cursor, int limit = 10}) async {
    final response = await dio.get(
      '/videos',
      queryParameters: {
        'limit': limit,
        if (cursor != null) 'cursor': cursor,
      },
    );
    return response.data['data'] as List<dynamic>;
  }

  // Example: Like video
  Future<void> likeVideo(String videoId) async {
    await dio.post('/videos/$videoId/like');
  }
}
```
