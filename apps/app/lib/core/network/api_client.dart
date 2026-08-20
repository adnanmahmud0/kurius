import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_endpoints.dart';
import 'api_exceptions.dart';
import 'api_response.dart';
import 'auth_interceptor.dart';

/// Custom Terminal Logger that outputs formatted API lifecycle events to console
class TerminalApiLogger extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    debugPrint('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    debugPrint('🌐 [API REQUEST] ${options.method.toUpperCase()} ${options.uri}');
    if (options.queryParameters.isNotEmpty) {
      debugPrint('🔍 [QUERY PARAMS] ${options.queryParameters}');
    }
    if (options.data != null) {
      if (options.data is FormData) {
        final form = options.data as FormData;
        debugPrint('📦 [MULTIPART FORM DATA] fields: ${form.fields}, files: ${form.files.map((f) => f.key)}');
      } else {
        debugPrint('📦 [REQUEST BODY] ${options.data}');
      }
    }
    debugPrint('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    debugPrint('✅ [API RESPONSE SUCCESS] ${response.requestOptions.method.toUpperCase()} ${response.requestOptions.path}');
    debugPrint('📊 [STATUS CODE] ${response.statusCode}');
    if (response.data is Map<String, dynamic>) {
      final map = response.data as Map<String, dynamic>;
      if (map.containsKey('message')) {
        debugPrint('💬 [SERVER MESSAGE] ${map['message']}');
      }
      if (map.containsKey('meta')) {
        debugPrint('📑 [META PAGINATION] ${map['meta']}');
      }
    }
    debugPrint('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    debugPrint('❌ [API RESPONSE ERROR] ${err.requestOptions.method.toUpperCase()} ${err.requestOptions.path}');
    debugPrint('⚠️ [STATUS CODE] ${err.response?.statusCode ?? "No Response"}');
    debugPrint('🚨 [ERROR DETAILS] ${err.message}');
    if (err.response?.data != null) {
      debugPrint('📄 [ERROR BODY] ${err.response?.data}');
    }
    debugPrint('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return handler.next(err);
  }
}

/// Production-grade API Client encapsulating Dio networking with interceptors & error mapping
class ApiClient {
  late final Dio dio;

  ApiClient({String? baseUrl, Dio? customDio}) {
    if (customDio != null) {
      dio = customDio;
      return;
    }

    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? ApiEndpoints.baseUrl,
        connectTimeout: ApiEndpoints.connectTimeout,
        receiveTimeout: ApiEndpoints.receiveTimeout,
        sendTimeout: ApiEndpoints.sendTimeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        responseType: ResponseType.json,
        validateStatus: (status) => status != null && status >= 200 && status < 300,
      ),
    );

    // Attach Auth & Header Interceptor
    dio.interceptors.add(AuthInterceptor());

    // Attach Terminal Logger to show all API working status
    dio.interceptors.add(TerminalApiLogger());
  }

  // Update dynamic base URL (e.g. switching environments)
  void setBaseUrl(String newUrl) {
    debugPrint('🔄 [API CLIENT] Setting base URL to: $newUrl');
    dio.options.baseUrl = newUrl;
    ApiEndpoints.baseUrl = newUrl;
  }

  // ---------------------------------------------------------------------------
  // HTTP Methods with explicit Terminal action messages
  // ---------------------------------------------------------------------------

  /// GET Request
  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    T Function(dynamic data)? fromJsonT,
  }) async {
    debugPrint('📡 [API GET EXECUTING] Path: $path | Params: $queryParameters');
    try {
      final response = await dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      debugPrint('🎉 [API GET FINISHED] Path: $path -> OK (${response.statusCode})');
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      debugPrint('🛑 [API GET FAILED] Path: $path -> ${e.message}');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('💥 [API GET UNEXPECTED ERROR] Path: $path -> $e');
      throw UnknownApiException(message: e.toString());
    }
  }

  /// POST Request
  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    T Function(dynamic data)? fromJsonT,
  }) async {
    debugPrint('🚀 [API POST EXECUTING] Path: $path | Data: $data');
    try {
      final response = await dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      debugPrint('🎉 [API POST FINISHED] Path: $path -> OK (${response.statusCode})');
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      debugPrint('🛑 [API POST FAILED] Path: $path -> ${e.message}');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('💥 [API POST UNEXPECTED ERROR] Path: $path -> $e');
      throw UnknownApiException(message: e.toString());
    }
  }

  /// PUT Request
  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    T Function(dynamic data)? fromJsonT,
  }) async {
    debugPrint('🔄 [API PUT / UPDATE EXECUTING] Path: $path | Data: $data');
    try {
      final response = await dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      debugPrint('🎉 [API PUT FINISHED] Path: $path -> OK (${response.statusCode})');
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      debugPrint('🛑 [API PUT FAILED] Path: $path -> ${e.message}');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('💥 [API PUT UNEXPECTED ERROR] Path: $path -> $e');
      throw UnknownApiException(message: e.toString());
    }
  }

  /// PATCH Request
  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    T Function(dynamic data)? fromJsonT,
  }) async {
    debugPrint('🛠️ [API PATCH / PARTIAL UPDATE EXECUTING] Path: $path | Data: $data');
    try {
      final response = await dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      debugPrint('🎉 [API PATCH FINISHED] Path: $path -> OK (${response.statusCode})');
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      debugPrint('🛑 [API PATCH FAILED] Path: $path -> ${e.message}');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('💥 [API PATCH UNEXPECTED ERROR] Path: $path -> $e');
      throw UnknownApiException(message: e.toString());
    }
  }

  /// DELETE Request
  Future<ApiResponse<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    T Function(dynamic data)? fromJsonT,
  }) async {
    debugPrint('🗑️ [API DELETE EXECUTING] Path: $path | Data: $data');
    try {
      final response = await dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      debugPrint('🎉 [API DELETE FINISHED] Path: $path -> OK (${response.statusCode})');
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      debugPrint('🛑 [API DELETE FAILED] Path: $path -> ${e.message}');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('💥 [API DELETE UNEXPECTED ERROR] Path: $path -> $e');
      throw UnknownApiException(message: e.toString());
    }
  }

  /// Multipart File Upload Request (POST)
  Future<ApiResponse<T>> postMultipart<T>(
    String path, {
    required FormData formData,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    T Function(dynamic data)? fromJsonT,
  }) async {
    debugPrint('📤 [API POST MULTIPART UPLOAD EXECUTING] Path: $path | Files: ${formData.files.map((f) => f.key)}');
    try {
      final response = await dio.post(
        path,
        data: formData,
        queryParameters: queryParameters,
        options: (options ?? Options()).copyWith(
          contentType: 'multipart/form-data',
        ),
        cancelToken: cancelToken,
        onSendProgress: (sent, total) {
          if (total > 0) {
            final progress = (sent / total * 100).toStringAsFixed(1);
            debugPrint('⏳ [UPLOAD PROGRESS] $progress% ($sent / $total bytes)');
          }
          if (onSendProgress != null) {
            onSendProgress(sent, total);
          }
        },
      );
      debugPrint('🎉 [API POST MULTIPART FINISHED] Path: $path -> OK (${response.statusCode})');
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      debugPrint('🛑 [API POST MULTIPART FAILED] Path: $path -> ${e.message}');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('💥 [API POST MULTIPART UNEXPECTED ERROR] Path: $path -> $e');
      throw UnknownApiException(message: e.toString());
    }
  }

  /// Multipart File Upload Request (PATCH)
  Future<ApiResponse<T>> patchMultipart<T>(
    String path, {
    required FormData formData,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    T Function(dynamic data)? fromJsonT,
  }) async {
    debugPrint('📤 [API PATCH MULTIPART UPLOAD EXECUTING] Path: $path | Files: ${formData.files.map((f) => f.key)}');
    try {
      final response = await dio.patch(
        path,
        data: formData,
        queryParameters: queryParameters,
        options: (options ?? Options()).copyWith(
          contentType: 'multipart/form-data',
        ),
        cancelToken: cancelToken,
        onSendProgress: (sent, total) {
          if (total > 0) {
            final progress = (sent / total * 100).toStringAsFixed(1);
            debugPrint('⏳ [UPLOAD PROGRESS] $progress% ($sent / $total bytes)');
          }
          if (onSendProgress != null) {
            onSendProgress(sent, total);
          }
        },
      );
      debugPrint('🎉 [API PATCH MULTIPART FINISHED] Path: $path -> OK (${response.statusCode})');
      return _parseResponse<T>(response, fromJsonT);
    } on DioException catch (e) {
      debugPrint('🛑 [API PATCH MULTIPART FAILED] Path: $path -> ${e.message}');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('💥 [API PATCH MULTIPART UNEXPECTED ERROR] Path: $path -> $e');
      throw UnknownApiException(message: e.toString());
    }
  }

  // ---------------------------------------------------------------------------
  // Response & Error Parsing
  // ---------------------------------------------------------------------------

  ApiResponse<T> _parseResponse<T>(
    Response response,
    T Function(dynamic data)? fromJsonT,
  ) {
    if (response.data is Map<String, dynamic>) {
      return ApiResponse<T>.fromJson(
        response.data as Map<String, dynamic>,
        fromJsonT,
      );
    }

    return ApiResponse<T>(
      success: true,
      statusCode: response.statusCode,
      data: response.data is T ? response.data as T : null,
    );
  }

  ApiException _handleDioError(DioException error) {
    // 1. Connection / Timeout Errors
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return const TimeoutException();
    }

    if (error.type == DioExceptionType.connectionError ||
        error.error is SocketException) {
      return const NetworkException();
    }

    // 2. Response Status Code Errors
    final response = error.response;
    if (response != null) {
      final statusCode = response.statusCode ?? 500;
      String message = 'An error occurred';
      List<ApiErrorMessage>? errorMessages;

      if (response.data is Map<String, dynamic>) {
        final resMap = response.data as Map<String, dynamic>;
        message = resMap['message'] as String? ?? message;
        if (resMap['errorMessages'] is List) {
          errorMessages = (resMap['errorMessages'] as List)
              .map((e) => ApiErrorMessage.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      }

      switch (statusCode) {
        case 400:
        case 422:
          return ValidationException(
            message: message,
            statusCode: statusCode,
            errorMessages: errorMessages,
          );
        case 401:
          return UnauthorizedException(
            message: message,
            statusCode: 401,
            errorMessages: errorMessages,
          );
        case 403:
          final requiresOtp = message.toLowerCase().contains('verify') ||
              message.toLowerCase().contains('otp');
          return ForbiddenException(
            message: message,
            statusCode: 403,
            errorMessages: errorMessages,
            isEmailVerificationRequired: requiresOtp,
          );
        case 404:
          return NotFoundException(
            message: message,
            statusCode: 404,
            errorMessages: errorMessages,
          );
        case 500:
        case 502:
        case 503:
          return ServerException(
            message: message,
            statusCode: statusCode,
            errorMessages: errorMessages,
          );
        default:
          return UnknownApiException(
            message: message,
            statusCode: statusCode,
            errorMessages: errorMessages,
          );
      }
    }

    // 3. Request Cancellation or Other Errors
    if (error.type == DioExceptionType.cancel) {
      return const UnknownApiException(message: 'Request was cancelled.');
    }

    return UnknownApiException(
      message: error.message ?? 'An unexpected network error occurred.',
    );
  }
}
