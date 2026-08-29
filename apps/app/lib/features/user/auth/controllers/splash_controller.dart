import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';

class SplashController extends GetxController {
  @override
  void onInit() {
    super.onInit();
    _navigateToHome();
  }

  void _navigateToHome() async {
    await Future.delayed(const Duration(milliseconds: 2400));
    Get.offNamed(AppRoutes.home);
  }
}
