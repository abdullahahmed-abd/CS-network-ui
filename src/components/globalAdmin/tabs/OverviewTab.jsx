// components/globalAdmin/tabs/OverviewTab.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchDashboard } from '../../../api/adminApi';

// ── Stat Card ─────────────────────────────
function StatCard({ label, value, icon, bg, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: '#fff', borderRadius: 16, padding: '18px 20px',
        border: '1px solid #E8F0E0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: 11, color: '#6B8F71', fontWeight: 600 }}>{label}</div>
      </div>
    </motion.div>
  );
}

// ── Franchise Hierarchy Node ──────────────
function FranchiseNode({ node, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const typeColors = {
    MASTER: { bg: '#EDE9FE', color: '#6D28D9', border: '#C4B5FD' },
    GENERAL: { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
    SECTOR: { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  };
  const tc = typeColors[node.franchiseType] || typeColors.GENERAL;

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.05 }}
        style={{
          background: '#fff', borderRadius: 12,
          border: `1px solid ${tc.border}`,
          padding: '12px 16px', marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Collapse toggle */}
        {hasChildren && (
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              width: 24, height: 24, borderRadius: 6,
              background: tc.bg, border: `1px solid ${tc.border}`,
              cursor: 'pointer', fontSize: 11, fontWeight: 800,
              color: tc.color, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {collapsed ? '+' : '−'}
          </button>
        )}

        {/* Type badge */}
        <span style={{
          padding: '3px 8px', borderRadius: 6, fontSize: 9,
          fontWeight: 800, background: tc.bg, color: tc.color,
          border: `1px solid ${tc.border}`, letterSpacing: '0.5px',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {node.franchiseType}
        </span>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A1A' }}>
            {node.franchiseName}
          </div>
          <div style={{ fontSize: 11, color: '#6B8F71', marginTop: 2 }}>
            👤 {node.operatorName}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            padding: '3px 8px', borderRadius: 6, fontSize: 10,
            fontWeight: 700, background: '#F0FDF4', color: '#166534',
          }}>
            👥 {node.totalMemberCount} members
          </span>
          {node.directMemberCount > 0 && (
            <span style={{
              padding: '3px 8px', borderRadius: 6, fontSize: 10,
              fontWeight: 700, background: '#EFF6FF', color: '#1E40AF',
            }}>
              ↳ {node.directMemberCount} direct
            </span>
          )}
        </div>
      </motion.div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div style={{
          borderLeft: `2px dashed ${tc.border}`,
          marginLeft: 12, paddingLeft: 8, marginBottom: 4,
        }}>
          {node.children.map((child) => (
            <FranchiseNode key={child.franchiseId} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main OverviewTab ──────────────────────
export default function OverviewTab({ onNavigate }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchDashboard();
        setDashboard(res.globalDashboardResponse);
      } catch (err) {
        console.error('❌ Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quickActions = [
    { label: 'Media Hub', icon: '🎬', desc: 'Manage YouTube videos', nav: 'media_hub' },
    { label: 'Create Franchise', icon: '🏢', desc: 'Create master franchise for a country', nav: 'franchises' },
    { label: 'Send Invitation', icon: '📨', desc: 'Invite operator for a franchise', nav: 'invitations' },
    { label: 'Manage Events', icon: '🎉', desc: 'Create events & manage registrations', nav: 'events' },
    { label: 'Manage Users', icon: '👥', desc: 'View and manage all users', nav: 'users' },
    { label: 'Settings', icon: '⚙️', desc: 'Platform configuration', nav: 'settings' },
  ];

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 20px', gap: 16,
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 44, height: 44,
            border: '3px solid #E8F0E0',
            borderTopColor: '#16A34A',
            borderRadius: '50%',
          }}
        />
        <p style={{ fontSize: 14, color: '#6B8F71', fontWeight: 600 }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div style={{
        background: '#FEF2F2', borderRadius: 16, padding: '32px',
        border: '1px solid #FECACA', textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#991B1B', marginBottom: 8 }}>
          Failed to load dashboard
        </div>
        <div style={{ fontSize: 13, color: '#DC2626' }}>{error}</div>
      </div>
    );
  }

  const { overview, marketplace, meetings, userGrowth, franchiseGrowth, hierarchy, subscriptions } = dashboard || {};

  return (
    <div>
      {/* ── Welcome Banner ── */}
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
        }}>
          {overview
            ? `Managing ${overview.totalUsers} users across ${overview.totalActiveFranchises} active franchises`
            : 'Manage your franchises, events and operators from here.'}
        </p>
      </motion.div>

      {/* ── Overview Stats ── */}
      {overview && (
        <>
          <div style={{
            fontSize: 13, fontWeight: 800, color: '#166534',
            margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            📊 Platform Overview
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14, marginBottom: 24,
          }}>
            <StatCard label="Total Users" value={overview.totalUsers} icon="👥" bg="#F0FDF4" color="#166534" delay={0.00} />
            <StatCard label="Total Members" value={overview.totalMembers} icon="🙋" bg="#DBEAFE" color="#1E40AF" delay={0.05} />
            <StatCard label="Total Operators" value={overview.totalOperators} icon="🧑‍💼" bg="#FEF3C7" color="#92400E" delay={0.10} />
            <StatCard label="Active Franchises" value={overview.totalActiveFranchises} icon="🏢" bg="#EDE9FE" color="#6D28D9" delay={0.15} />
            <StatCard label="Master" value={overview.totalMasterFranchises} icon="⭐" bg="#FCE7F3" color="#9F1239" delay={0.20} />
            <StatCard label="General" value={overview.totalGeneralFranchises} icon="🏙️" bg="#DCFCE7" color="#15803D" delay={0.25} />
            <StatCard label="Sector" value={overview.totalSectorFranchises} icon="🔧" bg="#FFF7ED" color="#C2410C" delay={0.30} />
          </div>
        </>
      )}

      {/* ── User Growth ── */}
      {userGrowth && (
        <>
          <div style={{
            fontSize: 13, fontWeight: 800, color: '#166534',
            margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            📈 User Growth
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 14, marginBottom: 24,
          }}>
            <StatCard label="New Today" value={userGrowth.newUsersToday} icon="🆕" bg="#F0FDF4" color="#166534" delay={0.00} />
            <StatCard label="This Week" value={userGrowth.newUsersThisWeek} icon="📅" bg="#DBEAFE" color="#1E40AF" delay={0.05} />
            <StatCard label="This Month" value={userGrowth.newUsersThisMonth} icon="📆" bg="#FEF3C7" color="#92400E" delay={0.10} />
            <StatCard label="New Members" value={userGrowth.newMembers} icon="🙋" bg="#EDE9FE" color="#6D28D9" delay={0.15} />
            <StatCard label="New Operators" value={userGrowth.newOperators} icon="🧑‍💼" bg="#FCE7F3" color="#9F1239" delay={0.20} />
          </div>
        </>
      )}

      {/* ── Franchise Growth ── */}
      {franchiseGrowth && (
        <>
          <div style={{
            fontSize: 13, fontWeight: 800, color: '#166534',
            margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            🏢 Franchise Growth
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 14, marginBottom: 24,
          }}>
            <StatCard label="New Today" value={franchiseGrowth.newFranchisesToday} icon="🆕" bg="#F0FDF4" color="#166534" delay={0.00} />
            <StatCard label="This Week" value={franchiseGrowth.newFranchisesThisWeek} icon="📅" bg="#DBEAFE" color="#1E40AF" delay={0.05} />
            <StatCard label="This Month" value={franchiseGrowth.newFranchisesThisMonth} icon="📆" bg="#FEF3C7" color="#92400E" delay={0.10} />
            <StatCard label="New Masters" value={franchiseGrowth.newMasterFranchises} icon="⭐" bg="#EDE9FE" color="#6D28D9" delay={0.15} />
            <StatCard label="New General" value={franchiseGrowth.newGeneralFranchises} icon="🏙️" bg="#FCE7F3" color="#9F1239" delay={0.20} />
            <StatCard label="New Sector" value={franchiseGrowth.newSectorFranchises} icon="🔧" bg="#DCFCE7" color="#15803D" delay={0.25} />
          </div>
        </>
      )}

      {/* ── Marketplace & Meetings ── */}
      {(marketplace || meetings) && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 16, marginBottom: 24,
        }}>
          {marketplace && (
            <div style={{
              background: '#fff', borderRadius: 16, padding: '20px 22px',
              border: '1px solid #E8F0E0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A3A1A', marginBottom: 14 }}>
                🛒 Marketplace
              </div>
              {[
                { label: 'Active Intents', value: marketplace.activeTradeIntents },
                { label: 'Deals Today', value: marketplace.dealsToday },
                { label: 'Deals This Week', value: marketplace.dealsThisWeek },
                { label: 'Deals This Month', value: marketplace.dealsThisMonth },
                { label: 'Completed', value: marketplace.completedDeals },
                { label: 'Pending', value: marketplace.pendingDeals },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  borderBottom: '1px solid #F0FDF4',
                  fontSize: 12, color: '#6B8F71', fontWeight: 600,
                }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 800, color: '#1A3A1A' }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {meetings && (
            <div style={{
              background: '#fff', borderRadius: 16, padding: '20px 22px',
              border: '1px solid #E8F0E0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A3A1A', marginBottom: 14 }}>
                📅 Meetings
              </div>
              {[
                { label: 'Today', value: meetings.meetingsToday },
                { label: 'Upcoming', value: meetings.upcomingMeetings },
                { label: 'Completed', value: meetings.completedMeetings },
                { label: 'Cancelled', value: meetings.cancelledMeetings },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  borderBottom: '1px solid #F0FDF4',
                  fontSize: 12, color: '#6B8F71', fontWeight: 600,
                }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 800, color: '#1A3A1A' }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Franchise Hierarchy ── */}
      {hierarchy?.roots?.length > 0 && (
        <>
          <div style={{
            fontSize: 13, fontWeight: 800, color: '#166534',
            margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            🌐 Franchise Hierarchy
          </div>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '20px 22px',
            border: '1px solid #E8F0E0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            marginBottom: 24,
          }}>
            {hierarchy.roots.map((root) => (
              <FranchiseNode key={root.franchiseId} node={root} depth={0} />
            ))}
          </div>
        </>
      )}

      {/* ── Quick Actions ── */}
      <div style={{
        fontSize: 13, fontWeight: 800, color: '#166534',
        margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        ⚡ Quick Actions
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
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
              background: '#fff', borderRadius: 18, padding: '22px',
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