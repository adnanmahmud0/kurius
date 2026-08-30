import '../../../../data/models/category/category_model.dart';
import '../../../../data/models/video/video_counts_model.dart';
import '../../../../data/models/video/video_creator_model.dart';
import '../../../../data/models/video/video_item_model.dart';

/// Primary Video model matching backend OpenAPI spec
class VideoModel {
  final String id;
  final String title;
  final String? subtitle;
  final String videoUrl;
  final String? thumbnailUrl;
  final String categoryId;
  final CategoryModel? category;
  final List<String> hashtags;
  final String status;
  final String createdBy;
  final VideoCreatorModel? creator;
  final String storageType;
  final VideoStatsModel stats;
  final bool isLiked;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String duration;

  const VideoModel({
    required this.id,
    required this.title,
    this.subtitle,
    required this.videoUrl,
    this.thumbnailUrl,
    this.categoryId = '',
    this.category,
    this.hashtags = const [],
    this.status = 'active',
    this.createdBy = '',
    this.creator,
    this.storageType = 'local',
    this.stats = const VideoStatsModel(),
    this.isLiked = false,
    this.createdAt,
    this.updatedAt,
    this.duration = '',
  });

  int get initialLikes => stats.likesCount;
  int get initialComments => stats.commentsCount;
  int get initialViews => stats.viewsCount;
  String get description => subtitle ?? '';
  String get imageUrl => thumbnailUrl ?? '';

  String get categoryName => category?.name ?? 'General';
  String get creatorName => creator?.name ?? 'Kurius Creator';
  String get creatorAvatar =>
      creator?.displayAvatar ?? 'https://i.ibb.co.com/Cs5Kr1gT/dc262f1cd78130b972c5dbd8643ad972.jpg';

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

  /// Returns actual absolute thumbnail URL from backend or fallback image
  String get displayThumbnail {
    final raw = (thumbnailUrl != null && thumbnailUrl!.trim().isNotEmpty)
        ? thumbnailUrl!.trim()
        : imageUrl.trim();

    if (raw.isEmpty) {
      final index = id.hashCode.abs() % fallbackThumbnails.length;
      return fallbackThumbnails[index];
    }

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }

    final path = raw.startsWith('/') ? raw : '/$raw';
    return 'https://api.kuriusapp.cloud$path';
  }

  factory VideoModel.fromJson(Map<String, dynamic> json) {
    List<String> tags = [];
    if (json['hashtags'] != null && json['hashtags'] is List) {
      tags = (json['hashtags'] as List).map((e) => e.toString()).toList();
    }

    CategoryModel? cat;
    if (json['category'] != null && json['category'] is Map<String, dynamic>) {
      cat = CategoryModel.fromJson(json['category'] as Map<String, dynamic>);
    }

    VideoCreatorModel? creatorModel;
    if (json['creator'] != null && json['creator'] is Map<String, dynamic>) {
      creatorModel = VideoCreatorModel.fromJson(json['creator'] as Map<String, dynamic>);
    }

    VideoStatsModel statsModel = const VideoStatsModel();
    if (json['stats'] != null && json['stats'] is Map<String, dynamic>) {
      statsModel = VideoStatsModel.fromJson(json['stats'] as Map<String, dynamic>);
    } else if (json['_count'] != null && json['_count'] is Map<String, dynamic>) {
      statsModel = VideoStatsModel.fromJson(json['_count'] as Map<String, dynamic>);
    }

    return VideoModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String?,
      videoUrl: json['videoUrl'] as String? ?? '',
      thumbnailUrl: json['thumbnailUrl'] as String? ?? json['imageUrl'] as String?,
      categoryId: json['categoryId'] as String? ?? (cat?.id ?? ''),
      category: cat,
      hashtags: tags,
      status: json['status'] as String? ?? 'active',
      createdBy: json['createdBy'] as String? ?? '',
      creator: creatorModel,
      storageType: json['storageType'] as String? ?? 'local',
      stats: statsModel,
      isLiked: json['isLiked'] as bool? ?? false,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'] as String) : null,
    );
  }

  factory VideoModel.fromVideoItem(VideoItemModel item) {
    return VideoModel(
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      videoUrl: item.videoUrl,
      thumbnailUrl: item.thumbnailUrl,
      categoryId: item.categoryId,
      category: item.category,
      hashtags: item.hashtags,
      status: item.status,
      createdBy: item.createdBy,
      creator: item.creator,
      storageType: item.storageType,
      stats: item.stats,
      isLiked: item.isLiked,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        if (subtitle != null) 'subtitle': subtitle,
        'videoUrl': videoUrl,
        if (thumbnailUrl != null) 'thumbnailUrl': thumbnailUrl,
        'categoryId': categoryId,
        if (category != null) 'category': category!.toJson(),
        'hashtags': hashtags,
        'status': status,
        'createdBy': createdBy,
        if (creator != null) 'creator': creator!.toJson(),
        'storageType': storageType,
        'stats': stats.toJson(),
        'isLiked': isLiked,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
      };
}
