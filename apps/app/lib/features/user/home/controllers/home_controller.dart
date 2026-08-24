import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/network/error_handler.dart';
import '../../../../data/models/category/category_model.dart';
import '../../../../data/models/video/video_item_model.dart';
import '../../../../data/repositories/category_repository.dart';
import '../../../../data/repositories/video_repository.dart';

class HomeController extends GetxController {
  final VideoRepository? videoRepository;
  final CategoryRepository? categoryRepository;

  HomeController({
    this.videoRepository,
    this.categoryRepository,
  });

  // Bottom Navigation Index: 0 = Start, 1 = Explore
  final RxInt selectedNavIndex = 0.obs;

  // Selected Category ID
  final RxString selectedCategoryId = ''.obs;

  // Fact of the Day
  final RxString factOfTheDay = ''.obs;

  // Loading, Unauthorized and Error States
  final RxBool isLoading = false.obs;
  final RxBool isUnauthorized = false.obs;
  final RxString errorMessage = ''.obs;

  // Dynamic Categories and Videos from API
  final RxList<CategoryModel> categories = <CategoryModel>[].obs;
  final RxList<VideoItemModel> latestVideos = <VideoItemModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    loadHomeData();
  }

  Future<void> loadHomeData() async {
    isLoading.value = true;
    errorMessage.value = '';
    isUnauthorized.value = false;

    final catRepo = categoryRepository ??
        (Get.isRegistered<CategoryRepository>()
            ? Get.find<CategoryRepository>()
            : null);
    final vidRepo = videoRepository ??
        (Get.isRegistered<VideoRepository>()
            ? Get.find<VideoRepository>()
            : null);

    // 1. Fetch public categories
    if (catRepo != null) {
      try {
        final catResponse = await catRepo.getCategories();
        categories.value = catResponse.data ?? [];
        if (categories.isNotEmpty && selectedCategoryId.value.isEmpty) {
          selectedCategoryId.value = categories.first.id;
        }
      } catch (e) {
        debugPrint('⚠️ [HomeController.loadHomeData] Categories fetch note: $e');
      }
    }

    // 2. Fetch latest videos (Requires Auth)
    if (vidRepo != null) {
      try {
        final vidResponse = await vidRepo.fetchVideos(limit: 10);
        latestVideos.value = vidResponse.data ?? [];
        isUnauthorized.value = false;
      } on UnauthorizedException {
        debugPrint('🔒 [HomeController.loadHomeData] User is not authenticated. Showing sign-in state.');
        isUnauthorized.value = true;
        latestVideos.value = [];
      } catch (e) {
        debugPrint('⚠️ [HomeController.loadHomeData] Failed to load videos: $e');
        if (e.toString().contains('401') || e.toString().toLowerCase().contains('authorized')) {
          isUnauthorized.value = true;
        } else {
          errorMessage.value = ErrorHandler.getErrorMessage(e);
        }
      }
    }

    isLoading.value = false;
  }

  void setNavIndex(int index) {
    selectedNavIndex.value = index;
  }

  void selectCategory(String categoryId) {
    selectedCategoryId.value = categoryId;
  }

  Future<void> refreshHome() async {
    await loadHomeData();
  }
}
