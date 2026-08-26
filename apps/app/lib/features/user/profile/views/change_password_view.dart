import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../controllers/profile_controller.dart';

class ChangePasswordView extends GetView<ProfileController> {
  const ChangePasswordView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Change Password',
          style: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Get.back(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Update your password to keep your account secure.',
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 20),

              // Dismissible / Toggleable Response Message Banner
              Obx(() {
                if (controller.changePasswordSuccessMessage.value.isNotEmpty) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFA5D6A7)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_rounded, color: Color(0xFF2E7D32), size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            controller.changePasswordSuccessMessage.value,
                            style: GoogleFonts.outfit(
                              color: const Color(0xFF1B5E20),
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: controller.dismissPasswordMessage,
                          child: const Icon(Icons.close_rounded, color: Color(0xFF2E7D32), size: 18),
                        ),
                      ],
                    ),
                  );
                }

                if (controller.changePasswordErrorMessage.value.isNotEmpty) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEBEE),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFFFCDD2)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded, color: Color(0xFFC62828), size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            controller.changePasswordErrorMessage.value,
                            style: GoogleFonts.outfit(
                              color: const Color(0xFFB71C1C),
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: controller.dismissPasswordMessage,
                          child: const Icon(Icons.close_rounded, color: Color(0xFFC62828), size: 18),
                        ),
                      ],
                    ),
                  );
                }

                return const SizedBox.shrink();
              }),

              // Current Password
              _buildFieldLabel('Current Password'),
              const SizedBox(height: 6),
              Obx(() => _buildPasswordField(
                    controller: controller.oldPasswordController,
                    hint: 'Enter your current password',
                    obscureText: controller.obscureOldPassword.value,
                    onToggle: controller.toggleOldPasswordVisibility,
                  )),

              const SizedBox(height: 18),

              // New Password
              _buildFieldLabel('New Password'),
              const SizedBox(height: 6),
              Obx(() => _buildPasswordField(
                    controller: controller.newPasswordController,
                    hint: 'Enter new password (min. 6 characters)',
                    obscureText: controller.obscureNewPassword.value,
                    onToggle: controller.toggleNewPasswordVisibility,
                  )),

              const SizedBox(height: 18),

              // Confirm New Password
              _buildFieldLabel('Confirm New Password'),
              const SizedBox(height: 6),
              Obx(() => _buildPasswordField(
                    controller: controller.confirmPasswordController,
                    hint: 'Confirm your new password',
                    obscureText: controller.obscureConfirmPassword.value,
                    onToggle: controller.toggleConfirmPasswordVisibility,
                  )),

              const SizedBox(height: 32),

              // Update Button
              Obx(() => SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: controller.isUpdating.value
                          ? null
                          : controller.changePassword,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 2,
                      ),
                      child: controller.isUpdating.value
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: Colors.white,
                              ),
                            )
                          : Text(
                              'Update Password',
                              style: GoogleFonts.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                    ),
                  )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Text(
      label,
      style: GoogleFonts.outfit(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required String hint,
    required bool obscureText,
    required VoidCallback onToggle,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscureText,
        style: GoogleFonts.outfit(fontSize: 15, color: AppColors.textPrimary),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: GoogleFonts.outfit(fontSize: 14, color: AppColors.textMuted),
          prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.textSecondary, size: 20),
          suffixIcon: IconButton(
            icon: Icon(
              obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              color: AppColors.textSecondary,
              size: 20,
            ),
            onPressed: onToggle,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }
}
