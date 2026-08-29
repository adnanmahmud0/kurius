import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../controllers/home_controller.dart';
import '../widgets/home_header.dart';
import '../widgets/categories_section.dart';
import '../widgets/fact_of_the_day_card.dart';
import '../widgets/latest_videos_section.dart';
import '../widgets/home_bottom_nav.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              // Top Greeting & Auth/Profile Action
              HomeHeader(),

              SizedBox(height: 28),

              // Categories Section
              CategoriesSection(),

              SizedBox(height: 24),

              // Fact of the Day Card
              FactOfTheDayCard(),

              SizedBox(height: 28),

              // Latest Videos Carousel Section
              LatestVideosSection(),

              SizedBox(height: 24),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const HomeBottomNav(),
    );
  }
}
