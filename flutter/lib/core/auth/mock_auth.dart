import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../mocks/users_mock.dart';

// Mock-auth dummy — satu-satunya sumber sesi. Guard baca dari sini,
// bukan dari input user. Role tidak pernah ditulis dari form.
class MockAuth {
  MockAuth._();
  static final instance = MockAuth._();

  final ValueNotifier<UserMock?> session = ValueNotifier(null);
  static const _key = 'souqna:session';
  static const _extraKey = 'souqna:extra-users';
  static const _ovKey = 'souqna:profile-overrides';

  bool _loaded = false;

  Future<void> ensureLoaded() async {
    if (_loaded) return;
    _loaded = true;
    try {
      final sp = await SharedPreferences.getInstance();
      final raw = sp.getString(_key);
      if (raw != null) {
        // Rekonstruksi ringan: cari di preset/extra, lalu terapkan override.
        // Format: simpan id + snapshot.
        session.value = _findById(_idOf(raw));
      }
    } catch (_) {}
  }

  String _idOf(String raw) {
    final m = RegExp(r'"id":"([^"]+)"').firstMatch(raw);
    return m?.group(1) ?? '';
  }

  UserMock? _findById(String id) {
    for (final u in usersMock) {
      if (u.id == id) return u;
    }
    return null;
  }

  Future<void> _persist() async {
    try {
      final sp = await SharedPreferences.getInstance();
      final s = session.value;
      if (s == null) {
        await sp.remove(_key);
      } else {
        await sp.setString(_key, '{"id":"${s.id}"}');
      }
    } catch (_) {}
  }

  List<UserMock> _extras = [];

  UserMock? _findByEmail(String email) {
    final e = email.trim().toLowerCase();
    for (final u in _extras) {
      if (u.email.toLowerCase() == e) return u;
    }
    for (final u in usersMock) {
      if (u.email.toLowerCase() == e) return u;
    }
    return null;
  }

  bool validEmail(String email) =>
      RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email.trim());

  /// Login dummy: email apa saja. Dikenal → akun itu; asing → buyer baru.
  Future<UserMock> loginWithEmail(String email) async {
    if (!validEmail(email)) throw Exception('Email tidak valid.');
    final found = _findByEmail(email);
    if (found != null) {
      session.value = found;
    } else {
      final name = email.trim().toLowerCase().split('@')[0].replaceAll(RegExp(r'[._-]+'), ' ').trim();
      session.value = UserMock(
        id: 'user-local-${DateTime.now().millisecondsSinceEpoch}',
        fullName: name.isEmpty ? 'Pembeli Baru' : name,
        email: email.trim(),
        role: 'buyer',
        hasStore: false,
      );
      _extras.add(session.value!);
      try {
        final sp = await SharedPreferences.getInstance();
        await sp.setString(_extraKey, _extras.map((u) => u.email).join(','));
      } catch (_) {}
    }
    await _persist();
    return session.value!;
  }

  /// Register dummy: selalu buyer baru (atau login bila email sudah ada).
  Future<UserMock> register(String name, String email) async {
    if (name.trim().isEmpty) throw Exception('Nama wajib diisi.');
    if (!validEmail(email)) throw Exception('Email tidak valid.');
    final u = await loginWithEmail(email);
    session.value = u.copyWith(fullName: name.trim());
    await _persist();
    return session.value!;
  }

  /// Switch peran demo antar akun preset (bukan dari input user).
  Future<UserMock> loginAs(String role) async {
    session.value = usersMock.firstWhere((u) => u.role == role, orElse: () => usersMock[0]);
    await _persist();
    return session.value!;
  }

  Future<UserMock> updateProfile({String? fullName, String? phone, String? defaultLocation}) async {
    final s = session.value;
    if (s == null) throw Exception('Belum login.');
    if (fullName != null && fullName.trim().isEmpty) throw Exception('Nama tidak boleh kosong.');
    session.value = s.copyWith(
      fullName: fullName ?? s.fullName,
      phone: phone ?? s.phone,
      defaultLocation: defaultLocation ?? s.defaultLocation,
    );
    try {
      final sp = await SharedPreferences.getInstance();
      await sp.setString('$_ovKey:${s.id}', '${session.value!.fullName}|${session.value!.phone ?? ''}|${session.value!.defaultLocation ?? ''}');
    } catch (_) {}
    await _persist();
    return session.value!;
  }

  Future<void> logout() async {
    session.value = null;
    await _persist();
  }

  /// Tandai sesi punya toko (dipanggil setelah createMyStore sukses).
  Future<UserMock> attachStore(String storeId) async {
    final s = session.value;
    if (s == null) throw Exception('Belum login.');
    session.value = s.copyWith(hasStore: true, storeId: storeId);
    await _persist();
    return session.value!;
  }
}
