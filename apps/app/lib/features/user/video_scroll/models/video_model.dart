import '../../../../data/models/video/video_item_model.dart';

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
    this.duration = '',
    this.initialLikes = 0,
    this.initialComments = 0,
    this.description = '',
  });

  /// Default production streaming video URL
  static const String defaultSampleVideoUrl =
      'https://api.kuriusapp.cloud/uploads/videos/790f0ee3-b99f-4330-8bc3-86d37d56ff12.mp4';

  /// Resolves the absolute playable video URL
  String get fullVideoUrl {
    final raw = videoUrl.trim();
    if (raw.isEmpty) return defaultSampleVideoUrl;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    final path = raw.startsWith('/') ? raw : '/$raw';
    return 'https://api.kuriusapp.cloud$path';
  }

  /// Curated educational and curiosity fallback thumbnails when video has no thumbnail
  static const List<String> fallbackThumbnails = [
    'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=800&auto=format&fit=crop&q=80', // Curiosity / Lightbulb
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80', // Earth / Space Exploration
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', // Tech Circuit
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80', // Science Lab
    'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&auto=format&fit=crop&q=80', // Astronomy Galaxy
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80', // Nature Mountains
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80', // Mathematics / Blackboard
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80', // Biology Microscope
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', // History & Culture
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80', // Learning Book
  ];

  /// Returns actual thumbnail if available, or a deterministic curated curiosity image
  String get displayThumbnail {
    if (imageUrl.isNotEmpty) return imageUrl;
    final index = id.hashCode.abs() % fallbackThumbnails.length;
    return fallbackThumbnails[index];
  }

  factory VideoModel.fromVideoItem(VideoItemModel item) {
    final rawThumb = item.thumbnailUrl?.trim() ?? '';
    final thumb = rawThumb.isNotEmpty
        ? rawThumb
        : fallbackThumbnails[(item.id.hashCode.abs()) % fallbackThumbnails.length];

    return VideoModel(
      id: item.id,
      title: item.title,
      category: item.category?.name ?? 'General',
      imageUrl: thumb,
      videoUrl: item.videoUrl,
      duration: '',
      initialLikes: item.counts.likes,
      initialComments: item.counts.comments,
      description: item.subtitle ?? '',
    );
  }
}
