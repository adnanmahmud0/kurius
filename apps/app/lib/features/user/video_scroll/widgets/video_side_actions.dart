import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../controllers/video_scroll_controller.dart';
import '../models/video_model.dart';
import 'comments_bottom_sheet.dart';

class VideoSideActions extends GetView<VideoScrollController> {
  final VideoModel video;

  const VideoSideActions({super.key, required this.video});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Views Count Indicator
        Obx(() {
          final viewsCount = controller.viewsCountMap[video.id] ?? video.initialViews;

          return Column(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.4),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white24, width: 1),
                ),
                child: const Icon(
                  Icons.visibility_outlined,
                  color: Colors.white,
                  size: 22,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '$viewsCount',
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  shadows: [
                    const Shadow(
                      color: Colors.black87,
                      blurRadius: 4,
                      offset: Offset(0, 1),
                    ),
                  ],
                ),
              ),
            ],
          );
        }),

        const SizedBox(height: 14),

        // Like Button
        Obx(() {
          final isLiked = controller.likedMap[video.id] ?? false;
          final likesCount = controller.likesCountMap[video.id] ?? video.initialLikes;

          return Column(
            children: [
              GestureDetector(
                onTap: () => controller.toggleLike(video.id),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.25),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(
                    isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                    color: isLiked ? Colors.redAccent : AppColors.textPrimary,
                    size: 26,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '$likesCount',
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  shadows: [
                    const Shadow(
                      color: Colors.black87,
                      blurRadius: 4,
                      offset: Offset(0, 1),
                    ),
                  ],
                ),
              ),
            ],
          );
        }),

        const SizedBox(height: 14),

        // Comment Button
        Column(
          children: [
            GestureDetector(
              onTap: () => showCommentsBottomSheet(context),
              child: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.chat_bubble_outline_rounded,
                  color: AppColors.textPrimary,
                  size: 24,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Obx(
              () {
                final count = video.initialComments + controller.comments.length;
                return Text(
                  '$count',
                  style: GoogleFonts.outfit(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    shadows: [
                      const Shadow(
                        color: Colors.black87,
                        blurRadius: 4,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),

        const SizedBox(height: 14),

        // Mute / Unmute Button
        Obx(() {
          final isMuted = controller.isMuted.value;

          return GestureDetector(
            onTap: controller.toggleMute,
            child: Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.25),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
                color: isMuted ? AppColors.textSecondary : AppColors.textPrimary,
                size: 22,
              ),
            ),
          );
        }),
      ],
    );
  }
}
