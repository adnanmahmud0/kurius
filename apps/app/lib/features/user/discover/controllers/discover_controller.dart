import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/network/error_handler.dart';
import '../../../../data/repositories/category_repository.dart';
import '../../../../data/repositories/video_repository.dart';
import '../../video_scroll/models/video_model.dart';

class DiscoverController extends GetxController {
  final VideoRepository? videoRepository;
  final CategoryRepository? categoryRepository;

  DiscoverController({
    this.videoRepository,
    this.categoryRepository,
  });

  // Active Category Filter ('All', 'Mythology', etc.)
  final RxString selectedCategory = 'All'.obs;

  // Categories Filter List
  final RxList<String> categories = <String>['All'].obs;
  final Map<String, String> categoryIdMap = {};

  // Search State & Observables
  final RxBool isSearching = false.obs;
  final RxString searchQuery = ''.obs;
  final TextEditingController searchController = TextEditingController();
  final RxList<VideoModel> searchFilteredVideos = <VideoModel>[].obs;

  // Loading, Unauthorized & Error States
  final RxBool isLoading = false.obs;
  final RxBool isUnauthorized = false.obs;
  final RxString errorMessage = ''.obs;

  // Videos List
  final RxList<VideoModel> allVideos = <VideoModel>[].obs;
  final RxList<VideoModel> filteredVideos = <VideoModel>[].obs;

  List<VideoModel> get displayedVideos =>
      isSearching.value && searchQuery.value.isNotEmpty
          ? searchFilteredVideos
          : filteredVideos;

  @override
  void onInit() {
    super.onInit();
    loadDiscoverData();
  }

  void toggleSearch() {
    isSearching.value = !isSearching.value;
    if (!isSearching.value) {
      clearSearch();
    }
  }

  void filterSearch(String query) {
    searchQuery.value = query;
    final term = query.trim().toLowerCase();
    if (term.isEmpty) {
      searchFilteredVideos.value = filteredVideos;
    } else {
      searchFilteredVideos.value = filteredVideos.where((v) {
        final title = v.title.toLowerCase();
        final desc = v.description.toLowerCase();
        final category = v.categoryName.toLowerCase();
        final creator = v.creatorName.toLowerCase();
        final tags = v.hashtags.join(' ').toLowerCase();
        return title.contains(term) ||
            desc.contains(term) ||
            category.contains(term) ||
            creator.contains(term) ||
            tags.contains(term);
      }).toList();
    }
  }

  void clearSearch() {
    searchController.clear();
    searchQuery.value = '';
    searchFilteredVideos.value = filteredVideos;
  }

  Future<void> loadDiscoverData() async {
    isLoading.value = true;
    errorMessage.value = '';
    isUnauthorized.value = false;

    final vidRepo = videoRepository ??
        (Get.isRegistered<VideoRepository>()
            ? Get.find<VideoRepository>()
            : null);
    final catRepo = categoryRepository ??
        (Get.isRegistered<CategoryRepository>()
            ? Get.find<CategoryRepository>()
            : null);

    // 1. Fetch categories
    if (catRepo != null) {
      try {
        final catRes = await catRepo.getCategories();
        if (catRes.data != null && catRes.data!.isNotEmpty) {
          final catNames = <String>['All'];
          for (var c in catRes.data!) {
            catNames.add(c.name);
            categoryIdMap[c.name] = c.id;
          }
          categories.value = catNames;
        }
      } catch (e) {
        debugPrint('⚠️ [DiscoverController.loadDiscoverData] Categories note: $e');
      }
    }

    // 2. Fetch videos
    if (vidRepo != null) {
      try {
        final vidRes = await vidRepo.fetchVideos(limit: 20);
        if (vidRes.data != null) {
          allVideos.value = vidRes.data!
              .map((item) => VideoModel.fromVideoItem(item))
              .toList();
        } else {
          allVideos.value = [];
        }
        isUnauthorized.value = false;
      } on UnauthorizedException {
        debugPrint('🔒 [DiscoverController.loadDiscoverData] Unauthorized.');
        isUnauthorized.value = true;
        allVideos.value = [];
      } catch (e) {
        debugPrint('⚠️ [DiscoverController.loadDiscoverData] Error: $e');
        if (e.toString().contains('401') || e.toString().toLowerCase().contains('authorized')) {
          isUnauthorized.value = true;
        } else {
          errorMessage.value = ErrorHandler.getErrorMessage(e);
        }
      }
    }

    await filterCategory(selectedCategory.value);
    isLoading.value = false;
  }

  Future<void> filterCategory(String category) async {
    selectedCategory.value = category;
    if (category == 'All') {
      filteredVideos.value = allVideos;
    } else {
      final catId = categoryIdMap[category];
      final vidRepo = videoRepository ??
          (Get.isRegistered<VideoRepository>()
              ? Get.find<VideoRepository>()
              : null);

      if (catId != null && vidRepo != null) {
        try {
          final catRes = await vidRepo.getVideosByCategory(catId, limit: 20);
          if (catRes.data != null && catRes.data!.isNotEmpty) {
            filteredVideos.value = catRes.data!
                .map((item) => VideoModel.fromVideoItem(item))
                .toList();
          } else {
            filteredVideos.value = allVideos
                .where((v) => v.categoryName.toLowerCase() == category.toLowerCase())
                .toList();
          }
        } catch (e) {
          debugPrint('⚠️ [DiscoverController.filterCategory] Error fetching category videos: $e');
          filteredVideos.value = allVideos
              .where((v) => v.categoryName.toLowerCase() == category.toLowerCase())
              .toList();
        }
      } else {
        filteredVideos.value = allVideos
            .where((v) => v.categoryName.toLowerCase() == category.toLowerCase())
            .toList();
      }
    }

    if (searchQuery.value.isNotEmpty) {
      filterSearch(searchQuery.value);
    } else {
      searchFilteredVideos.value = filteredVideos;
    }
  }

  void openVideo(int initialIndex) {
    final list = displayedVideos;
    if (list.isEmpty || initialIndex < 0 || initialIndex >= list.length) return;
    Get.toNamed(
      AppRoutes.videoScroll,
      arguments: {
        'initialIndex': initialIndex,
        'videos': list.toList(),
        if (selectedCategory.value != 'All' && categoryIdMap.containsKey(selectedCategory.value))
          'categoryId': categoryIdMap[selectedCategory.value],
      },
    );
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }
}
