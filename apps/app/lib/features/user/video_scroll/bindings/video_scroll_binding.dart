import 'package:get/get.dart';
import '../controllers/video_scroll_controller.dart';

class VideoScrollBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<VideoScrollController>(() => VideoScrollController());
  }
}
