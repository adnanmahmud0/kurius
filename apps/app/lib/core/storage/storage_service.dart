import 'dart:convert';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Persistent local storage service for authentication tokens, session, and user data
class StorageService extends GetxService {
  static StorageService get to {
    if (!Get.isRegistered<StorageService>()) {
      Get.put<StorageService>(StorageService(), permanent: true);
    }
    return Get.find<StorageService>();
  }

  SharedPreferences? _prefs;

  // Storage Keys
  static const String _keyAccessToken = 'access_token';
  static const String _keyRefreshToken = 'refresh_token';
  static const String _keyUserData = 'user_data';
  static const String _keyIsLoggedIn = 'is_logged_in';

  // In-memory cache for widget tests or before SharedPreferences is ready
  final Map<String, dynamic> _memoryCache = {};

  Future<StorageService> init() async {
    try {
      _prefs = await SharedPreferences.getInstance();
    } catch (_) {
      // Graceful fallback for test environments
    }
    return this;
  }

  // Access Token
  String? getAccessToken() => _prefs?.getString(_keyAccessToken) ?? _memoryCache[_keyAccessToken] as String?;
  Future<bool> setAccessToken(String token) async {
    _memoryCache[_keyAccessToken] = token;
    return (await _prefs?.setString(_keyAccessToken, token)) ?? true;
  }

  // Refresh Token
  String? getRefreshToken() => _prefs?.getString(_keyRefreshToken) ?? _memoryCache[_keyRefreshToken] as String?;
  Future<bool> setRefreshToken(String token) async {
    _memoryCache[_keyRefreshToken] = token;
    return (await _prefs?.setString(_keyRefreshToken, token)) ?? true;
  }

  // Save Auth Tokens Pair
  Future<void> saveAuthTokens({required String accessToken, String? refreshToken}) async {
    await setAccessToken(accessToken);
    if (refreshToken != null) {
      await setRefreshToken(refreshToken);
    }
    _memoryCache[_keyIsLoggedIn] = true;
    await _prefs?.setBool(_keyIsLoggedIn, true);
  }

  // Check Login Status
  bool isLoggedIn() {
    final token = getAccessToken();
    final loggedIn = _prefs?.getBool(_keyIsLoggedIn) ?? _memoryCache[_keyIsLoggedIn] as bool? ?? false;
    return token != null && token.isNotEmpty && loggedIn;
  }

  // User Profile JSON Cache
  Map<String, dynamic>? getUserData() {
    final raw = _prefs?.getString(_keyUserData) ?? _memoryCache[_keyUserData] as String?;
    if (raw == null || raw.isEmpty) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<bool> saveUserData(Map<String, dynamic> userJson) async {
    final jsonStr = jsonEncode(userJson);
    _memoryCache[_keyUserData] = jsonStr;
    return (await _prefs?.setString(_keyUserData, jsonStr)) ?? true;
  }

  // Clear Session / Logout
  Future<void> clearAuth() async {
    _memoryCache.clear();
    await _prefs?.remove(_keyAccessToken);
    await _prefs?.remove(_keyRefreshToken);
    await _prefs?.remove(_keyUserData);
    await _prefs?.setBool(_keyIsLoggedIn, false);
  }
}
