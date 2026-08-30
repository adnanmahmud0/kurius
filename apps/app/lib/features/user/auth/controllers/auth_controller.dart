import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/network/error_handler.dart';
import '../../../../core/storage/storage_service.dart';
import '../../../../data/models/auth/auth_requests.dart';
import '../../../../data/repositories/auth_repository.dart';

class AuthController extends GetxController {
  final AuthRepository? authRepository;
  final StorageService? storage;

  AuthController({
    this.authRepository,
    this.storage,
  });

  // Global Auth State
  final RxBool isLoggedIn = false.obs;
  final RxBool isLoading = false.obs;

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

  // Form Controller for Forgot Password
  final TextEditingController forgotEmailController = TextEditingController();

  // Form Controllers for Reset Password
  final TextEditingController resetNewPasswordController = TextEditingController();
  final TextEditingController resetConfirmPasswordController = TextEditingController();
  final RxBool resetObscureNew = true.obs;
  final RxBool resetObscureConfirm = true.obs;

  // OTP Verification State
  final List<TextEditingController> otpControllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> otpFocusNodes = List.generate(6, (_) => FocusNode());
  final RxString otpEmail = ''.obs;
  final RxBool otpIsResetFlow = false.obs;
  final RxString resetToken = ''.obs;

  // OTP Resend Countdown
  final RxInt resendCountdown = 60.obs;
  final RxBool canResend = false.obs;
  Timer? _countdownTimer;

  // User Profile Data (No hardcoded demo values)
  final RxString userName = ''.obs;
  final RxString userEmail = ''.obs;
  final RxString userHandle = ''.obs;
  final RxString avatarUrl = ''.obs;

  @override
  void onInit() {
    super.onInit();
    _checkStoredAuth();
  }

  void _checkStoredAuth() {
    final storageService = storage ?? (Get.isRegistered<StorageService>() ? Get.find<StorageService>() : null);
    if (storageService != null && storageService.isLoggedIn()) {
      isLoggedIn.value = true;
      final cachedUser = storageService.getUserData();
      if (cachedUser != null) {
        userName.value = cachedUser['name'] as String? ?? '';
        userEmail.value = cachedUser['email'] as String? ?? '';
        userHandle.value = userEmail.value.isNotEmpty ? '@${userEmail.value.split('@').first}' : '';

        final rawAvatar = (cachedUser['avatar'] as String?) ?? (cachedUser['image'] as String?);
        if (rawAvatar != null && rawAvatar.trim().isNotEmpty) {
          final trimmed = rawAvatar.trim();
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            avatarUrl.value = trimmed;
          } else {
            final clean = trimmed.startsWith('/') ? trimmed : '/$trimmed';
            avatarUrl.value = 'https://api.kuriusapp.cloud$clean';
          }
        }
      }
    }
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

  void toggleResetNewPasswordVisibility() {
    resetObscureNew.value = !resetObscureNew.value;
  }

  void toggleResetConfirmPasswordVisibility() {
    resetObscureConfirm.value = !resetObscureConfirm.value;
  }

  // ---------------------------------------------------------------------------
  // 1. Sign In Flow (With Unverified 403 Redirection)
  // ---------------------------------------------------------------------------

