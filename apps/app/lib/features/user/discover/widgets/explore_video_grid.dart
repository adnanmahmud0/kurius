import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/custom_logo_loader.dart';
import '../../video_scroll/models/video_model.dart';
import '../controllers/discover_controller.dart';

class ExploreVideoGrid extends GetView<DiscoverController> {
  const ExploreVideoGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.isLoading.value && controller.filteredVideos.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 60),
          child: CustomLogoLoader(
            size: 72,
            text: 'loading.....!',
          ),
        );
      }

      // Unauthorized Guest State
      if (controller.isUnauthorized.value && controller.filteredVideos.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
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
                'Sign In to Explore Content',
                style: GoogleFonts.outfit(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Unlock full access to topics, curated videos, and lessons.',
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
        );
      }

      // Error State
      if (controller.errorMessage.isNotEmpty && controller.filteredVideos.isEmpty) {
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline_rounded, color: AppColors.error, size: 22),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  controller.errorMessage.value,
                  style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textSecondary),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.refresh_rounded, size: 22, color: AppColors.primary),
                onPressed: controller.loadDiscoverData,
              ),
            ],
          ),
        );
      }

      final videos = controller.displayedVideos;

      if (videos.isEmpty) {
        final isSearching = controller.isSearching.value && controller.searchQuery.value.isNotEmpty;

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 20),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isSearching ? Icons.search_off_rounded : Icons.video_library_outlined,
                size: 40,
                color: AppColors.textMuted,
              ),
              const SizedBox(height: 12),
              Text(
                isSearching ? 'No matching videos found' : 'No Video or information found',
                style: GoogleFonts.outfit(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                isSearching
                    ? 'No videos match "${controller.searchQuery.value}".'
                    : 'No videos found in "${controller.selectedCategory.value}". Try another category.',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  color: AppColors.textMuted,
                ),
              ),
              if (isSearching) ...[
                const SizedBox(height: 12),
                TextButton(
                  onPressed: controller.clearSearch,
                  child: Text(
                    'Clear Search',
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      }

      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: videos.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 14,
          mainAxisSpacing: 18,
          childAspectRatio: 0.88,
        ),
        itemBuilder: (context, index) {
          final video = videos[index];
          final thumbUrl = video.displayThumbnail;

          return GestureDetector(
            onTap: () => controller.openVideo(index),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Video Thumbnail with Play Button & Fallback Image
                Expanded(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(18),
                        child: Container(
                          width: double.infinity,
                          color: AppColors.cardBackground,
                          child: Image.network(
                            thumbUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              final fallback = VideoModel.fallbackThumbnails[
                                  index % VideoModel.fallbackThumbnails.length];
                              return Image.network(
                                fallback,
                                fit: BoxFit.cover,
                                errorBuilder: (ctx, err, stack) => const Center(
                                  child: Icon(Icons.videocam_rounded, color: AppColors.textMuted, size: 36),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                      // White circular play button overlay
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.play_arrow_rounded,
                          color: AppColors.primary,
                          size: 24,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                // Video Title
                Text(
                  video.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                    height: 1.2,
                  ),
                ),
              ],
            ),
          );
        },
      );
    });
  }
}
