import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/custom_logo_loader.dart';
import '../controllers/legal_policy_controller.dart';

class LegalPolicyView extends GetView<LegalPolicyController> {
  const LegalPolicyView({super.key});

  @override
  LegalPolicyController get controller =>
      Get.isRegistered<LegalPolicyController>()
          ? Get.find<LegalPolicyController>()
          : Get.put(LegalPolicyController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary, size: 20),
          onPressed: () => Get.back(),
        ),
        title: Obx(
          () => Text(
            controller.screenTitle,
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Obx(() {
          // Loading State
          if (controller.isLoading.value && controller.policy.value == null) {
            return const CustomLogoLoader(
              size: 72,
              text: 'loading.....!',
            );
          }

          // Error State
          if (controller.errorMessage.value.isNotEmpty && controller.policy.value == null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline_rounded, size: 48, color: Colors.redAccent),
                    const SizedBox(height: 14),
                    Text(
                      controller.errorMessage.value,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: controller.loadPolicy,
                      icon: const Icon(Icons.refresh_rounded, size: 18),
                      label: Text(
                        'Retry',
                        style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          final policy = controller.policy.value;
          if (policy == null) {
            return Center(
              child: Text(
                'No content available.',
                style: GoogleFonts.outfit(fontSize: 15, color: AppColors.textSecondary),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: controller.loadPolicy,
            color: AppColors.primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title Header Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.cardBorder),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.pillBackground,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                policy.type == 'privacy'
                                    ? Icons.privacy_tip_rounded
                                    : Icons.gavel_rounded,
                                color: AppColors.primary,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    policy.title,
                                    style: GoogleFonts.outfit(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  if (policy.updatedAt != null) ...[
                                    const SizedBox(height: 2),
                                    Text(
                                      'Last Updated: ${_formatDate(policy.updatedAt!)}',
                                      style: GoogleFonts.outfit(
                                        fontSize: 12,
                                        color: AppColors.textMuted,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Structured Markdown / Policy Content
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: _buildFormattedPolicyContent(policy.content),
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildFormattedPolicyContent(String rawContent) {
    final blocks = rawContent.split('\n\n');
    final List<Widget> widgets = [];

    for (var block in blocks) {
      final trimmed = block.trim();
      if (trimmed.isEmpty) continue;

      if (trimmed.startsWith('## ')) {
        // Section Header (H2)
        widgets.add(
          Padding(
            padding: const EdgeInsets.only(top: 18, bottom: 8),
            child: Text(
              trimmed.substring(3).trim(),
              style: GoogleFonts.outfit(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
                height: 1.3,
              ),
            ),
          ),
        );
      } else if (trimmed.startsWith('# ')) {
        // Main Header (H1)
        widgets.add(
          Padding(
            padding: const EdgeInsets.only(top: 20, bottom: 10),
            child: Text(
              trimmed.substring(2).trim(),
              style: GoogleFonts.outfit(
                fontSize: 19,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
                height: 1.3,
              ),
            ),
          ),
        );
      } else if (trimmed.startsWith('### ')) {
        // Sub Header (H3)
        widgets.add(
          Padding(
            padding: const EdgeInsets.only(top: 14, bottom: 6),
            child: Text(
              trimmed.substring(4).trim(),
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        );
      } else {
        // Standard Paragraph or List of bullet items
        final lines = trimmed.split('\n');
        for (var line in lines) {
          final lineTrim = line.trim();
          if (lineTrim.startsWith('- ') || lineTrim.startsWith('* ')) {
            // Bullet item
            final itemText = lineTrim.substring(2).trim();
            widgets.add(
              Padding(
                padding: const EdgeInsets.only(bottom: 6, left: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 6, right: 8),
                      child: Icon(Icons.circle, size: 6, color: AppColors.primary),
                    ),
                    Expanded(
                      child: _buildRichInlineText(itemText),
                    ),
                  ],
                ),
              ),
            );
          } else {
            // Regular text block
            widgets.add(
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _buildRichInlineText(lineTrim),
              ),
            );
          }
        }
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: widgets,
    );
  }

  Widget _buildRichInlineText(String text) {
    // Check for bold markers **text**
    final spans = <TextSpan>[];
    final parts = text.split('**');

    for (int i = 0; i < parts.length; i++) {
      final part = parts[i];
      if (part.isEmpty) continue;

      if (i % 2 == 1) {
        // Odd index was inside ** ... **
        spans.add(
          TextSpan(
            text: part,
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
        );
      } else {
        // Normal text
        spans.add(
          TextSpan(
            text: part,
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w400,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
        );
      }
    }

    return RichText(
      text: TextSpan(
        style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textSecondary),
        children: spans,
      ),
    );
  }

  String _formatDate(String isoString) {
    try {
      final dt = DateTime.parse(isoString);
      return '${dt.day} ${_monthName(dt.month)} ${dt.year}';
    } catch (_) {
      return isoString;
    }
  }

  String _monthName(int month) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    if (month >= 1 && month <= 12) {
      return months[month - 1];
    }
    return '';
  }
}
