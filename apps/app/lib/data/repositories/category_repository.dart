import 'package:flutter/foundation.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../models/category/category_model.dart';

class CategoryRepository {
  final ApiClient? apiClient;

  const CategoryRepository({this.apiClient});

  /// Fetch all active categories: GET /categories
  Future<ApiResponse<List<CategoryModel>>> getCategories() async {
    debugPrint('📁 [CategoryRepository.getCategories] Fetching categories list from API...');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: true, data: []);
    }

    final response = await client.get<List<CategoryModel>>(
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

  /// Fetch a single category by ID or slug: GET /categories/{id}
  Future<ApiResponse<CategoryModel>> getCategoryById(String idOrSlug) async {
    debugPrint('📁 [CategoryRepository.getCategoryById] Fetching category: $idOrSlug');
    final client = apiClient;
    if (client == null) {
      return const ApiResponse(success: false, message: 'ApiClient not initialized');
    }

    final response = await client.get<CategoryModel>(
      '${ApiEndpoints.categories}/$idOrSlug',
      fromJsonT: (data) => CategoryModel.fromJson(data as Map<String, dynamic>),
    );
    return response;
  }
}
