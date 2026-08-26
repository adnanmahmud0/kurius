import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/network/error_handler.dart';
import '../../../../data/models/category/category_model.dart';
import '../../../../data/models/video/video_item_model.dart';
import '../../../../data/repositories/video_repository.dart';
import '../../video_scroll/models/video_model.dart';

class CategoryVideosController extends GetxController {
  final VideoRepository? videoRepository;

  CategoryVideosController({this.videoRepository});

  final ScrollController scrollController = ScrollController();

  // Category Info
  final Rx<CategoryModel?> category = Rx<CategoryModel?>(null);
  final RxString categoryId = ''.obs;
  final RxString categoryName = 'Category'.obs;

  // Video List & States
  final RxList<VideoItemModel> videos = <VideoItemModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxBool isLoadingMore = false.obs;
  final RxBool isRefreshing = false.obs;
  final RxBool isUnauthorized = false.obs;
  final RxString errorMessage = ''.obs;

  // Cursor Pagination States
  final Rx<String?> nextCursor = Rx<String?>(null);
  final RxBool hasNextPage = true.obs;

  @override
  void onInit() {
    super.onInit();

    // Parse navigation arguments
    if (Get.arguments != null && Get.arguments is Map) {
      final args = Get.arguments as Map;
      if (args['category'] is CategoryModel) {
        category.value = args['category'] as CategoryModel;
      }
      if (args['categoryId'] != null) {
        categoryId.value = args['categoryId'] as String;
      }
      if (args['categoryName'] != null) {
        categoryName.value = args['categoryName'] as String;
      } else if (category.value != null) {
        categoryName.value = category.value!.title;
      }
    }

    // Attach scroll listener for infinite cursor pagination
    scrollController.addListener(_scrollListener);

    if (categoryId.value.isNotEmpty || category.value != null) {
      loadCategoryVideos();
    }
  }

  void _scrollListener() {
    if (scrollController.position.pixels >=
            scrollController.position.maxScrollExtent - 200 &&
        hasNextPage.value &&
        !isLoadingMore.value &&
        !isLoading.value) {
      loadMoreVideos();
    }
  }

  VideoRepository get _effectiveRepo =>
      videoRepository ??
      (Get.isRegistered<VideoRepository>()
          ? Get.find<VideoRepository>()
          : const VideoRepository());

  /// Load initial page for the category (resets cursor)
  Future<void> loadCategoryVideos() async {
    isLoading.value = true;
    errorMessage.value = '';
    isUnauthorized.value = false;
    nextCursor.value = null;
    hasNextPage.value = true;

    final targetId = categoryId.value.isNotEmpty ? categoryId.value : (category.value?.id ?? '');

    try {
      var res = await _effectiveRepo.getVideosByCategory(
        targetId,
        limit: 10,
      );

      // If empty and category has slug, try slug fallback
      if ((res.data == null || res.data!.isEmpty) && category.value?.slug != null && category.value!.slug.isNotEmpty && category.value!.slug != targetId) {
        final slugRes = await _effectiveRepo.getVideosByCategory(
          category.value!.slug,
          limit: 10,
        );
        if (slugRes.data != null && slugRes.data!.isNotEmpty) {
          res = slugRes;
        }
      }

      if (res.data != null) {
        videos.value = res.data!;
        nextCursor.value = res.meta?.nextCursor;
        hasNextPage.value = res.meta?.hasNextPage ?? (res.meta?.nextCursor != null);
        isUnauthorized.value = false;
      } else {
        videos.value = [];
        hasNextPage.value = false;
      }
    } on UnauthorizedException {
      isUnauthorized.value = true;
      videos.value = [];
    } catch (e) {
      debugPrint('⚠️ [CategoryVideosController.loadCategoryVideos] Error: $e');
      if (e.toString().contains('401') || e.toString().toLowerCase().contains('authorized')) {
        isUnauthorized.value = true;
      } else {
        errorMessage.value = ErrorHandler.getErrorMessage(e);
      }
    } finally {
      isLoading.value = false;
    }
  }

  /// Pull-to-refresh
  Future<void> refreshVideos() async {
    isRefreshing.value = true;
    errorMessage.value = '';
    nextCursor.value = null;
    hasNextPage.value = true;

    final targetId = categoryId.value.isNotEmpty ? categoryId.value : (category.value?.id ?? '');

    try {
      final res = await _effectiveRepo.getVideosByCategory(
        targetId,
        limit: 10,
      );

      if (res.data != null) {
        videos.value = res.data!;
        nextCursor.value = res.meta?.nextCursor;
        hasNextPage.value = res.meta?.hasNextPage ?? (res.meta?.nextCursor != null);
      }
    } catch (e) {
      debugPrint('⚠️ [CategoryVideosController.refreshVideos] Error: $e');
    } finally {
      isRefreshing.value = false;
    }
  }

  /// Infinite scroll cursor load more
  Future<void> loadMoreVideos() async {
    if (isLoadingMore.value || !hasNextPage.value) return;

    final cursor = nextCursor.value;
    if (cursor == null && videos.isNotEmpty) {
      hasNextPage.value = false;
      return;
    }

    isLoadingMore.value = true;
    final targetId = categoryId.value.isNotEmpty ? categoryId.value : (category.value?.id ?? '');
    debugPrint('🔄 [CategoryVideosController.loadMoreVideos] Fetching cursor: $cursor for category: $targetId');

    try {
      final res = await _effectiveRepo.getVideosByCategory(
        targetId,
        limit: 10,
        cursor: cursor,
      );

      if (res.data != null && res.data!.isNotEmpty) {
        final existingIds = videos.map((v) => v.id).toSet();
        final uniqueNew = res.data!.where((v) => !existingIds.contains(v.id)).toList();

        videos.addAll(uniqueNew);
        nextCursor.value = res.meta?.nextCursor;
        hasNextPage.value = res.meta?.hasNextPage ?? (res.meta?.nextCursor != null);

        if (uniqueNew.length < 10 || res.meta?.nextCursor == null) {
          hasNextPage.value = false;
        }
      } else {
        hasNextPage.value = false;
      }
    } catch (e) {
      debugPrint('⚠️ [CategoryVideosController.loadMoreVideos] Error: $e');
    } finally {
      isLoadingMore.value = false;
    }
  }

  /// Open video scroll player starting at selected index
  void openVideo(int index) {
    if (videos.isEmpty || index < 0 || index >= videos.length) return;
    Get.toNamed(
      AppRoutes.videoScroll,
      arguments: {
        'initialIndex': index,
        'videos': videos.map((v) => VideoModel.fromVideoItem(v)).toList(),
        'categoryId': categoryId.value,
      },
    );
  }

  @override
  void onClose() {
    scrollController.dispose();
    super.onClose();
  }
}
