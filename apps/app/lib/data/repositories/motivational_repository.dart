import 'package:flutter/foundation.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../models/motivational/motivational_message_model.dart';

class MotivationalRepository {
  final ApiClient? apiClient;

  const MotivationalRepository({this.apiClient});

  /// Fetch a single random active motivational message: GET /motivational-messages/random
  Future<ApiResponse<MotivationalMessageModel>> getRandomMotivationalMessage() async {
    debugPrint('💡 [MotivationalRepository.getRandomMotivationalMessage] Fetching random message...');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: false, message: 'ApiClient not initialized');
    }

    final response = await client.get<MotivationalMessageModel>(
      ApiEndpoints.randomMotivationalMessage,
      fromJsonT: (data) => MotivationalMessageModel.fromJson(data as Map<String, dynamic>),
    );

    debugPrint('💡 [MotivationalRepository.getRandomMotivationalMessage] Received: ${response.data?.message}');
    return response;
  }

  /// Fetch paginated motivational messages list: GET /motivational-messages
  Future<ApiResponse<List<MotivationalMessageModel>>> getMotivationalMessages({
    int page = 1,
    int limit = 20,
    String? search,
    String status = 'active',
  }) async {
    debugPrint('💡 [MotivationalRepository.getMotivationalMessages] page=$page, limit=$limit, status=$status');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: true, data: []);
    }

    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      'status': status,
    };
    if (search != null && search.trim().isNotEmpty) {
      queryParams['search'] = search.trim();
    }

    final response = await client.get<List<MotivationalMessageModel>>(
      ApiEndpoints.motivationalMessages,
      queryParameters: queryParams,
      fromJsonT: (data) {
        if (data is List) {
          return data
              .map((e) => MotivationalMessageModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
        return [];
      },
    );

    return response;
  }
}
