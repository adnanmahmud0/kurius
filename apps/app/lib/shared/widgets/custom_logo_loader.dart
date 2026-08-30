import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';

/// Premium custom blinking logo loader for Kurius
class CustomLogoLoader extends StatefulWidget {
  final double size;
  final String text;
  final bool showText;
  final Color? textColor;
  final TextStyle? textStyle;
  final Duration duration;

  const CustomLogoLoader({
    super.key,
    this.size = 72.0,
    this.text = 'loading.....!',
    this.showText = true,
    this.textColor,
    this.textStyle,
    this.duration = const Duration(milliseconds: 900),
  });

  @override
  State<CustomLogoLoader> createState() => _CustomLogoLoaderState();
}

class _CustomLogoLoaderState extends State<CustomLogoLoader>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..repeat(reverse: true);

    _opacityAnimation = Tween<double>(begin: 0.35, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.92, end: 1.06).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return Transform.scale(
                scale: _scaleAnimation.value,
                child: Opacity(
                  opacity: _opacityAnimation.value,
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(
                            alpha: 0.15 + (0.25 * _opacityAnimation.value),
                          ),
                          blurRadius: 20 * _scaleAnimation.value,
                          spreadRadius: 2 * _scaleAnimation.value,
                        ),
                      ],
                    ),
                    child: Image.asset(
                      'assets/image/logo.png',
                      width: widget.size,
                      height: widget.size,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) {
                        return Icon(
                          Icons.play_circle_fill_rounded,
                          size: widget.size,
                          color: AppColors.primary,
                        );
                      },
                    ),
                  ),
                ),
              );
            },
          ),
          if (widget.showText && widget.text.isNotEmpty) ...[
            const SizedBox(height: 16),
            AnimatedBuilder(
              animation: _opacityAnimation,
              builder: (context, child) {
                return Opacity(
                  opacity: 0.6 + (0.4 * _opacityAnimation.value),
                  child: Text(
                    widget.text,
                    style: widget.textStyle ??
                        GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: widget.textColor ?? AppColors.textPrimary,
                          letterSpacing: 0.8,
                        ),
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }
}
