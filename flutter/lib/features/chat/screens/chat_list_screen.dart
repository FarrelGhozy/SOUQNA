import 'package:flutter/material.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/mock_auth.dart';
import '../../../shared/theme/app_theme.dart';
import 'thread_screen.dart';

// Daftar thread chat milik user (pembeli + toko miliknya).
class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});
  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  final _api = ApiClient();
  final _auth = MockAuth.instance;
  bool loading = true;
  String? err;
  List<ConversationMock> threads = [];
  Map<String, String> names = {};

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
    if (uid.isEmpty) {
      setState(() => loading = false);
      return;
    }
    try {
      threads = await _api.getConversations(uid, _storeIds());
      for (final t in threads) {
        final st = await _api.getStore(t.storeId);
        if (st != null) names[t.storeId] = st.name;
      }
    } catch (e) {
      err = e.toString().replaceFirst('Exception: ', '');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        flexibleSpace: AppTheme.topBarFlexibleSpace,
        title: const Text('Chat'),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : _auth.session.value == null
              ? const Center(child: Text('Masuk dulu untuk membuka chat.'))
              : err != null
                  ? Center(
                      child:
                          Text(err!, style: const TextStyle(color: Colors.red)))
                  : threads.isEmpty
                      ? const Center(
                          child: Text(
                              'Belum ada thread. Mulai dari halaman toko/produk.'))
                      : ListView(
                          padding: const EdgeInsets.all(12),
                          children: [
                            for (final t in threads)
                              Card(
                                child: ListTile(
                                  leading: const Icon(Icons.chat_bubble),
                                  title: Text(names[t.storeId] ?? t.storeId,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold)),
                                  subtitle: Text(t.id),
                                  onTap: () => Navigator.of(context)
                                      .push(MaterialPageRoute(
                                          builder: (_) => ThreadScreen(
                                              convId: t.id)))
                                      .then((_) => _load()),
                                ),
                              ),
                          ],
                        ),
    );
  }
}
