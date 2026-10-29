import React from 'react';
import type { OrderStatus } from '../../types/index.js';

export interface BadgeProps {
  variant?: 'warning' | 'info' | 'success' | 'danger' | 'gold' | 'muted';
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'muted', className = '', children }) => {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus | string }> = ({ status }) => {
  switch (status) {
    case 'pending_merchant_confirmation':
      return <Badge variant="warning">Menunggu konfirmasi</Badge>;
    case 'accepted':
      return <Badge variant="info">Diterima merchant</Badge>;
    case 'ready_for_pickup':
      return <Badge variant="info">Siap diambil</Badge>;
    case 'out_for_delivery':
      return <Badge variant="info">Sedang diantar</Badge>;
    case 'received_by_buyer':
      return <Badge variant="warning">Diterima, menunggu pelunasan</Badge>;
    case 'completed':
      return <Badge variant="success">Selesai</Badge>;
    case 'rejected':
      return <Badge variant="danger">Ditolak</Badge>;
    case 'cancelled':
      return <Badge variant="muted">Dibatalkan</Badge>;
    default:
      return <Badge variant="muted">{status}</Badge>;
  }
};

export const PaymentBadge: React.FC<{ status: 'unpaid' | 'paid' | string }> = ({ status }) => {
  if (status === 'paid') {
    return <Badge variant="success">Lunas (COD)</Badge>;
  }
  return <Badge variant="warning">Belum dibayar</Badge>;
};

export const DeliveryBadge: React.FC<{ method: 'pickup' | 'merchant_delivery' | string }> = ({ method }) => {
  if (method === 'pickup') {
    return <Badge variant="info">Ambil sendiri</Badge>;
  }
  return <Badge variant="gold">Diantar merchant</Badge>;
};
