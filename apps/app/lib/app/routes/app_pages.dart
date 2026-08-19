import 'package:get/get.dart';
import '../../features/user/auth/bindings/auth_binding.dart';
import '../../features/user/auth/bindings/splash_binding.dart';
import '../../features/user/auth/views/auth_view.dart';
import '../../features/user/auth/views/splash_view.dart';
import '../../features/user/discover/bindings/discover_binding.dart';
import '../../features/user/discover/views/discover_view.dart';
import '../../features/user/home/bindings/home_binding.dart';
import '../../features/user/home/views/home_view.dart';
import '../../features/user/profile/bindings/profile_binding.dart';
import '../../features/user/profile/views/profile_view.dart';
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
      name: AppRoutes.auth,
      page: () => const AuthView(),
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
