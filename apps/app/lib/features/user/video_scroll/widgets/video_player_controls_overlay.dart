import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../controllers/video_scroll_controller.dart';

class VideoPlayerControlsOverlay extends GetView<VideoScrollController> {
  const VideoPlayerControlsOverlay({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final isPlaying = controller.isPlaying.value;
      final showControls = controller.showControls.value;
      final currentPos = controller.currentPosition.value;
      final totalDur = controller.totalDuration.value;

      return GestureDetector(
        onTap: controller.togglePlayPause,
        behavior: HitTestBehavior.opaque,
        child: AnimatedOpacity(
          opacity: showControls || !isPlaying ? 1.0 : 0.0,
          duration: const Duration(milliseconds: 250),
          child: Container(
            color: Colors.black.withValues(alpha: isPlaying && !showControls ? 0.0 : 0.35),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Center Controls: 10s Back, Play/Pause, 10s Forward
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // 10 sec backward
                    GestureDetector(
                      onTap: controller.skipBackward10,
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.45),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.replay_10_rounded,
                          color: Colors.white,
                          size: 34,
                        ),
                      ),
                    ),

                    const SizedBox(width: 28),

                    // Big Play / Pause Button
                    GestureDetector(
                      onTap: controller.togglePlayPause,
                      child: Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.9),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.4),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Icon(
                          isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                          color: Colors.white,
                          size: 42,
                        ),
                      ),
                    ),

                    const SizedBox(width: 28),

                    // 10 sec forward
                    GestureDetector(
                      onTap: controller.skipForward10,
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.45),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.forward_10_rounded,
                          color: Colors.white,
                          size: 34,
                        ),
                      ),
                    ),
                  ],
                ),

                // Bottom Video Progress Bar
                Positioned(
                  bottom: 70,
                  left: 20,
                  right: 20,
                  child: Column(
                    children: [
                      // Time indicator
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            controller.formatDuration(currentPos),
                            style: GoogleFonts.outfit(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            controller.formatDuration(totalDur),
                            style: GoogleFonts.outfit(
                              color: Colors.white.withValues(alpha: 0.8),
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          trackHeight: 3,
                          thumbShape: const RoundSliderThumbShape(
                            enabledThumbRadius: 6,
                          ),
                          overlayShape: const RoundSliderOverlayShape(
                            overlayRadius: 12,
                          ),
                          activeTrackColor: AppColors.primary,
                          inactiveTrackColor: Colors.white38,
                          thumbColor: Colors.white,
                        ),
                        child: Slider(
                          value: currentPos.clamp(0.0, totalDur),
                          min: 0.0,
                          max: totalDur,
                          onChanged: (val) {
                            controller.seekTo(val);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    });
  }
}
