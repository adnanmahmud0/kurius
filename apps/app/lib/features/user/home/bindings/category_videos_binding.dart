import 'package:get/get.dart';
import '../../../../data/repositories/video_repository.dart';
import '../controllers/category_videos_controller.dart';

class CategoryVideosBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CategoryVideosController>(
      () => CategoryVideosController(
        videoRepository: Get.isRegistered<VideoRepository>()
            ? Get.find<VideoRepository>()
            : null,
      ),
    );
  }
}
