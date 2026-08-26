import 'package:get/get.dart';
import '../../features/user/auth/bindings/auth_binding.dart';
import '../../features/user/auth/bindings/splash_binding.dart';
import '../../features/user/auth/views/auth_view.dart';
import '../../features/user/auth/views/forgot_password_view.dart';
import '../../features/user/auth/views/reset_password_view.dart';
import '../../features/user/auth/views/splash_view.dart';
import '../../features/user/auth/views/verify_otp_view.dart';
import '../../features/user/discover/bindings/discover_binding.dart';
import '../../features/user/discover/views/discover_view.dart';
import '../../features/user/home/bindings/category_videos_binding.dart';
import '../../features/user/home/bindings/home_binding.dart';
import '../../features/user/home/views/category_videos_view.dart';
import '../../features/user/home/views/home_view.dart';
import '../../features/user/profile/bindings/profile_binding.dart';
import '../../features/user/profile/views/change_password_view.dart';
import '../../features/user/profile/views/edit_profile_view.dart';
import '../../features/user/profile/views/learning_history_view.dart';
import '../../features/user/profile/views/preferences_view.dart';
import '../../features/user/profile/views/profile_view.dart';
import '../../features/user/profile/views/saved_videos_view.dart';
import '../../features/user/video_scroll/bindings/video_scroll_binding.dart';
import '../../features/user/video_scroll/views/video_scroll_view.dart';
import 'app_routes.dart';

class AppPages {
  AppPages._();

  static const String initial = AppRoutes.splash;

  static final List<GetPage> routes = [
    GetPage(
      name: AppRoutes.splash,
      page: () => const SplashView(),
      binding: SplashBinding(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: AppRoutes.home,
      page: () => const HomeView(),
      binding: HomeBinding(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: AppRoutes.categoryVideos,
      page: () => const CategoryVideosView(),
      binding: CategoryVideosBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.auth,
      page: () => const AuthView(),
      binding: AuthBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.verifyOtp,
      page: () => const VerifyOtpView(),
      binding: AuthBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.forgotPassword,
      page: () => const ForgotPasswordView(),
      binding: AuthBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.resetPassword,
      page: () => const ResetPasswordView(),
      binding: AuthBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.profile,
      page: () => const ProfileView(),
      binding: ProfileBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.editProfile,
      page: () => const EditProfileView(),
      binding: ProfileBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.changePassword,
      page: () => const ChangePasswordView(),
      binding: ProfileBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.savedVideos,
      page: () => const SavedVideosView(),
      binding: ProfileBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.learningHistory,
      page: () => const LearningHistoryView(),
      binding: ProfileBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.preferences,
      page: () => const PreferencesView(),
      binding: ProfileBinding(),
      transition: Transition.rightToLeftWithFade,
    ),
    GetPage(
      name: AppRoutes.discover,
      page: () => const DiscoverView(),
      binding: DiscoverBinding(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: AppRoutes.videoScroll,
      page: () => const VideoScrollView(),
      binding: VideoScrollBinding(),
      transition: Transition.downToUp,
    ),
  ];
}
