import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/video_model.dart';

class VideoBottomInfo extends StatelessWidget {
  final VideoModel video;

  const VideoBottomInfo({super.key, required this.video});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Title
        Text(
          video.title,
          style: GoogleFonts.outfit(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: Colors.white,
            height: 1.25,
            shadows: [
              const Shadow(
                color: Colors.black87,
                blurRadius: 10,
                offset: Offset(0, 2),
              ),
            ],
          ),
        ),
        const SizedBox(height: 6),

        // Category Tag
        Text(
          video.category,
          style: GoogleFonts.outfit(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: Colors.white.withValues(alpha: 0.9),
            shadows: [
              const Shadow(
                color: Colors.black87,
                blurRadius: 8,
                offset: Offset(0, 1),
              ),
            ],
          ),
        ),

        const SizedBox(height: 28),

        // Swipe up indicator
        Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.arrow_upward_rounded,
                color: Colors.white,
                size: 18,
                shadows: [
                  Shadow(
                    color: Colors.black87,
                    blurRadius: 8,
                    offset: Offset(0, 1),
                  ),
                ],
              ),
              const SizedBox(width: 6),
              Text(
                'Swipe for next video',
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                  shadows: [
                    const Shadow(
                      color: Colors.black87,
                      blurRadius: 8,
                      offset: Offset(0, 1),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
      ],
    );
  }
}
