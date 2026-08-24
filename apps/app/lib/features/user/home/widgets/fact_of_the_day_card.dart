import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';
import '../controllers/home_controller.dart';

class FactOfTheDayCard extends GetView<HomeController> {
  const FactOfTheDayCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Fact of the day',
          style: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 14),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.cardBorder, width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              // Fact text
              Expanded(
                flex: 6,
                child: Obx(
                  () => Text(
                    controller.factOfTheDay.value.isNotEmpty
                        ? controller.factOfTheDay.value
                        : 'No information found',
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: controller.factOfTheDay.value.isNotEmpty
                          ? AppColors.textPrimary
                          : AppColors.textSecondary,
                      height: 1.35,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              // Mascot Owl Image
              Expanded(
                flex: 4,
                child: Image.asset(
                  AppAssets.logo,
                  height: 90,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => Container(
                    height: 80,
                    decoration: const BoxDecoration(
                      color: AppColors.yellowAccent,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.lightbulb_outline_rounded,
                      color: Colors.white,
                      size: 40,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
