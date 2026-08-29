import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';

class AuthController extends GetxController {
  // Authentication State
  final RxBool isLoggedIn = false.obs;

  // Tab State: 0 = Sign In, 1 = Sign Up
  final RxInt selectedTab = 0.obs;

  // Form Controllers for Sign In
  final TextEditingController loginEmailController = TextEditingController();
  final TextEditingController loginPasswordController = TextEditingController();
  final RxBool loginObscurePassword = true.obs;

  // Form Controllers for Sign Up
  final TextEditingController registerNameController = TextEditingController();
  final TextEditingController registerEmailController = TextEditingController();
  final TextEditingController registerPasswordController = TextEditingController();
  final TextEditingController registerConfirmPasswordController = TextEditingController();
  final RxBool registerObscurePassword = true.obs;
  final RxBool registerObscureConfirm = true.obs;

  // User Profile Data
  final RxString userName = 'Alex Johnson'.obs;
  final RxString userEmail = 'alex.johnson@kurius.app'.obs;
  final RxString userHandle = '@alex_kurius'.obs;

  @override
  void onInit() {
    super.onInit();
    // Default mock credentials
    loginEmailController.text = 'alex.johnson@kurius.app';
    loginPasswordController.text = '••••••••';
    registerNameController.text = 'Alex Johnson';
    registerEmailController.text = 'alex.johnson@kurius.app';
    registerPasswordController.text = '••••••••';
    registerConfirmPasswordController.text = '••••••••';
  }

  void setTab(int index) {
    selectedTab.value = index;
  }

  void toggleLoginPasswordVisibility() {
    loginObscurePassword.value = !loginObscurePassword.value;
  }

  void toggleRegisterPasswordVisibility() {
    registerObscurePassword.value = !registerObscurePassword.value;
  }

  void toggleRegisterConfirmVisibility() {
    registerObscureConfirm.value = !registerObscureConfirm.value;
  }

  void signIn() {
    isLoggedIn.value = true;
    if (loginEmailController.text.isNotEmpty) {
      userEmail.value = loginEmailController.text;
      userName.value = loginEmailController.text.split('@').first;
    }
    Get.snackbar(
      'Welcome back!',
      'Signed in successfully.',
      snackPosition: SnackPosition.BOTTOM,
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 2),
    );
    Get.offAllNamed(AppRoutes.home);
  }

  void signUp() {
    isLoggedIn.value = true;
    if (registerNameController.text.isNotEmpty) {
      userName.value = registerNameController.text;
    }
    if (registerEmailController.text.isNotEmpty) {
      userEmail.value = registerEmailController.text;
    }
    Get.snackbar(
      'Account Created!',
      'Welcome to Kurius.',
      snackPosition: SnackPosition.BOTTOM,
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 2),
    );
    Get.offAllNamed(AppRoutes.home);
  }

  void logout() {
    isLoggedIn.value = false;
    Get.snackbar(
      'Logged Out',
      'You have been logged out.',
      snackPosition: SnackPosition.BOTTOM,
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 2),
    );
    Get.offAllNamed(AppRoutes.home);
  }

  @override
  void onClose() {
    loginEmailController.dispose();
    loginPasswordController.dispose();
    registerNameController.dispose();
    registerEmailController.dispose();
    registerPasswordController.dispose();
    registerConfirmPasswordController.dispose();
    super.onClose();
  }
}
