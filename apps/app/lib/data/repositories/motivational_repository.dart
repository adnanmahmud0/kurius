import 'package:flutter/foundation.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../models/motivational/motivational_message_model.dart';

class MotivationalRepository {
  final ApiClient? apiClient;

  const MotivationalRepository({this.apiClient});

  /// Fetch motivational messages list: GET /motivational-messages
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

    debugPrint('💡 [MotivationalRepository.getMotivationalMessages] Received ${response.data?.length ?? 0} messages');
    return response;
  }
}
