import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/constants/app_colors.dart';
import '../../video_scroll/models/video_model.dart';
import '../bindings/all_categories_binding.dart';
import '../controllers/category_videos_controller.dart';
import 'all_categories_view.dart';

class CategoryVideosView extends StatelessWidget {
  const CategoryVideosView({super.key});

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
          onPressed: () => Get.back(),
        ),
        title: Obx(
          () => Text(
            controller.categoryName.value,
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        centerTitle: true,
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

        // 2. Unauthorized Guest State
        if (controller.isUnauthorized.value && controller.videos.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: const BoxDecoration(
                        color: AppColors.pillBackground,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.lock_outline_rounded, color: AppColors.primary, size: 32),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Sign In to Watch Videos',
                      style: GoogleFonts.outfit(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Please sign in to browse ${controller.categoryName.value} videos.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 18),
                    SizedBox(
                      width: 180,
                      height: 44,
                      child: ElevatedButton(
                        onPressed: () => Get.toNamed(AppRoutes.auth),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          'Sign In / Register',
                          style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }

        // 3. Error State
        if (controller.errorMessage.isNotEmpty && controller.videos.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.info_outline_rounded, color: AppColors.error, size: 36),
                  const SizedBox(height: 12),
                  Text(
                    controller.errorMessage.value,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: controller.loadCategoryVideos,
                    icon: const Icon(Icons.refresh_rounded, size: 18),
                    label: Text(
                      'Retry',
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

        // 5. Video Cards List with Infinite Cursor Pagination
        return RefreshIndicator(
          onRefresh: controller.refreshVideos,
          color: AppColors.primary,
          child: ListView.separated(
            controller: controller.scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            itemCount: controller.videos.length + (controller.isLoadingMore.value ? 1 : 0),
            separatorBuilder: (context, index) => const SizedBox(height: 18),
            itemBuilder: (context, index) {
              // Bottom Loading Indicator for pagination
              if (index == controller.videos.length) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.primary),
                  ),
                );
              }

              final videoItem = controller.videos[index];
              final thumbUrl = videoItem.displayThumbnail;

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
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Video Thumbnail Banner with Play Button
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                            child: SizedBox(
                              height: 180,
                              width: double.infinity,
                              child: Image.network(
                                thumbUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (ctx, err, stack) {
                                  final fallback = VideoModel.fallbackThumbnails[
                                      index % VideoModel.fallbackThumbnails.length];
                                  return Image.network(
                                    fallback,
                                    fit: BoxFit.cover,
                                    errorBuilder: (c, e, s) => Container(
                                      color: AppColors.cardBackground,
                                      child: const Center(
                                        child: Icon(Icons.videocam_rounded, color: AppColors.textMuted, size: 48),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),

                          // Play Button Overlay
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.95),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.25),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.play_arrow_rounded,
                              color: AppColors.primary,
                              size: 32,
                            ),
                          ),

                          // Category Tag Chip in Corner
                          Positioned(
                            top: 12,
                            left: 12,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.65),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                videoItem.categoryName,
                                style: GoogleFonts.outfit(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Card Content
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Video Title
                            Text(
                              videoItem.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                                height: 1.25,
                              ),
                            ),

                            // Subtitle (if present)
                            if (videoItem.subtitle != null && videoItem.subtitle!.trim().isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                videoItem.subtitle!,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.outfit(
                                  fontSize: 13,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],

                            const SizedBox(height: 12),

                            // Creator Info & Stats Bar
                            Row(
                              children: [
                                Container(
                                  width: 28,
                                  height: 28,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    image: DecorationImage(
                                      image: NetworkImage(videoItem.creatorAvatar),
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    videoItem.creatorName,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.outfit(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                                // Views Count
                                Row(
                                  children: [
                                    const Icon(Icons.visibility_outlined, size: 14, color: AppColors.textMuted),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${videoItem.stats.viewsCount}',
                                      style: GoogleFonts.outfit(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 12),
                                // Likes Count
                                Row(
                                  children: [
                                    const Icon(Icons.favorite_border_rounded, size: 14, color: AppColors.textMuted),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${videoItem.stats.likesCount}',
                                      style: GoogleFonts.outfit(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textMuted,
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
            },
          ),
        );
      }),
    );
  }
}
