import 'package:flutter/material.dart';
import '../../../core/utils/money.dart';
import '../../../mocks/products_mock.dart';
import '../../features/catalog/screens/store_detail_screen.dart';
import '../theme/app_theme.dart';
import 'product_image.dart';

/// Kartu produk profesional SOUQNA — Acuan Biru UNIDA Gontor.
/// Gambar wajib errorBuilder fallback, storeName dioper parent (resolve via ApiClient.getStores sekali).
class ProductCard extends StatelessWidget {
  final ProductMock p;
  final String? storeName;
  final VoidCallback? onTap;

  const ProductCard({
    super.key,
    required this.p,
    this.onTap,
    this.storeName,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppTheme.border, width: 1),
      ),
      child: InkWell(
        onTap: onTap,
        splashColor: AppTheme.unidaBlue.withOpacity(0.08),
        highlightColor: AppTheme.unidaGold.withOpacity(0.05),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gambar Produk dengan Lencana Status Melayang
            Stack(
              children: [
                SizedBox(
                  height: 116,
                  width: double.infinity,
                  child: ProductImage(
                    p.imageUrl,
                    fit: BoxFit.cover,
                    showLoading: true,
                  ),
                ),
                if (p.outOfStock)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.danger,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'Stok habis',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  )
                else
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.unidaNavy.withOpacity(0.85),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'COD',
                        style: TextStyle(
                          color: AppTheme.unidaGold,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
              ],
            ),

            // Detail Produk
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                            color: AppTheme.unidaText,
                            height: 1.25,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        // Tautan Toko Interaktif
                        GestureDetector(
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => StoreDetailScreen(storeId: p.storeId),
                              ),
                            );
                          },
                          child: Row(
                            children: [
                              const Icon(Icons.storefront, size: 12, color: AppTheme.muted),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  storeName ?? '-',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppTheme.muted,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    // Harga Produk
                    Text(
                      formatIDR(p.minPrice),
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                        color: AppTheme.unidaNavy,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
