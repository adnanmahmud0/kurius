import 'package:get/get.dart';
import '../../../../data/repositories/category_repository.dart';
import '../controllers/all_categories_controller.dart';

class AllCategoriesBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AllCategoriesController>(
      () => AllCategoriesController(
        categoryRepository: Get.isRegistered<CategoryRepository>()
            ? Get.find<CategoryRepository>()
            : null,
      ),
    );
  }
}
