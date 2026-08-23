import '../category/category_model.dart';
import 'video_counts_model.dart';
import 'video_creator_model.dart';

/// Full Video Entity Model matching backend API response
class VideoItemModel {
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
  final VideoCountsModel counts;
  final bool isLiked;
  final DateTime? createdAt;

  const VideoItemModel({
    required this.id,
    required this.title,
    this.subtitle,
    required this.videoUrl,
    this.thumbnailUrl,
    required this.categoryId,
    this.category,
    this.hashtags = const [],
    this.status = 'active',
    required this.createdBy,
    this.creator,
    this.storageType = 'local',
    this.counts = const VideoCountsModel(),
    this.isLiked = false,
    this.createdAt,
  });

  String get displayThumbnail {
    if (thumbnailUrl != null && thumbnailUrl!.isNotEmpty) {
      return thumbnailUrl!;
    }
    return 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop';
  }

  String get categoryName => category?.name ?? 'General';

  factory VideoItemModel.fromJson(Map<String, dynamic> json) {
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

    VideoCountsModel countsModel = const VideoCountsModel();
    if (json['_count'] != null && json['_count'] is Map<String, dynamic>) {
      countsModel = VideoCountsModel.fromJson(json['_count'] as Map<String, dynamic>);
    }

    return VideoItemModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String?,
      videoUrl: json['videoUrl'] as String? ?? '',
      thumbnailUrl: json['thumbnailUrl'] as String?,
      categoryId: json['categoryId'] as String? ?? '',
      category: cat,
      hashtags: tags,
      status: json['status'] as String? ?? 'active',
      createdBy: json['createdBy'] as String? ?? '',
      creator: creatorModel,
      storageType: json['storageType'] as String? ?? 'local',
      counts: countsModel,
      isLiked: json['isLiked'] as bool? ?? false,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
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
        '_count': counts.toJson(),
        'isLiked': isLiked,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      };
}
