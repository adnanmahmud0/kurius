import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/constants/app_colors.dart';
import '../../video_scroll/models/video_model.dart';
import '../controllers/home_controller.dart';

class LatestVideosSection extends GetView<HomeController> {
  const LatestVideosSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Latest videos',
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            Obx(() => controller.isLoading.value
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                  )
                : const SizedBox.shrink()),
          ],
        ),
        const SizedBox(height: 14),
        Obx(() {
          if (controller.isLoading.value && controller.latestVideos.isEmpty) {
            return Container(
              height: 140,
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: const Center(
                child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.primary),
              ),
            );
          }

          // Unauthorized / Guest Prompt
          if (controller.isUnauthorized.value && controller.latestVideos.isEmpty) {
            return Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: AppColors.pillBackground,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.lock_outline_rounded, color: AppColors.primary, size: 28),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Sign In to Watch Videos',
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Sign in or create an account to explore videos, save lessons, and track progress.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: 180,
                    height: 42,
                    child: ElevatedButton(
                      onPressed: () => Get.toNamed(AppRoutes.auth),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 1,
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
          if (controller.errorMessage.isNotEmpty && controller.latestVideos.isEmpty) {
            return Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: AppColors.error, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      controller.errorMessage.value,
                      style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, size: 20, color: AppColors.primary),
                    onPressed: controller.refreshHome,
                  ),
                ],
              ),
            );
          }

          // Empty State
          if (controller.latestVideos.isEmpty) {
            return Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.video_library_outlined, size: 36, color: AppColors.textMuted),
                  const SizedBox(height: 10),
                  Text(
                    'No Video or information found',
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            );
          }

          // Active Videos Carousel
          return SizedBox(
            height: 180,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              itemCount: controller.latestVideos.length,
              separatorBuilder: (context, index) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final video = controller.latestVideos[index];
                final thumbUrl = video.displayThumbnail;

                return GestureDetector(
                  onTap: () => Get.toNamed(
                    AppRoutes.videoScroll,
                    arguments: {
                      'initialIndex': index,
                      'videos': controller.latestVideos
                          .map((v) => VideoModel.fromVideoItem(v))
                          .toList(),
                    },
                  ),
                  child: SizedBox(
                    width: 165,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(18),
                              child: Container(
                                height: 120,
                                width: 165,
                                color: AppColors.cardBackground,
                                child: Image.network(
                                  thumbUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (ctx, err, stack) => const Center(
                                    child: Icon(Icons.videocam_rounded,
                                        color: AppColors.textMuted, size: 36),
                                  ),
                                ),
                              ),
                            ),
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.15),
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
                        const SizedBox(height: 8),
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
                  ),
                );
              },
            ),
          );
        }),
      ],
    );
  }
}
