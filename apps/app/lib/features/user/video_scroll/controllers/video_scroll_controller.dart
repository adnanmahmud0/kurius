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

  // Active Videos List & Index
  final RxList<VideoModel> videos = <VideoModel>[].obs;
  final RxInt currentIndex = 0.obs;

  // Loading & State Management
  final RxBool isLoading = false.obs;
  final RxBool isLoadingMore = false.obs;
  final RxBool isRefreshing = false.obs;
  final RxString errorMessage = ''.obs;
  final RxBool isUnauthorized = false.obs;

  // Filter & Query States
  final RxString selectedCategoryId = ''.obs;
  final RxString searchQuery = ''.obs;

  // Cursor Pagination States
  final Rx<String?> nextCursor = Rx<String?>(null);
  final RxBool hasNextPage = true.obs;

  // Video Playback States
  final RxBool isVideoInitialized = false.obs;
  final RxBool isBuffering = false.obs;
  final RxBool isPlaying = true.obs;
  final RxBool isMuted = false.obs;
  final RxDouble currentPosition = 0.0.obs; // in seconds
  final RxDouble totalDuration = 0.0.obs; // in seconds
  final RxBool showControls = false.obs;

  // Interaction States per video
  final RxMap<String, bool> likedMap = <String, bool>{}.obs;
  final RxMap<String, int> likesCountMap = <String, int>{}.obs;
  final RxMap<String, int> viewsCountMap = <String, int>{}.obs;

  // Comments List
  final RxList<CommentItem> comments = <CommentItem>[].obs;
  final TextEditingController commentInputController = TextEditingController();

  Timer? _controlsHideTimer;

  @override
  void onInit() {
    super.onInit();

    // Check passed arguments (e.g. from Home or Explore)
    if (Get.arguments != null && Get.arguments is Map) {
      final args = Get.arguments as Map;
      if (args['videos'] != null) {
        videos.value = List<VideoModel>.from(args['videos']);
      }
      if (args['categoryId'] != null) {
        selectedCategoryId.value = args['categoryId'] as String;
      }
      if (args['search'] != null) {
        searchQuery.value = args['search'] as String;
      }
      final initialIdx = args['initialIndex'] as int? ?? 0;
      currentIndex.value = initialIdx;
      pageController = PageController(initialPage: initialIdx);
    } else {
      pageController = PageController(initialPage: 0);
    }

    _initVideoStates();

    if (videos.isNotEmpty) {
      initializeVideoPlayer(currentIndex.value);
    } else {
      loadInitialVideos(
        categoryId: selectedCategoryId.value.isNotEmpty ? selectedCategoryId.value : null,
        search: searchQuery.value.isNotEmpty ? searchQuery.value : null,
      );
    }
  }

  void _initVideoStates() {
    for (var video in videos) {
      likedMap.putIfAbsent(video.id, () => video.isLiked);
      likesCountMap.putIfAbsent(video.id, () => video.initialLikes);
      viewsCountMap.putIfAbsent(video.id, () => video.initialViews);
    }
  }

  VideoRepository get _effectiveRepository =>
      videoRepository ??
      (Get.isRegistered<VideoRepository>()
          ? Get.find<VideoRepository>()
          : const VideoRepository());

  // ---------------------------------------------------------------------------
  // Video Feed Fetching with Cursor Pagination
  // ---------------------------------------------------------------------------

  /// Initial load or filter change: resets cursor and loads page 1
  Future<void> loadInitialVideos({String? categoryId, String? search}) async {
    isLoading.value = true;
    errorMessage.value = '';
    isUnauthorized.value = false;
    nextCursor.value = null;
    hasNextPage.value = true;

    if (categoryId != null) selectedCategoryId.value = categoryId;
    if (search != null) searchQuery.value = search;

    try {
      final res = selectedCategoryId.value.isNotEmpty
          ? await _effectiveRepository.getVideosByCategory(
              selectedCategoryId.value,
              limit: 10,
            )
          : await _effectiveRepository.fetchVideos(
              limit: 10,
              search: searchQuery.value.isNotEmpty ? searchQuery.value : null,
              categoryId: selectedCategoryId.value.isNotEmpty ? selectedCategoryId.value : null,
            );

      if (res.statusCode == 401) {
        isUnauthorized.value = true;
      }

      if (res.data != null && res.data!.isNotEmpty) {
        videos.value = res.data!
            .map((item) => VideoModel.fromVideoItem(item))
            .toList();
        nextCursor.value = res.meta?.nextCursor;
        hasNextPage.value = res.meta?.hasNextPage ?? (res.meta?.nextCursor != null);
        _initVideoStates();

        if (videos.isNotEmpty) {
          initializeVideoPlayer(0);
        }
      } else {
        if (!isUnauthorized.value && (res.message != null && res.message!.isNotEmpty && !res.success)) {
          errorMessage.value = res.message!;
        }
        hasNextPage.value = false;
      }
    } catch (e) {
      debugPrint('❌ [VideoScrollController.loadInitialVideos] Error: $e');
      errorMessage.value = 'Failed to load video feed. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  /// Pull-to-refresh: resets cursor and reloads first page
  Future<void> refreshVideos() async {
    isRefreshing.value = true;
    errorMessage.value = '';
    nextCursor.value = null;
    hasNextPage.value = true;

    try {
      final res = selectedCategoryId.value.isNotEmpty
          ? await _effectiveRepository.getVideosByCategory(
              selectedCategoryId.value,
              limit: 10,
            )
          : await _effectiveRepository.fetchVideos(
              limit: 10,
              search: searchQuery.value.isNotEmpty ? searchQuery.value : null,
              categoryId: selectedCategoryId.value.isNotEmpty ? selectedCategoryId.value : null,
            );

      if (res.data != null && res.data!.isNotEmpty) {
        videos.value = res.data!
            .map((item) => VideoModel.fromVideoItem(item))
            .toList();
        nextCursor.value = res.meta?.nextCursor;
        hasNextPage.value = res.meta?.hasNextPage ?? (res.meta?.nextCursor != null);
        _initVideoStates();

        final idx = currentIndex.value.clamp(0, videos.length - 1);
        initializeVideoPlayer(idx);
      }
    } catch (e) {
      debugPrint('⚠️ [VideoScrollController.refreshVideos] Error: $e');
    } finally {
      isRefreshing.value = false;
    }
  }

  /// Infinite scroll cursor pagination: appends new videos
  Future<void> loadMoreVideos() async {
    if (isLoadingMore.value || !hasNextPage.value) return;

    final cursor = nextCursor.value;
    if (cursor == null && videos.isNotEmpty) {
      // No more pages to fetch
      hasNextPage.value = false;
      return;
    }

    isLoadingMore.value = true;
    debugPrint('🔄 [VideoScrollController.loadMoreVideos] Fetching cursor: $cursor');

    try {
      final res = selectedCategoryId.value.isNotEmpty
          ? await _effectiveRepository.getVideosByCategory(
              selectedCategoryId.value,
              limit: 10,
              cursor: cursor,
            )
          : await _effectiveRepository.fetchVideos(
              limit: 10,
              cursor: cursor,
              search: searchQuery.value.isNotEmpty ? searchQuery.value : null,
              categoryId: selectedCategoryId.value.isNotEmpty ? selectedCategoryId.value : null,
            );

      if (res.data != null && res.data!.isNotEmpty) {
        final newItems = res.data!
            .map((item) => VideoModel.fromVideoItem(item))
            .toList();

        // Prevent duplicates
        final existingIds = videos.map((v) => v.id).toSet();
        final uniqueNew = newItems.where((v) => !existingIds.contains(v.id)).toList();

        videos.addAll(uniqueNew);
        nextCursor.value = res.meta?.nextCursor;
        hasNextPage.value = res.meta?.hasNextPage ?? (res.meta?.nextCursor != null);
        _initVideoStates();

        if (newItems.length < 10 || res.meta?.nextCursor == null) {
          hasNextPage.value = false;
        }
      } else {
        hasNextPage.value = false;
      }
    } catch (e) {
      debugPrint('⚠️ [VideoScrollController.loadMoreVideos] Error: $e');
    } finally {
      isLoadingMore.value = false;
    }
  }

  /// Fetch single video by ID
  Future<void> getVideoById(String id) async {
    isLoading.value = true;
    try {
      final res = await _effectiveRepository.getVideoById(id);
      if (res.data != null) {
        final video = VideoModel.fromVideoItem(res.data!);
        videos.value = [video];
        _initVideoStates();
        initializeVideoPlayer(0);
      } else {
        errorMessage.value = res.message ?? 'Video not found';
      }
    } catch (e) {
      errorMessage.value = 'Failed to load video';
    } finally {
      isLoading.value = false;
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

      // Safely dispose old player
      final oldController = activePlayerController;
      activePlayerController = null;
      if (oldController != null) {
        await oldController.dispose();
      }

      final targetVideo = videos[index];
      final videoUrl = targetVideo.fullVideoUrl;
      debugPrint('🎬 [VideoScrollController] Initializing player: $videoUrl');

      // Record view in background
      _effectiveRepository.recordView(targetVideo.id);
      final currentViews = viewsCountMap[targetVideo.id] ?? 0;
      viewsCountMap[targetVideo.id] = currentViews + 1;

      final controller = VideoPlayerController.networkUrl(Uri.parse(videoUrl));
      activePlayerController = controller;

      await controller.initialize();
      controller.setLooping(true);
      controller.setVolume(isMuted.value ? 0.0 : 1.0);

      // Synchronize player progress
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
      debugPrint('⚠️ [VideoScrollController] Video initialization failed: $e');
      isVideoInitialized.value = false;
      isBuffering.value = false;
    }
  }

  void onPageChanged(int index) {
    currentIndex.value = index;
    _resetControlsHideTimer();

    // Check Cursor Pagination Trigger
    if (index >= videos.length - 2 && hasNextPage.value && !isLoadingMore.value) {
      loadMoreVideos();
    }

    // Initialize player for newly scrolled video
    initializeVideoPlayer(index);
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

  // ---------------------------------------------------------------------------
  // User Actions (Like, Comment, Share)
  // ---------------------------------------------------------------------------

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

    // Call backend API in background
    if (!currentLiked) {
      _effectiveRepository.likeVideo(videoId);
    } else {
      _effectiveRepository.unlikeVideo(videoId);
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
