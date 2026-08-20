/// Register Request DTO
class RegisterRequest {
  final String name;
  final String email;
  final String password;

  const RegisterRequest({
    required this.name,
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'email': email,
        'password': password,
      };
}

/// Login Request DTO
class LoginRequest {
  final String email;
  final String password;

  const LoginRequest({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
      };
}

/// Verify Email OTP Request DTO
class VerifyEmailRequest {
  final String email;
  final int oneTimeCode;

  const VerifyEmailRequest({
    required this.email,
    required this.oneTimeCode,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'oneTimeCode': oneTimeCode,
      };
}

/// Forgot Password Request DTO
class ForgetPasswordRequest {
  final String email;

  const ForgetPasswordRequest({required this.email});

  Map<String, dynamic> toJson() => {'email': email};
}

/// Reset Password Request DTO
class ResetPasswordRequest {
  final String email;
  final String newPassword;
  final String confirmPassword;

  const ResetPasswordRequest({
    required this.email,
    required this.newPassword,
    required this.confirmPassword,
  });

  Map<String, dynamic> toJson() => {
        'email': email,
        'newPassword': newPassword,
        'confirmPassword': confirmPassword,
      };
}

/// Change Password Request DTO
class ChangePasswordRequest {
  final String currentPassword;
  final String newPassword;
  final String confirmPassword;

  const ChangePasswordRequest({
    required this.currentPassword,
    required this.newPassword,
    required this.confirmPassword,
  });

  Map<String, dynamic> toJson() => {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
        'confirmPassword': confirmPassword,
      };
}
