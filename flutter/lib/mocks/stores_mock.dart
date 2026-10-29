// Mirror frontend/src/mocks/stores.mock.ts — ID/status sama persis.
class StoreMock {
  final String id;
  final String name;
  final String description;
  final String pickupLocation;
  final bool deliveryAvailable;
  final int deliveryFee;
  final String status;
  final String ownerId;
  const StoreMock({
    required this.id,
    required this.name,
    required this.description,
    required this.pickupLocation,
    required this.deliveryAvailable,
    required this.deliveryFee,
    required this.status,
    required this.ownerId,
  });
}

const storesMock = [
  StoreMock(id: 'store-01', name: 'Kantin Berkah Jaya', description: 'Jajanan dan katering harian kampus.', pickupLocation: 'Kantin Lt.1 Blok A', deliveryAvailable: true, deliveryFee: 5000, status: 'active', ownerId: 'user-merchant-1'),
  StoreMock(id: 'store-02', name: 'Hijab Nusa', description: 'Hijab dan fashion muslimah.', pickupLocation: 'Ruko Kampus No.3', deliveryAvailable: true, deliveryFee: 7000, status: 'active', ownerId: 'user-merchant-2'),
  StoreMock(id: 'store-03', name: 'PrintQu Cepat', description: 'Print, jilid, dan ATK.', pickupLocation: 'Perpustakaan Lt.1', deliveryAvailable: false, deliveryFee: 0, status: 'active', ownerId: 'user-merchant-3'),
  StoreMock(id: 'store-04', name: 'Gadget Corner (Nonaktif)', description: 'Contoh toko nonaktif — tidak bisa checkout.', pickupLocation: '-', deliveryAvailable: false, deliveryFee: 0, status: 'inactive', ownerId: 'user-merchant-4'),
];
