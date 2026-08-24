import 'package:get/get.dart';
import '../../../../data/repositories/video_repository.dart';
import '../controllers/video_scroll_controller.dart';

class VideoScrollBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<VideoScrollController>(() => VideoScrollController(
          videoRepository: Get.isRegistered<VideoRepository>() ? Get.find<VideoRepository>() : null,
        ));
  }
}
