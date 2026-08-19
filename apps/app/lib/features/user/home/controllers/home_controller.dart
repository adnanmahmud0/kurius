import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../models/home_models.dart';

class HomeController extends GetxController {
  // Bottom Navigation Index: 0 = Start, 1 = Explore
  final RxInt selectedNavIndex = 0.obs;

  // Selected Category
  final RxString selectedCategoryId = 'mythology'.obs;

  // Fact of the Day
  final RxString factOfTheDay =
      'The human eye can distinguish more than 10 million colors.'.obs;

  // Categories List
  final RxList<CategoryModel> categories = <CategoryModel>[
    const CategoryModel(
      id: 'mythology',
      title: 'Mythology',
      icon: Icons.account_balance_rounded,
      color: AppColors.orangeAccent,
    ),
    const CategoryModel(
      id: 'history',
      title: 'History',
      icon: Icons.auto_stories_rounded,
      color: Color(0xFF6C83E2),
    ),
    const CategoryModel(
      id: 'science',
      title: 'Science',
      icon: Icons.science_rounded,
      color: Color(0xFF10B981),
    ),
    const CategoryModel(
      id: 'space',
      title: 'Space',
      icon: Icons.rocket_launch_rounded,
      color: Color(0xFF8B5CF6),
    ),
  ].obs;

  // Latest Videos
  final RxList<VideoItemModel> latestVideos = <VideoItemModel>[
    const VideoItemModel(
      id: 'video_1',
      title: 'Hermes: The Messenger of the...',
      category: 'Greek Mythology',
      imageUrl:
          'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
      duration: '0:45',
    ),
    const VideoItemModel(
      id: 'video_2',
      title: 'Kairos: the god of the i...',
      category: 'Greek Mythology',
      imageUrl:
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
      duration: '1:12',
    ),
    const VideoItemModel(
      id: 'video_3',
      title: 'Apollo: God of the Sun & Music',
      category: 'Greek Mythology',
      imageUrl:
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop',
      duration: '0:58',
    ),
  ].obs;

  void setNavIndex(int index) {
    selectedNavIndex.value = index;
  }

  void selectCategory(String categoryId) {
    selectedCategoryId.value = categoryId;
  }
}
