import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/network/error_handler.dart';
import '../../../../data/models/auth/auth_requests.dart';
import '../../../../data/models/user/user_model.dart';
import '../../../../data/repositories/auth_repository.dart';
import '../../../../data/repositories/user_repository.dart';
import '../../auth/controllers/auth_controller.dart';

class ProfileController extends GetxController {
  final UserRepository? userRepository;
  final AuthRepository? authRepository;
  final AuthController authController = Get.find<AuthController>();

  ProfileController({
    this.userRepository,
    this.authRepository,
  });

  final ImagePicker _imagePicker = ImagePicker();

  // State
  final RxBool isLoading = false.obs;
  final RxBool isUpdating = false.obs;
  final RxString errorMessage = ''.obs;

  // Real User Data
  final Rx<UserModel?> userProfile = Rx<UserModel?>(null);
  final RxString userName = ''.obs;
  final RxString userEmail = ''.obs;
  final RxString avatarUrl = ''.obs;
  final RxBool isVerified = false.obs;

  // Stats (default to 0)
  final RxInt topicsCount = 0.obs;
  final RxInt videosCount = 0.obs;
  final RxInt pointsCount = 0.obs;

  // Edit Profile Form Controllers
  final TextEditingController nameController = TextEditingController();
  final TextEditingController contactController = TextEditingController();
  final TextEditingController locationController = TextEditingController();

  // Change Password Form Controllers
  final TextEditingController oldPasswordController = TextEditingController();
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();
  final RxBool obscureOldPassword = true.obs;
  final RxBool obscureNewPassword = true.obs;
  final RxBool obscureConfirmPassword = true.obs;

  // Saved Videos & Learning History Lists
  final RxList<String> savedVideoIds = <String>[].obs;
  final RxList<String> learningHistoryIds = <String>[].obs;

  // Preferences & Notifications State
  final RxBool pushNotificationsEnabled = true.obs;
  final RxBool dailyCuriosityFactsEnabled = true.obs;
  final RxBool emailDigestEnabled = false.obs;
  final RxBool autoPlayVideosEnabled = true.obs;

  @override
  void onInit() {
    super.onInit();
    loadProfile();
  }

