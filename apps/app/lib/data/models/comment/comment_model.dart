import '../user/user_model.dart';

/// Video Comment model matching backend OpenAPI spec
class CommentModel {
  final String id;
  final String userId;
  final String videoId;
  final String commentText;
  final UserModel? user;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const CommentModel({
    required this.id,
    required this.userId,
    required this.videoId,
    required this.commentText,
    this.user,
    this.status = 'active',
    this.createdAt,
    this.updatedAt,
  });

  String get userName => user?.name ?? 'User';
  String get userAvatar => user?.avatar ?? '';
  String get avatarLetter => userName.trim().isNotEmpty ? userName.trim()[0].toUpperCase() : 'U';

  String get timeAgo {
    if (createdAt == null) return 'Just now';
    final diff = DateTime.now().difference(createdAt!);
    if (diff.inDays > 365) return '${(diff.inDays / 365).floor()}y ago';
    if (diff.inDays > 30) return '${(diff.inDays / 30).floor()}mo ago';
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    if (diff.inMinutes > 0) return '${diff.inMinutes}m ago';
    return 'Just now';
  }

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    UserModel? userModel;
    if (json['user'] != null && json['user'] is Map<String, dynamic>) {
      userModel = UserModel.fromJson(json['user'] as Map<String, dynamic>);
    }

    return CommentModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      videoId: json['videoId'] as String? ?? '',
      commentText: json['commentText'] as String? ?? json['text'] as String? ?? '',
      user: userModel,
      status: json['status'] as String? ?? 'active',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'userId': userId,
        'videoId': videoId,
        'commentText': commentText,
        if (user != null) 'user': user!.toJson(),
        'status': status,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
      };
}
