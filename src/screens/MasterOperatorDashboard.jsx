import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearTokens, getUserData } from '../api/auth';
import {
  createGeneralFranchise,
  createSectorFranchise,
  inviteGeneralOperator,
} from '../api/adminApi';

const navItems = [
  { id: 'overview',   label: 'Overview',            icon: '🏠' },
  { id: 'general',    label: 'General Franchises',   icon: '🏢' },
  { id: 'sector',     label: 'Sector Franchises',    icon: '🏭' },
  { id: 'invitations',label: 'Invitations',          icon: '📨' },
  { id: 'settings',   label: 'Settings',             icon: '⚙️' },
];

export default function MasterOperatorDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebar] = useState(true);
  const user = getUserData() || {};

  const handleLogout = () => {
    clearTokens();
    onLogout?.();
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#F7FAF4', fontFamily: 'Manrope, sans-serif',
    }}>

      {/* ── Sidebar ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(180deg, #0F4C3A 0%, #166534 40%, #16A34A 100%)',
              flexShrink: 0, display: 'flex', flexDirection: 'column',
              boxShadow: '4px 0 20px rgba(22,101,52,0.15)',
              height: '100vh', overflow: 'hidden',
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
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>🏢</div>
                <div>
                  <div style={{
                    color: '#fff', fontWeight: 800, fontSize: 15,
                    whiteSpace: 'nowrap',
                  }}>Connect Souq</div>
                  <div style={{
                    fontSize: 9, fontWeight: 700, color: '#BBF7D0',
                    background: 'rgba(255,255,255,0.15)', borderRadius: 4,
                    padding: '2px 8px', display: 'inline-block', marginTop: 3,
                    letterSpacing: '0.6px', textTransform: 'uppercase',
                  }}>Master Operator</div>
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
                textTransform: 'uppercase', letterSpacing: '1px',
                padding: '0 12px 10px',
              }}>Menu</div>

              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      gap: 12, padding: '11px 14px', borderRadius: 12,
                      marginBottom: 4, border: 'none', cursor: 'pointer',
                      textAlign: 'left', fontSize: 13,
                      fontWeight: isActive ? 700 : 600, whiteSpace: 'nowrap',
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ fontSize: 17 }}>{item.icon}</span>
                    {item.label}
                    {isActive && (
                      <motion.div layoutId="mo-nav"
                        style={{
                          marginLeft: 'auto', width: 6, height: 6,
                          borderRadius: '50%', background: '#BBF7D0',
                          boxShadow: '0 0 8px rgba(187,247,208,0.6)',
                        }}
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
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #BBF7D0, #86EFAC)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#166534', fontWeight: 800, fontSize: 15,
                }}>
                  {(user.fullName || 'M')[0].toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{
                    color: '#fff', fontWeight: 700, fontSize: 12,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{user.fullName || 'Operator'}</div>
                  <div style={{
                    color: 'rgba(255,255,255,0.5)', fontSize: 10,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{user.email || ''}</div>
                </div>
              </div>

              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FCA5A5', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: 8, justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
          flexShrink: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.button
              onClick={() => setSidebar((v) => !v)}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'transparent', border: 'none',
                cursor: 'pointer', padding: 8, borderRadius: 10,
                color: '#16A34A',
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
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
                {navItems.find((n) => n.id === activeNav)?.label}
              </h1>
              <p style={{ fontSize: 11, color: '#6B8F71', margin: 0 }}>
                Master Operator Panel
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
              width: 8, height: 8, borderRadius: '50%',
              background: '#22C55E',
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
              🏢 Master Operator
            </span>
          </div>
        </header>

        {/* Content */}
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
              {activeNav === 'general'     && <GeneralFranchiseTab />}
              {activeNav === 'sector'      && <SectorFranchiseTab />}
              {activeNav === 'invitations' && <InvitationsTab />}
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
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════ */
/* ══ Toast                           ══ */
/* ══════════════════════════════════════ */
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const c = {
    success: { bg: '#F0FDF4', border: '#BBF7D0', color: '#166534', icon: '✅' },
    error:   { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B', icon: '❌' },
  }[type] || { bg: '#F0FDF4', border: '#BBF7D0', color: '#166534', icon: '✅' };

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
      <span style={{ fontSize: 13, fontWeight: 600, color: c.color, flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: c.color, fontSize: 16,
      }}>×</button>
    </motion.div>
  );
}

