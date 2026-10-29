import React from 'react';

export const Skeleton: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = 20, borderRadius, className = '', style }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: borderRadius ?? 'var(--radius-sm)',
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="card" style={{ padding: 12 }}>
      <Skeleton height={180} borderRadius="var(--radius-md)" style={{ marginBottom: 12 }} />
      <Skeleton height={18} width="85%" style={{ marginBottom: 8 }} />
      <Skeleton height={16} width="50%" style={{ marginBottom: 12 }} />
      <Skeleton height={20} width="65%" />
    </div>
  );
};
