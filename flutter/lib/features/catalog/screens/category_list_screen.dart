import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../mocks/categories_mock.dart';
import 'search_screen.dart';

// Daftar kategori (parity web /categories). Ketuk → Search terfilter kategori.
class CategoryListScreen extends StatefulWidget {
  const CategoryListScreen({super.key});
  @override
  State<CategoryListScreen> createState() => _CategoryListScreenState();
}

class _CategoryListScreenState extends State<CategoryListScreen> {
  final _api = ApiClient();
  bool loading = true;
  String? error;
  List<Category> cats = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { loading = true; error = null; });
    try {
      cats = await _api.getCategories();
    } catch (_) {
      setState(() => error = 'Gagal memuat kategori. Coba lagi.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (error != null) {
      return Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Text(error!, style: const TextStyle(color: Colors.red)),
          TextButton(onPressed: _load, child: const Text('Muat ulang')),
        ]),
      );
    }
    if (cats.isEmpty) return const Center(child: Text('Belum ada kategori.'));
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: cats.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final c = cats[i];
          return Card(
            child: ListTile(
              leading: const Icon(Icons.category),
              title: Text(c.name, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(c.slug),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.of(context).push(MaterialPageRoute(
                builder: (_) => Scaffold(
                  appBar: AppBar(title: Text(c.name)),
                  body: SearchScreen(initialCategoryId: c.id),
                ),
              )),
            ),
          );
        },
      ),
    );
  }
}
