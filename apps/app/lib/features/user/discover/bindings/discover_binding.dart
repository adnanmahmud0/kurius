import 'package:get/get.dart';
import '../../../../data/repositories/category_repository.dart';
import '../../../../data/repositories/video_repository.dart';
import '../controllers/discover_controller.dart';

class DiscoverBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DiscoverController>(() => DiscoverController(
          videoRepository: Get.isRegistered<VideoRepository>() ? Get.find<VideoRepository>() : null,
          categoryRepository: Get.isRegistered<CategoryRepository>() ? Get.find<CategoryRepository>() : null,
        ));
  }
}
