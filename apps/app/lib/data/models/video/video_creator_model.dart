/// Video Creator summary model returned in video feeds
class VideoCreatorModel {
  final String id;
  final String name;
  final String? avatar;
  final String? email;

  const VideoCreatorModel({
    required this.id,
    required this.name,
    this.avatar,
    this.email,
  });

  String get displayAvatar {
    if (avatar == null || avatar!.trim().isEmpty) {
      return 'https://i.ibb.co.com/Cs5Kr1gT/dc262f1cd78130b972c5dbd8643ad972.jpg';
    }
    final raw = avatar!.trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    final cleanPath = raw.startsWith('/') ? raw : '/$raw';
    return 'https://api.kuriusapp.cloud$cleanPath';
  }

  factory VideoCreatorModel.fromJson(Map<String, dynamic> json) {
    return VideoCreatorModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      avatar: json['avatar'] as String? ?? json['image'] as String?,
      email: json['email'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        if (avatar != null) 'avatar': avatar,
        if (email != null) 'email': email,
      };
}
