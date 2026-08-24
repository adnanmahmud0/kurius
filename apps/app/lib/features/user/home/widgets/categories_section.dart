import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../controllers/home_controller.dart';

class CategoriesSection extends GetView<HomeController> {
  const CategoriesSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Categories',
          style: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 14),
        Obx(() {
          if (controller.isLoading.value && controller.categories.isEmpty) {
            return const SizedBox(
              height: 80,
              child: Center(
                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
              ),
            );
          }

          if (controller.categories.isEmpty) {
            return Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Center(
                child: Text(
                  'No categories found',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            );
          }

          return SizedBox(
            height: 100,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              itemCount: controller.categories.length,
              separatorBuilder: (context, index) => const SizedBox(width: 20),
              itemBuilder: (context, index) {
                final category = controller.categories[index];
                final isSelected =
                    controller.selectedCategoryId.value == category.id;

                return GestureDetector(
                  onTap: () => controller.selectCategory(category.id),
                  child: Column(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 58,
                        height: 58,
                        decoration: BoxDecoration(
                          color: category.displayColor,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: category.displayColor.withValues(alpha: 0.35),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Icon(
                          category.displayIcon,
                          color: Colors.white,
                          size: 28,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        category.title,
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight:
                              isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
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
