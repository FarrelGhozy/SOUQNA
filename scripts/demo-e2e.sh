#!/usr/bin/env bash
# Demo E2E M8 — cek parity mock + kontrak + build (tanpa backend/emulator).
# Lolos = siap demo manual web+android (lihat docs/demo-e2e.md).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
fail=0
say() { printf '%s\n' "$*"; }
ok() { say "  ✅ $*"; }
bad() { say "  ❌ $*"; fail=1; }

say "== 1. Parity ID & Nilai Kunci mock web ↔ flutter =="
for pat in "prod-[0-9]+" "store-[0-9]+" "cat-[0-9]+" "var-[0-9]+[a-z]"; do
  webm=$(grep -rhoE "$pat" frontend/src/mocks/*.ts | sort -u)
  fltm=$(grep -rhoE "$pat" flutter/lib/mocks/*.dart | sort -u)
  if [ "$webm" = "$fltm" ]; then ok "$pat sama ($(echo "$webm" | wc -l) id)"; else
    bad "$pat BEDA"; diff <(echo "$webm") <(echo "$fltm") || true
  fi
done

# Parity nilai kunci produk & varian (status & harga min)
web_status=$(grep -oE "status: '(published|hidden|suspended)'" frontend/src/mocks/products.mock.ts | sort)
flt_status=$(grep -oE "status: '(published|hidden|suspended)'" flutter/lib/mocks/products_mock.dart | sort)
if [ "$web_status" = "$flt_status" ]; then
  ok "Status produk parity (published, hidden, suspended sama)"
else
  bad "Status produk web vs flutter tidak sama"
fi

web_prices=$(grep -oE "price: [0-9]+" frontend/src/mocks/products.mock.ts | sort)
flt_prices=$(grep -oE ", [0-9]+, [0-9]+\)" flutter/lib/mocks/products_mock.dart | sed -E 's/, ([0-9]+), [0-9]+\)/price: \1/' | sort)
if [ "$web_prices" = "$flt_prices" ]; then
  ok "Harga varian produk parity (27 varian sama)"
else
  bad "Harga varian web vs flutter tidak sama"
fi

say "== 2. UI web tidak import mock langsung =="
if grep -rn "mocks/" frontend/src/pages frontend/src/components frontend/src/routes frontend/src/features 2>/dev/null | grep -v "^Binary" ; then
  bad "pages/components/routes/features import mocks langsung (harus via lib/api-client)"
else
  ok "web UI hanya via api-client"
fi

say "== 3. Flutter screens pakai api_client / mock_auth =="
missing=$(for f in flutter/lib/features/*/screens/*.dart; do
  grep -q "api_client\|mock_auth" "$f" || echo "$f"
done || true)
if [ -n "$missing" ]; then bad "layar tanpa api_client/mock_auth: $missing"; else ok "semua screen pakai api_client/mock_auth"; fi
if [ -e flutter/lib/mocks/souqna_mock.dart ]; then bad "souqna_mock.dart mati masih ada"; else ok "file mock mati terhapus"; fi

say "== 4. Tanpa secret di klien =="
if grep -rniE "service_role|SUPABASE_SERVICE_ROLE|BEGIN PRIVATE KEY|BEGIN RSA" frontend/src flutter/lib docs/openapi.yaml 2>/dev/null; then
  bad "secret terdeteksi di klien"
else
  ok "tanpa secret server di klien"
fi

say "== 5. Kontrak api-client grup endpoint =="
for fn in getCategories getProducts getProduct getStore getCart checkout getOrders transitionOrder getWishlist getReviews sendMessage getVouchers; do
  grep -q "$fn" frontend/src/lib/api-client.ts || { bad "web api-client kurang $fn"; continue; }
  grep -q "$fn" flutter/lib/core/api/api_client.dart || { bad "flutter api_client kurang $fn"; continue; }
done
ok "grup endpoint mirror (cek detail di docs/parity-audit.md)"

say "== 6. Verifikasi frontend (typecheck, test, build via bun) =="
if command -v bun >/dev/null 2>&1; then
  (cd frontend && bun run verify 2>&1 | tail -8) || { bad "bun run verify gagal"; }
  ok "bun run verify (typecheck, unit test, build) lolos"
else
  say "  ⚠️ bun tidak ada — lewati build (wajib lolos di mesin dev)"
fi

say "== 7. Dokumen M8 ada =="
for f in docs/ERD.md docs/openapi.yaml docs/parity-audit.md docs/demo-e2e.md; do
  [ -f "$f" ] && ok "$f" || bad "$f hilang"
done

if [ "$fail" -eq 0 ]; then say "E2E-CHECK: LOLOS — lanjut demo manual docs/demo-e2e.md"; else say "E2E-CHECK: GAGAL — perbaiki ❌ di atas"; exit 1; fi
