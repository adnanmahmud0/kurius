import 'package:get/get.dart';
import '../../auth/controllers/auth_controller.dart';

class ProfileController extends GetxController {
  final AuthController authController = Get.find<AuthController>();

  void logout() {
    authController.logout();
  }
}
