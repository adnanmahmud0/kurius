import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/storage/storage_service.dart';

class SplashController extends GetxController {
  @override
  void onInit() {
    super.onInit();
    _navigateNext();
  }

  void _navigateNext() async {
    await Future.delayed(const Duration(milliseconds: 2200));

    final storage = Get.isRegistered<StorageService>() ? Get.find<StorageService>() : StorageService.to;
    if (storage.isLoggedIn()) {
      Get.offNamed(AppRoutes.home);
    } else {
      // First-time or logged-out users land on Auth screen with Skip option
      Get.offNamed(AppRoutes.auth);
    }
  }
}
