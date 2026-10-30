import 'package:flutter/material.dart';
import '../../../core/utils/money.dart';
import '../../../mocks/products_mock.dart';

// Kartu produk reusable — gambar wajib errorBuilder fallback.
// storeName dioper parent (resolve via ApiClient.getStores sekali).
class ProductCard extends StatelessWidget {
  final ProductMock p;
  final String? storeName;
  final VoidCallback? onTap;
  const ProductCard({super.key, required this.p, this.onTap, this.storeName});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Image.network(
                p.imageUrl,
                height: 110,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox(
                  height: 110,
                  child: Center(child: Icon(Icons.image_not_supported)),
                ),
              ),
              const SizedBox(height: 6),
              Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold), maxLines: 2, overflow: TextOverflow.ellipsis),
              if (storeName != null)
                Text(storeName!,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              Text(formatIDR(p.minPrice)),
              if (p.outOfStock) const Text('Stok habis', style: TextStyle(color: Colors.red, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}
