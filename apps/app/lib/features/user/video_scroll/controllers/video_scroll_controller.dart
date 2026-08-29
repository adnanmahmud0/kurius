import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../app/routes/app_routes.dart';
import '../../../../core/storage/storage_service.dart';
import '../../../../data/repositories/video_repository.dart';
import '../models/video_model.dart';

class CommentItem {
  final String userName;
  final String comment;
  final String timeAgo;
  final String avatarLetter;

  CommentItem({
    required this.userName,
    required this.comment,
    required this.timeAgo,
    required this.avatarLetter,
  });
}

class VideoScrollController extends GetxController {
  final VideoRepository? videoRepository;

  VideoScrollController({this.videoRepository});

  late PageController pageController;

  // Active Videos List
  final RxList<VideoModel> videos = <VideoModel>[].obs;
  final RxInt currentIndex = 0.obs;

  // Playback States
  final RxBool isPlaying = true.obs;
  final RxBool isMuted = false.obs;
  final RxDouble currentPosition = 0.0.obs; // In seconds
  final RxDouble totalDuration = 60.0.obs; // In seconds
  final RxBool showControls = false.obs;

  // Interaction States per video (liked states & like counts default to 0)
  final RxMap<String, bool> likedMap = <String, bool>{}.obs;
  final RxMap<String, int> likesCountMap = <String, int>{}.obs;

  // Comments (empty by default, no demo values)
  final RxList<CommentItem> comments = <CommentItem>[].obs;

  final TextEditingController commentInputController = TextEditingController();

  Timer? _playbackTimer;
  Timer? _controlsHideTimer;

  @override
  void onInit() {
    super.onInit();

    // Check passed arguments
    if (Get.arguments != null && Get.arguments is Map) {
      final args = Get.arguments as Map;
      if (args['videos'] != null) {
        videos.value = List<VideoModel>.from(args['videos']);
      }
      final initialIdx = args['initialIndex'] as int? ?? 0;
      currentIndex.value = initialIdx;
      pageController = PageController(initialPage: initialIdx);
    } else {
      pageController = PageController(initialPage: 0);
      _fetchFallbackVideos();
    }

    // Initialize like maps with default 0 for numbers
    _initVideoStates();

    _startPlaybackSimulation();
  }

  void _initVideoStates() {
    for (var video in videos) {
      likedMap[video.id] = false;
      likesCountMap[video.id] = video.initialLikes;
    }
  }

  Future<void> _fetchFallbackVideos() async {
    final repo = videoRepository ??
        (Get.isRegistered<VideoRepository>()
            ? Get.find<VideoRepository>()
            : null);
    if (repo != null) {
      final res = await repo.fetchVideos(limit: 20);
      if (res.data != null) {
        videos.value = res.data!
            .map((item) => VideoModel.fromVideoItem(item))
            .toList();
        _initVideoStates();
      }
    }
  }

  void _startPlaybackSimulation() {
    _playbackTimer?.cancel();
    _playbackTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      if (isPlaying.value) {
        if (currentPosition.value < totalDuration.value) {
          currentPosition.value += 0.5;
        } else {
          // Loop video playback
          currentPosition.value = 0.0;
        }
      }
    });
  }

  void onPageChanged(int index) {
    currentIndex.value = index;
    currentPosition.value = 0.0;
    isPlaying.value = true;
    _resetControlsHideTimer();
  }

  void togglePlayPause() {
    isPlaying.value = !isPlaying.value;
    triggerShowControls();
  }

  void toggleMute() {
    isMuted.value = !isMuted.value;
  }

  void skipForward10() {
    currentPosition.value =
        (currentPosition.value + 10.0).clamp(0.0, totalDuration.value);
    triggerShowControls();
  }

  void skipBackward10() {
    currentPosition.value =
        (currentPosition.value - 10.0).clamp(0.0, totalDuration.value);
    triggerShowControls();
  }

  void seekTo(double seconds) {
    currentPosition.value = seconds.clamp(0.0, totalDuration.value);
  }

  bool _checkAuthRequirement(String action) {
    final storage = Get.isRegistered<StorageService>() ? Get.find<StorageService>() : StorageService.to;
    if (!storage.isLoggedIn()) {
      if (Get.context != null && Get.overlayContext != null) {
        Get.snackbar(
          'Sign In Required',
          'Please sign up or sign in to $action videos.',
          snackPosition: SnackPosition.TOP,
          backgroundColor: Colors.black87,
          colorText: Colors.white,
          margin: const EdgeInsets.all(16),
          borderRadius: 14,
          duration: const Duration(seconds: 3),
        );
      }
      if (Get.key.currentState != null) {
        Get.toNamed(AppRoutes.auth);
      }
      return false;
    }
    return true;
  }

  void toggleLike(String videoId) {
    if (!_checkAuthRequirement('like')) return;

    final currentLiked = likedMap[videoId] ?? false;
    likedMap[videoId] = !currentLiked;
    final currentLikes = likesCountMap[videoId] ?? 0;
    likesCountMap[videoId] =
        !currentLiked ? currentLikes + 1 : (currentLikes > 0 ? currentLikes - 1 : 0);

    // Trigger background API call if registered
    final repo = videoRepository ??
        (Get.isRegistered<VideoRepository>()
            ? Get.find<VideoRepository>()
            : null);
    if (repo != null) {
      if (!currentLiked) {
        repo.likeVideo(videoId);
      } else {
        repo.unlikeVideo(videoId);
      }
    }
  }

  void addComment(String text) {
    if (text.trim().isEmpty) return;
    if (!_checkAuthRequirement('comment on')) return;

    final storage = Get.isRegistered<StorageService>() ? Get.find<StorageService>() : StorageService.to;
    final user = storage.getUserData();
    final name = user?['name'] as String? ?? 'You';

    comments.insert(
      0,
      CommentItem(
        userName: name,
        comment: text.trim(),
        timeAgo: 'Just now',
        avatarLetter: name.isNotEmpty ? name[0].toUpperCase() : 'Y',
      ),
    );
    commentInputController.clear();
  }

  void triggerShowControls() {
    showControls.value = true;
    _resetControlsHideTimer();
  }

  void _resetControlsHideTimer() {
    _controlsHideTimer?.cancel();
    _controlsHideTimer = Timer(const Duration(seconds: 3), () {
      showControls.value = false;
    });
  }

  String formatDuration(double seconds) {
    final int minutes = seconds ~/ 60;
    final int remainingSeconds = (seconds % 60).toInt();
    return '${minutes.toString().padLeft(1, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  @override
  void onClose() {
    _playbackTimer?.cancel();
    _controlsHideTimer?.cancel();
    pageController.dispose();
    commentInputController.dispose();
    super.onClose();
  }
}
