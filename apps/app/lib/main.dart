import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'app/bindings/initial_binding.dart';
import 'app/routes/app_pages.dart';
import 'app/theme/app_theme.dart';
import 'core/storage/storage_service.dart';
import 'features/user/home/bindings/home_binding.dart';
import 'features/user/home/views/home_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Storage Service
  await Get.putAsync(() => StorageService().init());

  // Set preferred system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const KuriusApp());
}

class KuriusApp extends StatelessWidget {
  const KuriusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Kurius',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialBinding: InitialBinding(),
      initialRoute: AppPages.initial,
      getPages: AppPages.routes,
      unknownRoute: GetPage(
        name: '/not-found',
        page: () => const HomeView(),
        binding: HomeBinding(),
      ),
      defaultTransition: Transition.fadeIn,
    );
  }
}
