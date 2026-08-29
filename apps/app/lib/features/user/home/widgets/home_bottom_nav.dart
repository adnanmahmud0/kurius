import 'package:flutter/material.dart';
import '../../../../shared/widgets/user_bottom_nav.dart';

class HomeBottomNav extends StatelessWidget {
  const HomeBottomNav({super.key});

  @override
  Widget build(BuildContext context) {
    return const UserBottomNav(currentIndex: 0);
  }
}
