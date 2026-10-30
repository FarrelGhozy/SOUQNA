import React from 'react';
import { Button } from './Button.js';
import { OrdersIcon } from './Icons.js';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-4)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-strong)',
        margin: 'var(--space-4) 0',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--surface-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-3)',
          color: 'var(--muted)',
        }}
      >
        {icon || <OrdersIcon size={24} />}
      </div>
      <h3 style={{ fontSize: '18px', color: 'var(--unida-navy)', marginBottom: 'var(--space-1)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: 400, marginBottom: actionLabel ? 'var(--space-4)' : 0 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
