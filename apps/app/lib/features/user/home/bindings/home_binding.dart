import 'package:get/get.dart';
import '../../../../data/repositories/category_repository.dart';
import '../../../../data/repositories/motivational_repository.dart';
import '../../../../data/repositories/video_repository.dart';
import '../../auth/controllers/auth_controller.dart';
import '../controllers/home_controller.dart';

class HomeBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<AuthController>()) {
      Get.put<AuthController>(AuthController(), permanent: true);
    }
    Get.lazyPut<HomeController>(() => HomeController(
          videoRepository: Get.isRegistered<VideoRepository>() ? Get.find<VideoRepository>() : null,
          categoryRepository: Get.isRegistered<CategoryRepository>() ? Get.find<CategoryRepository>() : null,
          motivationalRepository: Get.isRegistered<MotivationalRepository>() ? Get.find<MotivationalRepository>() : null,
        ));
  }
}
