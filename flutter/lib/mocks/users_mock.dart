// Mirror frontend/src/mocks/extras.mock.ts (users) — ID/email/peran sama persis.
class UserMock {
  final String id;
  final String fullName;
  final String email;
  final String role; // buyer | merchant | admin
  final bool hasStore;
  final String? storeId;
  final String? phone;
  final String? defaultLocation;
  const UserMock({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
    required this.hasStore,
    this.storeId,
    this.phone,
    this.defaultLocation,
  });

  UserMock copyWith({String? fullName, String? phone, String? defaultLocation, bool? hasStore, String? storeId}) => UserMock(
    id: id, fullName: fullName ?? this.fullName, email: email,
    role: role, hasStore: hasStore ?? this.hasStore, storeId: storeId ?? this.storeId,
    phone: phone ?? this.phone, defaultLocation: defaultLocation ?? this.defaultLocation,
  );
}

const usersMock = [
  UserMock(id: 'user-buyer-1', fullName: 'Budi Pembeli', email: 'budi@kampus.ac.id', role: 'buyer', hasStore: false),
  UserMock(id: 'user-merchant-1', fullName: 'Siti Kantin', email: 'siti@kantin.id', role: 'merchant', hasStore: true, storeId: 'store-01'),
  UserMock(id: 'user-admin-1', fullName: 'Admin Souqna', email: 'admin@souqna.id', role: 'admin', hasStore: false),
];
