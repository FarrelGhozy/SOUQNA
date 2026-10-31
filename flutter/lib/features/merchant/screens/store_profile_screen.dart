import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../shared/theme/app_theme.dart';

/// Profil & pengaturan toko milik sendiri: nama, deskripsi, lokasi pickup, dan opsi pengantaran.
class StoreProfileScreen extends StatefulWidget {
  final String ownerId;
  final bool isEmbedded;

  const StoreProfileScreen({
    super.key,
    required this.ownerId,
    this.isEmbedded = false,
  });

  @override
  State<StoreProfileScreen> createState() => _StoreProfileScreenState();
}

class _StoreProfileScreenState extends State<StoreProfileScreen> {
  final _api = ApiClient();
  bool loading = true;
  bool busy = false;
  String? err;
  String? msg;
  final _name = TextEditingController();
  final _desc = TextEditingController();
  final _pickup = TextEditingController();
  final _fee = TextEditingController();
  bool _deliv = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final s = await _api.getMyStore(widget.ownerId);
      if (s != null) {
        _name.text = s.name;
        _desc.text = s.description;
        _pickup.text = s.pickupLocation;
        _fee.text = s.deliveryFee.toString();
        _deliv = s.deliveryAvailable;
      }
    } catch (e) {
      err = e.toString();
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Widget _buildBody(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (msg != null)
          Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.successSoft,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.success.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: AppTheme.success, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    msg!,
                    style: const TextStyle(color: AppTheme.success, fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
        if (err != null)
          Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.dangerSoft,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.danger.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, color: AppTheme.danger, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    err!,
                    style: const TextStyle(color: AppTheme.danger, fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),

        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: AppTheme.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Identitas Toko',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _name,
                  decoration: const InputDecoration(
                    labelText: 'Nama Toko*',
                    prefixIcon: Icon(Icons.storefront, color: AppTheme.unidaBlue, size: 20),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _desc,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Deskripsi Toko',
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _pickup,
                  decoration: const InputDecoration(
                    labelText: 'Lokasi Pengambilan (Pickup)*',
                    hintText: 'Contoh: Gedung Terpadu Lt. 1 / Asrama Ibnu Rusyd',
                    prefixIcon: Icon(Icons.location_on_outlined, color: AppTheme.unidaBlue, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: AppTheme.border),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Metode Penyerahan Barang',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.unidaNavy),
                ),
                const SizedBox(height: 10),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Melayani Pengantaran Langsung', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: const Text('Antar pesanan langsung ke lokasi pembeli di area kampus', style: TextStyle(fontSize: 12, color: AppTheme.muted)),
                  value: _deliv,
                  activeColor: AppTheme.unidaGold,
                  onChanged: (v) => setState(() => _deliv = v),
                ),
                if (_deliv) ...[
                  const SizedBox(height: 10),
                  TextField(
                    controller: _fee,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Biaya Ongkos Kirim (Rp)',
                      prefixText: 'Rp ',
                      hintText: '0 (Gratis Ongkir)',
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        ElevatedButton(
          onPressed: busy
              ? null
              : () async {
                  setState(() {
                    busy = true;
                    err = null;
                    msg = null;
                  });
                  try {
                    await _api.updateMyStore(
                      ownerId: widget.ownerId,
                      name: _name.text,
                      description: _desc.text,
                      pickupLocation: _pickup.text,
                      deliveryAvailable: _deliv,
                      deliveryFee: int.tryParse(_fee.text) ?? 0,
                    );
                    setState(() => msg = 'Profil toko berhasil diperbarui.');
                  } catch (e) {
                    setState(() => err = e.toString().replaceFirst('Exception: ', ''));
                  } finally {
                    if (mounted) setState(() => busy = false);
                  }
                },
          child: Text(busy ? 'Menyimpan...' : 'Simpan Perubahan Toko'),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final body = _buildBody(context);

    if (widget.isEmbedded) {
      return body;
    }

    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: const Text('Profil Toko'),
      ),
      body: body,
    );
  }
}
