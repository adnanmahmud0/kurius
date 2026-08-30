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
              // Header Title & Search Toggle Button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Explore',
                        style: GoogleFonts.outfit(
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Discover new content',
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  Obx(
                    () => Container(
                      decoration: BoxDecoration(
                        color: controller.isSearching.value
                            ? AppColors.primary
                            : AppColors.cardBackground,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: controller.isSearching.value
                              ? AppColors.primary
                              : AppColors.cardBorder,
                        ),
                      ),
                      child: IconButton(
                        icon: Icon(
                          controller.isSearching.value
                              ? Icons.close_rounded
                              : Icons.search_rounded,
                          color: controller.isSearching.value
                              ? Colors.white
                              : AppColors.textPrimary,
                          size: 22,
                        ),
                        onPressed: controller.toggleSearch,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Animated Expandable Search Input Bar
              Obx(() {
                if (!controller.isSearching.value) return const SizedBox.shrink();
                return Container(
                  margin: const EdgeInsets.only(bottom: 18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.cardBorder),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: controller.searchController,
                    autofocus: true,
                    onChanged: controller.filterSearch,
                    style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Search videos, topics or tags...',
                      hintStyle: GoogleFonts.outfit(fontSize: 14, color: AppColors.textMuted),
                      prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 22),
                      suffixIcon: Obx(() {
                        if (controller.searchQuery.value.isNotEmpty) {
                          return IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 18, color: AppColors.textMuted),
                            onPressed: controller.clearSearch,
                          );
                        }
                        return const SizedBox.shrink();
                      }),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                  ),
                );
              }),

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
