import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../mocks/categories_mock.dart';
import '../../../shared/theme/app_theme.dart';

// Form tambah/edit produk milik sendiri + kelola varian.
class ProductFormScreen extends StatefulWidget {
  final String ownerId;
  final String storeId;
  final String? productId;
  const ProductFormScreen(
      {super.key,
      required this.ownerId,
      required this.storeId,
      this.productId});
  @override
  State<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _VarRow {
  String? id;
  final TextEditingController label = TextEditingController();
  final TextEditingController price = TextEditingController();
  final TextEditingController stock = TextEditingController();
}

class _ProductFormScreenState extends State<ProductFormScreen> {
  final _api = ApiClient();
  bool loading = true;
  bool busy = false;
  String? err;
  final _name = TextEditingController();
  final _desc = TextEditingController();
  final _img = TextEditingController();
  String _cat = categoriesMock.first.id;
  String _status = 'draft';
  List<_VarRow> _vars = [_VarRow()];

  bool get isNew => widget.productId == null;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (isNew) {
      setState(() => loading = false);
      return;
    }
    try {
      final mine = await _api.getMyProducts(widget.storeId);
      final p = mine.where((e) => e.id == widget.productId);
      if (p.isEmpty) throw Exception('Produk tidak ditemukan / bukan milik tokomu.');
      final prod = p.first;
      _name.text = prod.name;
      _desc.text = prod.description;
      _img.text = prod.imageUrl;
      _cat = prod.categoryId;
      _status = prod.status == 'suspended' ? 'hidden' : prod.status;
      _vars = prod.variants.map((v) {
        final r = _VarRow()
          ..id = v.id
          ..label.text = v.label
          ..price.text = v.price.toString()
          ..stock.text = v.stock.toString();
        return r;
      }).toList();
    } catch (e) {
      err = e.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _save() async {
    setState(() {
      busy = true;
      err = null;
    });
    try {
      if (isNew) {
        await _api.createMyProduct(
          storeId: widget.storeId,
          ownerId: widget.ownerId,
          name: _name.text,
          categoryId: _cat,
          description: _desc.text,
          status: _status,
          imageUrl: _img.text,
          variants: _vars
              .map((r) => VariantMock('', r.label.text,
                  int.tryParse(r.price.text) ?? -1, int.tryParse(r.stock.text) ?? -1))
              .toList(),
        );
        if (mounted) Navigator.of(context).pop(true);
      } else {
        await _api.updateMyProduct(
          ownerId: widget.ownerId,
          productId: widget.productId!,
          name: _name.text,
          categoryId: _cat,
          description: _desc.text,
          status: _status,
          imageUrl: _img.text,
        );
        final mine = await _api.getMyProducts(widget.storeId);
        final cur = mine.firstWhere((e) => e.id == widget.productId);
        for (final r in _vars) {
          if (r.id != null) {
            final c = cur.variants.firstWhere((v) => v.id == r.id);
            if (c.label != r.label.text ||
                c.price.toString() != r.price.text ||
                c.stock.toString() != r.stock.text) {
              await _api.updateMyVariant(
                ownerId: widget.ownerId,
                variantId: r.id!,
                label: r.label.text,
                price: int.tryParse(r.price.text) ?? -1,
                stock: int.tryParse(r.stock.text) ?? -1,
              );
            }
          } else {
            await _api.createMyVariant(
              ownerId: widget.ownerId,
              productId: widget.productId!,
              label: r.label.text,
              price: int.tryParse(r.price.text) ?? -1,
              stock: int.tryParse(r.stock.text) ?? -1,
            );
          }
        }
        if (mounted) {
          ScaffoldMessenger.of(context)
              .showSnackBar(const SnackBar(content: Text('Produk tersimpan.')));
          Navigator.of(context).pop(true);
        }
      }
    } catch (e) {
      setState(() => err = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: Text(isNew ? 'Tambah produk' : 'Edit produk'),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (err != null)
                  Text(err!, style: const TextStyle(color: Colors.red)),
                TextField(controller: _name,
                    decoration:
                        const InputDecoration(labelText: 'Nama* (min 3)')),
                DropdownButtonFormField<String>(
                  value: categoriesMock.any((c) => c.id == _cat)
                      ? _cat
                      : categoriesMock.first.id,
                  items: [
                    for (final c in categoriesMock)
                      DropdownMenuItem(value: c.id, child: Text(c.name)),
                  ],
                  onChanged: (v) =>
                      setState(() => _cat = v ?? categoriesMock.first.id),
                  decoration: const InputDecoration(labelText: 'Kategori'),
                ),
                TextField(controller: _desc,
                    decoration: const InputDecoration(labelText: 'Deskripsi')),
                DropdownButtonFormField<String>(
                  value: _status,
                  items: const [
                    DropdownMenuItem(
                        value: 'draft', child: Text('draft (belum tayang)')),
                    DropdownMenuItem(
                        value: 'published', child: Text('published (publik)')),
                    DropdownMenuItem(
                        value: 'hidden', child: Text('hidden (arsip)')),
                  ],
                  onChanged: (v) => setState(() => _status = v ?? 'draft'),
                  decoration: const InputDecoration(labelText: 'Status'),
                ),
                TextField(controller: _img,
                    decoration: const InputDecoration(
                        labelText: 'Gambar URL (kosong = picsum)')),
                const SizedBox(height: 8),
                const Text('Varian (min 1)',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                for (var i = 0; i < _vars.length; i++)
                  Row(children: [
                    Expanded(
                        child: TextField(
                            controller: _vars[i].label,
                            decoration:
                                const InputDecoration(labelText: 'Label'))),
                    SizedBox(
                        width: 90,
                        child: TextField(
                            controller: _vars[i].price,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                                labelText: 'Harga'))),
                    SizedBox(
                        width: 70,
                        child: TextField(
                            controller: _vars[i].stock,
                            keyboardType: TextInputType.number,
                            decoration:
                                const InputDecoration(labelText: 'Stok'))),
                    if (_vars.length > 1)
                      IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () =>
                              setState(() => _vars.removeAt(i))),
                  ]),
                TextButton.icon(
                  onPressed: () => setState(() => _vars.add(_VarRow())),
                  icon: const Icon(Icons.add),
                  label: const Text('Varian'),
                ),
                ElevatedButton(
                  onPressed: busy ? null : _save,
                  child: Text(busy ? 'Menyimpan...' : 'Simpan produk'),
                ),
              ],
            ),
    );
  }
}
