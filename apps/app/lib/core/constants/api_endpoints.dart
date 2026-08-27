class ApiEndpoints {
  ApiEndpoints._();

  // Root & Base URLs
  static const String rootBaseUrl = 'https://api.kuriusapp.cloud/';
  static const String productionBaseUrl = 'https://api.kuriusapp.cloud/api/v1';
  static const String androidEmulatorBaseUrl = 'http://10.0.2.2:5000/api/v1';
  static const String iosSimulatorBaseUrl = 'http://localhost:5000/api/v1';

  // Active Base URL (defaults to https://api.kuriusapp.cloud/)
  static String baseUrl = rootBaseUrl;
  static const String apiPrefix = '/api/v1';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
  static const Duration sendTimeout = Duration(seconds: 30);

  // Authentication Endpoints
  static const String register = '$apiPrefix/auth/register';
  static const String verifyEmail = '$apiPrefix/auth/verify-email';
  static const String login = '$apiPrefix/auth/login';
  static const String forgetPassword = '$apiPrefix/auth/forget-password';
  static const String resetPassword = '$apiPrefix/auth/reset-password';
  static const String changePassword = '$apiPrefix/auth/change-password';
  static const String resendOtp = '$apiPrefix/auth/resend-otp';

  // User Profile Endpoints
  static const String userProfile = '$apiPrefix/user/profile';
  static const String updateProfile = '$apiPrefix/user/profile';
  static const String deleteAccount = '$apiPrefix/user/delete-account';

  // Video Endpoints
  static const String videos = '$apiPrefix/videos';
  static String videoDetails(String id) => '$apiPrefix/videos/$id';
  static String videosByCategory(String categoryId) => '$apiPrefix/videos/category/$categoryId';
  static String videoLike(String id) => '$apiPrefix/videos/$id/like';
  static String videoView(String id) => '$apiPrefix/videos/$id/view';

  // Comment Endpoints
  static String videoComments(String videoId) => '$apiPrefix/videos/$videoId/comments';
  static String commentReplies(String commentId) => '$apiPrefix/comments/$commentId/replies';
  static String deleteComment(String commentId) => '$apiPrefix/comments/$commentId';

  // Category Endpoints
  static const String categories = '$apiPrefix/categories';

  // Motivational Quotes Endpoints
  static const String motivationalMessages = '$apiPrefix/motivational-messages';
  static const String randomMotivationalMessage = '$apiPrefix/motivational-messages/random';

  // Legal Endpoints
  static const String privacyPolicy = '$apiPrefix/legal/privacy';
  static const String termsOfService = '$apiPrefix/legal/terms';
}
