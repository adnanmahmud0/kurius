import 'api_response.dart';

/// Base Exception class for all API-related errors
abstract class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final List<ApiErrorMessage>? errorMessages;

  const ApiException({
    required this.message,
    this.statusCode,
    this.errorMessages,
  });

  @override
  String toString() => message;
}

/// No Internet Connection or Network Drop
class NetworkException extends ApiException {
  const NetworkException({
    super.message = 'No internet connection. Please check your network and try again.',
    super.statusCode,
    super.errorMessages,
  });
}

/// 401 Unauthorized (Invalid or expired JWT token)
class UnauthorizedException extends ApiException {
  const UnauthorizedException({
    super.message = 'Session expired. Please log in again.',
    super.statusCode = 401,
    super.errorMessages,
  });
}

/// 403 Forbidden (Unverified email or restricted role)
class ForbiddenException extends ApiException {
  final bool isEmailVerificationRequired;

  const ForbiddenException({
    super.message = 'Access forbidden.',
    super.statusCode = 403,
    super.errorMessages,
    this.isEmailVerificationRequired = false,
  });
}

/// 404 Not Found
class NotFoundException extends ApiException {
  const NotFoundException({
    super.message = 'Requested resource not found.',
    super.statusCode = 404,
    super.errorMessages,
  });
}

/// 400 Bad Request or Validation failure (e.g. Zod validation error)
class ValidationException extends ApiException {
  const ValidationException({
    required super.message,
    super.statusCode = 400,
    super.errorMessages,
  });

  String get formattedErrors {
    if (errorMessages == null || errorMessages!.isEmpty) return message;
    return errorMessages!.map((e) => e.message).join('\n');
  }
}

/// 500 Internal Server Error
class ServerException extends ApiException {
  const ServerException({
    super.message = 'A server error occurred. Please try again later.',
    super.statusCode = 500,
    super.errorMessages,
  });
}

/// Request or Connection Timeout
class TimeoutException extends ApiException {
  const TimeoutException({
    super.message = 'Connection timed out. Please try again.',
    super.statusCode,
    super.errorMessages,
  });
}

/// General / Unexpected error
class UnknownApiException extends ApiException {
  const UnknownApiException({
    super.message = 'An unexpected error occurred.',
    super.statusCode,
    super.errorMessages,
  });
}