/* ══════════════════════════════════════ */
/* ══ Modal                           ══ */
/* ══════════════════════════════════════ */
function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
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
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>{title}</h3>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1 }}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: '1px solid #F0F0F0', background: '#F9FAFB',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#6B7280',
            }}>×</motion.button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════ */
/* ══ Input & Button                  ══ */
/* ══════════════════════════════════════ */
function InputField({ label, value, onChange, placeholder, disabled }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1A3A1A', marginBottom: 6 }}>
        {label}
      </label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1.5px solid #E8F0E0', background: disabled ? '#F7FAF4' : '#fff',
          fontSize: 14, fontWeight: 500, color: '#1A3A1A',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          boxSizing: 'border-box', opacity: disabled ? 0.7 : 1,
        }}
        onFocus={(e) => { if (!disabled) e.target.style.borderColor = '#16A34A'; }}
        onBlur={(e) => { e.target.style.borderColor = '#E8F0E0'; }}
      />
    </div>
  );
}

function GreenButton({ onClick, loading, children, fullWidth, variant = 'primary' }) {
  const s = variant === 'outline'
    ? { background: '#fff', color: '#16A34A', border: '1.5px solid #16A34A' }
    : { background: 'linear-gradient(135deg, #16A34A, #15803D)', color: '#fff', border: 'none' };

  return (
    <motion.button onClick={onClick} disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      style={{
        ...s, padding: '12px 24px', borderRadius: 12,
        fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: fullWidth ? '100%' : 'auto',
        opacity: loading ? 0.7 : 1, fontFamily: 'Manrope, sans-serif',
      }}
    >
      {loading && (
        <motion.div animate={{ rotate: 360 }}
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

/* ══════════════════════════════════════ */
/* ══ OVERVIEW TAB                    ══ */
/* ══════════════════════════════════════ */
function OverviewTab({ onNavigate }) {
  const actions = [
    { label: 'General Franchise', icon: '🏢', desc: 'Create state/city franchise', nav: 'general' },
    { label: 'Sector Franchise',  icon: '🏭', desc: 'Create sector-based franchise', nav: 'sector' },
    { label: 'Send Invitations',  icon: '📨', desc: 'Invite operators', nav: 'invitations' },
    { label: 'Settings',          icon: '⚙️', desc: 'Manage preferences', nav: 'settings' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #0F4C3A, #166534, #16A34A)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 24,
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -30, right: -20,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px', position: 'relative', zIndex: 1 }}>
          Welcome, Master Operator 👋
        </h2>
        <p style={{ fontSize: 13, margin: 0, opacity: 0.85, position: 'relative', zIndex: 1 }}>
          Manage your franchises and invite operators
        </p>
      </motion.div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 18,
      }}>
        {actions.map((a, i) => (
          <motion.button key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(a.nav)}
            style={{
              background: '#fff', borderRadius: 18, padding: '24px',
              border: '1px solid #E8F0E0', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: '#F0FDF4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, marginBottom: 14, border: '1px solid #E8F0E0',
            }}>{a.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A3A1A', marginBottom: 4 }}>{a.label}</div>
            <div style={{ fontSize: 12, color: '#6B8F71' }}>{a.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════ */
/* ══ GENERAL FRANCHISE TAB           ══ */
/* ══════════════════════════════════════ */
function GeneralFranchiseTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName]       = useState('');
  const [state, setState]     = useState('');
  const [city, setCity]       = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [franchises, setFranchises] = useState([]);

  const [inviteId, setInviteId]         = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult]   = useState(null);

  const handleCreate = async () => {
    if (!name.trim() || !state.trim() || !city.trim()) {
      setToast({ message: 'All fields are required', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await createGeneralFranchise(name.trim(), state.trim(), city.trim());
      setFranchises((p) => [...p, {
        id: res.franchiseId, name: res.franchiseName || name,
        state: state, city: city,
      }]);
      setToast({ message: res.message || 'General Franchise created!', type: 'success' });
      setName(''); setState(''); setCity('');
      setShowCreate(false);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally { setLoading(false); }
  };

  const handleInvite = async () => {
    if (!inviteId) { setToast({ message: 'Enter franchise ID', type: 'error' }); return; }
    setInviteLoading(true); setInviteResult(null);
    try {
      const res = await inviteGeneralOperator(Number(inviteId));
      setInviteResult(res);
      setToast({ message: res.message || 'Invite created!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally { setInviteLoading(false); }
  };

  const copyLink = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Link copied!', type: 'success' });
  };

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>General Franchises</h2>
          <p style={{ fontSize: 12, color: '#6B8F71', margin: '4px 0 0' }}>State & city level franchises</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <GreenButton variant="outline" onClick={() => { setShowInvite(true); setInviteResult(null); }}>
            📨 Invite Operator
          </GreenButton>
          <GreenButton onClick={() => setShowCreate(true)}>➕ Create Franchise</GreenButton>
        </div>
      </div>

      {/* List */}
      {franchises.length === 0 ? (
        <EmptyState icon="🏢" title="No General Franchises" desc="Create your first franchise"
          action={() => setShowCreate(true)} actionLabel="➕ Create Franchise" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {franchises.map((f, i) => (
            <FranchiseCard key={f.id || i} franchise={f}
              subtitle={`📍 ${f.state}, ${f.city}`}
              onInvite={() => { setInviteId(String(f.id)); setInviteResult(null); setShowInvite(true); }}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <Modal title="Create General Franchise" onClose={() => setShowCreate(false)}>
            <InputField label="Franchise Name" value={name} onChange={setName} placeholder="e.g. M.P General" />
            <InputField label="State" value={state} onChange={setState} placeholder="e.g. Madhya Pradesh" />
            <InputField label="City" value={city} onChange={setCity} placeholder="e.g. Indore" />
            <div style={{ marginTop: 8 }}>
              <GreenButton fullWidth onClick={handleCreate} loading={loading}>
                {loading ? 'Creating...' : '🏢 Create General Franchise'}
              </GreenButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <Modal title="Invite General Operator" onClose={() => setShowInvite(false)}>
            <InputField label="Franchise ID" value={inviteId} onChange={setInviteId} placeholder="e.g. 2" />
            {!inviteResult && (
              <GreenButton fullWidth onClick={handleInvite} loading={inviteLoading}>
                {inviteLoading ? 'Generating...' : '🔗 Generate Invite Link'}
              </GreenButton>
            )}
            <AnimatePresence>
              {inviteResult && <InviteResultCard result={inviteResult} onCopy={copyLink} />}
            </AnimatePresence>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════ */
/* ══ SECTOR FRANCHISE TAB            ══ */
/* ══════════════════════════════════════ */
function SectorFranchiseTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName]         = useState('');
  const [sector, setSector]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);
  const [franchises, setFranchises] = useState([]);

  const handleCreate = async () => {
    if (!name.trim() || !sector.trim()) {
      setToast({ message: 'All fields required', type: 'error' }); return;
    }
    setLoading(true);
    try {
      const res = await createSectorFranchise(name.trim(), sector.trim());
      setFranchises((p) => [...p, {
        id: res.franchiseId, name: res.franchiseName || name,
        sector: sector,
      }]);
      setToast({ message: res.message || 'Sector Franchise created!', type: 'success' });
      setName(''); setSector('');
      setShowCreate(false);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>Sector Franchises</h2>
          <p style={{ fontSize: 12, color: '#6B8F71', margin: '4px 0 0' }}>Industry-specific franchises</p>
        </div>
        <GreenButton onClick={() => setShowCreate(true)}>➕ Create Sector Franchise</GreenButton>
      </div>

      {franchises.length === 0 ? (
        <EmptyState icon="🏭" title="No Sector Franchises" desc="Create your first sector franchise"
          action={() => setShowCreate(true)} actionLabel="➕ Create Sector Franchise" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {franchises.map((f, i) => (
            <FranchiseCard key={f.id || i} franchise={f}
              subtitle={`🏭 ${f.sector}`} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <Modal title="Create Sector Franchise" onClose={() => setShowCreate(false)}>
            <InputField label="Franchise Name" value={name} onChange={setName} placeholder="e.g. UAE Textile Network" />
            <InputField label="Sector Name" value={sector} onChange={setSector} placeholder="e.g. Textile" />
            <div style={{ marginTop: 8 }}>
              <GreenButton fullWidth onClick={handleCreate} loading={loading}>
                {loading ? 'Creating...' : '🏭 Create Sector Franchise'}
              </GreenButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════ */
/* ══ INVITATIONS TAB                 ══ */
/* ══════════════════════════════════════ */
function InvitationsTab() {
  const [inviteId, setInviteId]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [inviteResult, setInviteResult] = useState(null);

  const handleInvite = async () => {
    if (!inviteId) { setToast({ message: 'Enter franchise ID', type: 'error' }); return; }
    setLoading(true); setInviteResult(null);
    try {
      const res = await inviteGeneralOperator(Number(inviteId));
      setInviteResult(res);
      setToast({ message: res.message || 'Invite created!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally { setLoading(false); }
  };

  const copyLink = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Link copied!', type: 'success' });
  };

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: '0 0 6px' }}>
        Send Invitations
      </h2>
      <p style={{ fontSize: 12, color: '#6B8F71', margin: '0 0 24px' }}>
        Invite operators to manage your franchises
      </p>

      <div style={{
        background: '#fff', borderRadius: 18, padding: '28px 30px',
        border: '1px solid #E8F0E0', maxWidth: 600,
      }}>
        <InputField label="Franchise ID" value={inviteId} onChange={setInviteId} placeholder="Enter franchise ID" />
        <GreenButton onClick={handleInvite} loading={loading}>
          {loading ? 'Generating...' : '🔗 Generate Invite Link'}
        </GreenButton>

        <AnimatePresence>
          {inviteResult && <InviteResultCard result={inviteResult} onCopy={copyLink} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════ */
/* ══ Shared Components               ══ */
/* ══════════════════════════════════════ */
function FranchiseCard({ franchise, subtitle, onInvite }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', borderRadius: 16, padding: '22px 24px',
        border: '1px solid #E8F0E0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: '#F0FDF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, border: '1px solid #E8F0E0',
        }}>🏢</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1A3A1A' }}>{franchise.name}</div>
          <div style={{ fontSize: 12, color: '#6B8F71' }}>{subtitle}</div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 8, background: '#F0FDF4',
          border: '1px solid #BBF7D0', fontSize: 11, fontWeight: 700, color: '#16A34A',
        }}>ID: {franchise.id}</div>
      </div>
      {onInvite && (
        <GreenButton variant="outline" onClick={onInvite}>📨 Invite Operator</GreenButton>
      )}
    </motion.div>
  );
}

function InviteResultCard({ result, onCopy }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: 20, padding: '20px', background: '#F0FDF4',
        borderRadius: 14, border: '1px solid #BBF7D0',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 12 }}>
        ✅ Invitation Created!
      </div>
      {result.inviteLink && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B8F71', marginBottom: 6 }}>Invite Link:</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', padding: '10px 14px', borderRadius: 10,
            border: '1px solid #E8F0E0',
          }}>
            <div style={{ flex: 1, fontSize: 12, color: '#1A3A1A', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {result.inviteLink}
            </div>
            <motion.button onClick={() => onCopy(result.inviteLink)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{
                padding: '6px 12px', borderRadius: 8, background: '#16A34A',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
              }}>📋 Copy</motion.button>
          </div>
        </div>
      )}
      {result.expiresAt && (
        <div style={{ fontSize: 11, color: '#6B8F71' }}>
          ⏰ Expires: {new Date(result.expiresAt).toLocaleString()}
        </div>
      )}
    </motion.div>
  );
}

function EmptyState({ icon, title, desc, action, actionLabel }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        background: '#fff', borderRadius: 20, padding: '60px 40px',
        textAlign: 'center', border: '1px solid #E8F0E0',
      }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: 24, background: '#F0FDF4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, margin: '0 auto 20px', border: '1px solid #BBF7D0',
      }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', marginBottom: 8 }}>{title}</h3>
      <p style={{ color: '#6B8F71', fontSize: 14, marginBottom: 20 }}>{desc}</p>
      {action && <GreenButton onClick={action}>{actionLabel}</GreenButton>}
    </motion.div>
  );
}

function PlaceholderTab({ name }) {
  return (
    <EmptyState icon="🚧"
      title={`${name.charAt(0).toUpperCase() + name.slice(1)} Module`}
      desc="Under development. Check back soon!" />
  );
}