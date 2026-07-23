import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearTokens, getUserData } from '../api/auth';
import {
  createMasterFranchise,
  inviteMasterOperator,
  verifyInvitation,
  acceptInvitation,
  createEvent,
  fetchAllEvents,
  fetchEventRegistrations,
  approveRegistration,
  rejectRegistration,
} from '../api/adminApi';

const navItems = [
  { id: 'overview',     label: 'Overview',     icon: '🏠' },
  { id: 'franchises',   label: 'Franchises',   icon: '🏢' },
  { id: 'invitations',  label: 'Invitations',  icon: '📨' },
  { id: 'events',       label: 'Events',       icon: '🎉' },
  { id: 'users',        label: 'Users',        icon: '👥' },
  { id: 'settings',     label: 'Settings',     icon: '⚙️' },
];

export default function GlobalAdminDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebar] = useState(true);
  const user = getUserData() || {};

  const handleLogout = () => {
    clearTokens();
    onLogout?.();
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: '#F7FAF4',
      fontFamily: 'Manrope, sans-serif',
    }}>

      {/* ── Sidebar ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(180deg, #166534 0%, #15803D 40%, #16A34A 100%)',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 20px rgba(22,101,52,0.15)',
              height: '100vh',
              overflow: 'hidden',
            }}
          >
            {/* Logo */}
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

            {/* Nav */}
            <nav style={{
              flex: 1, padding: '18px 14px',
              overflowY: 'auto', overflowX: 'hidden', minHeight: 0,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px 10px',
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

            {/* User + Logout */}
            <div style={{
              padding: '16px 16px 22px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              flexShrink: 0,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 14, padding: '10px 12px', borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #BBF7D0, #86EFAC)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#166534', fontWeight: 800, fontSize: 15,
                  border: '2px solid rgba(255,255,255,0.2)',
                }}>
                  {(user.fullName || 'A')[0].toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{
                    color: '#fff', fontWeight: 700, fontSize: 12,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{user.fullName || 'Admin'}</div>
                  <div style={{
                    color: 'rgba(255,255,255,0.5)', fontSize: 10,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{user.email || ''}</div>
                </div>
              </div>

              <motion.button
                onClick={handleLogout}
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
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* ── Main ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        height: '100vh', minWidth: 0, overflow: 'hidden',
      }}>
        {/* Top Bar */}
        <header style={{
          background: '#fff', padding: '14px 28px',
          borderBottom: '1px solid #E8F0E0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, boxShadow: '0 1px 4px rgba(22,101,52,0.04)', zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.button
              onClick={() => setSidebar((v) => !v)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: sidebarOpen ? 'transparent' : '#F0FDF4',
                border: sidebarOpen ? 'none' : '1px solid #BBF7D0',
                cursor: 'pointer', padding: 8, borderRadius: 10,
                color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
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

        {/* Page Content */}
        <main style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '28px', background: '#F7FAF4', minHeight: 0,
          WebkitOverflowScrolling: 'touch',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              {activeNav === 'overview'    && <OverviewTab onNavigate={setActiveNav} />}
              {activeNav === 'franchises'  && <FranchisesTab />}
              {activeNav === 'invitations' && <InvitationsTab />}
              {activeNav === 'events'      && <EventsTab />}
              {activeNav === 'users'       && <PlaceholderTab name="users" />}
              {activeNav === 'settings'    && <PlaceholderTab name="settings" />}
            </motion.div>
          </AnimatePresence>
          <div style={{ height: 40 }} />
        </main>
      </div>

      <style>{`
        * { scrollbar-width: thin; scrollbar-color: #BBF7D0 transparent; }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: #BBF7D0; border-radius: 10px; }
        *::-webkit-scrollbar-thumb:hover { background: #86EFAC; }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Toast Component                 ═══ */
/* ════════════════════════════════════════ */
function Toast({ message, type = 'success', onClose }) {
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
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
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

/* ════════════════════════════════════════ */
/* ═══ Modal Component                 ═══ */
/* ════════════════════════════════════════ */
function Modal({ title, onClose, children }) {
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
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, padding: '28px 32px',
          maxWidth: 480, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24,
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

/* ════════════════════════════════════════ */
/* ═══ Input Component                 ═══ */
/* ════════════════════════════════════════ */
function InputField({ label, value, onChange, placeholder, disabled }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: '#1A3A1A', marginBottom: 6,
      }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #E8F0E0', background: disabled ? '#F7FAF4' : '#fff',
          fontSize: 14, fontWeight: 500, color: '#1A3A1A',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          transition: 'border 0.2s',
          boxSizing: 'border-box',
          opacity: disabled ? 0.7 : 1,
        }}
        onFocus={(e) => { if (!disabled) e.target.style.borderColor = '#16A34A'; }}
        onBlur={(e) => { e.target.style.borderColor = '#E8F0E0'; }}
      />
    </div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Textarea Component              ═══ */
/* ════════════════════════════════════════ */
function TextareaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: '#1A3A1A', marginBottom: 6,
      }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #E8F0E0', background: '#fff',
          fontSize: 14, fontWeight: 500, color: '#1A3A1A',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          transition: 'border 0.2s', resize: 'vertical',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#16A34A'; }}
        onBlur={(e) => { e.target.style.borderColor = '#E8F0E0'; }}
      />
    </div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Select Component                ═══ */
/* ════════════════════════════════════════ */
function SelectField({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: '#1A3A1A', marginBottom: 6,
      }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #E8F0E0', background: '#fff',
          fontSize: 14, fontWeight: 500, color: '#1A3A1A',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ DateTime Input                  ═══ */
/* ════════════════════════════════════════ */
function DateTimeField({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: '#1A3A1A', marginBottom: 6,
      }}>{label}</label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #E8F0E0', background: '#fff',
          fontSize: 14, fontWeight: 500, color: '#1A3A1A',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Checkbox Field                  ═══ */
/* ════════════════════════════════════════ */
function CheckboxField({ label, checked, onChange }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 12,
      border: '1px solid #E8F0E0', background: '#fff',
      cursor: 'pointer', marginBottom: 16,
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 18, height: 18, accentColor: '#16A34A', cursor: 'pointer' }}
      />
      <span style={{ fontSize: 13, fontWeight: 700, color: '#1A3A1A' }}>
        {label}
      </span>
    </label>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Green Button                    ═══ */
/* ════════════════════════════════════════ */
function GreenButton({ onClick, loading, children, fullWidth, variant = 'primary' }) {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #16A34A, #15803D)',
      color: '#fff', border: 'none',
    },
    outline: {
      background: '#fff',
      color: '#16A34A',
      border: '1.5px solid #16A34A',
    },
  };

  const s = styles[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      style={{
        ...s,
        padding: '12px 24px', borderRadius: 12,
        fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: fullWidth ? '100%' : 'auto',
        opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          style={{
            width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff', borderRadius: '50%',
          }}
        />
      )}
      {children}
    </motion.button>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Section Title & Helper Styles   ═══ */
/* ════════════════════════════════════════ */
function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 800, color: '#166534',
      margin: '20px 0 12px', padding: '8px 0',
      borderBottom: '2px solid #F0FDF4',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>{children}</div>
  );
}

const sectionAddBtnStyle = {
  padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
  background: '#16A34A', color: '#fff', border: 'none', cursor: 'pointer',
};

const removeBtnStyle = {
  padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
  background: '#FEE2E2', color: '#991B1B', border: 'none', cursor: 'pointer',
};

/* ════════════════════════════════════════ */
/* ═══ OVERVIEW TAB                    ═══ */
/* ════════════════════════════════════════ */
function OverviewTab({ onNavigate }) {
  const quickActions = [
    {
      label: 'Create Franchise',
      icon: '🏢',
      desc: 'Create master franchise for a country',
      nav: 'franchises',
    },
    {
      label: 'Send Invitation',
      icon: '📨',
      desc: 'Invite operator for a franchise',
      nav: 'invitations',
    },
    {
      label: 'Manage Events',
      icon: '🎉',
      desc: 'Create events & manage registrations',
      nav: 'events',
    },
    {
      label: 'Manage Users',
      icon: '👥',
      desc: 'View and manage all users',
      nav: 'users',
    },
    {
      label: 'Settings',
      icon: '⚙️',
      desc: 'Platform configuration',
      nav: 'settings',
    },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #166534, #16A34A, #22C55E)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 24,
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -30, right: -20,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <h2 style={{
          fontSize: 22, fontWeight: 800, margin: '0 0 6px 0',
          position: 'relative', zIndex: 1,
        }}>Welcome back, Admin 👋</h2>
        <p style={{
          fontSize: 13, margin: 0, opacity: 0.85,
          fontWeight: 500, position: 'relative', zIndex: 1,
        }}>Manage your franchises, events and operators from here.</p>
      </motion.div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 18,
      }}>
        {quickActions.map((a, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(22,163,74,0.12)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(a.nav)}
            style={{
              background: '#fff', borderRadius: 18, padding: '24px',
              border: '1px solid #E8F0E0', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.3s ease',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: '#F0FDF4', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 24, marginBottom: 14, border: '1px solid #E8F0E0',
            }}>{a.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A3A1A', marginBottom: 4 }}>
              {a.label}
            </div>
            <div style={{ fontSize: 12, color: '#6B8F71', fontWeight: 500 }}>
              {a.desc}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ FRANCHISES TAB                  ═══ */
/* ════════════════════════════════════════ */
function FranchisesTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName]             = useState('');
  const [country, setCountry]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);

  const [franchises, setFranchises] = useState([]);

  const [inviteFranchiseId, setInviteFranchiseId]   = useState('');
  const [inviteLoading, setInviteLoading]           = useState(false);
  const [inviteResult, setInviteResult]             = useState(null);

  const handleCreate = async () => {
    if (!name.trim() || !country.trim()) {
      setToast({ message: 'Please fill franchise name and country', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await createMasterFranchise(name.trim(), country.trim());
      console.log('✅ Franchise created:', res);

      setFranchises((prev) => [...prev, {
        id: res.franchiseId,
        name: res.franchiseName || name,
        country: res.country || country,
        inviteLink: res.inviteLink,
      }]);

      setToast({ message: res.message || 'Master Franchise created successfully!', type: 'success' });
      setName('');
      setCountry('');
      setShowCreate(false);
    } catch (err) {
      console.error('❌ Create error:', err);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteFranchiseId) {
      setToast({ message: 'Please enter franchise ID', type: 'error' });
      return;
    }

    setInviteLoading(true);
    setInviteResult(null);
    try {
      const res = await inviteMasterOperator(Number(inviteFranchiseId));
      console.log('✅ Invite created:', res);
      setInviteResult(res);
      setToast({ message: res.message || 'Invitation created!', type: 'success' });
    } catch (err) {
      console.error('❌ Invite error:', err);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast({ message: 'Link copied to clipboard!', type: 'success' });
    });
  };

  return (
    <div>
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
            Master Franchises
          </h2>
          <p style={{ fontSize: 12, color: '#6B8F71', margin: '4px 0 0', fontWeight: 500 }}>
            Create and manage country-level franchises
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <GreenButton variant="outline" onClick={() => { setShowInvite(true); setInviteResult(null); }}>
            📨 Invite Operator
          </GreenButton>
          <GreenButton onClick={() => setShowCreate(true)}>
            ➕ Create Franchise
          </GreenButton>
        </div>
      </div>

      {/* Franchises List */}
      {franchises.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: '#fff', borderRadius: 20, padding: '60px 40px',
            textAlign: 'center', border: '1px solid #E8F0E0',
          }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: '#F0FDF4', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 20px', border: '1px solid #BBF7D0',
          }}>🏢</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', marginBottom: 8 }}>
            No Franchises Yet
          </h3>
          <p style={{ color: '#6B8F71', fontSize: 14, marginBottom: 20 }}>
            Create your first master franchise to get started
          </p>
          <GreenButton onClick={() => setShowCreate(true)}>
            ➕ Create First Franchise
          </GreenButton>
        </motion.div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {franchises.map((f, i) => (
            <motion.div
              key={f.id || i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: '#fff', borderRadius: 16, padding: '22px 24px',
                border: '1px solid #E8F0E0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#F0FDF4', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, border: '1px solid #E8F0E0',
                }}>🏢</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1A3A1A' }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B8F71', fontWeight: 500 }}>
                    🌍 {f.country}
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto', padding: '4px 10px', borderRadius: 8,
                  background: '#F0FDF4', border: '1px solid #BBF7D0',
                  fontSize: 11, fontWeight: 700, color: '#16A34A',
                }}>
                  ID: {f.id}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <GreenButton
                  variant="outline"
                  onClick={() => {
                    setInviteFranchiseId(String(f.id));
                    setInviteResult(null);
                    setShowInvite(true);
                  }}
                >
                  📨 Invite Operator
                </GreenButton>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Franchise Modal */}
      <AnimatePresence>
        {showCreate && (
          <Modal title="Create Master Franchise" onClose={() => setShowCreate(false)}>
            <InputField
              label="Franchise Name"
              value={name}
              onChange={setName}
              placeholder="e.g. India Master"
            />
            <InputField
              label="Country"
              value={country}
              onChange={setCountry}
              placeholder="e.g. India"
            />
            <div style={{ marginTop: 8 }}>
              <GreenButton fullWidth onClick={handleCreate} loading={loading}>
                {loading ? 'Creating...' : '🏢 Create Master Franchise'}
              </GreenButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Invite Operator Modal */}
      <AnimatePresence>
        {showInvite && (
          <Modal title="Invite Master Operator" onClose={() => setShowInvite(false)}>
            <InputField
              label="Franchise ID"
              value={inviteFranchiseId}
              onChange={setInviteFranchiseId}
              placeholder="e.g. 1"
            />

            {!inviteResult && (
              <GreenButton fullWidth onClick={handleInvite} loading={inviteLoading}>
                {inviteLoading ? 'Generating...' : '🔗 Generate Invite Link'}
              </GreenButton>
            )}

            <AnimatePresence>
              {inviteResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 20, padding: '20px',
                    background: '#F0FDF4', borderRadius: 14,
                    border: '1px solid #BBF7D0',
                  }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 12,
                  }}>✅ Invitation Created!</div>

                  {inviteResult.inviteLink && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 600, color: '#6B8F71', marginBottom: 6,
                      }}>Invite Link:</div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: '#fff', padding: '10px 14px', borderRadius: 10,
                        border: '1px solid #E8F0E0',
                      }}>
                        <div style={{
                          flex: 1, fontSize: 12, color: '#1A3A1A',
                          wordBreak: 'break-all', fontFamily: 'monospace',
                        }}>
                          {inviteResult.inviteLink}
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(inviteResult.inviteLink)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            padding: '6px 12px', borderRadius: 8,
                            background: '#16A34A', color: '#fff',
                            border: 'none', cursor: 'pointer',
                            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                          }}
                        >📋 Copy</motion.button>
                      </div>
                    </div>
                  )}

                  {inviteResult.expiresAt && (
                    <div style={{ fontSize: 11, color: '#6B8F71' }}>
                      ⏰ Expires: {new Date(inviteResult.expiresAt).toLocaleString()}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ INVITATIONS TAB                 ═══ */
/* ════════════════════════════════════════ */
function InvitationsTab() {
  const [token, setToken]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);

  const handleVerify = async () => {
    if (!token.trim()) {
      setToast({ message: 'Please enter invitation token', type: 'error' });
      return;
    }

    setLoading(true);
    setVerifyResult(null);
    try {
      const res = await verifyInvitation(token.trim());
      console.log('✅ Verify result:', res);
      setVerifyResult(res);
      setToast({ message: 'Invitation verified successfully!', type: 'success' });
    } catch (err) {
      console.error('❌ Verify error:', err);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token.trim()) return;

    setAcceptLoading(true);
    try {
      const res = await acceptInvitation(token.trim());
      console.log('✅ Accept result:', res);
      setToast({ message: res.message || 'Invitation accepted!', type: 'success' });
      setVerifyResult(null);
      setToken('');
    } catch (err) {
      console.error('❌ Accept error:', err);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setAcceptLoading(false);
    }
  };

  return (
    <div>
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: '0 0 6px' }}>
        Verify & Accept Invitations
      </h2>
      <p style={{ fontSize: 12, color: '#6B8F71', margin: '0 0 24px', fontWeight: 500 }}>
        Paste an invitation token to verify and accept it
      </p>

      <div style={{
        background: '#fff', borderRadius: 18, padding: '28px 30px',
        border: '1px solid #E8F0E0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        maxWidth: 600,
      }}>
        <InputField
          label="Invitation Token"
          value={token}
          onChange={setToken}
          placeholder="Paste invitation token here..."
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <GreenButton onClick={handleVerify} loading={loading}>
            {loading ? 'Verifying...' : '🔍 Verify Token'}
          </GreenButton>
        </div>

        <AnimatePresence>
          {verifyResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginTop: 24, padding: '24px',
                background: verifyResult.valid ? '#F0FDF4' : '#FEF2F2',
                borderRadius: 16,
                border: `1px solid ${verifyResult.valid ? '#BBF7D0' : '#FECACA'}`,
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
              }}>
                <span style={{ fontSize: 24 }}>
                  {verifyResult.valid ? '✅' : '❌'}
                </span>
                <div>
                  <div style={{
                    fontSize: 15, fontWeight: 800,
                    color: verifyResult.valid ? '#166534' : '#991B1B',
                  }}>
                    {verifyResult.valid ? 'Valid Invitation' : 'Invalid Invitation'}
                  </div>
                  {verifyResult.message && (
                    <div style={{
                      fontSize: 12, color: verifyResult.valid ? '#6B8F71' : '#DC2626',
                      marginTop: 2,
                    }}>
                      {verifyResult.message}
                    </div>
                  )}
                </div>
              </div>

              {verifyResult.valid && (
                <>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                    marginBottom: 16,
                  }}>
                    {[
                      { label: 'Purpose', value: verifyResult.purpose },
                      { label: 'Franchise', value: verifyResult.franchiseName },
                      { label: 'Type', value: verifyResult.franchiseType },
                      { label: 'Country', value: verifyResult.country },
                    ].filter(x => x.value).map((item, i) => (
                      <div key={i} style={{
                        background: '#fff', padding: '10px 14px', borderRadius: 10,
                        border: '1px solid #E8F0E0',
                      }}>
                        <div style={{ fontSize: 10, color: '#6B8F71', fontWeight: 600, marginBottom: 2 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A3A1A' }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {verifyResult.expiresAt && (
                    <div style={{
                      fontSize: 11, color: '#6B8F71', marginBottom: 16,
                    }}>
                      ⏰ Expires: {new Date(verifyResult.expiresAt).toLocaleString()}
                    </div>
                  )}

                  <GreenButton fullWidth onClick={handleAccept} loading={acceptLoading}>
                    {acceptLoading ? 'Accepting...' : '✅ Accept Invitation'}
                  </GreenButton>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ EVENTS TAB                      ═══ */
/* ════════════════════════════════════════ */
function EventsTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [managingEvent, setManagingEvent] = useState(null);

  const loadEvents = async (pg = 0) => {
    setLoading(true);
    try {
      const res = await fetchAllEvents(pg, 10);
      console.log('✅ Events fetched:', res);
      setEvents(res.events || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.totalRecords || 0);
    } catch (err) {
      console.error('❌ Fetch events error:', err);
      setToast({ message: err.message || 'Failed to load events', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(page);
  }, [page]);

  const filteredEvents = events.filter(ev => {
    if (filter === 'ALL')       return true;
    if (filter === 'ONLINE')    return ev.eventType === 'ONLINE';
    if (filter === 'IN_PERSON') return ev.eventType === 'IN_PERSON';
    if (filter === 'FREE')      return !ev.paid;
    if (filter === 'PAID')      return ev.paid;
    return true;
  });

  const onlineCount   = events.filter(e => e.eventType === 'ONLINE').length;
  const inPersonCount = events.filter(e => e.eventType === 'IN_PERSON').length;
  const paidCount     = events.filter(e => e.paid).length;
  const freeCount     = events.filter(e => !e.paid).length;

  return (
    <div>
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
            Events Management
          </h2>
          <p style={{ fontSize: 12, color: '#6B8F71', margin: '4px 0 0', fontWeight: 500 }}>
            {totalRecords > 0
              ? `${totalRecords} event${totalRecords > 1 ? 's' : ''} published`
              : 'Create and manage events (Online / In-Person, Free / Paid)'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <GreenButton variant="outline" onClick={() => loadEvents(page)} loading={loading}>
            🔄 Refresh
          </GreenButton>
          <GreenButton onClick={() => setShowCreate(true)}>
            ➕ Create Event
          </GreenButton>
        </div>
      </div>

      {/* Stats Cards */}
      {events.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}>
          {[
            { label: 'Total Events',  value: totalRecords,   icon: '🎉', bg: '#F0FDF4', color: '#16A34A' },
            { label: 'Online',        value: onlineCount,    icon: '💻', bg: '#DBEAFE', color: '#1E40AF' },
            { label: 'In-Person',     value: inPersonCount,  icon: '📍', bg: '#FEF3C7', color: '#92400E' },
            { label: 'Paid',          value: paidCount,      icon: '💰', bg: '#FCE7F3', color: '#9F1239' },
            { label: 'Free',          value: freeCount,      icon: '🆓', bg: '#DCFCE7', color: '#166534' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: '#fff', borderRadius: 14, padding: '14px 16px',
                border: '1px solid #E8F0E0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: s.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: '#6B8F71', fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter Chips */}
      {events.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'ALL',       label: 'All Events', icon: '📋' },
            { id: 'ONLINE',    label: 'Online',     icon: '💻' },
            { id: 'IN_PERSON', label: 'In-Person',  icon: '📍' },
            { id: 'FREE',      label: 'Free',       icon: '🆓' },
            { id: 'PAID',      label: 'Paid',       icon: '💰' },
          ].map(f => {
            const active = filter === f.id;
            return (
              <motion.button
                key={f.id}
                onClick={() => setFilter(f.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '8px 16px', borderRadius: 20,
                  fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: 6,
                  border: active ? 'none' : '1px solid #E8F0E0',
                  background: active
                    ? 'linear-gradient(135deg, #16A34A, #15803D)'
                    : '#fff',
                  color: active ? '#fff' : '#6B8F71',
                  boxShadow: active ? '0 4px 12px rgba(22,163,74,0.25)' : 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                <span>{f.icon}</span>
                {f.label}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 20px', gap: 16,
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{
              width: 40, height: 40,
              border: '3px solid #E8F0E0',
              borderTopColor: '#16A34A',
              borderRadius: '50%',
            }}
          />
          <p style={{ fontSize: 13, color: '#6B8F71', fontWeight: 600 }}>
            Loading events...
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: '#fff', borderRadius: 20, padding: '60px 40px',
            textAlign: 'center', border: '1px solid #E8F0E0',
          }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: '#F0FDF4', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 20px', border: '1px solid #BBF7D0',
          }}>🎉</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', marginBottom: 8 }}>
            {events.length === 0 ? 'No Events Yet' : `No ${filter.toLowerCase().replace('_', '-')} events`}
          </h3>
          <p style={{ color: '#6B8F71', fontSize: 14, marginBottom: 20 }}>
            {events.length === 0
              ? 'Create your first event to get started'
              : 'Try a different filter'}
          </p>
          {events.length === 0 && (
            <GreenButton onClick={() => setShowCreate(true)}>
              ➕ Create First Event
            </GreenButton>
          )}
        </motion.div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 18,
          }}>
            {filteredEvents.map((e, i) => (
              <EventCard
                key={e.id || i}
                event={e}
                index={i}
                onManageRegistrations={setManagingEvent}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, marginTop: 32,
            }}>
              <motion.button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                whileHover={{ scale: page === 0 ? 1 : 1.05 }}
                whileTap={{ scale: page === 0 ? 1 : 0.95 }}
                style={{
                  padding: '8px 14px', borderRadius: 10,
                  border: '1px solid #E8F0E0', background: '#fff',
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  opacity: page === 0 ? 0.4 : 1,
                  fontSize: 14, fontWeight: 700, color: '#16A34A',
                }}
              >
                ← Prev
              </motion.button>

              <span style={{
                padding: '8px 16px', borderRadius: 10,
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                fontSize: 12, fontWeight: 700, color: '#166534',
              }}>
                Page {page + 1} of {totalPages}
              </span>

              <motion.button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                whileHover={{ scale: page >= totalPages - 1 ? 1 : 1.05 }}
                whileTap={{ scale: page >= totalPages - 1 ? 1 : 0.95 }}
                style={{
                  padding: '8px 14px', borderRadius: 10,
                  border: '1px solid #E8F0E0', background: '#fff',
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages - 1 ? 0.4 : 1,
                  fontSize: 14, fontWeight: 700, color: '#16A34A',
                }}
              >
                Next →
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateEventModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setToast({ message: 'Event created and published!', type: 'success' });
              setShowCreate(false);
              loadEvents(0);
              setPage(0);
            }}
            onError={(msg) => setToast({ message: msg, type: 'error' })}
          />
        )}
      </AnimatePresence>

      {/* Manage Registrations Modal */}
      <AnimatePresence>
        {managingEvent && (
          <EventRegistrationsModal
            event={managingEvent}
            onClose={() => setManagingEvent(null)}
            onToast={setToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Event Card (Clickable)          ═══ */
/* ════════════════════════════════════════ */
function EventCard({ event, index, onManageRegistrations }) {
  const isOnline = event.eventType === 'ONLINE';
  const isPaid = event.paid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(22,163,74,0.15)' }}
      style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        border: '1px solid #E8F0E0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s',
      }}
    >
      {/* Cover / Header */}
      <div style={{
        height: 130,
        background: event.coverImageUrl
          ? `url(${event.coverImageUrl}) center/cover`
          : 'linear-gradient(135deg, #16A34A, #22C55E, #4ADE80)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.4) 100%)',
        }} />

        <div style={{
          position: 'absolute', top: 10, right: 10,
          padding: '4px 10px', borderRadius: 8,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
          fontSize: 10, fontWeight: 700, color: '#166534',
        }}>
          #{event.id}
        </div>

        <div style={{
          position: 'absolute', bottom: 10, left: 10, right: 10,
          display: 'flex', gap: 6, flexWrap: 'wrap',
        }}>
          <span style={{
            padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
            background: isOnline ? 'rgba(59,130,246,0.9)' : 'rgba(249,115,22,0.9)',
            color: '#fff', backdropFilter: 'blur(8px)',
          }}>
            {isOnline ? '💻 ONLINE' : '📍 IN-PERSON'}
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
            background: isPaid ? 'rgba(236,72,153,0.9)' : 'rgba(16,185,129,0.9)',
            color: '#fff', backdropFilter: 'blur(8px)',
          }}>
            {isPaid ? `💰 PAID` : '🆓 FREE'}
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
            background: 'rgba(255,255,255,0.25)',
            color: '#fff', backdropFilter: 'blur(8px)',
          }}>
            ✓ {event.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px' }}>
        <div style={{
          fontSize: 15, fontWeight: 800, color: '#1A3A1A',
          marginBottom: 10, lineHeight: 1.35,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {event.title}
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          fontSize: 12, color: '#6B8F71', marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#F0FDF4', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, flexShrink: 0,
            }}>📅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>DATE</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A1A' }}>
                {new Date(event.startDateTime).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </div>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: 8,
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              fontSize: 11, fontWeight: 700, color: '#166534',
            }}>
              {new Date(event.startDateTime).toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>

          {!isOnline && event.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: '#FEF3C7', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>📍</div>
              <div>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>CITY</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A1A' }}>
                  {event.city}
                </div>
              </div>
            </div>
          )}

          {isOnline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: '#DBEAFE', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>🌐</div>
              <div>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>MODE</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A1A' }}>
                  Virtual Event
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manage Registrations Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onManageRegistrations(event)}
          style={{
            width: '100%',
            padding: '10px 14px', borderRadius: 10,
            background: 'linear-gradient(135deg, #16A34A, #15803D)',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'Manrope, sans-serif',
            boxShadow: '0 4px 12px rgba(22,163,74,0.25)',
          }}
        >
          👥 Manage Registrations
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Event Registrations Modal       ═══ */
/* ════════════════════════════════════════ */
function EventRegistrationsModal({ event, onClose, onToast }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetchEventRegistrations(event.id);
      console.log('✅ Registrations fetched:', res);
      setRegistrations(res.registrations || []);
    } catch (err) {
      console.error('❌ Fetch registrations error:', err);
      onToast({ message: err.message || 'Failed to load registrations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [event.id]);

  const handleApprove = async (regId) => {
    setProcessingId(regId);
    try {
      const res = await approveRegistration(regId);
      console.log('✅ Approved:', res);
      onToast({ message: res.message || 'Registration approved!', type: 'success' });
      await loadRegistrations();
    } catch (err) {
      onToast({ message: err.message || 'Failed to approve', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (regId) => {
    if (!rejectNotes.trim()) {
      onToast({ message: 'Please enter rejection reason', type: 'error' });
      return;
    }
    setProcessingId(regId);
    try {
      const res = await rejectRegistration(regId, rejectNotes.trim());
      console.log('✅ Rejected:', res);
      onToast({ message: res.message || 'Registration rejected', type: 'success' });
      setRejectingId(null);
      setRejectNotes('');
      await loadRegistrations();
    } catch (err) {
      onToast({ message: err.message || 'Failed to reject', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount   = registrations.filter(r => r.status === 'PENDING_APPROVAL').length;
  const confirmedCount = registrations.filter(r => r.status === 'CONFIRMED').length;
  const paymentPending = registrations.filter(r => r.status === 'PAYMENT_PENDING').length;
  const rejectedCount  = registrations.filter(r => r.status === 'REJECTED').length;

  const filtered = statusFilter === 'ALL'
    ? registrations
    : registrations.filter(r => r.status === statusFilter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20,
          maxWidth: 820, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          maxHeight: '90vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #166534, #16A34A)',
          padding: '20px 28px', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, opacity: 0.85,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Event #{event.id} • Registrations
            </div>
            <div style={{
              fontSize: 17, fontWeight: 800, marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {event.title}
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
              👥 {registrations.length} total registration{registrations.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: 'none', background: 'rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginLeft: 12,
            }}
          >×</button>
        </div>

        {/* Stats Bar */}
        <div style={{
          padding: '14px 28px', background: '#F9FAFB',
          borderBottom: '1px solid #E8F0E0',
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {[
            { key: 'ALL',              label: 'All',       value: registrations.length, bg: '#F0FDF4', color: '#166534' },
            { key: 'PENDING_APPROVAL', label: 'Pending',   value: pendingCount,          bg: '#FEF3C7', color: '#92400E' },
            { key: 'CONFIRMED',        label: 'Confirmed', value: confirmedCount,        bg: '#DCFCE7', color: '#166534' },
            { key: 'PAYMENT_PENDING',  label: 'Payment',   value: paymentPending,        bg: '#FCE7F3', color: '#9F1239' },
            { key: 'REJECTED',         label: 'Rejected',  value: rejectedCount,         bg: '#FEE2E2', color: '#991B1B' },
          ].map(s => {
            const active = statusFilter === s.key;
            return (
              <motion.button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: active ? s.color : s.bg,
                  color: active ? '#fff' : s.color,
                  border: active ? 'none' : '1px solid transparent',
                  fontSize: 11, fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Manrope, sans-serif',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800 }}>{s.value}</span>
                {s.label}
              </motion.button>
            );
          })}
          <button
            onClick={loadRegistrations}
            style={{
              marginLeft: 'auto', padding: '6px 12px', borderRadius: 8,
              border: '1px solid #E8F0E0', background: '#fff',
              cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#16A34A',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 28px',
        }}>
          {loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '60px 20px', gap: 12,
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: 32, height: 32,
                  border: '3px solid #E8F0E0',
                  borderTopColor: '#16A34A',
                  borderRadius: '50%',
                }}
              />
              <p style={{ fontSize: 12, color: '#6B8F71', fontWeight: 600 }}>
                Loading registrations...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              padding: '60px 20px', textAlign: 'center',
            }}>
              <div style={{
                width: 70, height: 70, borderRadius: 20,
                background: '#F0FDF4', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, border: '1px solid #BBF7D0',
              }}>👥</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1A3A1A', marginBottom: 6 }}>
                {registrations.length === 0 ? 'No Registrations Yet' : `No ${statusFilter.toLowerCase().replace('_', ' ')} registrations`}
              </div>
              <div style={{ fontSize: 12, color: '#6B8F71' }}>
                {registrations.length === 0
                  ? 'Members will appear here when they register'
                  : 'Try a different filter'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((reg, i) => (
                <RegistrationRow
                  key={reg.id}
                  reg={reg}
                  index={i}
                  processing={processingId === reg.id}
                  rejectingId={rejectingId}
                  rejectNotes={rejectNotes}
                  setRejectingId={setRejectingId}
                  setRejectNotes={setRejectNotes}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Registration Row                ═══ */
/* ════════════════════════════════════════ */
function RegistrationRow({
  reg, index, processing, rejectingId, rejectNotes,
  setRejectingId, setRejectNotes, onApprove, onReject,
}) {
  const statusConfig = {
    PENDING_APPROVAL: { bg: '#FEF3C7', color: '#92400E', label: '⏳ Pending Approval' },
    CONFIRMED:        { bg: '#DCFCE7', color: '#166534', label: '✅ Confirmed' },
    PAYMENT_PENDING:  { bg: '#FCE7F3', color: '#9F1239', label: '💳 Payment Pending' },
    REJECTED:         { bg: '#FEE2E2', color: '#991B1B', label: '❌ Rejected' },
  };
  const cfg = statusConfig[reg.status] || statusConfig.PENDING_APPROVAL;
  const isPending = reg.status === 'PENDING_APPROVAL';
  const isRejecting = rejectingId === reg.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        border: '1px solid #E8F0E0', borderRadius: 12,
        background: '#fff', overflow: 'hidden',
      }}
    >
      <div style={{
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #16A34A, #15803D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 14,
          flexShrink: 0,
        }}>
          {(reg.userName || 'U').charAt(0).toUpperCase()}
        </div>

        {/* User info */}
        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: '#1A3A1A',
          }}>
            {reg.userName}
          </div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
            Reg #{reg.id} • {new Date(reg.registeredAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </div>
        </div>

        {/* Status */}
        <div style={{
          padding: '4px 10px', borderRadius: 8,
          background: cfg.bg, color: cfg.color,
          fontSize: 10, fontWeight: 800,
          whiteSpace: 'nowrap',
        }}>
          {cfg.label}
        </div>

        {/* Actions */}
        {isPending && !isRejecting && (
          <div style={{ display: 'flex', gap: 6 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onApprove(reg.id)}
              disabled={processing}
              style={{
                padding: '6px 12px', borderRadius: 8,
                background: '#16A34A', color: '#fff',
                border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
                opacity: processing ? 0.6 : 1,
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {processing ? '⏳ ...' : '✓ Approve'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setRejectingId(reg.id); setRejectNotes(''); }}
              disabled={processing}
              style={{
                padding: '6px 12px', borderRadius: 8,
                background: '#fff', color: '#EF4444',
                border: '1px solid #FECACA', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              ✕ Reject
            </motion.button>
          </div>
        )}
      </div>

      {/* Payment / Meeting info for approved regs */}
      {reg.status === 'CONFIRMED' && reg.onlineJoinLink && (
        <div style={{
          padding: '10px 16px', background: '#EFF6FF',
          borderTop: '1px solid #DBEAFE',
          fontSize: 11, color: '#1E40AF',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          🔗 <strong>Meeting Link:</strong>
          <span style={{
            fontFamily: 'monospace', fontSize: 10,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {reg.onlineJoinLink}
          </span>
        </div>
      )}

      {reg.status === 'CONFIRMED' && reg.qrCodeToken && (
        <div style={{
          padding: '10px 16px', background: '#F0FDF4',
          borderTop: '1px solid #BBF7D0',
          fontSize: 11, color: '#166534',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          🎫 <strong>QR Token generated</strong> — Member can show it at venue
        </div>
      )}

      {reg.status === 'PAYMENT_PENDING' && reg.paymentCheckoutUrl && (
        <div style={{
          padding: '10px 16px', background: '#FDF2F8',
          borderTop: '1px solid #FBCFE8',
          fontSize: 11, color: '#9F1239',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          💳 <strong>Stripe checkout link sent</strong> — Waiting for payment
        </div>
      )}

      {/* Reject notes input */}
      <AnimatePresence>
        {isRejecting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              padding: '12px 16px',
              background: '#FEF2F2', borderTop: '1px solid #FECACA',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', marginBottom: 6 }}>
              Rejection Reason:
            </div>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={2}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #FECACA', fontSize: 12,
                fontFamily: 'Manrope, sans-serif', outline: 'none',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setRejectingId(null); setRejectNotes(''); }}
                style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: '#fff', color: '#6B7280',
                  border: '1px solid #E5E7EB', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700,
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => onReject(reg.id)}
                disabled={processing || !rejectNotes.trim()}
                style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: '#EF4444', color: '#fff',
                  border: 'none',
                  cursor: (processing || !rejectNotes.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: 11, fontWeight: 700,
                  opacity: (processing || !rejectNotes.trim()) ? 0.5 : 1,
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                {processing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Create Event Modal              ═══ */
/* ════════════════════════════════════════ */
function CreateEventModal({ onClose, onCreated, onError }) {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('ONLINE');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [capacity, setCapacity] = useState(100);

  const [onlineJoinLink, setOnlineJoinLink] = useState('');

  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('INR');

  const [speakers, setSpeakers] = useState([
    { name: '', designation: '', bio: '', photoUrl: '', displayOrder: 1 }
  ]);
  const [agenda, setAgenda] = useState([
    { title: '', description: '', startTime: '', endTime: '', displayOrder: 1 }
  ]);

  const isOnline = eventType === 'ONLINE';

  const toISO = (local) => {
    if (!local) return '';
    return new Date(local).toISOString();
  };

  const addSpeaker = () => {
    setSpeakers([...speakers, {
      name: '', designation: '', bio: '', photoUrl: '',
      displayOrder: speakers.length + 1
    }]);
  };
  const removeSpeaker = (idx) => setSpeakers(speakers.filter((_, i) => i !== idx));
  const updateSpeaker = (idx, key, val) => {
    const updated = [...speakers];
    updated[idx][key] = val;
    setSpeakers(updated);
  };

  const addAgenda = () => {
    setAgenda([...agenda, {
      title: '', description: '', startTime: '', endTime: '',
      displayOrder: agenda.length + 1
    }]);
  };
  const removeAgenda = (idx) => setAgenda(agenda.filter((_, i) => i !== idx));
  const updateAgenda = (idx, key, val) => {
    const updated = [...agenda];
    updated[idx][key] = val;
    setAgenda(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      onError('Please fill title and description');
      return;
    }
    if (!startDateTime || !endDateTime) {
      onError('Please select start and end date/time');
      return;
    }
    if (isOnline && !onlineJoinLink.trim()) {
      onError('Online events need a join link');
      return;
    }
    if (!isOnline && (!venueName.trim() || !city.trim() || !country.trim())) {
      onError('In-person events need venue, city and country');
      return;
    }
    if (isPaid && (!price || Number(price) <= 0)) {
      onError('Please enter a valid price for paid event');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      eventType,
      startDateTime: toISO(startDateTime),
      endDateTime: toISO(endDateTime),
      timezone,
      isPaid,
      capacity: Number(capacity),
      speakers: speakers
        .filter(s => s.name.trim())
        .map((s, i) => ({ ...s, displayOrder: i + 1 })),
      agenda: agenda
        .filter(a => a.title.trim())
        .map((a, i) => ({
          ...a,
          startTime: toISO(a.startTime),
          endTime: toISO(a.endTime),
          displayOrder: i + 1,
        })),
    };

    if (isOnline) {
      payload.onlineJoinLink = onlineJoinLink.trim();
    } else {
      payload.venueName = venueName.trim();
      payload.venueAddress = venueAddress.trim();
      payload.city = city.trim();
      payload.state = state.trim();
      payload.country = country.trim();
      if (coverImageUrl.trim()) payload.coverImageUrl = coverImageUrl.trim();
    }

    if (isPaid) {
      payload.price = Number(price);
      payload.currency = currency;
    }

    setLoading(true);
    try {
      const res = await createEvent(payload);
      console.log('✅ Event created:', res);
      onCreated(res.event);
    } catch (err) {
      console.error('❌ Create event error:', err);
      onError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

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
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, padding: '28px 32px',
          maxWidth: 720, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, position: 'sticky', top: 0, background: '#fff', zIndex: 2,
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
              🎉 Create Event
            </h3>
            <p style={{ fontSize: 11, color: '#6B8F71', margin: '4px 0 0', fontWeight: 500 }}>
              Fill in details to create and publish a new event
            </p>
          </div>
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

        <SectionTitle>📋 Basic Information</SectionTitle>
        <InputField
          label="Event Title *"
          value={title}
          onChange={setTitle}
          placeholder="e.g. Connect Souq Meetup 2026"
        />
        <TextareaField
          label="Description *"
          value={description}
          onChange={setDescription}
          placeholder="Describe your event..."
          rows={3}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SelectField
            label="Event Type *"
            value={eventType}
            onChange={setEventType}
            options={[
              { value: 'ONLINE', label: '💻 Online' },
              { value: 'IN_PERSON', label: '📍 In-Person' },
            ]}
          />
          <InputField
            label="Capacity *"
            value={capacity}
            onChange={(v) => setCapacity(v.replace(/\D/g, ''))}
            placeholder="100"
          />
        </div>

        <SectionTitle>📅 Date & Time</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <DateTimeField
            label="Start Date & Time *"
            value={startDateTime}
            onChange={setStartDateTime}
          />
          <DateTimeField
            label="End Date & Time *"
            value={endDateTime}
            onChange={setEndDateTime}
          />
        </div>
        <InputField
          label="Timezone *"
          value={timezone}
          onChange={setTimezone}
          placeholder="e.g. Asia/Kolkata"
        />

        {isOnline ? (
          <>
            <SectionTitle>💻 Online Details</SectionTitle>
            <InputField
              label="Meeting Link *"
              value={onlineJoinLink}
              onChange={setOnlineJoinLink}
              placeholder="https://meet.example.com/..."
            />
          </>
        ) : (
          <>
            <SectionTitle>📍 Venue Details</SectionTitle>
            <InputField
              label="Venue Name *"
              value={venueName}
              onChange={setVenueName}
              placeholder="e.g. Dubai World Trade Centre"
            />
            <InputField
              label="Venue Address"
              value={venueAddress}
              onChange={setVenueAddress}
              placeholder="Street address"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <InputField label="City *" value={city} onChange={setCity} placeholder="Dubai" />
              <InputField label="State" value={state} onChange={setState} placeholder="Dubai" />
              <InputField label="Country *" value={country} onChange={setCountry} placeholder="UAE" />
            </div>
            <InputField
              label="Cover Image URL"
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              placeholder="https://example.com/image.jpg"
            />
          </>
        )}

        <SectionTitle>💰 Pricing</SectionTitle>
        <CheckboxField
          label="This is a paid event"
          checked={isPaid}
          onChange={setIsPaid}
        />
        {isPaid && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <InputField
              label="Price *"
              value={price}
              onChange={setPrice}
              placeholder="199.99"
            />
            <SelectField
              label="Currency *"
              value={currency}
              onChange={setCurrency}
              options={[
                { value: 'INR', label: 'INR ₹' },
                { value: 'AED', label: 'AED د.إ' },
                { value: 'USD', label: 'USD $' },
                { value: 'EUR', label: 'EUR €' },
                { value: 'GBP', label: 'GBP £' },
              ]}
            />
          </div>
        )}

        <SectionTitle>
          🎤 Speakers
          <button onClick={addSpeaker} style={sectionAddBtnStyle}>+ Add</button>
        </SectionTitle>
        {speakers.map((s, idx) => (
          <div key={idx} style={{
            padding: '16px', background: '#F9FAFB', borderRadius: 12,
            border: '1px solid #E8F0E0', marginBottom: 12,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>
                Speaker #{idx + 1}
              </span>
              {speakers.length > 1 && (
                <button onClick={() => removeSpeaker(idx)} style={removeBtnStyle}>
                  × Remove
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InputField label="Name" value={s.name} onChange={(v) => updateSpeaker(idx, 'name', v)} placeholder="Full name" />
              <InputField label="Designation" value={s.designation} onChange={(v) => updateSpeaker(idx, 'designation', v)} placeholder="Role/Title" />
            </div>
            <TextareaField label="Bio" value={s.bio} onChange={(v) => updateSpeaker(idx, 'bio', v)} placeholder="Short bio..." rows={2} />
            <InputField label="Photo URL" value={s.photoUrl} onChange={(v) => updateSpeaker(idx, 'photoUrl', v)} placeholder="https://..." />
          </div>
        ))}

        <SectionTitle>
          📋 Agenda
          <button onClick={addAgenda} style={sectionAddBtnStyle}>+ Add</button>
        </SectionTitle>
        {agenda.map((a, idx) => (
          <div key={idx} style={{
            padding: '16px', background: '#F9FAFB', borderRadius: 12,
            border: '1px solid #E8F0E0', marginBottom: 12,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>
                Session #{idx + 1}
              </span>
              {agenda.length > 1 && (
                <button onClick={() => removeAgenda(idx)} style={removeBtnStyle}>
                  × Remove
                </button>
              )}
            </div>
            <InputField label="Title" value={a.title} onChange={(v) => updateAgenda(idx, 'title', v)} placeholder="Session title" />
            <TextareaField label="Description" value={a.description} onChange={(v) => updateAgenda(idx, 'description', v)} placeholder="Details..." rows={2} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <DateTimeField label="Start Time" value={a.startTime} onChange={(v) => updateAgenda(idx, 'startTime', v)} />
              <DateTimeField label="End Time" value={a.endTime} onChange={(v) => updateAgenda(idx, 'endTime', v)} />
            </div>
          </div>
        ))}

        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <GreenButton variant="outline" onClick={onClose}>
            Cancel
          </GreenButton>
          <div style={{ flex: 1 }}>
            <GreenButton fullWidth onClick={handleSubmit} loading={loading}>
              {loading ? 'Creating Event...' : '🚀 Create & Publish Event'}
            </GreenButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════ */
/* ═══ Placeholder Tab                 ═══ */
/* ════════════════════════════════════════ */
function PlaceholderTab({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: '#fff', borderRadius: 20, padding: '60px 40px',
        textAlign: 'center', border: '1px solid #E8F0E0',
      }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: 24,
        background: '#F0FDF4', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 36, margin: '0 auto 20px', border: '1px solid #BBF7D0',
      }}>🚧</div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', marginBottom: 8 }}>
        {name.charAt(0).toUpperCase() + name.slice(1)} Module
      </h3>
      <p style={{ color: '#6B8F71', fontSize: 14, maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>
        This section is under development.
      </p>
      <div style={{
        marginTop: 24, padding: '8px 20px', borderRadius: 10,
        background: '#F0FDF4', border: '1px solid #BBF7D0',
        display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#16A34A',
      }}>Coming Soon</div>
    </motion.div>
  );
}