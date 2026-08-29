import 'package:flutter/foundation.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../models/legal/legal_policy_model.dart';

class LegalRepository {
  final ApiClient? apiClient;

  const LegalRepository({this.apiClient});

  /// Fetch legal policy content ('privacy' or 'terms'): GET /legal/{type}
  Future<ApiResponse<LegalPolicyModel>> getLegalPolicy(String type) async {
    debugPrint('📜 [LegalRepository.getLegalPolicy] Fetching policy for type: $type');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: false, message: 'ApiClient not initialized');
    }

    final response = await client.get<LegalPolicyModel>(
      ApiEndpoints.legalPolicy(type),
      fromJsonT: (data) => LegalPolicyModel.fromJson(data as Map<String, dynamic>),
    );

    debugPrint('📜 [LegalRepository.getLegalPolicy] Successfully fetched: ${response.data?.title}');
    return response;
  }
}
