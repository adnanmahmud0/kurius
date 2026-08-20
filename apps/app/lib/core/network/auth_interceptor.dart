import 'package:dio/dio.dart';
import '../storage/storage_service.dart';

/// Dio interceptor for injecting Bearer token into headers and handling 401 unauthorized
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Inject Bearer Authorization header if token exists and header isn't already set
    if (!options.headers.containsKey('Authorization')) {
      final token = StorageService.to.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }

    // Default JSON headers
    options.headers.putIfAbsent('Accept', () => 'application/json');
    if (options.data is! FormData) {
      options.headers.putIfAbsent('Content-Type', () => 'application/json');
    }

    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // If response is 401 Unauthorized, automatically clear invalid auth session
    if (err.response?.statusCode == 401) {
      StorageService.to.clearAuth();
    }
    return handler.next(err);
  }
}
