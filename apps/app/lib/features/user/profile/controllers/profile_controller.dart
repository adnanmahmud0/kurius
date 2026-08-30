import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/constants/app_colors.dart';
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
  final RxBool isEditingProfile = false.obs;
  final RxBool isVerifyingPassword = false.obs;
  final RxBool isDeletingAccount = false.obs;
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

  // Edit Profile Form Controllers & Status Response Observables
  final TextEditingController nameController = TextEditingController();
  final TextEditingController contactController = TextEditingController();
  final TextEditingController locationController = TextEditingController();
  final RxString editProfileSuccessMessage = ''.obs;
  final RxString editProfileErrorMessage = ''.obs;

  // Change Password Form Controllers & Observables
  final TextEditingController oldPasswordController = TextEditingController();
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();
  final RxBool obscureOldPassword = true.obs;
  final RxBool obscureNewPassword = true.obs;
  final RxBool obscureConfirmPassword = true.obs;
  final RxString changePasswordSuccessMessage = ''.obs;
  final RxString changePasswordErrorMessage = ''.obs;

  // Delete Account Form Controllers & Observables
  final TextEditingController deleteAccountPasswordController = TextEditingController();
  final RxBool obscureDeletePassword = true.obs;
  final RxString deleteAccountErrorMessage = ''.obs;

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
  // Edit Profile Mode Controls
  // ---------------------------------------------------------------------------

  void startEditProfile() {
    isEditingProfile.value = true;
    dismissEditProfileMessage();
  }

  void cancelEditProfile() {
    isEditingProfile.value = false;
    final user = userProfile.value;
    if (user != null) {
      nameController.text = user.name;
      contactController.text = user.contact ?? '';
      locationController.text = user.location ?? '';
    }
    dismissEditProfileMessage();
  }

  void toggleEditProfile() {
    if (isEditingProfile.value) {
      cancelEditProfile();
    } else {
      startEditProfile();
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
        final res = await repo.updateProfileImage(
          imageFilePath: pickedFile.path,
        );

        if (res.data != null) {
          userProfile.value = res.data;
          avatarUrl.value = res.data!.displayAvatar;
          final msg = (res.message != null && res.message!.isNotEmpty)
              ? res.message!
              : 'Profile image updated successfully';
          editProfileSuccessMessage.value = msg;
          ErrorHandler.showSuccessSnackbar(
            msg,
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
  // Save Profile Edits (with Toggleable Response Message)
  // ---------------------------------------------------------------------------

  void dismissEditProfileMessage() {
    editProfileSuccessMessage.value = '';
    editProfileErrorMessage.value = '';
  }

  Future<void> saveProfileEdits() async {
    dismissEditProfileMessage();

    final name = nameController.text.trim();
    final contact = contactController.text.trim();
    final location = locationController.text.trim();

    if (name.isEmpty) {
      const err = 'Name cannot be empty.';
      editProfileErrorMessage.value = err;
      ErrorHandler.showErrorSnackbar(
        err,
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

          final msg = (res.message != null && res.message!.isNotEmpty)
              ? res.message!
              : 'Profile updated successfully';

          editProfileSuccessMessage.value = msg;
          isEditingProfile.value = false;

          ErrorHandler.showSuccessSnackbar(
            msg,
            title: 'Profile Saved',
          );
        }
      }
    } catch (e) {
      final err = ErrorHandler.getErrorMessage(e);
      editProfileErrorMessage.value = err;
      ErrorHandler.showErrorSnackbar(
        e,
        onRetry: () => saveProfileEdits(),
      );
    } finally {
      isUpdating.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Change Password (with Toggleable Response Message)
  // ---------------------------------------------------------------------------

  void toggleOldPasswordVisibility() => obscureOldPassword.value = !obscureOldPassword.value;
  void toggleNewPasswordVisibility() => obscureNewPassword.value = !obscureNewPassword.value;
  void toggleConfirmPasswordVisibility() => obscureConfirmPassword.value = !obscureConfirmPassword.value;

  void dismissPasswordMessage() {
    changePasswordSuccessMessage.value = '';
    changePasswordErrorMessage.value = '';
  }

  Future<void> changePassword() async {
    dismissPasswordMessage();

    final oldPass = oldPasswordController.text;
    final newPass = newPasswordController.text;
    final confirmPass = confirmPasswordController.text;

    if (oldPass.isEmpty || newPass.isEmpty || confirmPass.isEmpty) {
      const err = 'Please fill in all password fields.';
      changePasswordErrorMessage.value = err;
      ErrorHandler.showErrorSnackbar(
        err,
        customTitle: 'Validation Error',
      );
      return;
    }

    if (newPass != confirmPass) {
      const err = 'New password and confirmation do not match.';
      changePasswordErrorMessage.value = err;
      ErrorHandler.showErrorSnackbar(
        err,
        customTitle: 'Validation Error',
      );
      return;
    }

    if (newPass.length < 6) {
      const err = 'New password must be at least 6 characters.';
      changePasswordErrorMessage.value = err;
      ErrorHandler.showErrorSnackbar(
        err,
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
        final res = await repo.changePassword(ChangePasswordRequest(
          currentPassword: oldPass,
          newPassword: newPass,
          confirmPassword: confirmPass,
        ));

        oldPasswordController.clear();
        newPasswordController.clear();
        confirmPasswordController.clear();

        final msg = (res.message != null && res.message!.isNotEmpty)
            ? res.message!
            : 'Your password has been successfully changed';

        changePasswordSuccessMessage.value = msg;
        ErrorHandler.showSuccessSnackbar(
          msg,
          title: 'Password Updated',
        );

        await Future.delayed(const Duration(milliseconds: 1200));
        if (Get.key.currentState?.canPop() == true) {
          Get.back();
        }
      }
    } catch (e) {
      final err = ErrorHandler.getErrorMessage(e);
      changePasswordErrorMessage.value = err;
      ErrorHandler.showErrorSnackbar(
        e,
        onRetry: () => changePassword(),
      );
    } finally {
      isUpdating.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Delete Account Flow (Check Password -> Confirm Pop-up -> DELETE /user/profile)
  // ---------------------------------------------------------------------------

  void toggleDeletePasswordVisibility() {
    obscureDeletePassword.value = !obscureDeletePassword.value;
  }

  /// Step 1: Prompt for password verification and authenticate ownership
  void promptDeleteAccount(BuildContext context) {
    deleteAccountPasswordController.clear();
    deleteAccountErrorMessage.value = '';
    isVerifyingPassword.value = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.error.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.lock_person_rounded, color: AppColors.error, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Confirm Password',
                        style: GoogleFonts.outfit(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'Please enter your account password to verify ownership before proceeding with account deletion.',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),

                // Password Input Field
                Obx(() => TextField(
                      controller: deleteAccountPasswordController,
                      obscureText: obscureDeletePassword.value,
                      style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        hintText: 'Enter your password',
                        hintStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textMuted),
                        prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.textSecondary, size: 20),
                        suffixIcon: IconButton(
                          icon: Icon(
                            obscureDeletePassword.value ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                            color: AppColors.textMuted,
                            size: 20,
                          ),
                          onPressed: toggleDeletePasswordVisibility,
                        ),
                        filled: true,
                        fillColor: AppColors.cardBackground,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.cardBorder),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.cardBorder),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      ),
                    )),

                // Error Message if any
                Obx(() {
                  if (deleteAccountErrorMessage.value.isEmpty) return const SizedBox.shrink();
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      deleteAccountErrorMessage.value,
                      style: GoogleFonts.outfit(fontSize: 12, color: AppColors.error),
                    ),
                  );
                }),

                const SizedBox(height: 20),

                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(dialogContext),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.cardBorder),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: Text(
                          'Cancel',
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Obx(
                        () => ElevatedButton(
                          onPressed: isVerifyingPassword.value
                              ? null
                              : () async {
                                  final password = deleteAccountPasswordController.text.trim();
                                  if (password.isEmpty) {
                                    deleteAccountErrorMessage.value = 'Password is required to proceed.';
                                    return;
                                  }
                                  if (password.length < 6) {
                                    deleteAccountErrorMessage.value = 'Password must be at least 6 characters.';
                                    return;
                                  }

                                  isVerifyingPassword.value = true;
                                  deleteAccountErrorMessage.value = '';

                                  final email = userEmail.value.isNotEmpty
                                      ? userEmail.value
                                      : authController.userEmail.value;

                                  final repo = authRepository ??
                                      (Get.isRegistered<AuthRepository>()
                                          ? Get.find<AuthRepository>()
                                          : null);

                                  if (repo != null && email.isNotEmpty) {
                                    try {
                                      final checkRes = await repo.login(LoginRequest(
                                        email: email,
                                        password: password,
                                      ));

                                      if (!checkRes.success || checkRes.data == null) {
                                        deleteAccountErrorMessage.value =
                                            'Incorrect password. Please enter your valid account password.';
                                        isVerifyingPassword.value = false;
                                        return;
                                      }
                                    } catch (e) {
                                      debugPrint('⚠️ [ProfileController.promptDeleteAccount] Password check error: $e');
                                      deleteAccountErrorMessage.value =
                                          'Incorrect password. Please try again.';
                                      isVerifyingPassword.value = false;
                                      return;
                                    }
                                  }

                                  isVerifyingPassword.value = false;

                                  // Close password dialog and open final confirmation pop-up
                                  if (dialogContext.mounted) {
                                    Navigator.pop(dialogContext);
                                  }
                                  if (context.mounted) {
                                    _showFinalDeleteConfirmationDialog(context);
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.error,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: isVerifyingPassword.value
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : Text(
                                  'Continue',
                                  style: GoogleFonts.outfit(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  /// Step 2: Final Confirmation Pop-up with exact warning message
  void _showFinalDeleteConfirmationDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (confirmContext) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.warning_amber_rounded,
                    color: AppColors.error,
                    size: 40,
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  'Are you want to delete your profile?',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.error.withValues(alpha: 0.2)),
                  ),
                  child: Text(
                    'Note: If you delete your profile, all of your data will be permanently removed and cannot be restored.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.error,
                      height: 1.4,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(confirmContext),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.cardBorder),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: Text(
                          'Cancel',
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Obx(
                        () => ElevatedButton(
                          onPressed: isDeletingAccount.value
                              ? null
                              : () async {
                                  Navigator.pop(confirmContext);
                                  await _executeDeleteAccount();
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.error,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: isDeletingAccount.value
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : Text(
                                  'Delete Now',
                                  style: GoogleFonts.outfit(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  /// Step 3: Execute DELETE /user/profile
  Future<void> _executeDeleteAccount() async {
    isDeletingAccount.value = true;

    try {
      final repo = userRepository ??
          (Get.isRegistered<UserRepository>()
              ? Get.find<UserRepository>()
              : null);

      if (repo != null) {
        await repo.deleteAccount();

        // Clear local credentials and reset state
        await authController.logout();

        ErrorHandler.showSuccessSnackbar(
          'Your account has been deleted successfully.',
          title: 'Account Deleted',
        );

        Get.offAllNamed(AppRoutes.auth);
      }
    } catch (e) {
      debugPrint('⚠️ [ProfileController._executeDeleteAccount] Delete failed: $e');
      ErrorHandler.showErrorSnackbar(
        e,
        customTitle: 'Delete Account Failed',
      );
    } finally {
      isDeletingAccount.value = false;
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
    deleteAccountPasswordController.dispose();
    super.onClose();
  }
}
