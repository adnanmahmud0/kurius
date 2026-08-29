import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../../features/user/video_scroll/models/video_model.dart';
import '../models/video/video_item_model.dart';

class VideoRepository {
  final ApiClient? apiClient;

  const VideoRepository({this.apiClient});

  // ---------------------------------------------------------------------------
  // Real Backend API Methods
  // ---------------------------------------------------------------------------

  /// Fetch videos with cursor pagination, optional search term and category ID
  Future<ApiResponse<List<VideoItemModel>>> fetchVideos({
    int? limit,
    String? cursor,
    String? search,
    String? searchTerm,
    String? categoryId,
    int? page,
  }) async {
    final searchVal = search ?? searchTerm;
    debugPrint('🎬 [VideoRepository.fetchVideos] limit=$limit, cursor=$cursor, search=$searchVal, categoryId=$categoryId, page=$page');
    
    final client = apiClient;
    if (client == null) {
      debugPrint('⚠️ [VideoRepository.fetchVideos] ApiClient is null, returning empty list');
      return const ApiResponse(success: true, data: []);
    }

    final query = <String, dynamic>{};
    if (limit != null) query['limit'] = limit;
    if (cursor != null && cursor.isNotEmpty) query['cursor'] = cursor;
    if (page != null) query['page'] = page;
    if (categoryId != null && categoryId.isNotEmpty) query['categoryId'] = categoryId;
    if (searchVal != null && searchVal.isNotEmpty) query['search'] = searchVal;

    final response = await client.get<List<VideoItemModel>>(
      ApiEndpoints.videos,
      queryParameters: query,
      fromJsonT: (data) {
        if (data is List) {
          return data
              .map((e) => VideoItemModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
        return [];
      },
    );
    debugPrint('🎥 [VideoRepository.fetchVideos] Retrieved ${response.data?.length ?? 0} videos (nextCursor: ${response.meta?.nextCursor}, hasNext: ${response.meta?.hasNextPage})');
    return response;
  }

  /// Get video details by ID: GET /videos/{id}
  Future<ApiResponse<VideoItemModel>> getVideoById(String id) async {
    debugPrint('🔍 [VideoRepository.getVideoById] ID: $id');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: false, message: 'ApiClient not initialized');
    }

    return client.get<VideoItemModel>(
      ApiEndpoints.videoDetails(id),
      fromJsonT: (data) => VideoItemModel.fromJson(data as Map<String, dynamic>),
    );
  }

  /// Fetch single video by ID alias
  Future<ApiResponse<VideoItemModel>> fetchVideoById(String id) => getVideoById(id);

  /// Get videos by category with cursor pagination: GET /videos/category/{categoryId}
  Future<ApiResponse<List<VideoItemModel>>> getVideosByCategory(
    String categoryId, {
    int? limit,
    String? cursor,
  }) async {
    debugPrint('📂 [VideoRepository.getVideosByCategory] Category ID: $categoryId, limit=$limit, cursor=$cursor');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: true, data: []);
    }

    final query = <String, dynamic>{};
    if (limit != null) query['limit'] = limit;
    if (cursor != null && cursor.isNotEmpty) query['cursor'] = cursor;

    return client.get<List<VideoItemModel>>(
      ApiEndpoints.videosByCategory(categoryId),
      queryParameters: query.isNotEmpty ? query : null,
      fromJsonT: (data) {
        if (data is List) {
          return data
              .map((e) => VideoItemModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
        return [];
      },
    );
  }

  /// Fetch videos by category alias
  Future<ApiResponse<List<VideoItemModel>>> fetchVideosByCategory(String categoryId) =>
      getVideosByCategory(categoryId);

  /// Like a video
  Future<ApiResponse<dynamic>> likeVideo(String id) async {
    debugPrint('❤️ [VideoRepository.likeVideo] Liking video: $id');
    final client = apiClient;
    if (client == null) return const ApiResponse(success: true);
    return client.post(ApiEndpoints.videoLike(id));
  }

  /// Unlike a video
  Future<ApiResponse<dynamic>> unlikeVideo(String id) async {
    debugPrint('💔 [VideoRepository.unlikeVideo] Unliking video: $id');
    final client = apiClient;
    if (client == null) return const ApiResponse(success: true);
    return client.delete(ApiEndpoints.videoLike(id));
  }

  /// Record 24-hour deduplicated video view
  Future<ApiResponse<dynamic>> recordView(String id) async {
    debugPrint('👁️ [VideoRepository.recordView] Recording view for video: $id');
    final client = apiClient;
    if (client == null) return const ApiResponse(success: true);
    return client.post(ApiEndpoints.videoView(id));
  }

  /// Upload a video with multipart form data
  Future<ApiResponse<VideoItemModel>> uploadVideo({
    required String videoFilePath,
    String? thumbnailFilePath,
    required String title,
    String? subtitle,
    required String categoryId,
    List<String> hashtags = const [],
  }) async {
    debugPrint('🚀 [VideoRepository.uploadVideo] Uploading video file: $videoFilePath | Title: $title');
    final client = apiClient;
    if (client == null) {
      throw Exception('ApiClient is required for video upload');
    }

    final Map<String, dynamic> formMap = {
      'video': await MultipartFile.fromFile(videoFilePath),
      'title': title,
      'categoryId': categoryId,
      'hashtags': hashtags,
    };
    if (thumbnailFilePath != null) {
      formMap['thumbnail'] = await MultipartFile.fromFile(thumbnailFilePath);
    }
    if (subtitle != null) {
      formMap['subtitle'] = subtitle;
    }

    final formData = FormData.fromMap(formMap);

    final response = await client.postMultipart<VideoItemModel>(
      ApiEndpoints.videos,
      formData: formData,
      fromJsonT: (data) => VideoItemModel.fromJson(data as Map<String, dynamic>),
    );
    debugPrint('🎉 [VideoRepository.uploadVideo] Video uploaded successfully! ID: ${response.data?.id}');
    return response;
  }

  List<VideoModel> getAllVideos() {
    return const [];
  }
}
