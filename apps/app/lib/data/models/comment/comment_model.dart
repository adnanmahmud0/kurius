import '../user/user_model.dart';

/// Video Comment model
class CommentModel {
  final String id;
  final String userId;
  final String videoId;
  final String commentText;
  final UserModel? user;
  final String status;
  final DateTime? createdAt;

  const CommentModel({
    required this.id,
    required this.userId,
    required this.videoId,
    required this.commentText,
    this.user,
    this.status = 'active',
    this.createdAt,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    UserModel? userModel;
    if (json['user'] != null && json['user'] is Map<String, dynamic>) {
      userModel = UserModel.fromJson(json['user'] as Map<String, dynamic>);
    }

    return CommentModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      videoId: json['videoId'] as String? ?? '',
      commentText: json['commentText'] as String? ?? '',
      user: userModel,
      status: json['status'] as String? ?? 'active',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
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
      };
}
