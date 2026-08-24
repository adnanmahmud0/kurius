import 'package:get/get.dart';
import '../../../../data/repositories/auth_repository.dart';
import '../../../../data/repositories/user_repository.dart';
import '../../auth/controllers/auth_controller.dart';
import '../controllers/profile_controller.dart';

class ProfileBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<AuthController>()) {
      Get.put<AuthController>(AuthController(), permanent: true);
    }
    Get.lazyPut<ProfileController>(() => ProfileController(
          userRepository: Get.isRegistered<UserRepository>() ? Get.find<UserRepository>() : null,
          authRepository: Get.isRegistered<AuthRepository>() ? Get.find<AuthRepository>() : null,
        ));
  }
}
