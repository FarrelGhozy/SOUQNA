import { Link } from 'react-router-dom';
import { formatIDR } from '../lib/format.js';
import { isProductOutOfStock, productMinPrice } from '../lib/api-client.js';
import type { Product } from '../types/index.js';
import { Badge } from './ui/Badge.js';

// Kartu produk profesional UNIDA Gontor — harga dari helper, gambar wajib fallback onError.
export function ProductCard({ p }: { p: Product }) {
  const habis = isProductOutOfStock(p);
  const minPrice = productMinPrice(p);

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        opacity: habis ? 0.8 : 1,
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
        {habis && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          >
            <Badge variant="danger">Stok habis</Badge>
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
          }}
        >
          {p.name}
        </Link>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
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
