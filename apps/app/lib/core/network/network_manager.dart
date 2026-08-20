import 'dart:async';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../constants/app_colors.dart';

/// Global network connectivity monitor managing real-time online/offline states and UI feedback
class NetworkManager extends GetxController {
  static NetworkManager get to => Get.find<NetworkManager>();

  final Connectivity _connectivity = Connectivity();
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  // Reactive connection state
  final RxBool isConnected = true.obs;
  final RxBool isChecking = false.obs;

  // Track if we already showed an offline banner to avoid spamming
  bool _wasOffline = false;

  @override
  void onInit() {
    super.onInit();
    _initConnectivity();
  }

  Future<void> _initConnectivity() async {
    try {
      final results = await _connectivity.checkConnectivity();
      await _updateConnectionStatus(results);
    } catch (_) {
      // In test environments or unsupported platforms, default to true
      isConnected.value = true;
    }

    try {
      _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
        _updateConnectionStatus,
        onError: (_) {},
      );
    } catch (_) {}
  }

  /// Evaluates connectivity results and verifies real Internet reachable status
  Future<void> _updateConnectionStatus(List<ConnectivityResult> results) async {
    final hasLocalNetwork = results.any(
      (r) =>
          r == ConnectivityResult.mobile ||
          r == ConnectivityResult.wifi ||
          r == ConnectivityResult.ethernet ||
          r == ConnectivityResult.vpn,
    );

    if (!hasLocalNetwork) {
      _setOffline();
      return;
    }

    // Double check real internet reachability via DNS probe
    final reachable = await hasRealInternet();
    if (reachable) {
      _setOnline();
    } else {
      _setOffline();
    }
  }

  /// DNS ping check to confirm actual internet access
  Future<bool> hasRealInternet() async {
    try {
      final lookup = await InternetAddress.lookup('google.com')
          .timeout(const Duration(seconds: 3));
      return lookup.isNotEmpty && lookup[0].rawAddress.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  /// Manually check connection (e.g. from Retry button)
  Future<bool> checkConnection() async {
    isChecking.value = true;
    try {
      final results = await _connectivity.checkConnectivity();
      final hasNet = results.any((r) => r != ConnectivityResult.none);
      if (!hasNet) {
        _setOffline();
        return false;
      }
      final reachable = await hasRealInternet();
      if (reachable) {
        _setOnline();
        return true;
      } else {
        _setOffline();
        return false;
      }
    } catch (_) {
      return true;
    } finally {
      isChecking.value = false;
    }
  }

  void _setOffline() {
    if (isConnected.value || !_wasOffline) {
      isConnected.value = false;
      _wasOffline = true;
      _showNoInternetSnackbar();
    }
  }

  void _setOnline() {
    final previouslyOffline = _wasOffline;
    isConnected.value = true;
    _wasOffline = false;

    if (previouslyOffline) {
      _showBackOnlineSnackbar();
    }
  }

  void _showNoInternetSnackbar() {
    if (Get.context == null || Get.isSnackbarOpen) return;

    Get.rawSnackbar(
      titleText: const Row(
        children: [
          Icon(Icons.wifi_off_rounded, color: Colors.white, size: 20),
          SizedBox(width: 8),
          Text(
            'No Internet Connection',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ],
      ),
      messageText: const Text(
        'Please check your Wi-Fi or mobile data network.',
        style: TextStyle(color: Colors.white70, fontSize: 12),
      ),
      backgroundColor: AppColors.error,
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: 12,
      isDismissible: true,
      duration: const Duration(seconds: 4),
      icon: const Icon(Icons.error_outline_rounded, color: Colors.white),
    );
  }

  void _showBackOnlineSnackbar() {
    if (Get.context == null) return;

    Get.rawSnackbar(
      titleText: const Row(
        children: [
          Icon(Icons.wifi_rounded, color: Colors.white, size: 20),
          SizedBox(width: 8),
          Text(
            'Back Online',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ],
      ),
      messageText: const Text(
        'Your internet connection was restored.',
        style: TextStyle(color: Colors.white70, fontSize: 12),
      ),
      backgroundColor: AppColors.success,
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      borderRadius: 12,
      isDismissible: true,
      duration: const Duration(seconds: 3),
    );
  }

  @override
  void onClose() {
    _connectivitySubscription?.cancel();
    super.onClose();
  }
}
