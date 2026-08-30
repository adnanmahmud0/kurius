import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../../core/storage/storage_service.dart';
import '../models/user/user_model.dart';

class UserRepository {
  final ApiClient apiClient;
  final StorageService storage;

  const UserRepository({
    required this.apiClient,
    required this.storage,
  });

  /// Fetch authenticated user profile
  Future<ApiResponse<UserModel>> getProfile() async {
    debugPrint('👤 [UserRepository.getProfile] Fetching user profile from API...');
    final response = await apiClient.get<UserModel>(
      ApiEndpoints.userProfile,
      fromJsonT: (data) => UserModel.fromJson(data as Map<String, dynamic>),
    );

    if (response.data != null) {
      debugPrint('💾 [UserRepository.getProfile] Profile loaded successfully for: ${response.data?.email}');
      await storage.saveUserData(response.data!.toJson());
    }

    return response;
  }

  /// Update user profile (supports text fields and optional multipart avatar image file)
  Future<ApiResponse<UserModel>> updateProfile({
    String? name,
    String? firstName,
    String? lastName,
    String? contact,
    String? location,
    String? avatarFilePath,
  }) async {
    debugPrint('✏️ [UserRepository.updateProfile] Updating profile fields: name=$name, location=$location, avatar=$avatarFilePath');
    final Map<String, dynamic> dataMap = {};
    if (name != null) dataMap['name'] = name;
    if (firstName != null) dataMap['firstName'] = firstName;
    if (lastName != null) dataMap['lastName'] = lastName;
    if (contact != null) dataMap['contact'] = contact;
    if (location != null) dataMap['location'] = location;

    if (avatarFilePath != null && avatarFilePath.isNotEmpty) {
      debugPrint('🖼️ [UserRepository.updateProfile] Uploading avatar image file: $avatarFilePath');
      final formData = FormData.fromMap({
        'data': jsonEncode(dataMap),
        'image': await MultipartFile.fromFile(avatarFilePath),
      });

      final response = await apiClient.patchMultipart<UserModel>(
        ApiEndpoints.updateProfile,
        formData: formData,
        fromJsonT: (data) => UserModel.fromJson(data as Map<String, dynamic>),
      );

      if (response.data != null) {
        debugPrint('💾 [UserRepository.updateProfile] Profile updated & saved to local cache');
        await storage.saveUserData(response.data!.toJson());
      }
      return response;
    }

    final response = await apiClient.patch<UserModel>(
      ApiEndpoints.updateProfile,
      data: dataMap,
      fromJsonT: (data) => UserModel.fromJson(data as Map<String, dynamic>),
    );

    if (response.data != null) {
      debugPrint('💾 [UserRepository.updateProfile] Profile updated & saved to local cache');
      await storage.saveUserData(response.data!.toJson());
    }

    return response;
  }

  /// Dedicated endpoint to upload or update user avatar/profile picture: POST /user/profile/image
  Future<ApiResponse<UserModel>> updateProfileImage({
    required String imageFilePath,
  }) async {
    debugPrint('🖼️ [UserRepository.updateProfileImage] Uploading avatar image file: $imageFilePath');
    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(imageFilePath),
    });

    final response = await apiClient.postMultipart<UserModel>(
      ApiEndpoints.updateProfileImage,
      formData: formData,
      fromJsonT: (data) => UserModel.fromJson(data as Map<String, dynamic>),
    );

    if (response.data != null) {
      debugPrint('💾 [UserRepository.updateProfileImage] Avatar updated & saved to local cache: ${response.data?.displayAvatar}');
      await storage.saveUserData(response.data!.toJson());
    }

    return response;
  }

  /// Delete user account
  Future<ApiResponse<dynamic>> deleteAccount() async {
    debugPrint('🗑️ [UserRepository.deleteAccount] Sending delete account request');
    final response = await apiClient.delete(ApiEndpoints.deleteAccount);
    debugPrint('🚪 [UserRepository.deleteAccount] Account deleted. Clearing local storage session.');
    await storage.clearAuth();
    return response;
  }
}
