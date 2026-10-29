# ERD — SOUQNA

Sumber: `SOUQNA_MVP.md` §8.3. Skema Drizzle (`db/schema/`) menyusul di fase backend;
mock `frontend/src/mocks/*` ↔ `flutter/lib/mocks/*` sudah memakai nama tabel/kolom yang sama.

```mermaid
erDiagram
    AUTH_USERS ||--o| PROFILES : has
    AUTH_USERS ||--o{ USER_ROLES : assigned
    AUTH_USERS ||--o| STORES : owns
    STORES ||--o{ PRODUCTS : lists
    CATEGORIES ||--o{ PRODUCTS : classifies
    PRODUCTS ||--o{ PRODUCT_VARIANTS : has
    PRODUCTS ||--o{ PRODUCT_IMAGES : has
    AUTH_USERS ||--o{ CART_ITEMS : owns
    PRODUCT_VARIANTS ||--o{ CART_ITEMS : selected
    AUTH_USERS ||--o{ CHECKOUTS : places
    CHECKOUTS ||--o{ ORDERS : splits_into
    STORES ||--o{ ORDERS : fulfills
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_STATUS_HISTORY : records
    VOUCHERS ||--o{ VOUCHER_REDEMPTIONS : redeemed
    CHECKOUTS ||--o| VOUCHER_REDEMPTIONS : applies
    AUTH_USERS ||--o{ WISHLIST_ITEMS : saves
    PRODUCTS ||--o{ WISHLIST_ITEMS : wished
    STORES ||--o{ CONVERSATIONS : receives
    CONVERSATIONS ||--o{ MESSAGES : contains
    ORDER_ITEMS ||--o| REVIEWS : reviewed_by
```

Catatan implementasi (lihat `docs/data-model.md`):
- `stores.owner_id` unik (1 akun = 1 toko). `cart_items(user_id, variant_id)` unik.
- `orders(checkout_id, store_id)` unik. `voucher_redemptions.checkout_id` unik (1 voucher/checkout).
- `wishlist_items(user_id, product_id)` unik. `reviews.order_item_id` unik (1 ulasan/item).
- Snapshot order (`*_snapshot`) + relasi tanpa cascade agar riwayat selamat dari hapus akun/katalog.
