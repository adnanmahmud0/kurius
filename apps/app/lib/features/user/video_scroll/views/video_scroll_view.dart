import 'package:flutter/material.dart';
import 'package:get/get.dart';
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
          // Top Header Bar matching Screenshot 2
          const VideoTopBar(),

          // Full Screen Vertical Video Scroll Pager
          Expanded(
            child: Obx(
              () => PageView.builder(
                controller: controller.pageController,
                scrollDirection: Axis.vertical,
                itemCount: controller.videos.length,
                onPageChanged: controller.onPageChanged,
                itemBuilder: (context, index) {
                  final video = controller.videos[index];

                  return Stack(
                    fit: StackFit.expand,
                    children: [
                      // Video Background Image / Player
                      Image.network(
                        video.imageUrl,
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
                      ),

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

                      // Interactive Player Controls (10s back, play/pause, 10s forward, scrub bar)
                      const Positioned.fill(
                        child: VideoPlayerControlsOverlay(),
                      ),

                      // Right Side Floating Actions (Like, Comment, Mute)
                      Positioned(
                        right: 16,
                        bottom: 120,
                        child: VideoSideActions(video: video),
                      ),

                      // Bottom Video Info & Swipe Guide
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
            ),
          ),
        ],
      ),
    );
  }
}
