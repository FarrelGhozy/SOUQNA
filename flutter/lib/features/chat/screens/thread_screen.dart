import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../core/utils/date_id.dart';
import '../../../shared/theme/app_theme.dart';

// Isi thread: pesan terlihat + penghitung pesan lama + kirim teks.
class ThreadScreen extends StatefulWidget {
  final String convId;
  const ThreadScreen({super.key, required this.convId});
  @override
  State<ThreadScreen> createState() => _ThreadScreenState();
}

class _ThreadScreenState extends State<ThreadScreen> {
  final _api = ApiClient();
  final _auth = MockAuth.instance;
  bool loading = true;
  bool busy = false;
  String? err;
  List<MessageMock> msgs = [];
  int hidden = 0;
  final _draft = TextEditingController();

  Set<String> _storeIds() {
    final s = _auth.session.value;
    if (s == null || !s.hasStore || s.storeId == null) return {};
    return {s.storeId!};
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final uid = _auth.session.value?.id ?? '';
    try {
      final r = await _api.getMessages(widget.convId, uid, _storeIds());
      msgs = r.messages;
      hidden = r.hidden;
    } catch (e) {
      err = e.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final uid = _auth.session.value?.id ?? '';
    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: Text(widget.convId),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : err != null
              ? Center(
                  child: Text(err!, style: const TextStyle(color: Colors.red)))
              : Column(
                  children: [
                    if (hidden > 0)
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Text(
                            '$hidden pesan lama (>7 hari) disembunyikan otomatis — thread tetap ada.',
                            style: const TextStyle(
                                color: Colors.grey, fontSize: 12)),
                      ),
                    Expanded(
                      child: msgs.isEmpty
                          ? const Center(
                              child: Text(
                                  'Belum ada pesan terlihat. Kirim pesan pertama.'))
                          : ListView(
                              padding: const EdgeInsets.all(12),
                              children: [
                                for (final m in msgs)
                                  Align(
                                    alignment: m.senderId == uid
                                        ? Alignment.centerRight
                                        : Alignment.centerLeft,
                                    child: Card(
                                      color: m.senderId == uid
                                          ? Colors.green[50]
                                          : null,
                                      child: Padding(
                                        padding: const EdgeInsets.all(8),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(m.body),
                                            Text(
                                                formatDateWIB(m.createdAt),
                                                style: const TextStyle(
                                                    color: Colors.grey,
                                                    fontSize: 11)),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _draft,
                              maxLength: 2000,
                              decoration: const InputDecoration(
                                  hintText: 'Tulis pesan',
                                  counterText: ''),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.send),
                            onPressed: busy
                                ? null
                                : () async {
                                    setState(() => busy = true);
                                    try {
                                      await _api.sendMessage(widget.convId,
                                          uid, _storeIds(), _draft.text);
                                      _draft.clear();
                                      await _load();
                                    } catch (e) {
                                      if (mounted) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(SnackBar(
                                                content: Text(e
                                                    .toString()
                                                    .replaceFirst(
                                                        'Exception: ', ''))));
                                      }
                                    } finally {
                                      if (mounted) {
                                        setState(() => busy = false);
                                      }
                                    }
                                  },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}
