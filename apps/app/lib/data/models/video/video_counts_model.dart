/// Video Engagement Stats & Metrics (supports both 'stats' and '_count' objects from API)
class VideoStatsModel {
  final int viewsCount;
  final int likesCount;
  final int commentsCount;

  const VideoStatsModel({
    this.viewsCount = 0,
    this.likesCount = 0,
    this.commentsCount = 0,
  });

  int get views => viewsCount;
  int get likes => likesCount;
  int get comments => commentsCount;

  factory VideoStatsModel.fromJson(Map<String, dynamic> json) {
    return VideoStatsModel(
      viewsCount: (json['viewsCount'] as num?)?.toInt() ??
          (json['views'] as num?)?.toInt() ??
          0,
      likesCount: (json['likesCount'] as num?)?.toInt() ??
          (json['likes'] as num?)?.toInt() ??
          0,
      commentsCount: (json['commentsCount'] as num?)?.toInt() ??
          (json['comments'] as num?)?.toInt() ??
          0,
    );
  }

  Map<String, dynamic> toJson() => {
        'viewsCount': viewsCount,
        'likesCount': likesCount,
        'commentsCount': commentsCount,
      };
}

/// Backwards-compatible alias for VideoCountsModel
typedef VideoCountsModel = VideoStatsModel;
