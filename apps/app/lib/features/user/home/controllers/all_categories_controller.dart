import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../data/models/category/category_model.dart';
import '../../../../data/repositories/category_repository.dart';
import '../bindings/category_videos_binding.dart';
import '../views/category_videos_view.dart';

class AllCategoriesController extends GetxController {
  final CategoryRepository? categoryRepository;

  AllCategoriesController({this.categoryRepository});

  final RxList<CategoryModel> categories = <CategoryModel>[].obs;
  final RxList<CategoryModel> filteredCategories = <CategoryModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxBool isRefreshing = false.obs;
  final RxString errorMessage = ''.obs;
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();

  @override
  void onInit() {
    super.onInit();
    loadCategories();
  }

  CategoryRepository get _effectiveRepo =>
      categoryRepository ??
      (Get.isRegistered<CategoryRepository>()
          ? Get.find<CategoryRepository>()
          : const CategoryRepository());

  Future<void> loadCategories() async {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      final res = await _effectiveRepo.getCategories();
      if (res.data != null) {
        categories.value = res.data!;
        filteredCategories.value = res.data!;
      } else {
        categories.value = [];
        filteredCategories.value = [];
      }
    } catch (e) {
      debugPrint('⚠️ [AllCategoriesController.loadCategories] Error: $e');
      errorMessage.value = 'Failed to load categories';
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshCategories() async {
    isRefreshing.value = true;
    try {
      final res = await _effectiveRepo.getCategories();
      if (res.data != null) {
        categories.value = res.data!;
        if (searchController.text.trim().isEmpty) {
          filteredCategories.value = res.data!;
        } else {
          filterCategories(searchController.text);
        }
      }
    } catch (e) {
      debugPrint('⚠️ [AllCategoriesController.refreshCategories] Error: $e');
    } finally {
      isRefreshing.value = false;
    }
  }

  void filterCategories(String query) {
    searchQuery.value = query;
    final term = query.trim().toLowerCase();
    if (term.isEmpty) {
      filteredCategories.value = categories;
    } else {
      filteredCategories.value = categories
          .where((cat) =>
              cat.name.toLowerCase().contains(term) ||
              cat.slug.toLowerCase().contains(term))
          .toList();
    }
  }

  void clearSearch() {
    searchController.clear();
    searchQuery.value = '';
    filteredCategories.value = categories;
  }

  void openCategory(CategoryModel category) {
    Get.to(
      () => const CategoryVideosView(),
      binding: CategoryVideosBinding(),
      arguments: {
        'category': category,
        'categoryId': category.id,
        'categoryName': category.title,
      },
    );
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
