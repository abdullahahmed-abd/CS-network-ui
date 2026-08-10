import { motion, AnimatePresence } from 'framer-motion';
import { resolvePhotoUrl } from '../../api/profileOperationsApi';

const navItems = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'media_hub', label: 'Media Hub', icon: '🎬' },
  { id: 'franchises', label: 'Franchises', icon: '🏢' },
  { id: 'directory', label: 'Directory', icon: '📖' },
  { id: 'events', label: 'Events', icon: '🎉' },
  { id: 'meetings', label: 'Meetings', icon: '📅' },
  { id: 'partnerships', label: 'Partnerships', icon: '🤝' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export { navItems };

export default function Sidebar({ open, activeNav, setActiveNav, user, onLogout, onOpenProfile }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          key="sidebar"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 250, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(180deg, #166534 0%, #15803D 40%, #16A34A 100%)',
            flexShrink: 0, display: 'flex', flexDirection: 'column',
            boxShadow: '4px 0 20px rgba(22,101,52,0.15)',
            height: '100vh', overflow: 'hidden',
          }}
        >
          {/* ── Logo ── */}
          <div style={{
            padding: '28px 22px 22px',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.15)',
              }}>🛡️</div>
              <div>
                <div style={{
                  color: '#fff', fontWeight: 800, fontSize: 15,
                  whiteSpace: 'nowrap', letterSpacing: '-0.3px',
                }}>Connect Souq</div>
                <div style={{
                  fontSize: 9, fontWeight: 700, color: '#BBF7D0',
                  background: 'rgba(255,255,255,0.15)', borderRadius: 4,
                  padding: '2px 8px', display: 'inline-block', marginTop: 3,
                  letterSpacing: '0.8px', textTransform: 'uppercase',
                }}>Global Admin</div>
              </div>
            </div>
          </div>

          {/* ── Nav ── */}
          <nav style={{
            flex: 1, padding: '18px 14px',
            overflowY: 'auto', overflowX: 'hidden', minHeight: 0,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '1px',
              padding: '0 12px 10px',
            }}>Menu</div>

            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  whileHover={{ x: 3, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 12, padding: '11px 14px', borderRadius: 12,
                    marginBottom: 4, border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontSize: 13,
                    fontWeight: isActive ? 700 : 600, whiteSpace: 'nowrap',
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)',
                    boxShadow: isActive
                      ? '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                      : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: 17, filter: isActive ? 'none' : 'grayscale(30%)' }}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        marginLeft: 'auto', width: 6, height: 6,
                        borderRadius: '50%', background: '#BBF7D0',
                        boxShadow: '0 0 8px rgba(187,247,208,0.6)',
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* ── User + Logout ── */}
          <div style={{
            padding: '16px 16px 22px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}>
            <motion.div
              whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.14)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenProfile}
              title="Click to view / edit My Profile"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 14, padding: '10px 12px', borderRadius: 12,
                background: 'rgba(255,255,255,0.08)', cursor: 'pointer',
              }}
            >
              {(() => {
                const photoSrc = resolvePhotoUrl(user?.profilePhotoUrl || user?.profilePicture);
                return photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={user?.fullName || 'Admin'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                    style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #BBF7D0, #86EFAC)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#166534', fontWeight: 800, fontSize: 15,
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}>
                    {(user?.fullName || user?.email || 'A')[0].toUpperCase()}
                  </div>
                );
              })()}
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{
                  color: '#fff', fontWeight: 700, fontSize: 12,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{user?.fullName || 'Admin'}</div>
                <div style={{
                  color: 'rgba(255,255,255,0.5)', fontSize: 10,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{user?.email || 'Click to edit profile'}</div>
              </div>
            </motion.div>

            <motion.button
              onClick={onLogout}
              whileHover={{ scale: 1.02, background: 'rgba(239,68,68,0.2)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FCA5A5', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 8, justifyContent: 'center', transition: 'all 0.2s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </motion.button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}