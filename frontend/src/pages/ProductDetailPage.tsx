import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB, formatIDR } from '../lib/format.js';
import type { Product, Review, Store } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Alert } from '../components/ui/Alert.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { useToast } from '../components/ui/ToastContext.js';
import { ChatIcon, HeartIcon, StarIcon } from '../components/ui/Icons.js';

export function ProductDetailPage() {
  const { productId } = useParams();
  const nav = useNavigate();
  const toast = useToast();

  const [p, setP] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wished, setWished] = useState(false);
  const [sel, setSel] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const prod = await api.getProduct(productId);
        if (!prod) {
          setError('Produk tidak ditemukan atau telah dihapus.');
          setP(null);
          return;
        }
        setP(prod);
        setSel(0);
        setQuantity(1);
        const [s, r] = await Promise.all([
          api.getStore(prod.store_id),
          api.getReviews(prod.id),
        ]);
        setStore(s);
        setReviews(r);
        setWished(await api.isWishlisted(prod.id));
      } catch {
        setError('Gagal memuat informasi produk. Coba lagi.');
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
        <Skeleton height={380} borderRadius="var(--radius-lg)" />
        <div>
          <Skeleton height={24} width="30%" style={{ marginBottom: 16 }} />
          <Skeleton height={36} width="80%" style={{ marginBottom: 16 }} />
          <Skeleton height={32} width="40%" style={{ marginBottom: 24 }} />
          <Skeleton height={100} style={{ marginBottom: 24 }} />
          <Skeleton height={48} width="60%" />
        </div>
      </div>
    );
  }

  if (error || !p) {
    return (
      <div style={{ padding: 'var(--space-8) 0' }}>
        <Alert variant="danger">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span>{error || 'Produk tidak ditemukan.'}</span>
            <Link to="/search">
              <Button variant="secondary" size="sm">Kembali ke Pencarian</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  const v = p.variants[sel];
  const habis = p.variants.every((x) => x.stock_quantity === 0);
  const hidden = p.status !== 'published';
  const storeOff = !store || store.status !== 'active';
  const variantHabis = !v || v.stock_quantity === 0;
  const blocked = habis || hidden || storeOff || variantHabis;

  const handleAddToCart = async (goToCart = false) => {
    if (!v) return;
    try {
      setAddingToCart(true);
      await api.addToCart(v.id, quantity);
      toast.success(`${p.name} (${v.label}) berhasil ditambahkan ke keranjang.`);
      if (goToCart) {
        nav('/cart');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menambahkan ke keranjang.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    try {
      if (wished) {
        await api.removeFromWishlist(p.id);
        setWished(false);
        toast.info('Dihapus dari wishlist.');
      } else {
        await api.addToWishlist(p.id);
        setWished(true);
        toast.success('Disimpan ke wishlist!');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal memperbarui wishlist.');
    }
  };

  const handleChatStore = async () => {
    try {
      const c = await api.getOrCreateConversation(p.store_id);
      nav(`/chat?thread=${c.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal membuka obrolan toko.');
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link to="/">Beranda</Link>
        <span>/</span>
        <Link to="/search">Katalog</Link>
        <span>/</span>
        <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>{p.name}</span>
      </nav>

      {/* Main 2-Column Product Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-8)',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Image & Store Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div
            className="card"
            style={{
              overflow: 'hidden',
              position: 'relative',
              aspectRatio: '1 / 1',
              background: 'var(--surface-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={p.image_url}
              alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            {habis && (
              <div style={{ position: 'absolute', top: 16, left: 16 }}>
                <Badge variant="danger">Stok Habis</Badge>
              </div>
            )}
          </div>

          {/* Store Card */}
          {store && (
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'var(--unida-navy)',
                      color: 'var(--unida-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 800,
                    }}
                  >
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Link
                      to={`/stores/${store.id}`}
                      style={{ fontWeight: 700, fontSize: '15px', color: 'var(--unida-navy)' }}
                    >
                      {store.name}
                    </Link>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 2 }}>
                      {store.status === 'active' ? '✓ Toko Aktif' : 'Toko Nonaktif'} · {store.pickup_location}
                    </div>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleChatStore}>
                  <ChatIcon size={16} />
                  <span>Chat Toko</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Details, Variants, Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-2)' }}>
              {storeOff ? (
                <Badge variant="danger">Toko Nonaktif</Badge>
              ) : hidden ? (
                <Badge variant="warning">Produk Diarsipkan</Badge>
              ) : habis ? (
                <Badge variant="danger">Stok Habis</Badge>
              ) : (
                <Badge variant="success">Tersedia</Badge>
              )}
              {avgRating && (
                <span style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <StarIcon size={14} fill="var(--warning)" />
                  <span>{avgRating} ({reviews.length} ulasan)</span>
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '26px', lineHeight: 1.3, marginBottom: 'var(--space-2)' }}>
              {p.name}
            </h1>

            <div
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--unida-navy)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {v ? formatIDR(v.price) : '-'}
            </div>
          </div>

          {/* Warning alerts if blocked */}
          {hidden && <Alert variant="warning">Produk ini sedang disembunyikan oleh penjual.</Alert>}
          {storeOff && <Alert variant="danger">Toko penjual saat ini sedang tidak beroperasi.</Alert>}
          {habis && !hidden && !storeOff && <Alert variant="warning">Semua varian produk ini habis terjual.</Alert>}

          {/* Variant Selection */}
          <div>
            <label className="form-label" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>
              Pilih Varian
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {p.variants.map((x, i) => {
                const isSelected = i === sel;
                const isOut = x.stock_quantity === 0;
                return (
                  <button
                    key={x.id}
                    disabled={isOut}
                    onClick={() => {
                      setSel(i);
                      setQuantity(1);
                    }}
                    style={{
                      background: isSelected ? 'var(--unida-navy)' : 'var(--surface)',
                      color: isSelected ? 'var(--surface)' : isOut ? 'var(--muted)' : 'var(--unida-text)',
                      border: isSelected
                        ? '2px solid var(--unida-navy)'
                        : isOut
                        ? '1px dashed var(--border)'
                        : '1px solid var(--border-strong)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: isOut ? 'not-allowed' : 'pointer',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                      minWidth: 100,
                    }}
                  >
                    <span>{x.label}</span>
                    <span style={{ fontSize: '11px', opacity: isSelected ? 0.85 : 0.65 }}>
                      {isOut ? 'Habis' : `Stok: ${x.stock_quantity}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper */}
          {v && v.stock_quantity > 0 && !storeOff && !hidden && (
            <div>
              <label className="form-label" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>
                Jumlah Pembelian
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface)',
                  }}
                >
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: '8px 14px',
                      fontSize: '16px',
                      cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                      color: 'var(--unida-navy)',
                    }}
                  >
                    −
                  </button>
                  <span style={{ padding: '0 12px', fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= v.stock_quantity}
                    onClick={() => setQuantity((q) => Math.min(v.stock_quantity, q + 1))}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: '8px 14px',
                      fontSize: '16px',
                      cursor: quantity >= v.stock_quantity ? 'not-allowed' : 'pointer',
                      color: 'var(--unida-navy)',
                    }}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Sisa {v.stock_quantity} buah
                </span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              disabled={blocked}
              loading={addingToCart}
              onClick={() => handleAddToCart(false)}
              style={{ flex: 1, minWidth: 160 }}
            >
              + Keranjang
            </Button>
            <Button
              variant="gold"
              size="lg"
              disabled={blocked}
              onClick={() => handleAddToCart(true)}
              style={{ minWidth: 140 }}
            >
              Beli Sekarang
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleToggleWishlist}
              style={{
                color: wished ? 'var(--danger)' : 'var(--unida-navy)',
                borderColor: wished ? 'var(--danger)' : 'var(--border-strong)',
              }}
              title={wished ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
            >
              <HeartIcon size={16} fill={wished ? 'currentColor' : 'none'} />
              <span>{wished ? 'Disimpan' : 'Wishlist'}</span>
            </Button>
          </div>

          {/* Description Section */}
          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '16px' }}>Deskripsi Produk</h3>
            </div>
            <div className="card-body">
              <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6, margin: 0, fontSize: '14px' }}>
                {p.description || 'Tidak ada deskripsi rinci untuk produk ini.'}
              </p>
              <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
                Dipublikasikan pada {formatDateWIB(p.created_at)} WIB
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '20px' }}>
            Ulasan Pembeli ({reviews.length})
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', margin: 0 }}>
              Belum ada ulasan untuk produk ini. Jadilah pembeli pertama yang memberikan ulasan!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {reviews.map((r) => (
              <div key={r.id} className="card" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <div style={{ color: 'var(--warning)', fontSize: '16px', letterSpacing: 2 }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {formatDateWIB(r.created_at)} WIB
                  </span>
                </div>
                <p style={{ fontSize: '14px', margin: 0, color: 'var(--unida-text)' }}>
                  {r.review_text || '(Tidak ada komentar tertulis)'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
