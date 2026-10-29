import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../mocks/categories_mock.dart';
import '../../../mocks/products_mock.dart';
import '../../../shared/widgets/product_card.dart';
import 'product_detail_screen.dart';

// Search + filter kategori/harga + sort + pagination dummy.
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _api = ApiClient();
  final _q = TextEditingController();
  final _min = TextEditingController();
  final _max = TextEditingController();
  String categoryId = '';
  ProductSort sort = ProductSort.terbaru;
  int page = 1;
  int total = 0;
  bool loading = false;
  String? error;
  List<Category> cats = [];
  List<ProductMock> prods = [];
  static const int limit = 12;

  @override
  void initState() {
    super.initState();
    _api.getCategories().then((c) => setState(() => cats = c));
    _search();
  }

  Future<void> _search() async {
    setState(() { loading = true; error = null; });
    try {
      final r = await _api.getProducts(
        q: _q.text.isEmpty ? null : _q.text,
        categoryId: categoryId.isEmpty ? null : categoryId,
        minPrice: int.tryParse(_min.text),
        maxPrice: int.tryParse(_max.text),
        sort: sort,
        page: page,
        limit: limit,
      );
      setState(() { prods = r.data; total = r.total; });
    } catch (_) {
      setState(() => error = 'Gagal memuat hasil. Coba lagi.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  void _resetPage() => page = 1;

  @override
  Widget build(BuildContext context) {
    final maxPage = (total / limit).ceil().clamp(1, 999);
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          TextField(
            controller: _q,
            decoration: const InputDecoration(labelText: 'Cari (cth: geprek, hijab, print)', border: OutlineInputBorder()),
            onSubmitted: (_) { _resetPage(); _search(); },
          ),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(
              child: DropdownButton<String>(
                value: categoryId,
                isExpanded: true,
                items: [
                  const DropdownMenuItem(value: '', child: Text('Semua kategori')),
                  ...cats.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))),
                ],
                onChanged: (v) { setState(() => categoryId = v ?? ''); _resetPage(); _search(); },
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: DropdownButton<ProductSort>(
                value: sort,
                isExpanded: true,
                items: const [
                  DropdownMenuItem(value: ProductSort.terbaru, child: Text('Terbaru')),
                  DropdownMenuItem(value: ProductSort.termurah, child: Text('Termurah')),
                  DropdownMenuItem(value: ProductSort.termahal, child: Text('Termahal')),
                  DropdownMenuItem(value: ProductSort.nama, child: Text('Nama')),
                ],
                onChanged: (v) { setState(() => sort = v ?? ProductSort.terbaru); _resetPage(); _search(); },
              ),
            ),
          ]),
          Row(children: [
            Expanded(child: TextField(controller: _min, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Min Rp'))),
            const SizedBox(width: 8),
            Expanded(child: TextField(controller: _max, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Max Rp'))),
            IconButton(onPressed: () { _resetPage(); _search(); }, icon: const Icon(Icons.search)),
          ]),
          Text('$total hasil', style: const TextStyle(color: Colors.grey)),
          Expanded(
            child: loading
                ? const Center(child: CircularProgressIndicator())
                : error != null
                    ? Center(child: Text(error!, style: const TextStyle(color: Colors.red)))
                    : prods.isEmpty
                        ? const Center(child: Text('Tidak ada produk. Coba kata kunci / filter lain.'))
                        : GridView.count(
                            crossAxisCount: 2,
                            childAspectRatio: 0.72,
                            children: prods.map((p) => ProductCard(
                              p: p,
                              onTap: () => Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => ProductDetailScreen(productId: p.id))),
                            )).toList(),
                          ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(onPressed: page <= 1 ? null : () { setState(() => page--); _search(); }, icon: const Icon(Icons.chevron_left)),
              Text('Halaman $page / $maxPage'),
              IconButton(onPressed: page >= maxPage ? null : () { setState(() => page++); _search(); }, icon: const Icon(Icons.chevron_right)),
            ],
          ),
        ],
      ),
    );
  }
}
