import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';
import '../controllers/auth_controller.dart';

class AuthView extends GetView<AuthController> {
  const AuthView({super.key});

  @override
  Widget build(BuildContext context) {
    // If an initial tab index was passed via arguments, set it
    if (Get.arguments != null && Get.arguments is int) {
      controller.setTab(Get.arguments as int);
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Get.back(),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.offAllNamed(AppRoutes.home),
            child: Text(
              'Skip',
              style: GoogleFonts.outfit(
                color: AppColors.textSecondary,
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logo and welcome title
              Center(
                child: Column(
                  children: [
                    Image.asset(
                      AppAssets.logo,
                      width: 85,
                      height: 85,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) => Container(
                        width: 70,
                        height: 70,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.school_rounded, color: Colors.white, size: 36),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Welcome to Kurius',
                      style: GoogleFonts.outfit(
                        fontSize: 26,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Unlock your daily curiosity & knowledge',
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // Segmented Tab Switcher: [ Sign In | Sign Up ]
              Obx(() {
                final isSignIn = controller.selectedTab.value == 0;
                return Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.cardBackground,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Row(
                    children: [
                      // Sign In Tab
                      Expanded(
                        child: GestureDetector(
                          onTap: () => controller.setTab(0),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 220),
                            curve: Curves.easeInOut,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: isSignIn ? AppColors.primary : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: isSignIn
                                  ? [
                                      BoxShadow(
                                        color: AppColors.primary.withValues(alpha: 0.3),
                                        blurRadius: 8,
                                        offset: const Offset(0, 3),
                                      )
                                    ]
                                  : [],
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Sign In',
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: isSignIn ? FontWeight.w700 : FontWeight.w600,
                                color: isSignIn ? Colors.white : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ),

                      // Sign Up Tab
                      Expanded(
                        child: GestureDetector(
                          onTap: () => controller.setTab(1),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 220),
                            curve: Curves.easeInOut,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: !isSignIn ? AppColors.primary : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: !isSignIn
                                  ? [
                                      BoxShadow(
                                        color: AppColors.primary.withValues(alpha: 0.3),
                                        blurRadius: 8,
                                        offset: const Offset(0, 3),
                                      )
                                    ]
                                  : [],
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Sign Up',
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: !isSignIn ? FontWeight.w700 : FontWeight.w600,
                                color: !isSignIn ? Colors.white : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),

              const SizedBox(height: 24),

              // Form Body depending on selected tab
              Obx(() {
                final isSignIn = controller.selectedTab.value == 0;
                return AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  child: isSignIn ? _buildSignInForm() : _buildSignUpForm(),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSignInForm() {
    return Column(
      key: const ValueKey('sign_in_form'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel('Email Address'),
        const SizedBox(height: 6),
        _buildTextField(
          controller: controller.loginEmailController,
          hint: 'Enter your email',
          prefixIcon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),
        _buildLabel('Password'),
        const SizedBox(height: 6),
        Obx(() => _buildTextField(
              controller: controller.loginPasswordController,
              hint: 'Enter your password',
              prefixIcon: Icons.lock_outline_rounded,
              obscureText: controller.loginObscurePassword.value,
              suffixIcon: IconButton(
                icon: Icon(
                  controller.loginObscurePassword.value
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  color: AppColors.textSecondary,
                  size: 20,
                ),
                onPressed: controller.toggleLoginPasswordVisibility,
              ),
            )),
        const SizedBox(height: 10),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () {},
            style: TextButton.styleFrom(padding: EdgeInsets.zero),
            child: Text(
              'Forgot Password?',
              style: GoogleFonts.outfit(
                color: AppColors.primary,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: controller.signIn,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 2,
            ),
            child: Text(
              'Sign In',
              style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSignUpForm() {
    return Column(
      key: const ValueKey('sign_up_form'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel('Full Name'),
        const SizedBox(height: 6),
        _buildTextField(
          controller: controller.registerNameController,
          hint: 'e.g. Alex Johnson',
          prefixIcon: Icons.person_outline_rounded,
        ),
        const SizedBox(height: 16),
        _buildLabel('Email Address'),
        const SizedBox(height: 6),
        _buildTextField(
          controller: controller.registerEmailController,
          hint: 'Enter your email',
          prefixIcon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),
        _buildLabel('Password'),
        const SizedBox(height: 6),
        Obx(() => _buildTextField(
              controller: controller.registerPasswordController,
              hint: 'Create a password',
              prefixIcon: Icons.lock_outline_rounded,
              obscureText: controller.registerObscurePassword.value,
              suffixIcon: IconButton(
                icon: Icon(
                  controller.registerObscurePassword.value
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  color: AppColors.textSecondary,
                  size: 20,
                ),
                onPressed: controller.toggleRegisterPasswordVisibility,
              ),
            )),
        const SizedBox(height: 22),
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: controller.signUp,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 2,
            ),
            child: Text(
              'Create Account',
              style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: GoogleFonts.outfit(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData prefixIcon,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType keyboardType = TextInputType.text,
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
        keyboardType: keyboardType,
        style: GoogleFonts.outfit(fontSize: 15, color: AppColors.textPrimary),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: GoogleFonts.outfit(fontSize: 14, color: AppColors.textMuted),
          prefixIcon: Icon(prefixIcon, color: AppColors.textSecondary, size: 20),
          suffixIcon: suffixIcon,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }
}
