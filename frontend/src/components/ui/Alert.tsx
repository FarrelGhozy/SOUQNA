import React from 'react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  className?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', className = '', children }) => {
  return (
    <div className={`alert alert-${variant} ${className}`} role="alert">
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};
