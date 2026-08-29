import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../app/routes/app_routes.dart';
import '../../core/constants/app_colors.dart';
import '../../features/user/auth/controllers/auth_controller.dart';

class UserBottomNav extends StatelessWidget {
  final int currentIndex;

  const UserBottomNav({
    super.key,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: AppColors.divider.withValues(alpha: 0.6)),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      padding: const EdgeInsets.only(top: 8, bottom: 12),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            // 1. Home Tab
            _buildNavItem(
              icon: Icons.home_outlined,
              selectedIcon: Icons.home_rounded,
              label: 'Home',
              isSelected: currentIndex == 0,
              onTap: () {
                if (currentIndex != 0) {
                  Get.offAllNamed(AppRoutes.home);
                }
              },
            ),

            // 2. Explore Tab
            _buildNavItem(
              icon: Icons.explore_outlined,
              selectedIcon: Icons.explore_rounded,
              label: 'Explore',
              isSelected: currentIndex == 1,
              onTap: () {
                if (currentIndex != 1) {
                  Get.toNamed(AppRoutes.discover);
                }
              },
            ),

            // 3. Profile Tab (Navigates to Auth if not logged in, or Profile if logged in)
            _buildNavItem(
              icon: Icons.person_outline_rounded,
              selectedIcon: Icons.person_rounded,
              label: 'Profile',
              isSelected: currentIndex == 2,
              onTap: () {
                if (authController.isLoggedIn.value) {
                  if (currentIndex != 2) {
                    Get.toNamed(AppRoutes.profile);
                  }
                } else {
                  Get.toNamed(AppRoutes.auth);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    IconData? selectedIcon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 90,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.pillBackground : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                isSelected ? (selectedIcon ?? icon) : icon,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
                size: 26,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
