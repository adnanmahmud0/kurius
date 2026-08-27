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
      return const ApiResponse(
        success: true,
        data: MotivationalMessageModel(
          id: 'default',
          message: 'Success is not final, failure is not fatal: It is the courage to continue that counts.',
          author: 'Winston Churchill',
        ),
      );
    }

    try {
      final response = await client.get<MotivationalMessageModel>(
        ApiEndpoints.randomMotivationalMessage,
        fromJsonT: (data) {
          if (data is Map<String, dynamic>) {
            return MotivationalMessageModel.fromJson(data);
          } else if (data is List && data.isNotEmpty) {
            return MotivationalMessageModel.fromJson(data.first as Map<String, dynamic>);
          }
          return const MotivationalMessageModel(id: '', message: '');
        },
      );

      if (response.data != null && response.data!.message.isNotEmpty) {
        debugPrint('💡 [MotivationalRepository.getRandomMotivationalMessage] Received: ${response.data?.message}');
        return response;
      }
    } catch (e) {
      debugPrint('⚠️ [MotivationalRepository.getRandomMotivationalMessage] Random endpoint note: $e');
    }

    // Fallback: GET /motivational-messages?page=1&limit=10&status=active
    try {
      final listResponse = await getMotivationalMessages(limit: 10, status: 'active');
      if (listResponse.data != null && listResponse.data!.isNotEmpty) {
        final randomItem = (listResponse.data!..shuffle()).first;
        return ApiResponse(
          success: true,
          statusCode: 200,
          data: randomItem,
          message: listResponse.message,
        );
      }
    } catch (e) {
      debugPrint('⚠️ [MotivationalRepository.getRandomMotivationalMessage] Fallback list note: $e');
    }

    return const ApiResponse(
      success: true,
      data: MotivationalMessageModel(
        id: 'default',
        message: 'Success is not final, failure is not fatal: It is the courage to continue that counts.',
        author: 'Winston Churchill',
      ),
    );
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
