import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/video/video_item_model.dart';
import '../bindings/all_categories_binding.dart';
import '../controllers/category_videos_controller.dart';
import 'all_categories_view.dart';

class CategoryVideosView extends GetView<CategoryVideosController> {
  const CategoryVideosView({super.key});

  @override
  CategoryVideosController get controller =>
      Get.isRegistered<CategoryVideosController>()
          ? Get.find<CategoryVideosController>()
          : Get.put(CategoryVideosController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary, size: 20),
          onPressed: () {
            if (controller.isSearching.value) {
              controller.toggleSearch();
            } else {
              Get.back();
            }
          },
        ),
        title: Obx(
          () {
            if (controller.isSearching.value) {
              return Container(
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: TextField(
                  controller: controller.searchController,
                  autofocus: true,
                  onChanged: controller.filterVideos,
                  style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: 'Search in ${controller.categoryName.value}...',
                    hintStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textMuted),
                    prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20),
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
                    contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                  ),
                ),
              );
            }

            return Text(
              controller.categoryName.value,
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            );
          },
        ),
        centerTitle: true,
        actions: [
          Obx(
            () => IconButton(
              icon: Icon(
                controller.isSearching.value ? Icons.close_rounded : Icons.search_rounded,
                color: AppColors.textPrimary,
                size: 22,
              ),
              onPressed: controller.toggleSearch,
            ),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Obx(() {
        // 1. Initial Loading State
        if (controller.isLoading.value && controller.videos.isEmpty) {
          return const Center(
            child: CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 3,
            ),
          );
        }

        // 2. Error State
        if (controller.errorMessage.value.isNotEmpty && controller.videos.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline_rounded, size: 48, color: Colors.redAccent),
                  const SizedBox(height: 12),
                  Text(
                    controller.errorMessage.value,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: controller.refreshVideos,
                    icon: const Icon(Icons.refresh_rounded, size: 18),
                    label: Text(
                      'Try Again',
                      style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        // 3. Unauthorized State
        if (controller.isUnauthorized.value && controller.videos.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.lock_outline_rounded, size: 48, color: AppColors.primary),
                  const SizedBox(height: 12),
                  Text(
                    'Sign In to View Videos',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Sign in or create an account to explore videos in "${controller.categoryName.value}".',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 18),
                  ElevatedButton.icon(
                    onPressed: () => Get.toNamed(AppRoutes.auth),
                    icon: const Icon(Icons.login_rounded, size: 18),
                    label: Text(
                      'Sign In / Register',
                      style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        // 4. Empty State
        if (controller.videos.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: AppColors.cardBackground,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: const Icon(Icons.video_library_outlined, size: 40, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'No Video or information found',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'No videos currently available for "${controller.categoryName.value}".',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: () {
                      Get.to(
                        () => const AllCategoriesView(),
                        binding: AllCategoriesBinding(),
                      );
                    },
                    icon: const Icon(Icons.category_rounded, size: 18),
                    label: Text(
                      'Explore Other Categories',
                      style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        final displayedList = controller.displayedVideos;

        // 4b. Search empty state
        if (controller.isSearching.value && displayedList.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.search_off_rounded, size: 48, color: AppColors.textMuted),
                  const SizedBox(height: 12),
                  Text(
                    'No videos found',
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'No matches for "${controller.searchQuery.value}"',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: controller.clearSearch,
                    child: Text(
                      'Clear Search',
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        // 5. Video Cards List with Infinite Cursor Pagination
        return RefreshIndicator(
          onRefresh: controller.refreshVideos,
          color: AppColors.primary,
          child: ListView.separated(
            controller: controller.scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            itemCount: displayedList.length + (controller.isLoadingMore.value ? 1 : 0),
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              // Bottom Loading Indicator during cursor pagination
              if (index >= displayedList.length) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(
                    child: CircularProgressIndicator(
                      color: AppColors.primary,
                      strokeWidth: 2.5,
                    ),
                  ),
                );
              }

              final video = displayedList[index];
              return _buildVideoCard(context, video, index);
            },
          ),
        );
      }),
    );
  }

  Widget _buildVideoCard(BuildContext context, VideoItemModel video, int index) {
    final thumbUrl = video.displayThumbnail;

    return GestureDetector(
      onTap: () => controller.openVideo(index),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.cardBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Video Thumbnail AspectRatio Banner with Play Icon & Duration
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: thumbUrl.isNotEmpty
                      ? Image.network(
                          thumbUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (ctx, err, stack) => _buildPlaceholderBanner(video),
                        )
                      : _buildPlaceholderBanner(video),
                ),
                // Play Icon Overlay
                Positioned.fill(
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.45),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withValues(alpha: 0.8), width: 1.5),
                      ),
                      child: const Icon(
                        Icons.play_arrow_rounded,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                  ),
                ),
                // Category Chip Badge
                if (video.categoryName.isNotEmpty)
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.65),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        video.categoryName,
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                // Views count badge
                Positioned(
                  bottom: 10,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.remove_red_eye_rounded, size: 12, color: Colors.white),
                        const SizedBox(width: 4),
                        Text(
                          '${video.stats.viewsCount}',
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // Card Text Details
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    video.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      height: 1.3,
                    ),
                  ),
                  if (video.subtitle != null && video.subtitle!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      video.subtitle!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w400,
                        color: AppColors.textSecondary,
                        height: 1.3,
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),

                  // Bottom Info Row: Likes & Comments count
                  Row(
                    children: [
                      if (video.creatorName.isNotEmpty) ...[
                        const Icon(Icons.account_circle_outlined, size: 16, color: AppColors.textSecondary),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            video.creatorName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ] else
                        const Spacer(),

                      // Likes count
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            video.isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                            size: 16,
                            color: video.isLiked ? Colors.redAccent : AppColors.textMuted,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${video.stats.likesCount}',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 14),

                      // Comments count
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.mode_comment_outlined, size: 15, color: AppColors.textMuted),
                          const SizedBox(width: 4),
                          Text(
                            '${video.stats.commentsCount}',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholderBanner(VideoItemModel video) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF2C3E50), Color(0xFF4CA1AF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Icon(
          Icons.play_circle_fill_rounded,
          color: Colors.white.withValues(alpha: 0.6),
          size: 48,
        ),
      ),
    );
  }
}
