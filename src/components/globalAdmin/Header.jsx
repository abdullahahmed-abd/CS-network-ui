// components/globalAdmin/Header.jsx
import { motion } from 'framer-motion';
import { navItems } from './Sidebar';

export default function Header({ activeNav, sidebarOpen, onToggleSidebar }) {
  return (
    <header style={{
      background: '#fff', padding: '14px 28px',
      borderBottom: '1px solid #E8F0E0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
      boxShadow: '0 1px 4px rgba(22,101,52,0.04)', zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <motion.button
          onClick={onToggleSidebar}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: sidebarOpen ? 'transparent' : '#F0FDF4',
            border: sidebarOpen ? 'none' : '1px solid #BBF7D0',
            cursor: 'pointer', padding: 8, borderRadius: 10,
            color: '#16A34A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </motion.button>

        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 800, color: '#1A3A1A',
            margin: 0, letterSpacing: '-0.3px',
          }}>
            {navItems.find((n) => n.id === activeNav)?.label}
          </h1>
          <p style={{ fontSize: 11, color: '#6B8F71', margin: 0, fontWeight: 500 }}>
            Global Admin Panel
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 16px', borderRadius: 20,
        background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
        border: '1px solid #BBF7D0',
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: '#22C55E',
          boxShadow: '0 0 6px rgba(34,197,94,0.5)',
        }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
          🛡️ Admin
        </span>
      </div>
    </header>
  );
}