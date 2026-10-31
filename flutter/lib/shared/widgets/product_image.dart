import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Gambar produk mock: path `/images/...` dipetakan ke asset lokal,
/// URL http(s) tetap lewat network. Selalu punya fallback.
class ProductImage extends StatelessWidget {
  final String source;
  final BoxFit fit;
  final double? width;
  final double? height;
  final double errorIconSize;
  final bool showLoading;

  const ProductImage(
    this.source, {
    super.key,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.errorIconSize = 28,
    this.showLoading = false,
  });

  /// `/images/products/x.jpg` -> `assets/images/products/x.jpg`
  static String? assetFor(String source) {
    if (source.startsWith('/images/')) return 'assets$source';
    return null;
  }

  Widget _fallback() => Container(
        width: width,
        height: height,
        color: AppTheme.surfaceMuted,
        child: Center(
          child: Icon(
            Icons.image_not_supported_outlined,
            color: AppTheme.muted,
            size: errorIconSize,
          ),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final asset = assetFor(source);
    if (asset != null) {
      return Image.asset(
        asset,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, __, ___) => _fallback(),
      );
    }

    if (source.startsWith('http://') || source.startsWith('https://')) {
      return Image.network(
        source,
        width: width,
        height: height,
        fit: fit,
        loadingBuilder: showLoading
            ? (context, child, progress) {
                if (progress == null) return child;
                return Container(
                  width: width,
                  height: height,
                  color: AppTheme.surfaceMuted,
                  child: const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                );
              }
            : null,
        errorBuilder: (_, __, ___) => _fallback(),
      );
    }

    return _fallback();
  }
}
