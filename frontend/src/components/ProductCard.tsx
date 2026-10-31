import { Link } from 'react-router-dom';
import { formatIDR } from '../lib/format.js';
import { isProductOutOfStock, productMinPrice } from '../lib/api-client.js';
import type { Product } from '../types/index.js';
import { Badge } from './ui/Badge.js';
import { StoreIcon } from './ui/Icons.js';

// Kartu produk profesional UNIDA Gontor — harga dari helper, gambar wajib fallback onError.
// storeName dioper parent (resolve via api.getStores sekali), bukan import mock langsung.
export function ProductCard({ p, storeName }: { p: Product; storeName?: string }) {
  const habis = isProductOutOfStock(p);
  const minPrice = productMinPrice(p);

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        opacity: habis ? 0.85 : 1,
      }}
    >
      <Link
        to={`/products/${p.id}`}
        style={{
          display: 'block',
          position: 'relative',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          background: 'var(--surface-muted)',
        }}
      >
        <img
          src={p.image_url}
          alt={p.name}
          className="product-img"
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {habis ? (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          >
            <Badge variant="danger">Stok habis</Badge>
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          >
            <span
              style={{
                background: 'rgba(11, 42, 74, 0.85)',
                color: 'var(--unida-gold)',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                backdropFilter: 'blur(4px)',
                display: 'inline-block',
              }}
            >
              COD
            </span>
          </div>
        )}
      </Link>

      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link
          to={`/products/${p.id}`}
          style={{
            color: 'var(--unida-text)',
            fontWeight: 600,
            fontSize: 'var(--font-size-small)',
            lineHeight: 1.35,
            marginBottom: 'var(--space-1)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.7em',
            textDecoration: 'none',
          }}
        >
          {p.name}
        </Link>
        <Link
          to={`/stores/${p.store_id}`}
          aria-label={`Toko ${storeName ?? '-'}`}
          style={{
            color: 'var(--muted)',
            fontSize: '12px',
            textDecoration: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 2,
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--unida-blue)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <StoreIcon size={13} />
          <span>{storeName ?? '-'}</span>
        </Link>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: 'var(--unida-navy)',
            }}
          >
            {formatIDR(minPrice)}
          </div>
        </div>
      </div>
    </div>
  );
}
