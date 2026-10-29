# 5. Model Data (Ringkas)

> Disarikan dari §8. Skema Drizzle menyusul; mock frontend/flutter harus pakai bentuk ini.

## Konvensi

- PK UUID. Waktu `timestamptz`, tampil Asia/Jakarta.
- Uang `numeric(12,2)`, jangan float. Stok int ≥0. `created_at/updated_at` di tabel audit.
- Status via enum/constraint. Snapshot order (nama/opsi/harga) agar riwayat tidak berubah saat katalog berubah.

## Tabel inti

- `profiles(id=auth.user, full_name, phone, avatar_url, default_location)`
- `user_roles(user_id, role[admin], created_at)` — pembeli = tanpa row; merchant = punya toko.
- `categories(id, name, slug!, description, is_active)` — admin only.
- `stores(id, owner_id!1-1, name, slug!, description, logo_url, pickup_location, delivery_available, delivery_fee, status[active|inactive|suspended])`
- `products(id, store_id, category_id, name, slug, description, status[draft|published|hidden|suspended])` — harga/stok di variasi.
- `product_images(id, product_id, storage_path|image_url, sort_order)`
- `product_variants(id, product_id, sku?, label|options JSON, price≥0, stock≥0, is_active)`
- `cart_items(id, user_id, product_variant_id, quantity)` — unique `(user_id, variant)`.
- `checkouts(id, buyer_id→null saat anonim, checkout_code!, subtotal, discount_total, grand_total)`
- `orders(id, checkout_id, store_id, buyer_id→null, status, payment_method=cod, payment_status[unpaid|paid], delivery_method[pickup|merchant_delivery], delivery_fee snapshot, subtotal, discount_amount, grand_total, buyer_*_snapshot→anonim, handover_location_snapshot, buyer_note)` — unique `(checkout_id, store_id)`.
- `order_items(id, order_id, product_id?, variant_id?, *_snapshot, unit_price, quantity, line_total)` — relasi tanpa cascade hapus riwayat.
- `order_status_history(id, order_id, from→to, changed_by?, note?)`
- `vouchers(id, code!upper, description, discount_type[%|fixed], discount_value, minimum_subtotal, maximum_discount?, starts/ends_at, usage_limit?, used_count, is_active, created_by)` — admin only. 1 voucher per checkout (`voucher_redemptions.checkout_id` unique).
- `voucher_redemptions(id, voucher_id, checkout_id!, user_id?, discount_amount)`
- `wishlist_items(id, user_id, product_id)` — unique `(user_id, product_id)`.
- `conversations(id, buyer_id, store_id)` — unik per pasangan. `messages(id, conversation_id, sender_id, body≤2000, created_at)` — purge `>7 hari`, thread tetap ada.
- `reviews(id, order_item_id!1-1, product_id, buyer_id, rating 1–5, review_text?, display_name_snapshot?)` — hanya order completed milik sendiri.
- `admin_audit_logs(id, admin_user_id, action, target_type, target_id, metadata JSON tanpa secret)`

## Relasi (konseptual)

```
auth.users ─ profiles, user_roles, stores(1-1 owner)
stores ─ products ─ product_variants ─ cart_items
users ─ checkouts ─ orders (per store) ─ order_items ─ reviews
orders ─ order_status_history
vouchers ─ redemptions ─ checkouts
users ─ wishlist_items ─ products
stores ─ conversations ─ messages
```

ERD visual: `docs/ERD.md` (TODO).
Mock TS/Dart wajib pakai nama field yang sama agar migrasi ke API nyata tinggal ganti transport.