  Future<void> signIn() async {
    final email = loginEmailController.text.trim();
    final password = loginPasswordController.text;

    if (email.isEmpty || password.isEmpty) {
      ErrorHandler.showErrorSnackbar(
        'Please enter both your email address and password.',
        customTitle: 'Validation Error',
      );
      return;
    }

    isLoading.value = true;

    try {
      final repo = authRepository ?? (Get.isRegistered<AuthRepository>() ? Get.find<AuthRepository>() : null);
      if (repo != null) {
        await repo.login(LoginRequest(email: email, password: password));
      }

      isLoggedIn.value = true;
      userEmail.value = email;
      userName.value = email.split('@').first;
      userHandle.value = '@${email.split('@').first}';

      ErrorHandler.showSuccessSnackbar(
        'Signed in successfully.',
        title: 'Welcome Back!',
      );
      Get.offAllNamed(AppRoutes.home);
    } on ForbiddenException catch (e) {
      // User is not verified yet: Redirect to OTP Verification page
      debugPrint('⚠️ [AuthController.signIn] User is unverified. Redirecting to OTP Verification...');
      prepareOtpFlow(email: email, isReset: false);
      ErrorHandler.showErrorSnackbar(
        e.message.isNotEmpty ? e.message : 'Please verify your email address to continue.',
        customTitle: 'Verification Required',
      );
      Get.toNamed(AppRoutes.verifyOtp, arguments: {'email': email, 'isReset': false});
    } catch (e) {
      // Check if error message mentions unverified email
      final errStr = e.toString().toLowerCase();
      if (errStr.contains('verify') || errStr.contains('verification') || errStr.contains('otp')) {
        prepareOtpFlow(email: email, isReset: false);
        Get.toNamed(AppRoutes.verifyOtp, arguments: {'email': email, 'isReset': false});
      } else {
        ErrorHandler.showErrorSnackbar(
          e,
          onRetry: () => signIn(),
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Sign Up Flow (Leads directly to OTP Verification)
  // ---------------------------------------------------------------------------

  Future<void> signUp() async {
    final name = registerNameController.text.trim();
    final email = registerEmailController.text.trim();
    final password = registerPasswordController.text;
    final confirm = registerConfirmPasswordController.text;

    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      ErrorHandler.showErrorSnackbar(
        'Please fill in all required registration fields.',
        customTitle: 'Validation Error',
      );
      return;
    }

    if (password != confirm) {
      ErrorHandler.showErrorSnackbar(
        'Passwords do not match. Please re-enter your password.',
        customTitle: 'Validation Error',
      );
      return;
    }

    isLoading.value = true;

    try {
      final repo = authRepository ?? (Get.isRegistered<AuthRepository>() ? Get.find<AuthRepository>() : null);
      if (repo != null) {
        await repo.register(RegisterRequest(name: name, email: email, password: password));
      }

      userName.value = name;
      userEmail.value = email;
      userHandle.value = '@${email.split('@').first}';

      ErrorHandler.showSuccessSnackbar(
        'Account registered! Please enter the 6-digit code sent to your email.',
        title: 'Check Your Email',
      );

      // Navigate to OTP page
      prepareOtpFlow(email: email, isReset: false);
      Get.toNamed(AppRoutes.verifyOtp, arguments: {'email': email, 'isReset': false});
    } catch (e) {
      ErrorHandler.showErrorSnackbar(
        e,
        onRetry: () => signUp(),
      );
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. OTP Verification & Resend
  // ---------------------------------------------------------------------------

  void prepareOtpFlow({required String email, bool isReset = false}) {
    otpEmail.value = email;
    otpIsResetFlow.value = isReset;
    for (var c in otpControllers) {
      c.clear();
    }
    startResendTimer();
  }

  void startResendTimer() {
    _countdownTimer?.cancel();
    resendCountdown.value = 60;
    canResend.value = false;

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (resendCountdown.value > 1) {
        resendCountdown.value--;
      } else {
        canResend.value = true;
        timer.cancel();
      }
    });
  }

  String getCombinedOtp() {
    return otpControllers.map((c) => c.text.trim()).join();
  }

  Future<void> verifyOtp() async {
    final codeStr = getCombinedOtp();

    if (codeStr.length < 6) {
      ErrorHandler.showErrorSnackbar(
        'Please enter the full 6-digit verification code.',
        customTitle: 'Incomplete Code',
      );
      return;
    }

    final int? otpNumber = int.tryParse(codeStr);
    if (otpNumber == null) {
      ErrorHandler.showErrorSnackbar(
        'Invalid code format. Digits only.',
        customTitle: 'Invalid Code',
      );
      return;
    }

    isLoading.value = true;

    try {
      final repo = authRepository ?? (Get.isRegistered<AuthRepository>() ? Get.find<AuthRepository>() : null);
      if (repo == null) {
        throw Exception('Auth repository not ready');
      }

      final response = await repo.verifyEmail(
        VerifyEmailRequest(email: otpEmail.value, oneTimeCode: otpNumber),
      );

      if (otpIsResetFlow.value) {
        // In reset password flow, verifyEmail returns a reset token string
        final token = response.data?.accessToken ?? '';
        resetToken.value = token;
        ErrorHandler.showSuccessSnackbar(
          'Code verified! Please create your new password.',
          title: 'Verification Successful',
        );
        Get.offNamed(AppRoutes.resetPassword, arguments: {
          'email': otpEmail.value,
          'resetToken': token,
        });
      } else {
        // In signup/login verification, user is now logged in
        isLoggedIn.value = true;
        userEmail.value = otpEmail.value;
        userName.value = otpEmail.value.split('@').first;
        userHandle.value = '@${otpEmail.value.split('@').first}';

        ErrorHandler.showSuccessSnackbar(
          'Your email has been verified! Welcome to Kurius.',
          title: 'Verified Successfully',
        );
        Get.offAllNamed(AppRoutes.home);
      }
    } catch (e) {
      ErrorHandler.showErrorSnackbar(
        e,
        onRetry: () => verifyOtp(),
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> resendOtpCode() async {
    if (!canResend.value) return;

    isLoading.value = true;
    try {
      final repo = authRepository ?? (Get.isRegistered<AuthRepository>() ? Get.find<AuthRepository>() : null);
      if (repo != null) {
        if (otpIsResetFlow.value) {
          await repo.forgetPassword(ForgetPasswordRequest(email: otpEmail.value));
        } else {
          await repo.resendOtp();
        }
      }

      startResendTimer();
      ErrorHandler.showSuccessSnackbar(
        'A fresh verification code was sent to ${otpEmail.value}',
        title: 'Code Resent',
      );
    } catch (e) {
      ErrorHandler.showErrorSnackbar(e);
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Forgot Password Flow
  // ---------------------------------------------------------------------------

  Future<void> sendForgotPasswordOtp() async {
    final email = forgotEmailController.text.trim();

    if (email.isEmpty) {
      ErrorHandler.showErrorSnackbar(
        'Please enter your registered email address.',
        customTitle: 'Validation Error',
      );
      return;
    }

    isLoading.value = true;

    try {
      final repo = authRepository ?? (Get.isRegistered<AuthRepository>() ? Get.find<AuthRepository>() : null);
      if (repo != null) {
        await repo.forgetPassword(ForgetPasswordRequest(email: email));
      }

      ErrorHandler.showSuccessSnackbar(
        'Passcode sent! Check your inbox for the OTP.',
        title: 'Email Sent',
      );

      prepareOtpFlow(email: email, isReset: true);
      Get.toNamed(AppRoutes.verifyOtp, arguments: {'email': email, 'isReset': true});
    } catch (e) {
      ErrorHandler.showErrorSnackbar(
        e,
        onRetry: () => sendForgotPasswordOtp(),
      );
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Reset Password Flow
  // ---------------------------------------------------------------------------

  Future<void> submitResetPassword() async {
    final newPass = resetNewPasswordController.text;
    final confirmPass = resetConfirmPasswordController.text;

    if (newPass.isEmpty || confirmPass.isEmpty) {
      ErrorHandler.showErrorSnackbar(
        'Please fill in both new password and confirmation.',
        customTitle: 'Validation Error',
      );
      return;
    }

    if (newPass != confirmPass) {
      ErrorHandler.showErrorSnackbar(
        'Passwords do not match.',
        customTitle: 'Validation Error',
      );
      return;
    }

    if (newPass.length < 6) {
      ErrorHandler.showErrorSnackbar(
        'Password must be at least 6 characters.',
        customTitle: 'Weak Password',
      );
      return;
    }

    isLoading.value = true;

    try {
      final repo = authRepository ?? (Get.isRegistered<AuthRepository>() ? Get.find<AuthRepository>() : null);
      if (repo == null) {
        throw Exception('Auth repository not ready');
      }

      await repo.resetPassword(
        ResetPasswordRequest(
          email: otpEmail.value,
          newPassword: newPass,
          confirmPassword: confirmPass,
        ),
        resetToken: resetToken.value,
      );

      ErrorHandler.showSuccessSnackbar(
        'Password successfully updated! Please sign in with your new password.',
        title: 'Password Changed',
      );

      // Reset form and return to Sign In
      resetNewPasswordController.clear();
      resetConfirmPasswordController.clear();
      loginEmailController.text = otpEmail.value;
      loginPasswordController.text = newPass;
      setTab(0);
      Get.offAllNamed(AppRoutes.auth);
    } catch (e) {
      ErrorHandler.showErrorSnackbar(
        e,
        onRetry: () => submitResetPassword(),
      );
    } finally {
      isLoading.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  Future<void> logout() async {
    isLoading.value = true;
    try {
      final repo = authRepository ?? (Get.isRegistered<AuthRepository>() ? Get.find<AuthRepository>() : null);
      if (repo != null) {
        await repo.logout();
      }
    } catch (_) {
      // Local session cleared
    } finally {
      isLoggedIn.value = false;
      userName.value = '';
      userEmail.value = '';
      userHandle.value = '';
      isLoading.value = false;
      ErrorHandler.showSuccessSnackbar(
        'You have been logged out successfully.',
        title: 'Logged Out',
      );
      Get.offAllNamed(AppRoutes.home);
    }
  }

  @override
  void onClose() {
    _countdownTimer?.cancel();
    loginEmailController.dispose();
    loginPasswordController.dispose();
    registerNameController.dispose();
    registerEmailController.dispose();
    registerPasswordController.dispose();
    registerConfirmPasswordController.dispose();
    forgotEmailController.dispose();
    resetNewPasswordController.dispose();
    resetConfirmPasswordController.dispose();
    for (var c in otpControllers) {
      c.dispose();
    }
    for (var f in otpFocusNodes) {
      f.dispose();
    }
    super.onClose();
  }
}
