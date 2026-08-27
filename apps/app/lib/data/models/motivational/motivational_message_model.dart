/// Motivational Message / Quote model matching backend API schema
class MotivationalMessageModel {
  final String id;
  final String message;
  final String? author;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const MotivationalMessageModel({
    required this.id,
    required this.message,
    this.author,
    this.status = 'active',
    this.createdAt,
    this.updatedAt,
  });

  String get displayAuthor => (author != null && author!.trim().isNotEmpty) ? author!.trim() : 'Unknown';

  String get formattedText => (author != null && author!.trim().isNotEmpty)
      ? '$message\n— $author'
      : message;

  factory MotivationalMessageModel.fromJson(Map<String, dynamic> json) {
    return MotivationalMessageModel(
      id: json['id'] as String? ?? '',
      message: json['message'] as String? ?? '',
      author: json['author'] as String?,
      status: json['status'] as String? ?? 'active',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'message': message,
        if (author != null) 'author': author,
        'status': status,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
      };
}
