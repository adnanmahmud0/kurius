import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';

class VideoTopBar extends StatelessWidget {
  const VideoTopBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.primary,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 6,
        bottom: 10,
        left: 16,
        right: 16,
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Left: Back button & Owl Logo
          Row(
            children: [
              // White circular back button
              GestureDetector(
                onTap: () => Get.back(),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: AppColors.textPrimary,
                    size: 16,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Owl Mascot Logo
              Image.asset(
                AppAssets.logo,
                width: 28,
                height: 28,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) =>
                    const SizedBox.shrink(),
              ),
            ],
          ),

          // Center: Bold "Kurius" title
          Text(
            'Kurius',
            style: GoogleFonts.outfit(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}
