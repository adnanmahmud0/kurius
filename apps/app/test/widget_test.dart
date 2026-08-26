import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:kurius/core/network/api_response.dart';
import 'package:kurius/core/storage/storage_service.dart';
import 'package:kurius/data/models/category/category_model.dart';
import 'package:kurius/data/models/user/user_model.dart';
import 'package:kurius/data/models/video/video_item_model.dart';
import 'package:kurius/features/user/auth/controllers/auth_controller.dart';
import 'package:kurius/features/user/home/controllers/category_videos_controller.dart';
import 'package:kurius/features/user/home/controllers/home_controller.dart';
import 'package:kurius/features/user/profile/controllers/profile_controller.dart';
import 'package:kurius/features/user/video_scroll/controllers/video_scroll_controller.dart';
import 'package:kurius/features/user/video_scroll/models/video_model.dart';
import 'package:kurius/main.dart';

void main() {
  setUp(() {
    Get.testMode = true;
  });

  tearDown(() {
    Get.reset();
  });

  testWidgets('Kurius app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const KuriusApp());
    expect(find.byType(KuriusApp), findsOneWidget);
    // Advance virtual clock past splash timers
    await tester.pump(const Duration(seconds: 4));
    await tester.pumpAndSettle();
  });

  test('AuthController OTP and Form State Test', () {
    Get.put(StorageService());
    final controller = Get.put(AuthController());

    expect(controller.selectedTab.value, 0);
    controller.setTab(1);
    expect(controller.selectedTab.value, 1);

    controller.prepareOtpFlow(email: 'test@kurius.app', isReset: true);
    expect(controller.otpEmail.value, 'test@kurius.app');
    expect(controller.otpIsResetFlow.value, true);
    expect(controller.resendCountdown.value, 60);
    expect(controller.canResend.value, false);

    // Verify all demo values are empty
    expect(controller.userName.value, '');
    expect(controller.userEmail.value, '');
    expect(controller.loginEmailController.text, '');
  });

  test('ProfileController user real name and verified badge tests', () {
    Get.put(StorageService());
    final authController = Get.put(AuthController());
    authController.isLoggedIn.value = true;

    final profileController = Get.put(ProfileController());

    const sampleUser = UserModel(
      id: 'u1',
      name: 'Adnan Mahmud',
      email: 'adnan@kurius.app',
      verified: true,
    );

    profileController.userProfile.value = sampleUser;
    profileController.userName.value = sampleUser.displayName;
    profileController.userEmail.value = sampleUser.email;
    profileController.isVerified.value = sampleUser.verified;

    // Verify that display name uses real name, not email prefix
    expect(profileController.userName.value, 'Adnan Mahmud');
    expect(profileController.userName.value, isNot('adnan'));
    expect(profileController.isVerified.value, isTrue);

    // Test saved videos and history management
    profileController.savedVideoIds.add('v1');
    profileController.clearSavedVideos();
    expect(profileController.savedVideoIds, isEmpty);

    profileController.learningHistoryIds.add('h1');
    profileController.clearLearningHistory();
    expect(profileController.learningHistoryIds, isEmpty);
  });

  test('VideoModel & VideoItemModel API JSON Deserialization Test', () {
    final sampleJson = {
      "id": "vid-999",
      "title": "Quantum Computing 101",
      "subtitle": "Understanding qubits and superposition",
      "videoUrl": "/uploads/videos/quantum.mp4",
      "thumbnailUrl": "/uploads/thumbnails/quantum.jpg",
      "categoryId": "cat-physics",
      "hashtags": ["quantum", "physics", "tech"],
      "status": "active",
      "createdBy": "user-42",
      "storageType": "local",
      "createdAt": "2026-08-20T10:00:00.000Z",
      "updatedAt": "2026-08-20T10:00:00.000Z",
      "isLiked": true,
      "category": {
        "id": "cat-physics",
        "name": "Physics",
        "slug": "physics"
      },
      "creator": {
        "id": "creator-1",
        "name": "Dr. Sarah",
        "avatar": "https://i.ibb.co.com/avatar.jpg"
      },
      "stats": {
        "viewsCount": 1250,
        "likesCount": 420,
        "commentsCount": 18
      }
    };

    final videoItem = VideoItemModel.fromJson(sampleJson);
    expect(videoItem.id, 'vid-999');
    expect(videoItem.title, 'Quantum Computing 101');
    expect(videoItem.subtitle, 'Understanding qubits and superposition');
    expect(videoItem.isLiked, isTrue);
    expect(videoItem.categoryName, 'Physics');
    expect(videoItem.creatorName, 'Dr. Sarah');
    expect(videoItem.stats.viewsCount, 1250);
    expect(videoItem.stats.likesCount, 420);
    expect(videoItem.stats.commentsCount, 18);
    expect(videoItem.hashtags, contains('quantum'));
    expect(videoItem.displayThumbnail, 'https://api.kuriusapp.cloud/uploads/thumbnails/quantum.jpg');
    expect(videoItem.fullVideoUrl, 'https://api.kuriusapp.cloud/uploads/videos/quantum.mp4');

    final videoModel = VideoModel.fromJson(sampleJson);
    expect(videoModel.id, 'vid-999');
    expect(videoModel.initialLikes, 420);
    expect(videoModel.initialViews, 1250);
    expect(videoModel.initialComments, 18);
    expect(videoModel.creatorName, 'Dr. Sarah');
    expect(videoModel.categoryName, 'Physics');
    expect(videoModel.displayThumbnail, 'https://api.kuriusapp.cloud/uploads/thumbnails/quantum.jpg');
    expect(videoModel.fullVideoUrl, 'https://api.kuriusapp.cloud/uploads/videos/quantum.mp4');
    expect(videoModel.hashtags.length, 3);
  });

  test('CategoryVideosController State & Pagination Defaults', () {
    final catController = Get.put(CategoryVideosController());
    expect(catController.videos, isEmpty);
    expect(catController.isLoading.value, isFalse);
    expect(catController.isLoadingMore.value, isFalse);
    expect(catController.nextCursor.value, isNull);
    expect(catController.hasNextPage.value, isTrue);

    const category = CategoryModel(id: 'cat-1', name: 'Comedy', slug: 'comedy');
    catController.category.value = category;
    catController.categoryId.value = category.id;
    catController.categoryName.value = category.title;
    expect(catController.categoryName.value, 'Comedy');
  });

  test('PaginationMeta Cursor and Pagination Parsing Test', () {
    final metaJson = {
      "limit": 10,
      "nextCursor": "cursor-abc-123",
      "hasNextPage": true
    };

    final meta = PaginationMeta.fromJson(metaJson);
    expect(meta.limit, 10);
    expect(meta.nextCursor, 'cursor-abc-123');
    expect(meta.hasNextPage, isTrue);
  });

  test('VideoModel full video URL and fallback thumbnail tests', () {
    const videoNoThumb = VideoModel(
      id: 'vid-123',
      title: 'Curiosity in Physics',
      videoUrl: '/uploads/videos/790f0ee3-b99f-4330-8bc3-86d37d56ff12.mp4',
    );

    // Ensure fallback thumbnail is non-empty and starts with https://
    expect(videoNoThumb.displayThumbnail, isNotEmpty);
    expect(videoNoThumb.displayThumbnail.startsWith('https://'), isTrue);

    // Ensure fullVideoUrl resolves to https://api.kuriusapp.cloud/...
    expect(
      videoNoThumb.fullVideoUrl,
      'https://api.kuriusapp.cloud/uploads/videos/790f0ee3-b99f-4330-8bc3-86d37d56ff12.mp4',
    );

    // Test default fallback video url when empty
    const videoEmptyUrl = VideoModel(
      id: 'vid-456',
      title: 'Test',
      videoUrl: '',
    );
    expect(videoEmptyUrl.fullVideoUrl, VideoModel.defaultSampleVideoUrl);

    // Test unauthenticated like/comment check
    Get.put(StorageService());
    final videoController = Get.put(VideoScrollController());

    videoController.toggleLike('vid-123');
    expect(videoController.likedMap['vid-123'] ?? false, isFalse);

    videoController.addComment('A test comment');
    expect(videoController.comments, isEmpty);

    // Test format duration
    expect(videoController.formatDuration(65), '1:05');
    expect(videoController.formatDuration(0), '0:00');
  });

  test('HomeController and VideoModel defaults to 0 and empty', () {
    const video = VideoModel(
      id: 'v1',
      title: 'Sample Video',
      videoUrl: '',
      duration: '',
    );
    expect(video.initialLikes, 0);
    expect(video.initialComments, 0);
    expect(video.description, '');

    final homeController = Get.put(HomeController());
    expect(homeController.categories, isEmpty);
    expect(homeController.latestVideos, isEmpty);
  });
}
