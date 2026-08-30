import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/storage/storage_service.dart';
import '../controllers/video_scroll_controller.dart';

void showCommentsBottomSheet(BuildContext context) {
  final controller = Get.find<VideoScrollController>();
  final storage = Get.isRegistered<StorageService>() ? Get.find<StorageService>() : StorageService.to;
  final isLoggedIn = storage.isLoggedIn();
  final currentUser = storage.getUserData();
  final currentUserId = currentUser?['id'] as String? ?? '';
  final currentUserRole = currentUser?['role'] as String? ?? '';

  // Load latest comments from backend API on bottom sheet open
  controller.loadCommentsForCurrentVideo(isRefresh: true);

  final scrollController = ScrollController();
  scrollController.addListener(() {
    if (scrollController.position.pixels >=
            scrollController.position.maxScrollExtent - 100 &&
        controller.hasCommentsNextPage.value &&
        !controller.isLoadingMoreComments.value &&
        !controller.isLoadingComments.value) {
      controller.loadMoreCommentsForCurrentVideo();
    }
  });

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return Container(
        height: MediaQuery.of(context).size.height * 0.70,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: Column(
          children: [
            // Handle bar
            const SizedBox(height: 12),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 14),

            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Obx(
                    () => Text(
                      'Comments (${controller.activeVideoComments.length})',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // Comments List
            Expanded(
              child: Obx(
                () {
                  if (controller.isLoadingComments.value && controller.activeVideoComments.isEmpty) {
                    return const Center(
                      child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.primary),
                    );
                  }

                  if (controller.activeVideoComments.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.chat_bubble_outline_rounded,
                              size: 40, color: AppColors.textMuted),
                          const SizedBox(height: 10),
                          Text(
                            'No comments yet',
                            style: GoogleFonts.outfit(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Be the first to share your thoughts!',
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return ListView.separated(
                    controller: scrollController,
                    padding: const EdgeInsets.all(20),
                    itemCount: controller.activeVideoComments.length +
                        (controller.isLoadingMoreComments.value ? 1 : 0),
                    separatorBuilder: (context, index) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      if (index == controller.activeVideoComments.length) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 8),
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                          ),
                        );
                      }

                      final comment = controller.activeVideoComments[index];
                      final canDelete = isLoggedIn &&
                          (comment.userId == currentUserId ||
                              currentUserRole == 'ADMIN' ||
                              comment.userId.isEmpty);

                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Avatar
                          if (comment.userAvatar.isNotEmpty)
                            CircleAvatar(
                              radius: 18,
                              backgroundImage: NetworkImage(comment.userAvatar),
                              backgroundColor: AppColors.pillBackground,
                            )
                          else
                            CircleAvatar(
                              radius: 18,
                              backgroundColor: AppColors.pillBackground,
                              child: Text(
                                comment.avatarLetter,
                                style: GoogleFonts.outfit(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                ),
                              ),
                            ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          comment.userName,
                                          style: GoogleFonts.outfit(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          comment.timeAgo,
                                          style: GoogleFonts.outfit(
                                            fontSize: 12,
                                            color: AppColors.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                    // Delete Button
                                    if (canDelete)
                                      IconButton(
                                        icon: const Icon(
                                          Icons.delete_outline_rounded,
                                          size: 18,
                                          color: Colors.redAccent,
                                        ),
                                        splashRadius: 18,
                                        padding: EdgeInsets.zero,
                                        constraints: const BoxConstraints(),
                                        onPressed: () {
                                          showDialog(
                                            context: context,
                                            builder: (ctx) => AlertDialog(
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(16),
                                              ),
                                              title: Text(
                                                'Delete Comment',
                                                style: GoogleFonts.outfit(
                                                  fontWeight: FontWeight.w700,
                                                  fontSize: 18,
                                                ),
                                              ),
                                              content: Text(
                                                'Are you sure you want to delete this comment?',
                                                style: GoogleFonts.outfit(
                                                  fontSize: 14,
                                                  color: AppColors.textSecondary,
                                                ),
                                              ),
                                              actions: [
                                                TextButton(
                                                  onPressed: () => Navigator.pop(ctx),
                                                  child: Text(
                                                    'Cancel',
                                                    style: GoogleFonts.outfit(
                                                      color: AppColors.textSecondary,
                                                      fontWeight: FontWeight.w600,
                                                    ),
                                                  ),
                                                ),
                                                ElevatedButton(
                                                  onPressed: () {
                                                    Navigator.pop(ctx);
                                                    controller.deleteComment(comment.id);
                                                  },
                                                  style: ElevatedButton.styleFrom(
                                                    backgroundColor: Colors.redAccent,
                                                    foregroundColor: Colors.white,
                                                    shape: RoundedRectangleBorder(
                                                      borderRadius: BorderRadius.circular(10),
                                                    ),
                                                  ),
                                                  child: Text(
                                                    'Delete',
                                                    style: GoogleFonts.outfit(
                                                      fontWeight: FontWeight.w700,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          );
                                        },
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  comment.commentText,
                                  style: GoogleFonts.outfit(
                                    fontSize: 14,
                                    color: AppColors.textPrimary,
                                    height: 1.3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      );
                    },
                  );
                },
              ),
            ),

            // Comment input bar / Sign In prompt if not logged in
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: AppColors.cardBorder)),
              ),
              child: isLoggedIn
                  ? Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            decoration: BoxDecoration(
                              color: AppColors.cardBackground,
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: AppColors.cardBorder),
                            ),
                            child: TextField(
                              controller: controller.commentInputController,
                              style: GoogleFonts.outfit(fontSize: 14),
                              decoration: InputDecoration(
                                hintText: 'Add a comment...',
                                hintStyle: GoogleFonts.outfit(
                                  fontSize: 14,
                                  color: AppColors.textMuted,
                                ),
                                border: InputBorder.none,
                              ),
                              onSubmitted: (val) => controller.postComment(val),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Obx(
                          () => controller.isPostingComment.value
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                                )
                              : IconButton(
                                  icon: const Icon(Icons.send_rounded, color: AppColors.primary),
                                  onPressed: () =>
                                      controller.postComment(controller.commentInputController.text),
                                ),
                        ),
                      ],
                    )
                  : SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          Get.toNamed(AppRoutes.auth);
                        },
                        icon: const Icon(Icons.lock_outline_rounded, size: 18),
                        label: Text(
                          'Sign In / Register to Comment',
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                      ),
                    ),
            ),
          ],
        ),
      );
    },
  );
}
