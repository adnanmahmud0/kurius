import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';

class SplashController extends GetxController {
  @override
  void onInit() {
    super.onInit();
    _navigateNext();
  }

  void _navigateNext() async {
    await Future.delayed(const Duration(milliseconds: 1500));
    Get.offNamed(AppRoutes.home);
  }
}
