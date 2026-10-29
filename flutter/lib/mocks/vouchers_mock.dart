// Mirror frontend/src/mocks/extras.mock.ts (vouchers) — kode/aturan sama persis.
class VoucherMock {
  final String id;
  final String code;
  final String description;
  final String discountType; // fixed_amount
  final int discountValue;
  final int minimumSubtotal;
  final String startsAt;
  final String endsAt;
  final bool isActive;
  const VoucherMock({
    required this.id,
    required this.code,
    required this.description,
    required this.discountType,
    required this.discountValue,
    required this.minimumSubtotal,
    required this.startsAt,
    required this.endsAt,
    required this.isActive,
  });
}

final _now = DateTime.now().toUtc();
String _ago(int days) => _now.subtract(Duration(days: days)).toIso8601String();
String _in(int days) => _now.add(Duration(days: days)).toIso8601String();

final vouchersMock = [
  VoucherMock(
    id: 'v-1', code: 'HEMAT5K', description: 'Potongan 5rb min belanja 30rb',
    discountType: 'fixed_amount', discountValue: 5000, minimumSubtotal: 30000,
    startsAt: _ago(1), endsAt: _in(30), isActive: true,
  ),
  VoucherMock(
    id: 'v-2', code: 'KADALUARSA', description: 'Contoh expired',
    discountType: 'fixed_amount', discountValue: 10000, minimumSubtotal: 0,
    startsAt: _ago(30), endsAt: _ago(1), isActive: true,
  ),
];
