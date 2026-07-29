// components/globalAdmin/ui/Modal.jsx
import { motion } from 'framer-motion';

export default function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        exit={{ scale: 0.9,    opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, padding: '28px 32px',
          maxWidth: 480, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
            {title}
          </h3>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, background: '#FEE2E2' }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: '1px solid #F0F0F0', background: '#F9FAFB',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#6B7280',
            }}
          >×</motion.button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}