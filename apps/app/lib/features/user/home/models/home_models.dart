import 'package:flutter/material.dart';

class CategoryModel {
  final String id;
  final String title;
  final IconData icon;
  final Color color;

  const CategoryModel({
    required this.id,
    required this.title,
    required this.icon,
    required this.color,
  });
}

class VideoItemModel {
  final String id;
  final String title;
  final String category;
  final String imageUrl;
  final String duration;

  const VideoItemModel({
    required this.id,
    required this.title,
    required this.category,
    required this.imageUrl,
    required this.duration,
  });
}
