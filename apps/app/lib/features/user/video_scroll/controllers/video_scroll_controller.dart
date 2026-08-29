import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:video_player/video_player.dart';
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
  VideoPlayerController? activePlayerController;

  // Active Videos List
  final RxList<VideoModel> videos = <VideoModel>[].obs;
  final RxInt currentIndex = 0.obs;

  // Video Player States
  final RxBool isVideoInitialized = false.obs;
  final RxBool isBuffering = false.obs;
  final RxBool isPlaying = true.obs;
  final RxBool isMuted = false.obs;
  final RxDouble currentPosition = 0.0.obs; // in seconds
  final RxDouble totalDuration = 0.0.obs; // in seconds
  final RxBool showControls = false.obs;

  // Pagination States
  int currentPage = 1;
  final RxBool isLoadingMore = false.obs;
  final RxBool hasMoreVideos = true.obs;

  // Interaction States per video
  final RxMap<String, bool> likedMap = <String, bool>{}.obs;
  final RxMap<String, int> likesCountMap = <String, int>{}.obs;

  // Comments (empty by default)
  final RxList<CommentItem> comments = <CommentItem>[].obs;
  final TextEditingController commentInputController = TextEditingController();

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

    _initVideoStates();

    if (videos.isNotEmpty) {
      initializeVideoPlayer(currentIndex.value);
    }
  }

  void _initVideoStates() {
    for (var video in videos) {
      likedMap.putIfAbsent(video.id, () => false);
      likesCountMap.putIfAbsent(video.id, () => video.initialLikes);
    }
  }

  Future<void> _fetchFallbackVideos() async {
    final repo = videoRepository ??
        (Get.isRegistered<VideoRepository>()
            ? Get.find<VideoRepository>()
            : null);
    if (repo != null) {
      final res = await repo.fetchVideos(page: 1, limit: 10);
      if (res.data != null && res.data!.isNotEmpty) {
        videos.value = res.data!
            .map((item) => VideoModel.fromVideoItem(item))
            .toList();
        _initVideoStates();
        initializeVideoPlayer(0);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Video Player Lifecycle & Playback Management
  // ---------------------------------------------------------------------------

  Future<void> initializeVideoPlayer(int index) async {
    if (index < 0 || index >= videos.length) return;

    try {
      isVideoInitialized.value = false;
      isBuffering.value = true;

      // Safely dispose active player
      final oldController = activePlayerController;
      activePlayerController = null;
      if (oldController != null) {
        await oldController.dispose();
      }

      final targetVideo = videos[index];
      final videoUrl = targetVideo.fullVideoUrl;
      debugPrint('🎬 [VideoScrollController] Initializing video player for URL: $videoUrl');

      final controller = VideoPlayerController.networkUrl(Uri.parse(videoUrl));
      activePlayerController = controller;

      await controller.initialize();
      controller.setLooping(true);
      controller.setVolume(isMuted.value ? 0.0 : 1.0);

      // Listen for playback updates
      controller.addListener(() {
        if (activePlayerController == controller && controller.value.isInitialized) {
          currentPosition.value =
              controller.value.position.inMilliseconds / 1000.0;
          totalDuration.value =
              controller.value.duration.inMilliseconds / 1000.0;
          isPlaying.value = controller.value.isPlaying;
          isBuffering.value = controller.value.isBuffering;
        }
      });

      await controller.play();
      isVideoInitialized.value = true;
      isBuffering.value = false;
    } catch (e) {
      debugPrint('⚠️ [VideoScrollController] Video playback initialization failed: $e');
      isVideoInitialized.value = false;
      isBuffering.value = false;
    }
  }

  void onPageChanged(int index) {
    currentIndex.value = index;
    _resetControlsHideTimer();

    // Check Pagination Trigger
    if (index >= videos.length - 2 && hasMoreVideos.value && !isLoadingMore.value) {
      loadMoreVideos();
    }

    // Initialize player for newly scrolled video
    initializeVideoPlayer(index);
  }

  // ---------------------------------------------------------------------------
  // Pagination / Infinite Scrolling
  // ---------------------------------------------------------------------------

  Future<void> loadMoreVideos() async {
    if (isLoadingMore.value || !hasMoreVideos.value) return;

    isLoadingMore.value = true;
    debugPrint('🔄 [VideoScrollController.loadMoreVideos] Fetching page ${currentPage + 1}...');

    try {
      final repo = videoRepository ??
          (Get.isRegistered<VideoRepository>()
              ? Get.find<VideoRepository>()
              : null);

      if (repo != null) {
        final res = await repo.fetchVideos(page: currentPage + 1, limit: 10);
        if (res.data != null && res.data!.isNotEmpty) {
          final newVideos = res.data!
              .map((item) => VideoModel.fromVideoItem(item))
              .toList();

          videos.addAll(newVideos);
          currentPage++;
          _initVideoStates();

          if (newVideos.length < 10) {
            hasMoreVideos.value = false;
          }
        } else {
          hasMoreVideos.value = false;
        }
      }
    } catch (e) {
      debugPrint('⚠️ [VideoScrollController.loadMoreVideos] Error loading page: $e');
    } finally {
      isLoadingMore.value = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Player Controls (Play, Pause, Mute, 10s Skip, Slider Seek)
  // ---------------------------------------------------------------------------

  void togglePlayPause() {
    if (activePlayerController != null && isVideoInitialized.value) {
      if (activePlayerController!.value.isPlaying) {
        activePlayerController!.pause();
      } else {
        activePlayerController!.play();
      }
    } else {
      isPlaying.value = !isPlaying.value;
    }
    triggerShowControls();
  }

  void toggleMute() {
    isMuted.value = !isMuted.value;
    activePlayerController?.setVolume(isMuted.value ? 0.0 : 1.0);
  }

  void skipForward10() {
    if (activePlayerController != null && isVideoInitialized.value) {
      final target = activePlayerController!.value.position + const Duration(seconds: 10);
      final maxDuration = activePlayerController!.value.duration;
      activePlayerController!.seekTo(target > maxDuration ? maxDuration : target);
    } else {
      currentPosition.value =
          (currentPosition.value + 10.0).clamp(0.0, totalDuration.value);
    }
    triggerShowControls();
  }

  void skipBackward10() {
    if (activePlayerController != null && isVideoInitialized.value) {
      final target = activePlayerController!.value.position - const Duration(seconds: 10);
      activePlayerController!.seekTo(target < Duration.zero ? Duration.zero : target);
    } else {
      currentPosition.value =
          (currentPosition.value - 10.0).clamp(0.0, totalDuration.value);
    }
    triggerShowControls();
  }

  void seekTo(double seconds) {
    if (activePlayerController != null && isVideoInitialized.value) {
      activePlayerController!.seekTo(Duration(milliseconds: (seconds * 1000).toInt()));
    } else {
      currentPosition.value = seconds.clamp(0.0, totalDuration.value);
    }
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

    // Trigger background API call
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
    _controlsHideTimer?.cancel();
    activePlayerController?.dispose();
    activePlayerController = null;
    pageController.dispose();
    commentInputController.dispose();
    super.onClose();
  }
}
