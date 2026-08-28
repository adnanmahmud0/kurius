import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../bindings/all_categories_binding.dart';
import '../bindings/category_videos_binding.dart';
import '../controllers/home_controller.dart';
import '../views/all_categories_view.dart';
import '../views/category_videos_view.dart';

class CategoriesSection extends GetView<HomeController> {
  const CategoriesSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Categories',
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {
                Get.to(
                  () => const AllCategoriesView(),
                  binding: AllCategoriesBinding(),
                );
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
                child: Text(
                  'See all',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ),
          ],
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
                final thumbUrl = category.displayThumbnail;

                return GestureDetector(
                  onTap: () {
                    controller.selectCategory(category.id);
                    Get.to(
                      () => const CategoryVideosView(),
                      binding: CategoryVideosBinding(),
                      arguments: {
                        'category': category,
                        'categoryId': category.id,
                        'categoryName': category.title,
                      },
                    );
                  },
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
                        clipBehavior: Clip.antiAlias,
                        child: thumbUrl != null
                            ? Image.network(
                                thumbUrl,
                                fit: BoxFit.cover,
                                width: 58,
                                height: 58,
                                errorBuilder: (ctx, err, stack) => Center(
                                  child: Icon(
                                    category.displayIcon,
                                    color: Colors.white,
                                    size: 28,
                                  ),
                                ),
                              )
                            : Center(
                                child: Icon(
                                  category.displayIcon,
                                  color: Colors.white,
                                  size: 28,
                                ),
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
