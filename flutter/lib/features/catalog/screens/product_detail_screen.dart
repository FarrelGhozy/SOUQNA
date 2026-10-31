import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../core/utils/date_id.dart';
import '../../../core/utils/money.dart';
import '../../../mocks/products_mock.dart';
import '../../../mocks/stores_mock.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/product_image.dart';
import '../../chat/screens/thread_screen.dart';
import 'store_detail_screen.dart';

/// Detail produk komprehensif: varian, harga & stok, profil toko, ulasan, wishlist, dan chat.
class ProductDetailScreen extends StatefulWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final _api = ApiClient();
  final _auth = MockAuth.instance;
  bool loading = true;
  String? error;
  ProductMock? p;
  StoreMock? store;
  List<ReviewMock> reviews = [];
  bool wished = false;
  int sel = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final prod = await _api.getProduct(widget.productId);
      if (prod == null) {
        error = 'Produk tidak ditemukan atau telah dihapus.';
      } else {
        p = prod;
        sel = 0;
        final s = await _api.getStore(prod.storeId);
        final r = await _api.getReviews(prod.id);
        final uid = _auth.session.value?.id ?? '';
        final w = uid.isEmpty ? false : await _api.isWishlisted(uid, prod.id);
        store = s;
        reviews = r;
        wished = w;
      }
    } catch (_) {
      error = 'Gagal memuat produk. Coba lagi.';
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: const Text('Detail Produk'),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: AppTheme.danger),
                        const SizedBox(height: 12),
                        Text(error!, style: const TextStyle(color: AppTheme.danger), textAlign: TextAlign.center),
                        const SizedBox(height: 12),
                        ElevatedButton(onPressed: _load, child: const Text('Muat Ulang')),
                      ],
                    ),
                  ),
                )
              : p == null
                  ? const Center(child: Text('Produk tidak ditemukan.'))
                  : _body(),
    );
  }

  Widget _body() {
    final prod = p!;
    final v = prod.variants[sel];
    final hidden = prod.status != 'published';
    final storeOff = store == null || store!.status != 'active';
    final blocked = prod.outOfStock || hidden || storeOff;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Gambar Utama Produk dengan Fallback
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Container(
            height: 250,
            width: double.infinity,
            color: AppTheme.surfaceMuted,
            child: ProductImage(
              prod.imageUrl,
              fit: BoxFit.cover,
              errorIconSize: 56,
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Judul, Tanggal, & Harga Varian Terpilih
        Text(
          prod.name,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy),
        ),
        const SizedBox(height: 6),
        Text(
          'Ditambahkan pada ${formatDateWIB(prod.createdAt)} WIB',
          style: const TextStyle(color: AppTheme.muted, fontSize: 12),
        ),
        const SizedBox(height: 10),
        Text(
          formatIDR(v.price),
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.unidaBlue),
        ),
        const SizedBox(height: 16),

        // Peringatan Blokir Checkout (Bila ada)
        if (hidden)
          _buildAlert(Icons.visibility_off, 'Produk ini disembunyikan dan tidak dapat dibeli.', AppTheme.warningSoft, AppTheme.warning),
        if (storeOff)
          _buildAlert(Icons.store_mall_directory_outlined, 'Toko sedang nonaktif. Transaksi sementara tidak tersedia.', AppTheme.dangerSoft, AppTheme.danger),
        if (prod.outOfStock && !hidden && !storeOff)
          _buildAlert(Icons.inventory_2_outlined, 'Stok varian produk ini sedang habis.', AppTheme.dangerSoft, AppTheme.danger),

        // Kartu Toko
        if (store != null)
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: AppTheme.border),
            ),
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppTheme.unidaNavy,
                child: Icon(Icons.storefront, color: AppTheme.unidaGold, size: 20),
              ),
              title: Text(store!.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              subtitle: Text(
                '${store!.pickupLocation} · ${store!.deliveryAvailable ? 'Bisa Antar (+${formatIDR(store!.deliveryFee)})' : 'Ambil di Tempat'}',
                style: const TextStyle(fontSize: 12, color: AppTheme.muted),
              ),
              trailing: const Icon(Icons.chevron_right, color: AppTheme.muted),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => StoreDetailScreen(storeId: store!.id)),
              ),
            ),
          ),
        const SizedBox(height: 16),

        // Deskripsi Produk
        const Text(
          'Deskripsi Produk',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy),
        ),
        const SizedBox(height: 6),
        Text(
          prod.description.isEmpty ? 'Tidak ada deskripsi tambahan.' : prod.description,
          style: const TextStyle(fontSize: 13, height: 1.45, color: AppTheme.unidaText),
        ),
        const SizedBox(height: 18),

        // Pilihan Varian
        const Text(
          'Pilih Varian Produk',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: prod.variants.asMap().entries.map((e) {
            final i = e.key;
            final x = e.value;
            final isSelected = i == sel;
            return ChoiceChip(
              backgroundColor: AppTheme.surface,
              selectedColor: AppTheme.unidaGoldSoft,
              side: BorderSide(color: isSelected ? AppTheme.unidaGold : AppTheme.border),
              label: Text(
                '${x.label} — ${formatIDR(x.price)} (${x.stock > 0 ? "Stok ${x.stock}" : "Habis"})',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? AppTheme.unidaNavy : AppTheme.unidaText,
                ),
              ),
              selected: isSelected,
              onSelected: x.stock == 0 ? null : (_) => setState(() => sel = i),
            );
          }).toList(),
        ),
        const SizedBox(height: 20),

        // Tombol Tambah ke Keranjang
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.unidaBlue,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
          onPressed: blocked || v.stock == 0
              ? null
              : () async {
                  try {
                    await _api.addToCart(v.id, 1);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${prod.name} (${v.label}) berhasil ditambahkan ke keranjang.')),
                      );
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
                      );
                    }
                  }
                },
          icon: const Icon(Icons.add_shopping_cart),
          label: Text(v.stock == 0 ? 'Varian Ini Habis' : '+ Tambah ke Keranjang'),
        ),
        const SizedBox(height: 10),

        // Aksi Wishlist & Chat Toko
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                icon: Icon(wished ? Icons.favorite : Icons.favorite_border,
                    color: wished ? AppTheme.danger : AppTheme.unidaNavy),
                label: Text(wished ? 'Di Wishlist' : 'Wishlist'),
                onPressed: () async {
                  final uid = _auth.session.value?.id ?? '';
                  if (uid.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Masuk terlebih dahulu untuk menyimpan wishlist.')),
                    );
                    return;
                  }
                  try {
                    if (wished) {
                      await _api.removeFromWishlist(uid, prod.id);
                      setState(() => wished = false);
                    } else {
                      await _api.addToWishlist(uid, prod.id);
                      setState(() => wished = true);
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
                      );
                    }
                  }
                },
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: OutlinedButton.icon(
                icon: const Icon(Icons.chat_outlined, color: AppTheme.unidaBlue),
                label: const Text('Chat Toko'),
                onPressed: () async {
                  final uid = _auth.session.value?.id ?? '';
                  if (uid.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Masuk terlebih dahulu untuk membuka pesan.')),
                    );
                    return;
                  }
                  try {
                    final c = await _api.getOrCreateConversation(uid, prod.storeId);
                    if (context.mounted) {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => ThreadScreen(convId: c.id)),
                      );
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
                      );
                    }
                  }
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Ulasan Pembeli
        Text(
          'Ulasan Pembeli (${reviews.length})',
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.unidaNavy),
        ),
        const SizedBox(height: 10),
        if (reviews.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 8),
            child: Text('Belum ada ulasan untuk produk ini.', style: TextStyle(color: AppTheme.muted, fontSize: 13)),
          )
        else
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: AppTheme.border),
            ),
            child: Column(
              children: [
                for (var idx = 0; idx < reviews.length; idx++) ...[
                  ListTile(
                    title: Row(
                      children: [
                        Text('★' * reviews[idx].rating, style: const TextStyle(color: AppTheme.unidaGold, fontSize: 14)),
                        Text('☆' * (5 - reviews[idx].rating), style: const TextStyle(color: AppTheme.border, fontSize: 14)),
                      ],
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        reviews[idx].text.isEmpty ? '(Tanpa komentar tertulis)' : reviews[idx].text,
                        style: const TextStyle(fontSize: 13, color: AppTheme.unidaText),
                      ),
                    ),
                  ),
                  if (idx < reviews.length - 1) const Divider(height: 1, indent: 16, endIndent: 16),
                ],
              ],
            ),
          ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildAlert(IconData icon, String message, Color bg, Color fg) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: fg.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: fg, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(message, style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}
