/// User model matching backend Prisma User model
class UserModel {
  final String id;
  final String name;
  final String? firstName;
  final String? lastName;
  final String email;
  final String? contact;
  final String? location;
  final String? image;
  final String? avatar;
  final String role;
  final bool verified;
  final String provider;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const UserModel({
    required this.id,
    required this.name,
    this.firstName,
    this.lastName,
    required this.email,
    this.contact,
    this.location,
    this.image,
    this.avatar,
    this.role = 'USER',
    this.verified = false,
    this.provider = 'local',
    this.createdAt,
    this.updatedAt,
  });

  String get displayName {
    if (name.isNotEmpty) return name;
    if (firstName != null && lastName != null) return '$firstName $lastName';
    return email.split('@').first;
  }

  String get displayAvatar {
    String? raw = (avatar != null && avatar!.trim().isNotEmpty)
        ? avatar!.trim()
        : (image != null && image!.trim().isNotEmpty ? image!.trim() : null);

    if (raw == null || raw.isEmpty) {
      return 'https://i.ibb.co.com/Cs5Kr1gT/dc262f1cd78130b972c5dbd8643ad972.jpg';
    }

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }

    // Relative backend path e.g. "/uploads/users/..."
    final cleanPath = raw.startsWith('/') ? raw : '/$raw';
    return 'https://api.kuriusapp.cloud$cleanPath';
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      email: json['email'] as String? ?? '',
      contact: json['contact'] as String?,
      location: json['location'] as String?,
      image: json['image'] as String?,
      avatar: json['avatar'] as String?,
      role: json['role'] as String? ?? 'USER',
      verified: json['verified'] as bool? ?? false,
      provider: json['provider'] as String? ?? 'local',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        'email': email,
        if (contact != null) 'contact': contact,
        if (location != null) 'location': location,
        if (image != null) 'image': image,
        if (avatar != null) 'avatar': avatar,
        'role': role,
        'verified': verified,
        'provider': provider,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
      };
}
