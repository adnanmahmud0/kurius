import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../controllers/discover_controller.dart';

class ExploreFilterChips extends GetView<DiscoverController> {
  const ExploreFilterChips({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 38,
      child: Obx(() {
        final categoryList = controller.categories;
        final selected = controller.selectedCategory.value;

        return ListView.separated(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          clipBehavior: Clip.none,
          itemCount: categoryList.length,
          separatorBuilder: (context, index) => const SizedBox(width: 10),
          itemBuilder: (context, index) {
            final category = categoryList[index];
            final isSelected = selected == category;

            return GestureDetector(
              onTap: () => controller.filterCategory(category),
              behavior: HitTestBehavior.opaque,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                curve: Curves.easeInOut,
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.cardBorder,
                    width: 1.2,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          )
                        ]
                      : null,
                ),
                alignment: Alignment.center,
                child: Text(
                  category,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                ),
              ),
            );
          },
        );
      }),
    );
  }
}
