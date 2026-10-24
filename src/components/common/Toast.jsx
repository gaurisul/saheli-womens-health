import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '20px',
        right: '24px',
        zIndex: 1000,
        backgroundColor: isError ? '#991B1B' : isInfo ? '#2A4365' : '#4F142A',
        color: '#FFFFFF',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.88rem',
        fontWeight: '500',
        animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '380px'
      }}
    >
      {isError ? (
        <AlertCircle size={18} color="#FCA5A5" />
      ) : isInfo ? (
        <Info size={18} color="#90CDF4" />
      ) : (
        <CheckCircle2 size={18} color="#E8BACB" />
      )}
      <span style={{ flex: 1 }}>{toast.message}</span>
    </div>
  );
}
