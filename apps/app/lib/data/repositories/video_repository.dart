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

  /// Fetch videos with cursor-based pagination, optional category filter and search term
  Future<ApiResponse<List<VideoItemModel>>> fetchVideos({
    String? cursor,
    int limit = 10,
    String? categoryId,
    String? searchTerm,
  }) async {
    debugPrint('🎬 [VideoRepository.fetchVideos] Fetching video feed: limit=$limit, cursor=$cursor, category=$categoryId, search=$searchTerm');
    final client = apiClient;
    if (client == null) {
      debugPrint('⚠️ [VideoRepository.fetchVideos] ApiClient is null, returning empty list');
      return const ApiResponse(success: true, data: []);
    }

    final query = <String, dynamic>{
      'limit': limit,
    };
    if (cursor != null) query['cursor'] = cursor;
    if (categoryId != null) query['categoryId'] = categoryId;
    if (searchTerm != null && searchTerm.isNotEmpty) query['searchTerm'] = searchTerm;

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
    debugPrint('🎥 [VideoRepository.fetchVideos] Retrieved ${response.data?.length ?? 0} videos');
    return response;
  }

  /// Fetch videos by category
  Future<ApiResponse<List<VideoItemModel>>> fetchVideosByCategory(String categoryId) async {
    debugPrint('📂 [VideoRepository.fetchVideosByCategory] Category ID: $categoryId');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: true, data: []);
    }

    return client.get<List<VideoItemModel>>(
      ApiEndpoints.videosByCategory(categoryId),
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

  /// Fetch single video by ID
  Future<ApiResponse<VideoItemModel>> fetchVideoById(String id) async {
    debugPrint('🔍 [VideoRepository.fetchVideoById] Video ID: $id');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: false, message: 'ApiClient not initialized');
    }

    return client.get<VideoItemModel>(
      ApiEndpoints.videoDetails(id),
      fromJsonT: (data) => VideoItemModel.fromJson(data as Map<String, dynamic>),
    );
  }

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
