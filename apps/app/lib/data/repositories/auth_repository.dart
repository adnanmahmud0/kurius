import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../../core/storage/storage_service.dart';
import '../models/auth/auth_requests.dart';
import '../models/auth/auth_tokens_model.dart';

class AuthRepository {
  final ApiClient apiClient;
  final StorageService storage;

  const AuthRepository({
    required this.apiClient,
    required this.storage,
  });

  /// Register a new account (triggers OTP verification email)
  Future<ApiResponse<Map<String, dynamic>>> register(RegisterRequest request) async {
    debugPrint('📝 [AuthRepository.register] Sending register request for: ${request.email}');
    final response = await apiClient.post<Map<String, dynamic>>(
      ApiEndpoints.register,
      data: request.toJson(),
      fromJsonT: (data) => data as Map<String, dynamic>,
    );
    debugPrint('✨ [AuthRepository.register] Register response received: ${response.message}');
    return response;
  }

  /// Verify 6-digit email OTP and store returned JWT tokens
  Future<ApiResponse<AuthTokensModel>> verifyEmail(VerifyEmailRequest request) async {
    debugPrint('🔑 [AuthRepository.verifyEmail] Verifying OTP for: ${request.email}');
    final response = await apiClient.post<AuthTokensModel>(
      ApiEndpoints.verifyEmail,
      data: request.toJson(),
      fromJsonT: (data) => AuthTokensModel.fromJson(data as Map<String, dynamic>),
    );

    if (response.data != null) {
      debugPrint('💾 [AuthRepository.verifyEmail] Saving JWT tokens to local storage');
      await storage.saveAuthTokens(
        accessToken: response.data!.accessToken,
        refreshToken: response.data!.refreshToken,
      );
    }

    return response;
  }

  /// Login with email & password and store returned JWT tokens
  Future<ApiResponse<AuthTokensModel>> login(LoginRequest request) async {
    debugPrint('🔐 [AuthRepository.login] Logging in user: ${request.email}');
    final response = await apiClient.post<AuthTokensModel>(
      ApiEndpoints.login,
      data: request.toJson(),
      fromJsonT: (data) => AuthTokensModel.fromJson(data as Map<String, dynamic>),
    );

    if (response.data != null) {
      debugPrint('💾 [AuthRepository.login] Login successful! Persisting JWT tokens...');
      await storage.saveAuthTokens(
        accessToken: response.data!.accessToken,
        refreshToken: response.data!.refreshToken,
      );
    }

    return response;
  }

  /// Request password reset OTP email
  Future<ApiResponse<dynamic>> forgetPassword(ForgetPasswordRequest request) async {
    debugPrint('📧 [AuthRepository.forgetPassword] Requesting reset OTP for: ${request.email}');
    return apiClient.post(
      ApiEndpoints.forgetPassword,
      data: request.toJson(),
    );
  }

  /// Submit new password with OTP token
  Future<ApiResponse<dynamic>> resetPassword(
    ResetPasswordRequest request, {
    required String resetToken,
  }) async {
    debugPrint('🔄 [AuthRepository.resetPassword] Resetting password for: ${request.email}');
    return apiClient.post(
      ApiEndpoints.resetPassword,
      data: request.toJson(),
      options: Options(
        headers: {'Authorization': 'Bearer $resetToken'},
      ),
    );
  }

  /// Change password for logged in user
  Future<ApiResponse<dynamic>> changePassword(ChangePasswordRequest request) async {
    debugPrint('🔒 [AuthRepository.changePassword] Changing user password');
    return apiClient.post(
      ApiEndpoints.changePassword,
      data: request.toJson(),
    );
  }

  /// Resend verification OTP code
  Future<ApiResponse<dynamic>> resendOtp() async {
    debugPrint('🔁 [AuthRepository.resendOtp] Requesting OTP resend');
    return apiClient.post(ApiEndpoints.resendOtp);
  }

  /// Logout and clear saved tokens
  Future<void> logout() async {
    debugPrint('🚪 [AuthRepository.logout] Logging out and clearing storage session');
    await storage.clearAuth();
  }
}
