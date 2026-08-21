import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

/// Category model
class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String status;
  final DateTime? createdAt;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.status = 'active',
    this.createdAt,
  });

  String get title => name;

  Color get displayColor {
    final colors = [
      AppColors.orangeAccent,
      const Color(0xFF6C83E2),
      const Color(0xFF10B981),
      const Color(0xFF8B5CF6),
      const Color(0xFFEC4899),
      const Color(0xFFF59E0B),
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
    return Icons.category_rounded;
  }

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      status: json['status'] as String? ?? 'active',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'status': status,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      };
}
