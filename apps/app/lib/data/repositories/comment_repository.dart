import 'package:flutter/foundation.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../models/comment/comment_model.dart';

class CommentRepository {
  final ApiClient apiClient;

  const CommentRepository({required this.apiClient});

  /// Fetch paginated comments for a video
  Future<ApiResponse<List<CommentModel>>> getVideoComments(
    String videoId, {
    int page = 1,
    int limit = 20,
  }) async {
    debugPrint('💬 [CommentRepository.getVideoComments] Fetching comments for video: $videoId (page=$page, limit=$limit)');
    final response = await apiClient.get<List<CommentModel>>(
      ApiEndpoints.videoComments(videoId),
      queryParameters: {
        'page': page,
        'limit': limit,
      },
      fromJsonT: (data) {
        if (data is List) {
          return data
              .map((e) => CommentModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
        return [];
      },
    );
    debugPrint('📨 [CommentRepository.getVideoComments] Loaded ${response.data?.length ?? 0} comments');
    return response;
  }

  /// Post a new comment to a video
  Future<ApiResponse<CommentModel>> postComment(
    String videoId, {
    required String commentText,
  }) async {
    debugPrint('✍️ [CommentRepository.postComment] Posting comment to video: $videoId | text="$commentText"');
    final response = await apiClient.post<CommentModel>(
      ApiEndpoints.videoComments(videoId),
      data: {'commentText': commentText},
      fromJsonT: (data) => CommentModel.fromJson(data as Map<String, dynamic>),
    );
    debugPrint('🎉 [CommentRepository.postComment] Comment posted successfully! ID: ${response.data?.id}');
    return response;
  }

  /// Delete a comment by ID
  Future<ApiResponse<dynamic>> deleteComment(String commentId) async {
    debugPrint('🗑️ [CommentRepository.deleteComment] Deleting comment ID: $commentId');
    final response = await apiClient.delete(ApiEndpoints.deleteComment(commentId));
    debugPrint('✅ [CommentRepository.deleteComment] Comment deleted');
    return response;
  }
}
