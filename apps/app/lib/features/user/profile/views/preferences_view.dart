import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../controllers/profile_controller.dart';

class PreferencesView extends GetView<ProfileController> {
  const PreferencesView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Preferences & Notifications',
          style: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Get.back(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionHeader('Notifications'),
              const SizedBox(height: 10),
              Obx(() => _buildSwitchTile(
                    icon: Icons.notifications_outlined,
                    title: 'Push Notifications',
                    subtitle: 'Receive alerts when new videos and lessons are released',
                    value: controller.pushNotificationsEnabled.value,
                    onChanged: (val) => controller.pushNotificationsEnabled.value = val,
                  )),
              const SizedBox(height: 12),
              Obx(() => _buildSwitchTile(
                    icon: Icons.lightbulb_outline_rounded,
                    title: 'Daily Curiosity Fact',
                    subtitle: 'Get an intriguing knowledge fact delivered every morning',
                    value: controller.dailyCuriosityFactsEnabled.value,
                    onChanged: (val) => controller.dailyCuriosityFactsEnabled.value = val,
                  )),
              const SizedBox(height: 12),
              Obx(() => _buildSwitchTile(
                    icon: Icons.mail_outline_rounded,
                    title: 'Weekly Digest Email',
                    subtitle: 'Weekly summary of trending curiosity topics',
                    value: controller.emailDigestEnabled.value,
                    onChanged: (val) => controller.emailDigestEnabled.value = val,
                  )),

              const SizedBox(height: 28),

              _buildSectionHeader('Playback & Experience'),
              const SizedBox(height: 10),
              Obx(() => _buildSwitchTile(
                    icon: Icons.play_circle_outline_rounded,
                    title: 'Auto-play Next Video',
                    subtitle: 'Automatically advance to the next video when scrolling',
                    value: controller.autoPlayVideosEnabled.value,
                    onChanged: (val) => controller.autoPlayVideosEnabled.value = val,
                  )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.outfit(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.pillBackground,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.outfit(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Switch.adaptive(
            value: value,
            activeTrackColor: AppColors.primary,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}
