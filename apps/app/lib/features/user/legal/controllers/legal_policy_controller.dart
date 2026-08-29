import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../../../../core/network/error_handler.dart';
import '../../../../data/models/legal/legal_policy_model.dart';
import '../../../../data/repositories/legal_repository.dart';

class LegalPolicyController extends GetxController {
  final LegalRepository? legalRepository;
  final String? initialPolicyType;

  LegalPolicyController({
    this.legalRepository,
    this.initialPolicyType,
  });

  // Policy type: 'terms' or 'privacy'
  final RxString policyType = 'terms'.obs;

  // Policy State
  final Rx<LegalPolicyModel?> policy = Rx<LegalPolicyModel?>(null);
  final RxBool isLoading = false.obs;
  final RxString errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();

    // Extract argument if passed
    if (Get.arguments != null) {
      if (Get.arguments is Map && (Get.arguments as Map).containsKey('type')) {
        policyType.value = (Get.arguments as Map)['type'].toString();
      } else if (Get.arguments is String) {
        policyType.value = Get.arguments.toString();
      }
    } else if (initialPolicyType != null && initialPolicyType!.isNotEmpty) {
      policyType.value = initialPolicyType!;
    }

    loadPolicy();
  }

  Future<void> loadPolicy() async {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      final repo = legalRepository ??
          (Get.isRegistered<LegalRepository>()
              ? Get.find<LegalRepository>()
              : null);

      if (repo != null) {
        final res = await repo.getLegalPolicy(policyType.value);
        if (res.data != null) {
          policy.value = res.data;
        } else {
          errorMessage.value = 'Failed to load policy content.';
        }
      } else {
        errorMessage.value = 'Legal repository not available.';
      }
    } catch (e) {
      debugPrint('⚠️ [LegalPolicyController.loadPolicy] Error: $e');
      errorMessage.value = ErrorHandler.getErrorMessage(e);
    } finally {
      isLoading.value = false;
    }
  }

  String get screenTitle {
    if (policy.value != null && policy.value!.title.isNotEmpty) {
      return policy.value!.title;
    }
    return policyType.value == 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  }
}
