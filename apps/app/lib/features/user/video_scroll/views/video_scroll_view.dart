import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/custom_logo_loader.dart';
import '../controllers/video_scroll_controller.dart';
import '../widgets/video_top_bar.dart';
import '../widgets/video_side_actions.dart';
import '../widgets/video_bottom_info.dart';
import '../widgets/video_player_controls_overlay.dart';

class VideoScrollView extends GetView<VideoScrollController> {
  const VideoScrollView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          // Top Navigation Bar
          const VideoTopBar(),

          // Main Video Scroll Pager or State Views
          Expanded(
            child: Obx(
              () {
                // 1. Initial Loading State
                if (controller.isLoading.value) {
                  return const CustomLogoLoader(
                    size: 76,
                    text: 'loading.....!',
                    textColor: Colors.white,
                  );
                }

                // 2. Unauthorized State (401)
                if (controller.isUnauthorized.value) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.lock_outline_rounded,
                              size: 48,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(height: 18),
                          Text(
                            'Sign In Required',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Please sign in or register to browse video feeds.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.outfit(
                              fontSize: 14,
                              color: Colors.white60,
                            ),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () => Get.toNamed(AppRoutes.auth),
                            icon: const Icon(Icons.login_rounded, size: 18),
                            label: Text(
                              'Sign In / Register',
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                // 3. Error State
                if (controller.errorMessage.value.isNotEmpty && controller.videos.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.error_outline_rounded,
                            size: 48,
                            color: Colors.redAccent,
                          ),
                          const SizedBox(height: 14),
                          Text(
                            controller.errorMessage.value,
                            textAlign: TextAlign.center,
                            style: GoogleFonts.outfit(
                              fontSize: 15,
                              color: Colors.white70,
                            ),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton.icon(
                            onPressed: () => controller.loadInitialVideos(),
                            icon: const Icon(Icons.refresh_rounded, size: 18),
                            label: Text(
                              'Retry',
                              style: GoogleFonts.outfit(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
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
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.08),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.video_library_outlined,
                              size: 48,
                              color: Colors.white70,
                            ),
                          ),
                          const SizedBox(height: 18),
                          Text(
                            'No Video or information found',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Explore other categories or refresh.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.outfit(
                              fontSize: 14,
                              color: Colors.white60,
                            ),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () => Get.back(),
                            icon: const Icon(Icons.arrow_back_rounded, size: 18),
                            label: Text(
                              'Go Back',
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                // 5. Full-screen Vertical Feed with Pull-to-Refresh
                return RefreshIndicator(
                  onRefresh: controller.refreshVideos,
                  color: AppColors.primary,
                  backgroundColor: const Color(0xFF1E2432),
                  child: PageView.builder(
                    controller: controller.pageController,
                    scrollDirection: Axis.vertical,
                    itemCount: controller.videos.length + (controller.isLoadingMore.value ? 1 : 0),
                    onPageChanged: controller.onPageChanged,
                    itemBuilder: (context, index) {
                      // Bottom loader when fetching next cursor
                      if (index == controller.videos.length) {
                        return const Center(
                          child: CircularProgressIndicator(
                            strokeWidth: 3,
                            color: AppColors.primary,
                          ),
                        );
                      }

                      final video = controller.videos[index];
                      final thumbUrl = video.displayThumbnail;

                      return Stack(
                        fit: StackFit.expand,
                        children: [
                          // Real Video Player or Thumbnail Fallback
                          Obx(() {
                            final isCurrent = controller.currentIndex.value == index;
                            final isInitialized = controller.isVideoInitialized.value;
                            final player = controller.activePlayerController;

                            if (isCurrent && isInitialized && player != null) {
                              return Center(
                                child: AspectRatio(
                                  aspectRatio: player.value.aspectRatio > 0
                                      ? player.value.aspectRatio
                                      : 9 / 16,
                                  child: VideoPlayer(player),
                                ),
                              );
                            }

                            return Image.network(
                              thumbUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => Container(
                                color: const Color(0xFF1E2432),
                                child: const Center(
                                  child: Icon(
                                    Icons.movie_creation_outlined,
                                    size: 80,
                                    color: Colors.white24,
                                  ),
                                ),
                              ),
                            );
                          }),

                          // Buffering / Loading Spinner
                          Obx(() {
                            final isCurrent = controller.currentIndex.value == index;
                            final isBuffering = controller.isBuffering.value;
                            if (isCurrent && isBuffering) {
                              return const Center(
                                child: CircularProgressIndicator(
                                  strokeWidth: 3,
                                  color: AppColors.primary,
                                ),
                              );
                            }
                            return const SizedBox.shrink();
                          }),

                          // Gradient overlays for crisp text visibility
                          Positioned.fill(
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    Colors.black.withValues(alpha: 0.25),
                                    Colors.transparent,
                                    Colors.transparent,
                                    Colors.black.withValues(alpha: 0.85),
                                  ],
                                  stops: const [0.0, 0.2, 0.65, 1.0],
                                ),
                              ),
                            ),
                          ),

                          // Interactive Player Controls (10s back, Play/Pause, 10s forward, live seek bar & timers)
                          const Positioned.fill(
                            child: VideoPlayerControlsOverlay(),
                          ),

                          // Right Side Floating Actions (Like, Comment, Mute)
                          Positioned(
                            right: 16,
                            bottom: 120,
                            child: VideoSideActions(video: video),
                          ),

                          // Bottom Video Info (Creator, Title, Subtitle, Category, Hashtags)
                          Positioned(
                            left: 20,
                            right: 80,
                            bottom: 10,
                            child: VideoBottomInfo(video: video),
                          ),
                        ],
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
