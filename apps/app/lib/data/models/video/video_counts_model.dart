/// Video Engagement metrics (_count object)
class VideoCountsModel {
  final int views;
  final int likes;
  final int comments;

  const VideoCountsModel({
    this.views = 0,
    this.likes = 0,
    this.comments = 0,
  });

  factory VideoCountsModel.fromJson(Map<String, dynamic> json) {
    return VideoCountsModel(
      views: (json['views'] as num?)?.toInt() ?? 0,
      likes: (json['likes'] as num?)?.toInt() ?? 0,
      comments: (json['comments'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'views': views,
        'likes': likes,
        'comments': comments,
      };
}
