/// Tokens returned on successful authentication/verification
class AuthTokensModel {
  final String accessToken;
  final String? refreshToken;

  const AuthTokensModel({
    required this.accessToken,
    this.refreshToken,
  });

  factory AuthTokensModel.fromJson(Map<String, dynamic> json) {
    return AuthTokensModel(
      accessToken: json['accessToken'] as String? ?? '',
      refreshToken: json['refreshToken'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'accessToken': accessToken,
        if (refreshToken != null) 'refreshToken': refreshToken,
      };
}
