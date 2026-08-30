import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

/// Category model matching backend API schema
class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String? thumbnail;
  final String status;
  final int videosCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.thumbnail,
    this.status = 'active',
    this.videosCount = 0,
    this.createdAt,
    this.updatedAt,
  });

  String get title => name;

  String? get displayThumbnail {
    if (thumbnail == null || thumbnail!.trim().isEmpty) return null;
    final raw = thumbnail!.trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    final path = raw.startsWith('/') ? raw : '/$raw';
    return 'https://api.kuriusapp.cloud$path';
  }

  Color get displayColor {
    final colors = [
      AppColors.orangeAccent,
      const Color(0xFF6C83E2),
      const Color(0xFF10B981),
      const Color(0xFF8B5CF6),
      const Color(0xFFEC4899),
      const Color(0xFFF59E0B),
      const Color(0xFF06B6D4),
      const Color(0xFF3B82F6),
    ];
    return colors[name.hashCode.abs() % colors.length];
  }

  IconData get displayIcon {
    final lower = name.toLowerCase();
    if (lower.contains('myth')) return Icons.account_balance_rounded;
    if (lower.contains('hist')) return Icons.auto_stories_rounded;
    if (lower.contains('sci')) return Icons.science_rounded;
    if (lower.contains('space') || lower.contains('astro')) return Icons.rocket_launch_rounded;
    if (lower.contains('art')) return Icons.palette_rounded;
    if (lower.contains('sport')) return Icons.sports_basketball_rounded;
    if (lower.contains('tech')) return Icons.computer_rounded;
    if (lower.contains('edu')) return Icons.school_rounded;
    if (lower.contains('comed')) return Icons.sentiment_very_satisfied_rounded;
    if (lower.contains('music')) return Icons.music_note_rounded;
    if (lower.contains('game') || lower.contains('gaming')) return Icons.sports_esports_rounded;
    return Icons.category_rounded;
  }

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    int count = 0;
    if (json['_count'] != null && json['_count'] is Map<String, dynamic>) {
      count = json['_count']['videos'] as int? ?? 0;
    } else if (json['videosCount'] != null) {
      count = json['videosCount'] as int? ?? 0;
    }

    return CategoryModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      thumbnail: json['thumbnail'] as String?,
      status: json['status'] as String? ?? 'active',
      videosCount: count,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        if (thumbnail != null) 'thumbnail': thumbnail,
        'status': status,
        '_count': {'videos': videosCount},
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
      };
}
