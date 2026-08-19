import 'package:get/get.dart';
import '../../../../data/repositories/video_repository.dart';
import '../../video_scroll/models/video_model.dart';
import '../../../../app/routes/app_routes.dart';

class DiscoverController extends GetxController {
  final VideoRepository _videoRepository = VideoRepository();

  // Active Category Filter ('All', 'Mythology', etc.)
  final RxString selectedCategory = 'All'.obs;

  // Categories Filter List
  final List<String> categories = ['All', 'Mythology', 'History', 'Science', 'Art'];

  // Videos List
  final RxList<VideoModel> allVideos = <VideoModel>[].obs;
  final RxList<VideoModel> filteredVideos = <VideoModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    loadVideos();
  }

  void loadVideos() {
    allVideos.value = _videoRepository.getAllVideos();
    filterCategory('All');
  }

  void filterCategory(String category) {
    selectedCategory.value = category;
    if (category == 'All') {
      filteredVideos.value = allVideos;
    } else {
      filteredVideos.value = allVideos
          .where((v) => v.category.toLowerCase() == category.toLowerCase())
          .toList();
    }
  }

  void openVideo(int initialIndex) {
    Get.toNamed(
      AppRoutes.videoScroll,
      arguments: {
        'initialIndex': initialIndex,
        'videos': filteredVideos.toList(),
      },
    );
  }
}
