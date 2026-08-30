import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../../../data/repositories/legal_repository.dart';
import '../controllers/legal_policy_controller.dart';

class LegalPolicyBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<LegalRepository>()) {
      Get.lazyPut<LegalRepository>(
        () => LegalRepository(
          apiClient: Get.isRegistered<ApiClient>() ? Get.find<ApiClient>() : null,
        ),
      );
    }

    Get.lazyPut<LegalPolicyController>(
      () => LegalPolicyController(
        legalRepository: Get.find<LegalRepository>(),
      ),
    );
  }
}
