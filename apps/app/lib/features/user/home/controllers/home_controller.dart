import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/network/error_handler.dart';
import '../../../../data/models/category/category_model.dart';
import '../../../../data/models/motivational/motivational_message_model.dart';
import '../../../../data/models/video/video_item_model.dart';
import '../../../../data/repositories/category_repository.dart';
import '../../../../data/repositories/motivational_repository.dart';
import '../../../../data/repositories/user_repository.dart';
import '../../../../data/repositories/video_repository.dart';
import '../../auth/controllers/auth_controller.dart';

class HomeController extends GetxController {
  final VideoRepository? videoRepository;
  final CategoryRepository? categoryRepository;
  final MotivationalRepository? motivationalRepository;

  HomeController({
    this.videoRepository,
    this.categoryRepository,
    this.motivationalRepository,
  });

  // Bottom Navigation Index: 0 = Start, 1 = Explore
  final RxInt selectedNavIndex = 0.obs;

  // Selected Category ID
  final RxString selectedCategoryId = ''.obs;

  // Fact of the Day / Random Motivational Message
  final RxString factOfTheDay =
      'Success is not final, failure is not fatal: It is the courage to continue that counts.'.obs;
  final RxString factAuthor = 'Winston Churchill'.obs;
  final Rx<MotivationalMessageModel?> motivationalMessage = Rx<MotivationalMessageModel?>(null);

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
            : const CategoryRepository());
    final vidRepo = videoRepository ??
        (Get.isRegistered<VideoRepository>()
            ? Get.find<VideoRepository>()
            : const VideoRepository());
    final quoteRepo = motivationalRepository ??
        (Get.isRegistered<MotivationalRepository>()
            ? Get.find<MotivationalRepository>()
            : const MotivationalRepository());

    // 1. Fetch public categories
    try {
      final catResponse = await catRepo.getCategories();
      if (catResponse.data != null && catResponse.data!.isNotEmpty) {
        categories.value = catResponse.data!;
        if (selectedCategoryId.value.isEmpty) {
          selectedCategoryId.value = categories.first.id;
        }
      }
    } catch (e) {
      debugPrint('⚠️ [HomeController.loadHomeData] Categories fetch note: $e');
    }

    // 2. Fetch Random Motivational Message (Fact of the Day): GET /motivational-messages/random
    try {
      final quoteResponse = await quoteRepo.getRandomMotivationalMessage();
      if (quoteResponse.data != null && quoteResponse.data!.message.isNotEmpty) {
        final msg = quoteResponse.data!;
        motivationalMessage.value = msg;
        factOfTheDay.value = msg.message;
        factAuthor.value = msg.displayAuthor;
      }
    } catch (e) {
      debugPrint('⚠️ [HomeController.loadHomeData] Random motivational quote fetch note: $e');
    }

    // 3. Fetch latest videos (Requires Auth)
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

    // 4. Sync latest user profile & avatar for HomeHeader
    if (Get.isRegistered<UserRepository>() && Get.isRegistered<AuthController>()) {
      final auth = Get.find<AuthController>();
      if (auth.isLoggedIn.value) {
        try {
          final userRepo = Get.find<UserRepository>();
          final profileRes = await userRepo.getProfile();
          if (profileRes.data != null) {
            final user = profileRes.data!;
            auth.userName.value = user.displayName;
            auth.userEmail.value = user.email;
            auth.avatarUrl.value = user.displayAvatar;
          }
        } catch (e) {
          debugPrint('⚠️ [HomeController.loadHomeData] User profile sync note: $e');
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