  Future<void> loadProfile() async {
    if (!authController.isLoggedIn.value) return;

    isLoading.value = true;
    errorMessage.value = '';

    try {
      final repo = userRepository ??
          (Get.isRegistered<UserRepository>()
              ? Get.find<UserRepository>()
              : null);

      if (repo != null) {
        final res = await repo.getProfile();
        if (res.data != null) {
          final user = res.data!;
          userProfile.value = user;

          // Populate with real name
          userName.value = user.displayName;
          userEmail.value = user.email;
          isVerified.value = user.verified;
          avatarUrl.value = user.displayAvatar;

          // Sync AuthController
          authController.userName.value = user.displayName;
          authController.userEmail.value = user.email;

          // Populate edit controllers
          nameController.text = user.name;
          contactController.text = user.contact ?? '';
          locationController.text = user.location ?? '';
        }
      }
    } catch (e) {
      debugPrint('⚠️ [ProfileController.loadProfile] Error: $e');
      errorMessage.value = ErrorHandler.getErrorMessage(e);
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Avatar Image Upload
  // ---------------------------------------------------------------------------

  Future<void> pickAndUploadAvatar(ImageSource source) async {
    try {
      final pickedFile = await _imagePicker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 800,
      );

      if (pickedFile == null) return;

      isUpdating.value = true;

      final repo = userRepository ??
          (Get.isRegistered<UserRepository>()
              ? Get.find<UserRepository>()
              : null);

      if (repo != null) {
        final res = await repo.updateProfile(
          avatarFilePath: pickedFile.path,
        );

        if (res.data != null) {
          userProfile.value = res.data;
          avatarUrl.value = res.data!.displayAvatar;
          ErrorHandler.showSuccessSnackbar(
            'Profile picture updated successfully!',
            title: 'Avatar Updated',
          );
        }
      }
    } catch (e) {
      ErrorHandler.showErrorSnackbar(
        e,
        customTitle: 'Avatar Upload Failed',
      );
    } finally {
      isUpdating.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Save Profile Edits
  // ---------------------------------------------------------------------------

  Future<void> saveProfileEdits() async {
    final name = nameController.text.trim();
    final contact = contactController.text.trim();
    final location = locationController.text.trim();

    if (name.isEmpty) {
      ErrorHandler.showErrorSnackbar(
        'Name cannot be empty.',
        customTitle: 'Validation Error',
      );
      return;
    }

    isUpdating.value = true;

    try {
      final repo = userRepository ??
          (Get.isRegistered<UserRepository>()
              ? Get.find<UserRepository>()
              : null);

      if (repo != null) {
        final res = await repo.updateProfile(
          name: name,
          contact: contact.isNotEmpty ? contact : null,
          location: location.isNotEmpty ? location : null,
        );

        if (res.data != null) {
          userProfile.value = res.data;
          userName.value = res.data!.displayName;
          authController.userName.value = res.data!.displayName;

          ErrorHandler.showSuccessSnackbar(
            'Profile details updated successfully.',
            title: 'Profile Saved',
          );
          Get.back();
        }
      }
    } catch (e) {
      ErrorHandler.showErrorSnackbar(
        e,
        onRetry: () => saveProfileEdits(),
      );
    } finally {
      isUpdating.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Change Password
  // ---------------------------------------------------------------------------

  void toggleOldPasswordVisibility() => obscureOldPassword.value = !obscureOldPassword.value;
  void toggleNewPasswordVisibility() => obscureNewPassword.value = !obscureNewPassword.value;
  void toggleConfirmPasswordVisibility() => obscureConfirmPassword.value = !obscureConfirmPassword.value;

  Future<void> changePassword() async {
    final oldPass = oldPasswordController.text;
    final newPass = newPasswordController.text;
    final confirmPass = confirmPasswordController.text;

    if (oldPass.isEmpty || newPass.isEmpty || confirmPass.isEmpty) {
      ErrorHandler.showErrorSnackbar(
        'Please fill in all password fields.',
        customTitle: 'Validation Error',
      );
      return;
    }

    if (newPass != confirmPass) {
      ErrorHandler.showErrorSnackbar(
        'New password and confirmation do not match.',
        customTitle: 'Validation Error',
      );
      return;
    }

    if (newPass.length < 6) {
      ErrorHandler.showErrorSnackbar(
        'New password must be at least 6 characters.',
        customTitle: 'Validation Error',
      );
      return;
    }

    isUpdating.value = true;

    try {
      final repo = authRepository ??
          (Get.isRegistered<AuthRepository>()
              ? Get.find<AuthRepository>()
              : null);

      if (repo != null) {
        await repo.changePassword(ChangePasswordRequest(
          currentPassword: oldPass,
          newPassword: newPass,
          confirmPassword: confirmPass,
        ));

        oldPasswordController.clear();
        newPasswordController.clear();
        confirmPasswordController.clear();

        ErrorHandler.showSuccessSnackbar(
          'Your password has been changed successfully.',
          title: 'Password Updated',
        );
        Get.back();
      }
    } catch (e) {
      ErrorHandler.showErrorSnackbar(
        e,
        onRetry: () => changePassword(),
      );
    } finally {
      isUpdating.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Management: Saved Videos & Learning History
  // ---------------------------------------------------------------------------

  void clearSavedVideos() {
    savedVideoIds.clear();
    ErrorHandler.showSuccessSnackbar(
      'Saved videos have been cleared.',
      title: 'Saved Videos Removed',
    );
  }

  void clearLearningHistory() {
    learningHistoryIds.clear();
    ErrorHandler.showSuccessSnackbar(
      'Your learning history has been reset.',
      title: 'History Cleared',
    );
  }

  void logout() {
    authController.logout();
  }

  @override
  void onClose() {
    nameController.dispose();
    contactController.dispose();
    locationController.dispose();
    oldPasswordController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.onClose();
  }
}
