class VideoModel {
  final String id;
  final String title;
  final String category;
  final String imageUrl;
  final String videoUrl;
  final String duration;
  final int initialLikes;
  final int initialComments;
  final String description;

  const VideoModel({
    required this.id,
    required this.title,
    required this.category,
    required this.imageUrl,
    this.videoUrl = '',
    required this.duration,
    this.initialLikes = 1240,
    this.initialComments = 85,
    this.description = 'Explore the fascinating stories and legends of ancient mythology.',
  });
}
