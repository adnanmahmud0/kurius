import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../constants/app_colors.dart';
import 'api_exceptions.dart';

/// Centralized error handling and user notification utility
class ErrorHandler {
  ErrorHandler._();

  /// Parse any exception into a user-friendly message
  static String getErrorMessage(dynamic error) {
    if (error is ApiException) {
      if (error is ValidationException) {
        return error.formattedErrors;
      }
      return error.message;
    }

    if (error is DioException) {
      if (error.error is SocketException ||
          error.type == DioExceptionType.connectionError) {
        return 'No internet connection. Please check your network and try again.';
      }
      if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.receiveTimeout) {
        return 'Request timed out. Please check your connection and retry.';
      }
      if (error.response?.data is Map<String, dynamic>) {
        final res = error.response!.data as Map<String, dynamic>;
        if (res['message'] != null) {
          return res['message'].toString();
        }
      }
      return error.message ?? 'A network communication error occurred.';
    }

    if (error is SocketException) {
      return 'No internet connection. Please check your network and try again.';
    }

    if (error is FormatException) {
      return 'Invalid server response format.';
    }

    return error?.toString().replaceAll('Exception: ', '') ?? 'An unexpected error occurred.';
  }

  /// Get appropriate title based on error type
  static String getErrorTitle(dynamic error) {
    if (error is NetworkException || error is SocketException) {
      return 'No Internet Connection';
    }
    if (error is UnauthorizedException) {
      return 'Session Expired';
    }
    if (error is ForbiddenException) {
      return error.isEmailVerificationRequired ? 'Verification Required' : 'Access Restricted';
    }
    if (error is ValidationException) {
      return 'Validation Error';
    }
    if (error is NotFoundException) {
      return 'Not Found';
    }
    if (error is ServerException) {
      return 'Server Error';
    }
    if (error is TimeoutException) {
      return 'Connection Timeout';
    }
    return 'Error';
  }

  /// Show a standardized error snackbar with optional retry button
  static void showErrorSnackbar(
    dynamic error, {
    String? customTitle,
    String? customMessage,
    VoidCallback? onRetry,
  }) {
    if (Get.context == null) return;

    final title = customTitle ?? getErrorTitle(error);
    final message = customMessage ?? getErrorMessage(error);
    final isNetwork = error is NetworkException ||
        error is SocketException ||
        title.toLowerCase().contains('internet');

    Get.rawSnackbar(
      titleText: Row(
        children: [
          Icon(
            isNetwork ? Icons.wifi_off_rounded : Icons.error_outline_rounded,
            color: Colors.white,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
      messageText: Text(
        message,
        style: const TextStyle(color: Colors.white70, fontSize: 12),
      ),
      mainButton: onRetry != null
          ? TextButton(
              onPressed: () {
                if (Get.isSnackbarOpen) Get.back();
                onRetry();
              },
              child: const Text(
                'RETRY',
                style: TextStyle(
                  color: AppColors.yellowAccent,
                  fontWeight: FontWeight.bold,
                ),
              ),
            )
          : null,
      backgroundColor: AppColors.error,
      snackPosition: SnackPosition.BOTTOM,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: 12,
      duration: const Duration(seconds: 4),
      isDismissible: true,
    );
  }

  /// Show a standardized success snackbar
  static void showSuccessSnackbar(
    String message, {
    String title = 'Success',
  }) {
    if (Get.context == null) return;

    Get.rawSnackbar(
      titleText: Row(
        children: [
          const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
          const SizedBox(width: 8),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ],
      ),
      messageText: Text(
        message,
        style: const TextStyle(color: Colors.white70, fontSize: 12),
      ),
      backgroundColor: AppColors.success,
      snackPosition: SnackPosition.BOTTOM,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: 12,
      duration: const Duration(seconds: 3),
      isDismissible: true,
    );
  }
}
