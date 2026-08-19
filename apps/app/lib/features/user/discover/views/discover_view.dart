import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/user_bottom_nav.dart';
import '../controllers/discover_controller.dart';
import '../widgets/explore_filter_chips.dart';
import '../widgets/explore_video_grid.dart';

class DiscoverView extends GetView<DiscoverController> {
  const DiscoverView({super.key});

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
            children: [
              // Header Title & Subtitle
              Text(
                'Explore',
                style: GoogleFonts.outfit(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Discover new content',
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w400,
                ),
              ),

              const SizedBox(height: 20),

              // Filter Chips
              const ExploreFilterChips(),

              const SizedBox(height: 24),

              // 2-Column Video Grid
              const ExploreVideoGrid(),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const UserBottomNav(currentIndex: 1),
    );
  }
}
