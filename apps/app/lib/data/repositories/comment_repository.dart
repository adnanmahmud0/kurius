import 'package:flutter/foundation.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../models/comment/comment_model.dart';

class CommentRepository {
  final ApiClient? apiClient;

  const CommentRepository({this.apiClient});

  /// Fetch cursor-paginated comments for a video: GET /videos/{id}/comments
  Future<ApiResponse<List<CommentModel>>> getVideoComments(
    String videoId, {
    int? limit,
    String? cursor,
    int? page,
  }) async {
    debugPrint('💬 [CommentRepository.getVideoComments] Fetching comments for video: $videoId (limit=$limit, cursor=$cursor)');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: true, data: []);
    }

    final query = <String, dynamic>{};
    if (limit != null) query['limit'] = limit;
    if (cursor != null && cursor.isNotEmpty) query['cursor'] = cursor;
    if (page != null) query['page'] = page;

    final response = await client.get<List<CommentModel>>(
      ApiEndpoints.videoComments(videoId),
      queryParameters: query.isNotEmpty ? query : null,
      fromJsonT: (data) {
        if (data is List) {
          return data
              .map((e) => CommentModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
        return [];
      },
    );
    debugPrint('📨 [CommentRepository.getVideoComments] Loaded ${response.data?.length ?? 0} comments (nextCursor: ${response.meta?.nextCursor})');
    return response;
  }

  /// Post a new comment to a video: POST /videos/{id}/comments
  Future<ApiResponse<CommentModel>> postComment(
    String videoId, {
    required String commentText,
  }) async {
    debugPrint('✍️ [CommentRepository.postComment] Posting comment to video: $videoId | text="$commentText"');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: false, message: 'ApiClient is not initialized');
    }

    final response = await client.post<CommentModel>(
      ApiEndpoints.videoComments(videoId),
      data: {'commentText': commentText},
      fromJsonT: (data) => CommentModel.fromJson(data as Map<String, dynamic>),
    );
    debugPrint('🎉 [CommentRepository.postComment] Comment posted successfully! ID: ${response.data?.id}');
    return response;
  }

  /// Delete a comment by ID: DELETE /comments/{id}
  Future<ApiResponse<dynamic>> deleteComment(String commentId) async {
    debugPrint('🗑️ [CommentRepository.deleteComment] Deleting comment ID: $commentId');
    final client = apiClient;
    if (client == null) return const ApiResponse(success: true);
    final response = await client.delete(ApiEndpoints.deleteComment(commentId));
    debugPrint('✅ [CommentRepository.deleteComment] Comment deleted');
    return response;
  }
}
