import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatIDR } from '../lib/format.js';
import type { Product, Store } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import { ProductCardSkeleton, Skeleton } from '../components/ui/Skeleton.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Alert } from '../components/ui/Alert.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { useToast } from '../components/ui/ToastContext.js';
import { ChatIcon } from '../components/ui/Icons.js';

export function StoreDetailPage() {
  const { storeId } = useParams();
  const nav = useNavigate();
  const toast = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [prods, setProds] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const s = await api.getStore(storeId);
        if (!s) {
          setError('Toko tidak ditemukan.');
          return;
        }
        setStore(s);
        setProds(await api.getStoreProducts(s.id));
      } catch {
        setError('Gagal memuat profil toko. Coba lagi.');
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <Skeleton height={140} borderRadius="var(--radius-lg)" />
        <div className="grid-products">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div style={{ padding: 'var(--space-8) 0' }}>
        <Alert variant="danger">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span>{error || 'Toko tidak ditemukan.'}</span>
            <Link to="/">
              <Button variant="secondary" size="sm">Kembali ke Beranda</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  const off = store.status !== 'active';

  const handleChat = async () => {
    try {
      const c = await api.getOrCreateConversation(store.id);
      nav(`/chat?thread=${c.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal membuka obrolan toko.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8 }}>
        <Link to="/">Beranda</Link>
        <span>/</span>
        <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>{store.name}</span>
      </nav>

      {/* Store Header Card */}
      <div
        className="card"
        style={{
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--unida-navy)',
                color: 'var(--unida-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 800,
              }}
            >
              {store.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '24px', margin: 0 }}>{store.name}</h1>
                {store.status === 'active' ? (
                  <Badge variant="success">Aktif</Badge>
                ) : (
                  <Badge variant="danger">Nonaktif</Badge>
                )}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0 0' }}>
                {store.description || 'Tidak ada deskripsi toko.'}
              </p>
            </div>
          </div>

          <Button variant="primary" size="md" onClick={handleChat}>
            <ChatIcon size={16} />
            <span>Chat Penjual</span>
          </Button>
        </div>

        {off && (
          <Alert variant="warning">
            Toko ini sedang nonaktif. Produk yang terdaftar tidak dapat dipesan untuk saat ini.
          </Alert>
        )}

        {/* Store Logistics Info */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-6)',
            flexWrap: 'wrap',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border)',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: 'var(--muted)' }}>Lokasi Pengambilan: </span>
            <strong>{store.pickup_location}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--muted)' }}>Layanan Antar: </span>
            <strong>
              {store.delivery_available
                ? `Tersedia (${store.delivery_fee === 0 ? 'Gratis' : formatIDR(store.delivery_fee)})`
                : 'Ambil di tempat saja'}
            </strong>
          </div>
        </div>
      </div>

      {/* Store Products */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '20px' }}>
            Katalog Produk Toko ({prods.length})
          </h2>
        </div>

        {prods.length === 0 ? (
          <EmptyState
            title="Belum Ada Produk"
            description="Toko ini belum menambahkan produk yang siap dijual."
          />
        ) : (
          <div className="grid-products">
            {prods.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
