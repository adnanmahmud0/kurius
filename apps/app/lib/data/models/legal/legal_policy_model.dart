class LegalPolicyModel {
  final String id;
  final String type; // 'privacy' or 'terms'
  final String title;
  final String content;
  final String? createdAt;
  final String? updatedAt;

  const LegalPolicyModel({
    required this.id,
    required this.type,
    required this.title,
    required this.content,
    this.createdAt,
    this.updatedAt,
  });

  factory LegalPolicyModel.fromJson(Map<String, dynamic> json) {
    return LegalPolicyModel(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? '',
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'content': content,
      if (createdAt != null) 'createdAt': createdAt,
      if (updatedAt != null) 'updatedAt': updatedAt,
    };
  }
}
