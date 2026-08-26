import 'package:get/get.dart';
import '../../core/network/api_client.dart';
import '../../core/network/network_manager.dart';
import '../../core/storage/storage_service.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/repositories/category_repository.dart';
import '../../data/repositories/comment_repository.dart';
import '../../data/repositories/user_repository.dart';
import '../../data/repositories/video_repository.dart';
import '../../features/user/auth/controllers/auth_controller.dart';

class InitialBinding extends Bindings {
  @override
  void dependencies() {
    // 1. Storage, Network Monitoring & Core Network Client
    final storage = Get.isRegistered<StorageService>()
        ? Get.find<StorageService>()
        : Get.put<StorageService>(StorageService(), permanent: true);

    if (!Get.isRegistered<NetworkManager>()) {
      Get.put<NetworkManager>(NetworkManager(), permanent: true);
    }

    final apiClient = Get.isRegistered<ApiClient>()
        ? Get.find<ApiClient>()
        : Get.put<ApiClient>(ApiClient(), permanent: true);

    // 2. Repositories
    final authRepo = Get.put<AuthRepository>(
      AuthRepository(apiClient: apiClient, storage: storage),
      permanent: true,
    );
    Get.put<UserRepository>(
      UserRepository(apiClient: apiClient, storage: storage),
      permanent: true,
    );
    Get.put<VideoRepository>(
      VideoRepository(apiClient: apiClient),
      permanent: true,
    );
    Get.put<CategoryRepository>(
      CategoryRepository(apiClient: apiClient),
      permanent: true,
    );
    Get.put<CommentRepository>(
      CommentRepository(apiClient: apiClient),
      permanent: true,
    );

    // 3. Controllers
    Get.put<AuthController>(
      AuthController(authRepository: authRepo, storage: storage),
      permanent: true,
    );
  }
}
