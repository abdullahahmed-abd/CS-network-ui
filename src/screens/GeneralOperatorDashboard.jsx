import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearTokens, getUserData, authenticatedFetch } from '../api/auth';
import { inviteMember } from '../api/adminApi';

const BASE_URL = 'https://7545-2401-4900-8823-9cd3-35b9-880-b014-2367.ngrok-free.app';

const navItems = [
  { id: 'overview',      label: 'Overview',      icon: '🏠' },
  { id: 'applications',  label: 'Applications',  icon: '📋' },
  { id: 'invitations',   label: 'Invite Members', icon: '📨' },
  { id: 'members',       label: 'Members',       icon: '👥' },
  { id: 'settings',      label: 'Settings',      icon: '⚙️' },
];

export default function GeneralOperatorDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebar] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
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
              background: 'linear-gradient(180deg, #134E2B 0%, #166534 40%, #16A34A 100%)',
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
                }}>🏪</div>
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
                  }}>Franchise Operator</div>
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
                const showBadge = item.id === 'applications' && pendingCount > 0;
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
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: 17 }}>{item.icon}</span>
                    {item.label}

                    {/* ✅ Pending count badge */}
                    {showBadge && (
                      <span style={{
                        marginLeft: 'auto', minWidth: 20, height: 20,
                        borderRadius: 10, background: '#EF4444',
                        color: '#fff', fontSize: 10, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 6px',
                        boxShadow: '0 0 8px rgba(239,68,68,0.4)',
                      }}>
                        {pendingCount}
                      </span>
                    )}

                    {isActive && !showBadge && (
                      <motion.div layoutId="go-nav"
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
                  {(user.fullName || 'O')[0].toUpperCase()}
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
                cursor: 'pointer', padding: 8, borderRadius: 10, color: '#16A34A',
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
                Franchise Operator Panel
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Pending badge in topbar */}
            {pendingCount > 0 && (
              <motion.button
                onClick={() => setActiveNav('applications')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 20,
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  color: '#991B1B',
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#EF4444',
                  animation: 'pulse 2s infinite',
                }} />
                {pendingCount} Pending
              </motion.button>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 16px', borderRadius: 20,
              background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
              border: '1px solid #BBF7D0',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#22C55E',
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                🏪 Franchise Operator
              </span>
            </div>
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
              {activeNav === 'overview'     && <OverviewTab onNavigate={setActiveNav} pendingCount={pendingCount} />}
              {activeNav === 'applications' && <ApplicationsTab onCountChange={setPendingCount} />}
              {activeNav === 'invitations'  && <InviteMembersTab />}
              {activeNav === 'members'      && <PlaceholderTab name="members" />}
              {activeNav === 'settings'     && <PlaceholderTab name="settings" />}
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
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
/* ══ OVERVIEW TAB                    ══ */
/* ══════════════════════════════════════ */
function OverviewTab({ onNavigate, pendingCount }) {
  return (
    <div>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #134E2B, #166534, #16A34A)',
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
          fontSize: 22, fontWeight: 800, margin: '0 0 6px',
          position: 'relative', zIndex: 1,
        }}>
          Welcome, Operator 👋
        </h2>
        <p style={{
          fontSize: 13, margin: 0, opacity: 0.85,
          position: 'relative', zIndex: 1,
        }}>
          Manage your franchise, review applications, and invite members
        </p>
      </motion.div>

      {/* ✅ Pending alert banner */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onNavigate('applications')}
          style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            border: '1px solid #F59E0B',
            borderRadius: 16, padding: '18px 24px', marginBottom: 24,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: '#F59E0B', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>⏳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#92400E' }}>
              {pendingCount} Pending Application{pendingCount > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 12, color: '#B45309', marginTop: 2 }}>
              Click to review and approve/reject business partner applications
            </div>
          </div>
          <div style={{
            fontSize: 20, color: '#92400E',
          }}>→</div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 18,
      }}>
        {[
          {
            label: 'Applications',
            icon: '📋',
            desc: 'Review pending BP applications',
            nav: 'applications',
            badge: pendingCount > 0 ? pendingCount : null,
          },
          {
            label: 'Invite Members',
            icon: '📨',
            desc: 'Generate invite links for new members',
            nav: 'invitations',
          },
          {
            label: 'View Members',
            icon: '👥',
            desc: 'See all members in your franchise',
            nav: 'members',
          },
          {
            label: 'Settings',
            icon: '⚙️',
            desc: 'Manage your preferences',
            nav: 'settings',
          },
        ].map((a, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(a.nav)}
            style={{
              background: '#fff', borderRadius: 18, padding: '24px',
              border: '1px solid #E8F0E0', cursor: 'pointer', textAlign: 'left',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              position: 'relative',
            }}
          >
            {a.badge && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                minWidth: 22, height: 22, borderRadius: 11,
                background: '#EF4444', color: '#fff',
                fontSize: 11, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 6px',
              }}>{a.badge}</div>
            )}
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: '#F0FDF4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, marginBottom: 14, border: '1px solid #E8F0E0',
            }}>{a.icon}</div>
            <div style={{
              fontSize: 15, fontWeight: 700, color: '#1A3A1A', marginBottom: 4,
            }}>{a.label}</div>
            <div style={{ fontSize: 12, color: '#6B8F71' }}>{a.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* ══ APPLICATIONS TAB (Approve / Reject BP applications) ══ */
/* ══════════════════════════════════════════════════════════ */
function ApplicationsTab({ onCountChange }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [toast, setToast]               = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // applicationId being acted on
  const [reviewNotes, setReviewNotes]   = useState({});
  const [expandedId, setExpandedId]     = useState(null);
  const [filter, setFilter]             = useState('PENDING'); // PENDING | ALL

  // ── Fetch pending applications ──
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/franchise-operator`, {
        method: 'POST',
        body: JSON.stringify({
          franchiseOperatorRequestType: 'FETCH_PENDING_APPLICATIONS',
        }),
      });

      console.log('📋 Applications response:', data);

      const apps = data?.applications || data?.pendingApplications || data?.content || [];
      const list = Array.isArray(apps) ? apps : [];
      setApplications(list);

      // Update parent count
      const pendingCount = list.filter((a) => a.status === 'PENDING').length;
      onCountChange?.(pendingCount || list.length);

    } catch (err) {
      console.error('❌ Fetch applications error:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ── Approve / Reject ──
  const handleAction = async (applicationId, action) => {
    setActionLoading(applicationId);
    try {
      const notes = reviewNotes[applicationId]?.trim() || (
        action === 'APPROVE'
          ? 'Application verified and approved.'
          : 'Application rejected.'
      );

      const payload = {
        franchiseOperatorRequestType: action === 'APPROVE'
          ? 'APPROVE_APPLICATION'
          : 'REJECT_APPLICATION',
        applicationId: applicationId,
        reviewNotes: notes,
      };

      console.log(`📤 ${action} application:`, payload);

      await authenticatedFetch(`${BASE_URL}/cs-network/franchise-operator`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setToast({
        message: action === 'APPROVE'
          ? `Application #${applicationId} approved successfully!`
          : `Application #${applicationId} rejected.`,
        type: 'success',
      });

      // Remove from list or refresh
      setApplications((prev) =>
        prev.filter((a) => a.id !== applicationId && a.applicationId !== applicationId)
      );

      // Update count
      onCountChange?.((prev) => Math.max(0, (prev || 1) - 1));

      setExpandedId(null);

    } catch (err) {
      console.error(`❌ ${action} error:`, err);
      setToast({
        message: err.message || `Failed to ${action.toLowerCase()} application`,
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filtered list ──
  const filteredApps = filter === 'ALL'
    ? applications
    : applications.filter((a) => (a.status || 'PENDING') === 'PENDING');

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
          <h2 style={{
            fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: '0 0 4px',
          }}>
            Business Partner Applications
          </h2>
          <p style={{ fontSize: 12, color: '#6B8F71', margin: 0 }}>
            Review and approve/reject business partner requests
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* Filter */}
          {['PENDING', 'ALL'].map((f) => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '8px 18px', borderRadius: 10,
                background: filter === f
                  ? 'linear-gradient(135deg, #16A34A, #15803D)'
                  : '#fff',
                color: filter === f ? '#fff' : '#6B8F71',
                border: filter === f ? 'none' : '1px solid #E8F0E0',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {f === 'PENDING' ? `⏳ Pending (${applications.filter((a) => (a.status || 'PENDING') === 'PENDING').length})` : '📋 All'}
            </motion.button>
          ))}

          {/* Refresh */}
          <motion.button
            onClick={fetchApplications}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            style={{
              padding: '8px 16px', borderRadius: 10,
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              color: '#16A34A', fontSize: 12, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'Manrope, sans-serif',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                style={{
                  width: 14, height: 14,
                  border: '2px solid #BBF7D0',
                  borderTopColor: '#16A34A', borderRadius: '50%',
                }}
              />
            ) : '🔄'} Refresh
          </motion.button>
        </div>
      </div>

      {/* Loading */}
      {loading && applications.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center', padding: '60px 0',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            style={{
              width: 48, height: 48, margin: '0 auto 20px',
              border: '3px solid #E8F0E0',
              borderTopColor: '#16A34A', borderRadius: '50%',
            }}
          />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#6B8F71' }}>
            Loading applications...
          </p>
        </motion.div>
      )}

      {/* Error */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 16, padding: '20px 24px', textAlign: 'center',
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: '#991B1B', margin: '0 0 12px' }}>
            ❌ {error}
          </p>
          <motion.button
            onClick={fetchApplications}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg, #16A34A, #15803D)',
              color: '#fff', border: 'none', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
            }}
          >
            🔄 Retry
          </motion.button>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredApps.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: '#fff', borderRadius: 20, padding: '60px 40px',
            textAlign: 'center', border: '1px solid #E8F0E0',
          }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: 24, background: '#F0FDF4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, margin: '0 auto 20px', border: '1px solid #BBF7D0',
          }}>🎉</div>
          <h3 style={{
            fontSize: 18, fontWeight: 800, color: '#1A3A1A', margin: '0 0 8px',
          }}>
            No Pending Applications
          </h3>
          <p style={{ color: '#6B8F71', fontSize: 13 }}>
            All business partner applications have been reviewed.
          </p>
        </motion.div>
      )}

      {/* ── Application Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredApps.map((app, i) => {
          const appId = app.id || app.applicationId;
          const isExpanded = expandedId === appId;
          const isActing = actionLoading === appId;
          const status = app.status || 'PENDING';

          return (
            <motion.div
              key={appId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: '#fff', borderRadius: 20,
                border: status === 'PENDING'
                  ? '2px solid #FDE68A'
                  : '1px solid #E8F0E0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : appId)}
                style={{
                  padding: '20px 24px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 50, height: 50, borderRadius: 16,
                  background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, color: '#166534',
                  border: '1px solid #BBF7D0', flexShrink: 0,
                }}>
                  {(app.fullName || app.applicantName || 'U')[0].toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 800, color: '#1A3A1A',
                    marginBottom: 4,
                  }}>
                    {app.fullName || app.applicantName || 'Unknown'}
                  </div>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 6,
                    alignItems: 'center',
                  }}>
                    {app.companyName && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: '#6B8F71',
                        background: '#F0FDF4', padding: '3px 10px',
                        borderRadius: 8, border: '1px solid #E8F0E0',
                      }}>🏢 {app.companyName}</span>
                    )}
                    {app.businessSector && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: '#7C3AED',
                        background: '#F5F3FF', padding: '3px 10px',
                        borderRadius: 8, border: '1px solid #DDD6FE',
                      }}>🏭 {app.businessSector.replace(/_/g, ' ')}</span>
                    )}
                    {(app.country || app.city) && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: '#0369A1',
                        background: '#F0F9FF', padding: '3px 10px',
                        borderRadius: 8, border: '1px solid #BAE6FD',
                      }}>📍 {[app.city, app.state, app.country].filter(Boolean).join(', ')}</span>
                    )}
                  </div>
                </div>

                {/* Status + Expand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{
                    padding: '5px 14px', borderRadius: 20,
                    fontSize: 11, fontWeight: 700,
                    background: status === 'PENDING' ? '#FEF3C7' : status === 'APPROVED' ? '#DCFCE7' : '#FEE2E2',
                    color: status === 'PENDING' ? '#92400E' : status === 'APPROVED' ? '#166534' : '#991B1B',
                    border: `1px solid ${status === 'PENDING' ? '#F59E0B' : status === 'APPROVED' ? '#86EFAC' : '#FCA5A5'}`,
                  }}>
                    {status === 'PENDING' ? '⏳' : status === 'APPROVED' ? '✅' : '❌'} {status}
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    style={{ color: '#6B8F71', fontSize: 18 }}
                  >▼</motion.div>
                </div>
              </div>

              {/* ── Expanded Details ── */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '0 24px 24px',
                      borderTop: '1px solid #F0F5EC',
                    }}>
                      {/* Details grid */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 12, padding: '20px 0',
                      }}>
                        {[
                          { label: 'Full Name', value: app.fullName || app.applicantName, icon: '👤' },
                          { label: 'Company', value: app.companyName, icon: '🏢' },
                          { label: 'Position', value: app.position, icon: '💼' },
                          { label: 'Phone', value: app.alternatePhoneNumber || app.phone, icon: '📱' },
                          { label: 'Business Age', value: app.businessAge?.replace(/_/g, ' '), icon: '📅' },
                          { label: 'Sector', value: app.businessSector?.replace(/_/g, ' '), icon: '🏭' },
                          { label: 'Contact Method', value: app.preferredContactMethod, icon: '💬' },
                          { label: 'Language', value: app.languagePreference, icon: '🌐' },
                          { label: 'Location', value: [app.city, app.state, app.country].filter(Boolean).join(', '), icon: '📍' },
                          { label: 'Applied', value: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-', icon: '📆' },
                        ].filter((d) => d.value).map((detail, di) => (
                          <div key={di} style={{
                            background: '#F7FAF4', padding: '12px 16px',
                            borderRadius: 12, border: '1px solid #E8F0E0',
                          }}>
                            <div style={{
                              fontSize: 10, fontWeight: 700, color: '#6B8F71',
                              textTransform: 'uppercase', marginBottom: 4,
                              letterSpacing: '0.5px',
                            }}>{detail.icon} {detail.label}</div>
                            <div style={{
                              fontSize: 13, fontWeight: 700, color: '#1A3A1A',
                            }}>{detail.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* ── Action section (only for PENDING) ── */}
                      {status === 'PENDING' && (
                        <div style={{
                          background: '#F7FAF4', borderRadius: 16,
                          padding: '20px', border: '1px solid #E8F0E0',
                          marginTop: 8,
                        }}>
                          <div style={{
                            fontSize: 13, fontWeight: 700, color: '#1A3A1A',
                            marginBottom: 12,
                          }}>
                            📝 Review Notes (optional)
                          </div>
                          <textarea
                            placeholder="Add notes about this application..."
                            value={reviewNotes[appId] || ''}
                            onChange={(e) =>
                              setReviewNotes((prev) => ({
                                ...prev,
                                [appId]: e.target.value,
                              }))
                            }
                            style={{
                              width: '100%', minHeight: 80, padding: '12px 16px',
                              borderRadius: 12, border: '1px solid #E8F0E0',
                              background: '#fff', fontSize: 13, fontWeight: 500,
                              color: '#1A3A1A', fontFamily: 'Manrope, sans-serif',
                              resize: 'vertical', outline: 'none',
                              boxSizing: 'border-box',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#16A34A'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#E8F0E0'; }}
                          />

                          {/* Action buttons */}
                          <div style={{
                            display: 'flex', gap: 12, marginTop: 16,
                          }}>
                            {/* Reject */}
                            <motion.button
                              onClick={() => handleAction(appId, 'REJECT')}
                              disabled={isActing}
                              whileHover={{ scale: isActing ? 1 : 1.02 }}
                              whileTap={{ scale: isActing ? 1 : 0.97 }}
                              style={{
                                flex: 1, padding: '14px', borderRadius: 12,
                                background: '#fff',
                                border: '2px solid #FCA5A5',
                                color: '#DC2626', fontSize: 14, fontWeight: 700,
                                cursor: isActing ? 'not-allowed' : 'pointer',
                                fontFamily: 'Manrope, sans-serif',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 8,
                                opacity: isActing ? 0.6 : 1,
                              }}
                            >
                              {isActing ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                  style={{
                                    width: 16, height: 16,
                                    border: '2px solid #FCA5A5',
                                    borderTopColor: '#DC2626', borderRadius: '50%',
                                  }}
                                />
                              ) : '❌'} Reject
                            </motion.button>

                            {/* Approve */}
                            <motion.button
                              onClick={() => handleAction(appId, 'APPROVE')}
                              disabled={isActing}
                              whileHover={{ scale: isActing ? 1 : 1.02 }}
                              whileTap={{ scale: isActing ? 1 : 0.97 }}
                              style={{
                                flex: 2, padding: '14px', borderRadius: 12,
                                background: 'linear-gradient(135deg, #16A34A, #15803D)',
                                border: 'none', color: '#fff',
                                fontSize: 14, fontWeight: 700,
                                cursor: isActing ? 'not-allowed' : 'pointer',
                                fontFamily: 'Manrope, sans-serif',
                                boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 8,
                                opacity: isActing ? 0.6 : 1,
                              }}
                            >
                              {isActing ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                  style={{
                                    width: 16, height: 16,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#fff', borderRadius: '50%',
                                  }}
                                />
                              ) : '✅'} Approve
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════ */
/* ══ INVITE MEMBERS TAB              ══ */
/* ══════════════════════════════════════ */
function InviteMembersTab() {
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [inviteResult, setInviteResult] = useState(null);
  const [history, setHistory]           = useState([]);

  const handleInvite = async () => {
    setLoading(true);
    setInviteResult(null);

    try {
      const res = await inviteMember();
      console.log('✅ Member invite created:', res);
      setInviteResult(res);
      setToast({ message: res.message || 'Invite link generated!', type: 'success' });

      setHistory((prev) => [
        {
          link: res.inviteLink,
          expiresAt: res.expiresAt,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('❌ Invite error:', err);
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast({ message: 'Link copied to clipboard!', type: 'success' });
    }).catch(() => {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setToast({ message: 'Link copied!', type: 'success' });
    });
  };

  return (
    <div>
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <h2 style={{
        fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: '0 0 6px',
      }}>Invite Members</h2>
      <p style={{
        fontSize: 12, color: '#6B8F71', margin: '0 0 24px',
      }}>Generate invite links to add new members to your franchise</p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: '#fff', borderRadius: 20, padding: '32px',
          border: '1px solid #E8F0E0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          maxWidth: 560,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, border: '1px solid #BBF7D0', flexShrink: 0,
          }}>📨</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A' }}>
              Generate Member Invite
            </div>
            <div style={{
              fontSize: 13, color: '#6B8F71', fontWeight: 500, marginTop: 2,
            }}>Click below to create a new invite link for a member</div>
          </div>
        </div>

        <motion.button
          onClick={handleInvite}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          style={{
            width: '100%', padding: '16px', borderRadius: 14,
            background: 'linear-gradient(135deg, #16A34A, #15803D)',
            border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Manrope, sans-serif',
            boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                style={{
                  width: 18, height: 18,
                  border: '2.5px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                }}
              />
              Generating...
            </>
          ) : '🔗 Generate Invite Link'}
        </motion.button>

        <AnimatePresence>
          {inviteResult && (
            <motion.div
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{
                marginTop: 24, padding: '22px',
                background: '#F0FDF4', borderRadius: 16,
                border: '1px solid #BBF7D0', overflow: 'hidden',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
              }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
                  Invite Link Generated!
                </span>
              </div>

              {inviteResult.inviteLink && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: '#6B8F71', marginBottom: 8,
                  }}>Share this link with the member:</div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#fff', padding: '12px 16px',
                    borderRadius: 12, border: '1px solid #E8F0E0',
                  }}>
                    <div style={{
                      flex: 1, fontSize: 12, color: '#1A3A1A',
                      wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.5,
                    }}>{inviteResult.inviteLink}</div>
                    <motion.button
                      onClick={() => copyLink(inviteResult.inviteLink)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: '8px 16px', borderRadius: 10,
                        background: 'linear-gradient(135deg, #16A34A, #15803D)',
                        color: '#fff', border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(22,163,74,0.2)',
                      }}
                    >📋 Copy</motion.button>
                  </div>
                </div>
              )}

              {inviteResult.expiresAt && (
                <div style={{ fontSize: 11, color: '#6B8F71', display: 'flex', alignItems: 'center', gap: 6 }}>
                  ⏰ Expires: {new Date(inviteResult.expiresAt).toLocaleString()}
                </div>
              )}

              <motion.button
                onClick={() => setInviteResult(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  marginTop: 16, width: '100%', padding: '10px',
                  borderRadius: 10, background: '#fff',
                  border: '1.5px solid #BBF7D0',
                  color: '#16A34A', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                }}>➕ Generate Another Link</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            marginTop: 24, background: '#fff', borderRadius: 20,
            padding: '24px 28px', border: '1px solid #E8F0E0', maxWidth: 560,
          }}
        >
          <h3 style={{
            fontSize: 15, fontWeight: 800, color: '#1A3A1A', margin: '0 0 16px',
          }}>📋 Recent Invites ({history.length})</h3>

          {history.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: i < history.length - 1 ? '1px solid #F0F5EC' : 'none',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#F0FDF4', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, border: '1px solid #E8F0E0',
              }}>📨</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, color: '#1A3A1A', fontWeight: 600,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  fontFamily: 'monospace',
                }}>{item.link || 'Link generated'}</div>
                <div style={{ fontSize: 10, color: '#6B8F71', marginTop: 2 }}>
                  Created: {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              {item.link && (
                <motion.button
                  onClick={() => copyLink(item.link)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '6px 12px', borderRadius: 8,
                    background: '#F0FDF4', border: '1px solid #BBF7D0',
                    color: '#16A34A', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >📋 Copy</motion.button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════ */
/* ══ Placeholder Tab                 ══ */
/* ══════════════════════════════════════ */
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
        width: 80, height: 80, borderRadius: 24, background: '#F0FDF4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, margin: '0 auto 20px', border: '1px solid #BBF7D0',
      }}>🚧</div>
      <h3 style={{
        fontSize: 20, fontWeight: 800, color: '#1A3A1A', marginBottom: 8,
      }}>{name.charAt(0).toUpperCase() + name.slice(1)} Module</h3>
      <p style={{ color: '#6B8F71', fontSize: 14 }}>
        Under development. Check back soon!
      </p>
      <div style={{
        marginTop: 24, padding: '8px 20px', borderRadius: 10,
        background: '#F0FDF4', border: '1px solid #BBF7D0',
        display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#16A34A',
      }}>Coming Soon</div>
    </motion.div>
  );
}