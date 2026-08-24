import 'package:flutter/foundation.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../models/category/category_model.dart';

class CategoryRepository {
  final ApiClient apiClient;

  const CategoryRepository({required this.apiClient});

  /// Fetch all active categories
  Future<ApiResponse<List<CategoryModel>>> getCategories() async {
    debugPrint('📁 [CategoryRepository.getCategories] Fetching categories list from API...');
    final response = await apiClient.get<List<CategoryModel>>(
      ApiEndpoints.categories,
      fromJsonT: (data) {
        if (data is List) {
          return data
              .map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
        return [];
      },
    );
    debugPrint('📂 [CategoryRepository.getCategories] Loaded ${response.data?.length ?? 0} categories');
    return response;
  }
}
