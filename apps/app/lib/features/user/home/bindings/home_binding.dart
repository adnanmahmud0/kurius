import 'package:get/get.dart';
import '../controllers/home_controller.dart';
import '../../auth/controllers/auth_controller.dart';

class HomeBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<AuthController>()) {
      Get.put<AuthController>(AuthController(), permanent: true);
    }
    Get.lazyPut<HomeController>(() => HomeController());
  }
}
