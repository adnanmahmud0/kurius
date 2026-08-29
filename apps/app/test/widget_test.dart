import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:kurius/core/storage/storage_service.dart';
import 'package:kurius/data/models/user/user_model.dart';
import 'package:kurius/features/user/auth/controllers/auth_controller.dart';
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

  test('VideoModel fallback thumbnail and auth protection on actions', () {
    const videoNoThumb = VideoModel(
      id: 'vid-123',
      title: 'Curiosity in Physics',
      category: 'Science',
      imageUrl: '',
    );

    // Ensure fallback thumbnail is non-empty and starts with https://
    expect(videoNoThumb.displayThumbnail, isNotEmpty);
    expect(videoNoThumb.displayThumbnail.startsWith('https://'), isTrue);

    // Test unauthenticated like/comment check
    Get.put(StorageService());
    final videoController = Get.put(VideoScrollController());

    videoController.toggleLike('vid-123');
    // Expect like not added for unauthenticated guest
    expect(videoController.likedMap['vid-123'] ?? false, isFalse);

    videoController.addComment('A test comment');
    // Expect comment not added for unauthenticated guest
    expect(videoController.comments, isEmpty);
  });

  test('HomeController and VideoModel defaults to 0 and empty', () {
    const video = VideoModel(
      id: 'v1',
      title: 'Sample Video',
      category: 'Science',
      imageUrl: '',
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
