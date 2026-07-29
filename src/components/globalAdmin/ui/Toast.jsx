// components/globalAdmin/ui/Toast.jsx
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: '#F0FDF4', border: '#BBF7D0', color: '#166534', icon: '✅' },
    error:   { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B', icon: '❌' },
    info:    { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF', icon: 'ℹ️' },
  };

  const c = colors[type] || colors.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0,   x: '-50%' }}
      exit={{ opacity: 0,   y: -20,  x: '-50%' }}
      style={{
        position: 'fixed', top: 20, left: '50%',
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: 14, padding: '14px 24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10,
        maxWidth: 500, minWidth: 300,
      }}
    >
      <span style={{ fontSize: 18 }}>{c.icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: c.color, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: c.color, fontSize: 16, padding: 0, lineHeight: 1,
        }}
      >×</button>
    </motion.div>
  );
}