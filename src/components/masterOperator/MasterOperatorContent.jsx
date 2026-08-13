// components/masterOperator/MasterOperatorContent.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Master & Franchise Operator Content Panel
// Backend API Integration: POST /cs-network/master-operator (FETCH_DASHBOARD)
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authenticatedFetch, getUserData, saveUserData } from '../../api/auth';
import {
  fetchMasterDashboard,
  fetchFranchiseDashboard,
  refreshMemberInvite,
  createGeneralFranchise,
  createSectorFranchise,
  inviteGeneralOperator,
  inviteSectorOperator,
  fetchFranchiseCommissions,
  approveCommissionEntry,
  markCommissionEntryPaid,
} from '../../api/adminApi';
import { T } from '../masterOperator/MasterOperatorDashboard';
import MeetingsTab from '../meetings/MeetingsTab';
import DirectoryTab from '../directory/DirectoryTab';
import RoleEventsTab from '../events/RoleEventsTab';
import PartnershipsTab from '../partnerships/PartnershipsTab';
import TrustLeaderboardTab from '../globalAdmin/tabs/TrustLeaderboardTab';
import { getStates, getCities } from '../../utils/locationData';


const BASE_URL = 'https://connectsouq.sundukpay.com';

// ══════════════════════════════════════════════════
// ── DESIGN HELPERS
// ══════════════════════════════════════════════════
const glass = (opts = {}) => ({
  background: opts.bg || 'rgba(255,255,255,0.72)',
  backdropFilter: opts.blur || T.blur.md,
  WebkitBackdropFilter: opts.blur || T.blur.md,
  border: `1px solid ${opts.border || T.border.light}`,
  borderRadius: opts.radius || T.radius.xl,
  boxShadow: opts.shadow || T.shadow.card,
});

// ══════════════════════════════════════════════════
// ── TOAST
// ══════════════════════════════════════════════════
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4200); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success: { gradient: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(52,211,153,0.07))', border: 'rgba(16,185,129,0.25)', color: '#065F46', accent: '#10B981', icon: '✅' },
    error: { gradient: 'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(248,113,113,0.07))', border: 'rgba(239,68,68,0.25)', color: '#991B1B', accent: '#EF4444', icon: '❌' },
    info: { gradient: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(96,165,250,0.07))', border: 'rgba(59,130,246,0.25)', color: '#1E3A8A', accent: '#3B82F6', icon: 'ℹ️' },
  }[type] || {};
  return (
    <motion.div
      initial={{ opacity: 0, y: -28, x: '-50%', scale: 0.9 }}
      animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
      exit={{ opacity: 0, y: -18, x: '-50%', scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{
        position: 'fixed', top: 24, left: '50%',
        background: cfg.gradient, backdropFilter: T.blur.lg, WebkitBackdropFilter: T.blur.lg,
        border: `1px solid ${cfg.border}`, borderRadius: T.radius.lg, padding: '15px 24px',
        boxShadow: T.shadow.xl, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 12,
        maxWidth: 460, minWidth: 320,
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '12px 0 0 12px', background: cfg.accent }} />
      <span style={{ fontSize: 20 }}>{cfg.icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color, flex: 1, fontFamily: T.font, lineHeight: 1.4 }}>{message}</span>
      <motion.button onClick={onClose} whileHover={{ scale: 1.15, rotate: 90 }} whileTap={{ scale: 0.85 }}
        style={{ background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', color: cfg.color, fontSize: 14, width: 28, height: 28, borderRadius: T.radius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
      >×</motion.button>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// ── MODAL & INPUT HELPERS
// ══════════════════════════════════════════════════
function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: T.radius.xxl, padding: '28px 32px',
          maxWidth: 480, width: '100%',
          boxShadow: T.shadow.xl,
          maxHeight: '85vh', overflowY: 'auto', fontFamily: T.font,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, borderBottom: `1px solid ${T.border.light}`, paddingBottom: 16
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary, margin: 0 }}>{title}</h3>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1 }}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: `1px solid ${T.border.light}`, background: '#F9FAFB',
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

function InputField({ label, value, onChange, placeholder, disabled, type = 'text' }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.text.primary, marginBottom: 6, fontFamily: T.font }}>
        {label}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: T.radius.md,
          border: `1.5px solid ${T.border.light}`, background: disabled ? '#F7FAF4' : '#fff',
          fontSize: 14, fontWeight: 600, color: T.text.primary,
          fontFamily: T.font, outline: 'none',
          boxSizing: 'border-box', opacity: disabled ? 0.7 : 1,
        }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, disabled }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.text.primary, marginBottom: 6, fontFamily: T.font }}>
        {label}
      </label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: T.radius.md,
          border: `1.5px solid ${T.border.light}`, background: disabled ? '#F7FAF4' : '#fff',
          fontSize: 14, fontWeight: 600, color: T.text.primary,
          fontFamily: T.font, outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          boxSizing: 'border-box', opacity: disabled ? 0.7 : 1,
        }}
      >
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── BUTTON
// ══════════════════════════════════════════════════
function Btn({ onClick, loading, children, fullWidth, variant = 'primary', size = 'md', accent }) {
  const ac = accent || T.green[500];
  const variants = {
    primary: { background: `linear-gradient(135deg,${ac},${ac}dd)`, color: '#fff', border: 'none', boxShadow: T.shadow.button },
    secondary: { background: 'rgba(255,255,255,0.75)', backdropFilter: T.blur.sm, color: ac, border: `1.5px solid ${ac}44`, boxShadow: T.shadow.card },
    danger: { background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' },
  };
  const sizes = { sm: '8px 16px', md: '12px 24px', lg: '14px 32px' };
  const s = variants[variant] || variants.primary;

  return (
    <motion.button onClick={onClick} disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.025 }} whileTap={{ scale: loading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        ...s, padding: sizes[size] || sizes.md, borderRadius: T.radius.md,
        fontSize: size === 'sm' ? 12 : 14, fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: fullWidth ? '100%' : 'auto', opacity: loading ? 0.7 : 1,
        fontFamily: T.font, letterSpacing: '-0.1px',
        position: 'relative', overflow: 'hidden', transition: 'all 0.18s ease',
      }}
    >
      {loading && (
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', flexShrink: 0 }}
        />
      )}
      {children}
    </motion.button>
  );
}

// ══════════════════════════════════════════════════
// ── STAT CARD
// ══════════════════════════════════════════════════
function StatCard({ label, value, icon, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 280, damping: 24 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
      style={{
        ...glass({ bg: 'rgba(255,255,255,0.75)' }),
        padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -18, right: -18, width: 70, height: 70, borderRadius: '50%', background: gradient, opacity: 0.08, filter: 'blur(16px)' }} />
      <div style={{
        width: 50, height: 50, borderRadius: T.radius.lg,
        background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.09)',
      }}>{icon}</div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: T.text.primary, fontFamily: T.font, letterSpacing: '-0.5px', lineHeight: 1 }}>{value ?? 0}</div>
        <div style={{ fontSize: 11, color: T.text.muted, fontWeight: 600, marginTop: 4, fontFamily: T.font }}>{label}</div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// ── INFO TABLE
// ══════════════════════════════════════════════════
function InfoTable({ title, icon, items, onItemClick }) {
  return (
    <div style={{ ...glass({ bg: 'rgba(255,255,255,0.72)' }), padding: '22px 24px' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: T.text.primary, marginBottom: 16, fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>{title}
      </div>
      {items.map((item, i) => {
        const isClickable = Boolean(item.onClick || onItemClick);
        return (
          <div key={item.label}
            onClick={() => {
              if (item.onClick) item.onClick(item);
              else if (onItemClick) onItemClick(item);
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 10px', borderRadius: 8,
              borderBottom: i < items.length - 1 ? `1px solid ${T.border.light}` : 'none',
              fontSize: 13, color: T.text.muted, fontWeight: 500, fontFamily: T.font,
              cursor: isClickable ? 'pointer' : 'default',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => { if (isClickable) e.currentTarget.style.background = 'rgba(22, 163, 74, 0.08)'; }}
            onMouseLeave={(e) => { if (isClickable) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ textDecoration: isClickable ? 'underline' : 'none' }}>{item.label}</span>
            <span style={{ fontWeight: 800, color: T.text.primary, fontSize: 14 }}>{item.value ?? 0}</span>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── HIERARCHY NODE
// ══════════════════════════════════════════════════
function HierarchyNode({ node, depth = 0, accent }) {
  const [collapsed, setCollapsed] = useState(depth > 0);
  const hasChildren = node.children?.length > 0;
  const grad = node.franchiseType === 'MASTER'
    ? 'linear-gradient(135deg,#4F46E5,#6366F1)'
    : node.franchiseType === 'GENERAL'
      ? 'linear-gradient(135deg,#3B82F6,#60A5FA)'
      : 'linear-gradient(135deg,#10B981,#34D399)';
  const bdr = node.franchiseType === 'MASTER' ? 'rgba(79,70,229,0.18)' : (node.franchiseType === 'GENERAL' ? 'rgba(59,130,246,0.18)' : 'rgba(16,185,129,0.18)');

  return (
    <div style={{ marginLeft: depth > 0 ? 22 : 0 }}>
      <motion.div
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
        whileHover={{ scale: 1.01, x: 2 }}
        onClick={() => hasChildren && setCollapsed(c => !c)}
        style={{
          ...glass({ bg: 'rgba(255,255,255,0.6)', blur: T.blur.sm, border: bdr, radius: T.radius.md }),
          padding: '13px 18px', marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          cursor: hasChildren ? 'pointer' : 'default',
        }}
      >
        {hasChildren ? (
          <motion.div animate={{ rotate: collapsed ? 0 : 90 }} transition={{ duration: 0.2 }}
            style={{ width: 24, height: 24, borderRadius: 6, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >▶</motion.div>
        ) : <div style={{ width: 24 }} />}
        <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 9, fontWeight: 800, background: grad, color: '#fff', letterSpacing: '0.8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {node.franchiseType} #{node.franchiseId}
        </span>
        <div style={{ flex: 1, minWidth: 100 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, fontFamily: T.font }}>{node.franchiseName}</div>
          <div style={{ fontSize: 10, color: T.text.muted, marginTop: 2, fontFamily: T.font }}>👤 Operator: {node.operatorName || 'Unassigned'}</div>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: T.green[700], fontFamily: T.font }}>
          👥 {node.totalMemberCount} Members
        </span>
      </motion.div>
      <AnimatePresence>
        {hasChildren && !collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden', borderLeft: `2px dashed ${bdr}`, marginLeft: 12, paddingLeft: 10, marginBottom: 4 }}
          >
            {node.children.map(child => <HierarchyNode key={child.franchiseId} node={child} depth={depth + 1} accent={accent} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── EMPTY STATE
// ══════════════════════════════════════════════════
function EmptyState({ icon, title, desc, action, actionLabel }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      style={{ ...glass({ bg: 'rgba(255,255,255,0.72)' }), padding: '72px 40px', textAlign: 'center' }}
    >
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{
          width: 88, height: 88, borderRadius: T.radius.xxl,
          background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(59,130,246,0.07))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, margin: '0 auto 24px', border: `1px solid ${T.border.light}`,
        }}>{icon}</motion.div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: T.text.primary, marginBottom: 8, fontFamily: T.font }}>{title}</h3>
      <p style={{ color: T.text.muted, fontSize: 14, fontFamily: T.font, lineHeight: 1.5, marginBottom: action ? 20 : 0 }}>{desc}</p>
      {action && (
        <Btn onClick={action}>{actionLabel}</Btn>
      )}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// ── INVITE LINK CARD
// ══════════════════════════════════════════════════
function InviteLinkCard({ inviteData, onRefresh, refreshLoading, onCopy, accent }) {
  if (!inviteData) return null;

  const {
    inviteLink,
    usesCount = 0,
    maxUses = 100,
    usesRemaining = 100,
    status = 'ACTIVE',
    createdAt,
    expiresAt,
    daysRemaining = 30,
  } = inviteData;

  const isActive = status === 'ACTIVE' && usesRemaining > 0;
  const isExhausted = usesRemaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{
        ...glass({ bg: 'rgba(255,255,255,0.85)' }),
        padding: '24px', borderRadius: T.radius.xxl, position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🔗</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text.primary, fontFamily: T.font }}>
              Member Invitation Link
            </div>
            <div style={{ fontSize: 11, color: T.text.muted, fontFamily: T.font, marginTop: 2 }}>
              Share this link to invite new members to your franchise
            </div>
          </div>
        </div>

        <span style={{
          fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: T.radius.full,
          background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: isActive ? '#065F46' : '#991B1B',
          fontFamily: T.font,
        }}>
          {status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          readOnly
          value={inviteLink || ''}
          style={{
            flex: 1, padding: '12px 14px', borderRadius: T.radius.md,
            border: `1px solid ${T.border.light}`, background: '#F9FAFB',
            fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#000000',
          }}
        />
        <Btn onClick={() => onCopy(inviteLink)} accent={accent}>📋 Copy</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: T.radius.md, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#000000" }}>{usesCount}</div>
          <div style={{ fontSize: 10, color: T.text.muted }}>Uses</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: T.radius.md, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800,color:"#000000" }}>{maxUses}</div>
          <div style={{ fontSize: 10, color: T.text.muted }}>Max Uses</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: T.radius.md, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#000000" }}>{usesRemaining}</div>
          <div style={{ fontSize: 10, color: T.text.muted }}>Remaining</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: T.radius.md, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#000000" }}>{daysRemaining}</div>
          <div style={{ fontSize: 10, color: T.text.muted }}>Days Left</div>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// ── OVERVIEW TAB
// ══════════════════════════════════════════════════
function OverviewTab({ onNavigate, cfg }) {
  const [dashData, setDashData] = useState(null);
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshLoading, setRefreshLoading] = useState(false);

  /* ── Fetch dashboard ── */
  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = cfg.isMaster ? await fetchMasterDashboard() : await fetchFranchiseDashboard();
        const data = res?.masterDashboardResponse || res?.dashboardResponse || res;
        console.log('📊 Dashboard Data Loaded:', data);
        setDashData(data);
        setInviteData(res?.memberInviteLink || res?.inviteLink || data?.memberInviteLink);

        // ── Persist franchiseId so ScheduleMeetingModal reads the correct ID ──
        const franchiseId = data?.franchiseId || data?.franchise?.franchiseId || data?.franchise?.id;
        if (franchiseId) {
          const existing = getUserData() || {};
          if (!existing.franchiseId || existing.franchiseId !== Number(franchiseId)) {
            saveUserData({ ...existing, franchiseId: Number(franchiseId) });
            console.log('💾 Saved franchiseId to userData:', franchiseId);
          }
        }
      } catch (err) { setError(err.message || 'Failed to load dashboard'); }
      finally { setLoading(false); }
    })();
  }, [cfg.isMaster]);

  /* ── Refresh invite ── */
  const handleRefresh = async () => {
    setRefreshLoading(true);
    try {
      const res = await refreshMemberInvite();
      setInviteData(res.memberInviteLink);
      setToast({ message: res.message || 'Invite link refreshed!', type: 'success' });
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
    finally { setRefreshLoading(false); }
  };

  const copyLink = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Link copied to clipboard!', type: 'success' });
  };

  const accent = cfg.accent;
  const accentHue = cfg.isMaster ? 'indigo' : (cfg.isGeneral ? 'blue' : 'green');

  /* Loading */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: 18 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        style={{ width: 46, height: 46, border: `3px solid ${T.border.light}`, borderTopColor: accent, borderRadius: '50%' }} />
      <p style={{ fontSize: 14, color: T.text.muted, fontWeight: 600, fontFamily: T.font }}>Loading dashboard...</p>
    </div>
  );

  /* Error */
  if (error) return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      style={{ ...glass({ bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)' }), padding: '40px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>⚠️</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#991B1B', marginBottom: 8, fontFamily: T.font }}>Failed to load dashboard</div>
      <div style={{ fontSize: 13, color: '#DC2626', fontFamily: T.font }}>{error}</div>
    </motion.div>
  );

  const { overview, marketplace, meetings, businessPartners, userGrowth, franchiseGrowth, hierarchy } = dashData || {};

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: cfg.isMaster
            ? 'linear-gradient(135deg,#1E1B4B 0%,#312E81 55%,#4F46E5 100%)'
            : (cfg.isGeneral
              ? 'linear-gradient(135deg,#1E3A5F 0%,#2563EB 55%,#60A5FA 100%)'
              : 'linear-gradient(135deg,#064E3B 0%,#059669 55%,#34D399 100%)'),
          borderRadius: T.radius.xxl, padding: '32px 36px',
          marginBottom: 28, color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -50, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '35%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: 20, right: 44, fontSize: 52, opacity: 0.12 }}
        >{cfg.icon}</motion.div>

        <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', position: 'relative', zIndex: 1, fontFamily: T.font, letterSpacing: '-0.5px' }}>
          Welcome, {cfg.label} 👋
        </h2>
        <p style={{ fontSize: 14, margin: 0, opacity: 0.85, fontWeight: 500, position: 'relative', zIndex: 1, fontFamily: T.font, lineHeight: 1.5 }}>
          {overview
            ? `Managing ${overview.totalMembers} members across ${overview.totalActiveFranchises} active franchises`
            : `Manage your ${cfg.label} from here.`}
        </p>
      </motion.div>

      {/* ── Invite Link Card ── */}
      {inviteData && (
        <>
          <div style={{ fontSize: 12, fontWeight: 800, color: cfg.isMaster ? '#4338CA' : (cfg.isGeneral ? '#1D4ED8' : T.green[700]), margin: '0 0 14px', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔗 Member Invite Link
          </div>
          <div style={{ marginBottom: 28 }}>
            <InviteLinkCard
              inviteData={inviteData}
              onRefresh={handleRefresh}
              refreshLoading={refreshLoading}
              onCopy={copyLink}
              accent={accent}
            />
          </div>
        </>
      )}

      {/* ── Platform Overview Stats ── */}
      {overview && (
        <>
          <div style={{ fontSize: 12, fontWeight: 800, color: cfg.isMaster ? '#4338CA' : (cfg.isGeneral ? '#1D4ED8' : T.green[700]), margin: '0 0 14px', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 Overview Stats
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
            <StatCard label="Total Users" value={overview.totalUsers} icon="👥" gradient={cfg.isMaster ? 'linear-gradient(135deg,#4F46E5,#6366F1)' : (cfg.isGeneral ? 'linear-gradient(135deg,#3B82F6,#60A5FA)' : 'linear-gradient(135deg,#10B981,#34D399)')} delay={0.00} />
            <StatCard label="Members" value={overview.totalMembers} icon="🙋" gradient="linear-gradient(135deg,#8B5CF6,#A78BFA)" delay={0.05} />
            <StatCard label="Operators" value={overview.totalOperators} icon="🧑‍💼" gradient="linear-gradient(135deg,#F59E0B,#FBBF24)" delay={0.10} />
            <StatCard label="Active Franchises" value={overview.totalActiveFranchises} icon="🏢" gradient="linear-gradient(135deg,#EC4899,#F472B6)" delay={0.15} />
            {cfg.isMaster && (
              <>
                <StatCard label="General Franchises" value={overview.totalGeneralFranchises} icon="🏢" gradient="linear-gradient(135deg,#3B82F6,#60A5FA)" delay={0.20} />
                <StatCard label="Sector Franchises" value={overview.totalSectorFranchises} icon="🏭" gradient="linear-gradient(135deg,#10B981,#34D399)" delay={0.25} />
              </>
            )}
          </div>
        </>
      )}

      {/* ── Growth ── */}
      {(userGrowth || franchiseGrowth) && (
        <>
          <div style={{ fontSize: 12, fontWeight: 800, color: cfg.isMaster ? '#4338CA' : (cfg.isGeneral ? '#1D4ED8' : T.green[700]), margin: '0 0 14px', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 8 }}>
            📈 Growth & Analytics
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            {userGrowth && (
              <InfoTable title="User Growth" icon="👥" items={[
                { label: 'New Today', value: userGrowth.newUsersToday },
                { label: 'This Week', value: userGrowth.newUsersThisWeek },
                { label: 'This Month', value: userGrowth.newUsersThisMonth },
                { label: 'New Members', value: userGrowth.newMembers },
                { label: 'New Operators', value: userGrowth.newOperators },
              ]} />
            )}
            {franchiseGrowth && (
              <InfoTable title="Franchise Growth" icon="🏢" items={[
                { label: 'New General', value: franchiseGrowth.newGeneralFranchises },
                { label: 'New Sector', value: franchiseGrowth.newSectorFranchises },
                { label: 'New Today', value: franchiseGrowth.newFranchisesToday },
                { label: 'This Week', value: franchiseGrowth.newFranchisesThisWeek },
                { label: 'This Month', value: franchiseGrowth.newFranchisesThisMonth },
              ]} />
            )}
            {businessPartners && !franchiseGrowth && (
              <InfoTable
                title="Business Partners"
                icon="🤝"
                items={[
                  { label: 'Pending', value: businessPartners.pendingApplications, filter: 'PENDING' },
                  { label: 'Approved', value: businessPartners.approvedApplications, filter: 'APPROVED' },
                  { label: 'Rejected', value: businessPartners.rejectedApplications, filter: 'REJECTED' },
                  { label: 'Today', value: businessPartners.applicationsToday, filter: 'ALL' },
                ]}
                onItemClick={(item) => onNavigate && onNavigate('bp_approvals', item.filter)}
              />
            )}
          </div>
        </>
      )}

      {/* ── Activity ── */}
      {(marketplace || meetings) && (
        <>
          <div style={{ fontSize: 12, fontWeight: 800, color: cfg.isMaster ? '#4338CA' : (cfg.isGeneral ? '#1D4ED8' : T.green[700]), margin: '0 0 14px', fontFamily: T.font, display: 'flex', items: 'center', gap: 8 }}>
            🛒 Activity
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            {marketplace && <InfoTable title="Marketplace" icon="🛒" items={[
              { label: 'Active Intents', value: marketplace.activeTradeIntents },
              { label: 'Deals Today', value: marketplace.dealsToday },
              { label: 'Deals This Week', value: marketplace.dealsThisWeek },
              { label: 'Completed Deals', value: marketplace.completedDeals },
              { label: 'Pending Deals', value: marketplace.pendingDeals },
            ]} />}
            {meetings && <InfoTable title="Meetings" icon="📅" items={[
              { label: 'Today', value: meetings.meetingsToday },
              { label: 'Upcoming', value: meetings.upcomingMeetings },
              { label: 'Completed', value: meetings.completedMeetings },
              { label: 'Cancelled', value: meetings.cancelledMeetings },
            ]} />}
          </div>
        </>
      )}

      {/* ── Hierarchy ── */}
      {hierarchy?.roots?.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 800, color: cfg.isMaster ? '#4338CA' : (cfg.isGeneral ? '#1D4ED8' : T.green[700]), margin: '0 0 14px', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 8 }}>
            🌐 Franchise Network Hierarchy
          </div>
          <div style={{ ...glass({ bg: 'rgba(255,255,255,0.55)' }), padding: '22px 24px', marginBottom: 28 }}>
            {hierarchy.roots.map(root => (
              <HierarchyNode key={root.franchiseId} node={root} depth={0} accent={accentHue} />
            ))}
          </div>
        </>
      )}

      {/* ── Quick Actions ── */}
      <div style={{ fontSize: 12, fontWeight: 800, color: cfg.isMaster ? '#4338CA' : (cfg.isGeneral ? '#1D4ED8' : T.green[700]), margin: '0 0 14px', fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 8 }}>
        ⚡ Quick Actions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
        {(cfg.isMaster ? [
          { label: 'General Franchises', icon: '🏢', desc: 'Create & invite general operators', nav: 'general', gradient: 'linear-gradient(135deg,#3B82F6,#60A5FA)' },
          { label: 'Sector Franchises', icon: '🏭', desc: 'Create & invite sector operators', nav: 'sector', gradient: 'linear-gradient(135deg,#10B981,#34D399)' },
          { label: 'Members', icon: '👥', desc: 'View network members', nav: 'members', gradient: 'linear-gradient(135deg,#8B5CF6,#A78BFA)' },
          { label: 'Meetings', icon: '📅', desc: 'Schedule role-based meetings', nav: 'meetings', gradient: 'linear-gradient(135deg,#EC4899,#F472B6)' },
        ] : [
          { label: 'Members', icon: '👥', desc: 'View and manage members', nav: 'members', gradient: cfg.isGeneral ? 'linear-gradient(135deg,#3B82F6,#60A5FA)' : 'linear-gradient(135deg,#10B981,#34D399)' },
          { label: 'Invite Link', icon: '🔗', desc: 'Share member invite link', nav: 'invite', gradient: 'linear-gradient(135deg,#8B5CF6,#A78BFA)' },
          { label: 'Marketplace', icon: '🛒', desc: 'View marketplace activity', nav: 'marketplace', gradient: 'linear-gradient(135deg,#F59E0B,#FBBF24)' },
          { label: 'Meetings', icon: '📅', desc: 'Manage scheduled meetings', nav: 'meetings', gradient: 'linear-gradient(135deg,#EC4899,#F472B6)' },
        ]).map((a, i) => (
          <motion.button key={i}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 280, damping: 24 }}
            whileHover={{ y: -6, boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate(a.nav)}
            style={{ ...glass({ bg: 'rgba(255,255,255,0.72)' }), padding: '24px', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: -18, right: -18, width: 80, height: 80, borderRadius: '50%', background: a.gradient, opacity: 0.07, filter: 'blur(14px)' }} />
            <div style={{ width: 50, height: 50, borderRadius: T.radius.lg, background: a.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>{a.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text.primary, marginBottom: 5, fontFamily: T.font }}>{a.label}</div>
            <div style={{ fontSize: 12, color: T.text.muted, fontWeight: 500, fontFamily: T.font, lineHeight: 1.4 }}>{a.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── GENERAL FRANCHISE TAB (MASTER OPERATOR)
// ══════════════════════════════════════════════════
function GeneralFranchiseTab({ cfg }) {
  const [franchises, setFranchises] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [inviteId, setInviteId] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

  const getLinkFromRes = (res) => {
    if (!res) return '';
    if (res.inviteLink) return res.inviteLink;
    if (res.token) return `${window.location.origin}/invite/${res.token}`;
    if (res.inviteUrl) return res.inviteUrl;
    if (typeof res === 'string') return res;
    return '';
  };

  const handleCreate = async () => {
    if (!name.trim() || !state.trim() || !city.trim()) {
      setToast({ message: 'All fields are required', type: 'error' });
      return;
    }
    setLoading(true);
    setCreateResult(null);
    try {
      const res = await createGeneralFranchise(name.trim(), state.trim(), city.trim());
      let link = getLinkFromRes(res);
      const franchiseId = res?.franchiseId || res?.id || Date.now();

      if (!link && franchiseId) {
        try {
          const invRes = await inviteGeneralOperator(Number(franchiseId));
          link = getLinkFromRes(invRes);
        } catch (e) {
          console.error('Failed to auto-generate invite link:', e);
        }
      }

      const newFranchise = {
        id: franchiseId,
        name: res.franchiseName || name.trim(),
        state: res.state || state.trim(),
        city: res.city || city.trim(),
        inviteLink: link,
      };
      setFranchises((prev) => [newFranchise, ...prev]);
      setCreateResult({ ...res, inviteLink: link, franchiseId });
      setToast({ message: res.message || 'General Franchise created successfully!', type: 'success' });
      setName(''); setState(''); setCity('');
    } catch (err) {
      setToast({ message: err.message || 'Failed to create General Franchise', type: 'error' });
    } finally { setLoading(false); }
  };

  const handleInvite = async (overrideId) => {
    const targetId = overrideId || inviteId || franchises[0]?.id || 1;
    setInviteLoading(true); setInviteResult(null);
    try {
      const res = await inviteGeneralOperator(Number(targetId));
      const link = getLinkFromRes(res);
      setInviteResult({ ...res, inviteLink: link });
      setToast({ message: res.message || 'Invite link generated!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to generate invite link', type: 'error' });
    } finally { setInviteLoading(false); }
  };

  useEffect(() => {
    if (showInvite && !inviteResult && !inviteLoading) {
      handleInvite(inviteId);
    }
  }, [showInvite]);

  const copyLink = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setToast({ message: 'Invite link copied to clipboard!', type: 'success' });
  };

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text.primary, margin: 0, fontFamily: T.font }}>General Franchises</h2>
          <p style={{ fontSize: 12, color: T.text.muted, margin: '4px 0 0', fontFamily: T.font }}>Create and manage state & city level franchises</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="secondary" onClick={() => { setInviteId(''); setInviteResult(null); setShowInvite(true); }} accent="#3B82F6">
            📨 Invite Operator
          </Btn>
          <Btn onClick={() => { setShowCreate(true); setCreateResult(null); }} accent="#3B82F6">➕ Create General Franchise</Btn>
        </div>
      </div>

      {/* Franchises Cards List / Empty State */}
      {franchises.length === 0 ? (
        <div style={{ ...glass({ bg: 'rgba(255,255,255,0.72)' }), padding: '36px', textAlign: 'center', borderRadius: T.radius.xxl }}>
          <div style={{ fontSize: 42, marginBottom: 16 }}>🏢</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary, fontFamily: T.font, margin: '0 0 8px' }}>
            General Franchises Management
          </h3>
          <p style={{ fontSize: 13, color: T.text.muted, fontFamily: T.font, maxWidth: 460, margin: '0 auto 24px' }}>
            Create General Franchises for states and cities, or generate invite links for General Franchise Operators.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Btn onClick={() => { setShowCreate(true); setCreateResult(null); }} accent="#3B82F6">➕ Create General Franchise</Btn>
            <Btn variant="secondary" onClick={() => { setInviteId(''); setInviteResult(null); setShowInvite(true); }} accent="#3B82F6">🔗 Invite General Operator</Btn>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {franchises.map((f, i) => (
            <motion.div key={f.id || i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ ...glass({ bg: '#fff' }), padding: '22px 24px', borderRadius: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid #BFDBFE' }}>🏢</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text.primary }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: T.text.muted, fontWeight: 500 }}>📍 {f.city}, {f.state}</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>
                  ID: {f.id}
                </div>
              </div>
              {f.inviteLink && (
                <div style={{ marginBottom: 12, background: '#F8FAFC', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, fontSize: 11, fontFamily: 'monospace', color: '#0f172a', fontWeight: 700, wordBreak: 'break-all' }}>{f.inviteLink}</div>
                  <motion.button onClick={() => copyLink(f.inviteLink)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ padding: '4px 10px', borderRadius: 6, background: '#2563EB', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}
                  >📋 Copy</motion.button>
                </div>
              )}
              <Btn variant="secondary" fullWidth onClick={() => { setInviteId(String(f.id)); setInviteResult(null); setShowInvite(true); }} accent="#3B82F6">
                📨 Invite Operator
              </Btn>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <Modal title="Create General Franchise" onClose={() => { setShowCreate(false); setCreateResult(null); }}>
            {!createResult ? (
              <>
                <InputField label="Franchise Name" value={name} onChange={setName} placeholder="e.g. Bhopal General Franchise" />
                <SelectField
                  label="State"
                  value={state}
                  onChange={(s) => { setState(s); setCity(''); }}
                  options={['Select State', ...getStates('India'), ...getStates('United Arab Emirates'), ...getStates('Saudi Arabia')]}
                />
                <SelectField
                  label="City"
                  value={city}
                  onChange={setCity}
                  disabled={!state}
                  options={['Select City', ...(getCities('India', state).length ? getCities('India', state) : getCities('United Arab Emirates', state).length ? getCities('United Arab Emirates', state) : getCities('Saudi Arabia', state))]}
                />
                <div style={{ marginTop: 12 }}>
                  <Btn fullWidth onClick={handleCreate} loading={loading} accent="#3B82F6">
                    {loading ? 'Creating...' : '🏢 Create General Franchise'}
                  </Btn>
                </div>
              </>
            ) : (
              <div style={{ background: '#F0FDF4', padding: 20, borderRadius: 14, border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
                  ✅ General Franchise Created!
                </div>
                <div style={{ fontSize: 12, color: '#15803D', marginBottom: 14 }}>
                  Franchise ID: <strong>#{createResult.franchiseId}</strong>
                </div>

                {createResult.inviteLink ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 6 }}>
                      General Operator Invite Link:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '10px 12px', borderRadius: 10, border: '1px solid #BBF7D0' }}>
                      <div style={{ flex: 1, fontSize: 11, fontFamily: 'monospace', color: '#000000', fontWeight: 700, wordBreak: 'break-all' }}>
                        {createResult.inviteLink}
                      </div>
                      <motion.button onClick={() => copyLink(createResult.inviteLink)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ padding: '6px 12px', borderRadius: 8, background: '#16A34A', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}
                      >📋 Copy</motion.button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#6B8F71', marginBottom: 16 }}>
                    Franchise created. Click "Invite Operator" anytime to generate a fresh invite link.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <Btn variant="secondary" fullWidth onClick={() => setCreateResult(null)} accent="#3B82F6">
                    ➕ Create Another
                  </Btn>
                  <Btn fullWidth onClick={() => { setShowCreate(false); setCreateResult(null); }} accent="#10B981">
                    Done
                  </Btn>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <Modal title="Invite General Operator" onClose={() => { setShowInvite(false); setInviteResult(null); setInviteId(''); }}>
            {inviteLoading && (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{ width: 40, height: 40, border: '3px solid #BFDBFE', borderTopColor: '#2563EB', borderRadius: '50%', margin: '0 auto 16px' }}
                />
                <p style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, margin: 0, fontFamily: T.font }}>
                  Generating Operator Invite Link...
                </p>
              </div>
            )}
            {!inviteLoading && inviteResult && (
              <div style={{ marginTop: 8, background: '#F0FDF4', padding: 20, borderRadius: 14, border: '1px solid #BBF7D0' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#166534', margin: '0 0 12px' }}>✅ General Operator Invite Link Ready!</p>
                {inviteResult.inviteLink ? (
                  <>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #BBF7D0', color: '#000000', fontWeight: 700, marginBottom: 14 }}>
                      {inviteResult.inviteLink}
                    </div>
                    <Btn fullWidth onClick={() => copyLink(inviteResult.inviteLink)} accent="#10B981">
                      📋 Copy Invite Link
                    </Btn>
                  </>
                ) : (
                  <p style={{ fontSize: 12, color: '#166534' }}>{inviteResult.message || 'Invitation created.'}</p>
                )}
                {inviteResult.expiresAt && (
                  <div style={{ fontSize: 11, color: '#6B8F71', marginTop: 12, textAlign: 'center' }}>
                    ⏰ Expires: {new Date(inviteResult.expiresAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── SECTOR FRANCHISE TAB (MASTER OPERATOR)
// ══════════════════════════════════════════════════
function SectorFranchiseTab({ cfg }) {
  const [franchises, setFranchises] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [inviteId, setInviteId] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

  const getLinkFromRes = (res) => {
    if (!res) return '';
    if (res.inviteLink) return res.inviteLink;
    if (res.token) return `${window.location.origin}/invite/${res.token}`;
    if (res.inviteUrl) return res.inviteUrl;
    if (typeof res === 'string') return res;
    return '';
  };

  const handleCreate = async () => {
    if (!name.trim() || !sector.trim()) {
      setToast({ message: 'All fields required', type: 'error' }); return;
    }
    setLoading(true);
    setCreateResult(null);
    try {
      const res = await createSectorFranchise(name.trim(), sector.trim());
      let link = getLinkFromRes(res);
      const franchiseId = res?.franchiseId || res?.id || Date.now();

      if (!link && franchiseId) {
        try {
          const invRes = await inviteSectorOperator(Number(franchiseId));
          link = getLinkFromRes(invRes);
        } catch (e) {
          console.error('Failed to auto-generate invite link:', e);
        }
      }

      const newFranchise = {
        id: franchiseId,
        name: res.franchiseName || name.trim(),
        sector: res.sectorName || sector.trim(),
        inviteLink: link,
      };
      setFranchises((prev) => [newFranchise, ...prev]);
      setCreateResult({ ...res, inviteLink: link, franchiseId });
      setToast({ message: res.message || 'Sector Franchise created successfully!', type: 'success' });
      setName(''); setSector('');
    } catch (err) {
      setToast({ message: err.message || 'Failed to create Sector Franchise', type: 'error' });
    } finally { setLoading(false); }
  };

  const handleInvite = async (overrideId) => {
    const targetId = overrideId || inviteId || franchises[0]?.id || 1;
    setInviteLoading(true); setInviteResult(null);
    try {
      const res = await inviteSectorOperator(Number(targetId));
      const link = getLinkFromRes(res);
      setInviteResult({ ...res, inviteLink: link });
      setToast({ message: res.message || 'Invite link generated!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to generate invite link', type: 'error' });
    } finally { setInviteLoading(false); }
  };

  useEffect(() => {
    if (showInvite && !inviteResult && !inviteLoading) {
      handleInvite(inviteId);
    }
  }, [showInvite]);

  const copyLink = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setToast({ message: 'Invite link copied to clipboard!', type: 'success' });
  };

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text.primary, margin: 0, fontFamily: T.font }}>Sector Franchises</h2>
          <p style={{ fontSize: 12, color: T.text.muted, margin: '4px 0 0', fontFamily: T.font }}>Create and manage industry sector franchises</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="secondary" onClick={() => { setInviteId(''); setInviteResult(null); setShowInvite(true); }} accent="#10B981">
            📨 Invite Operator
          </Btn>
          <Btn onClick={() => { setShowCreate(true); setCreateResult(null); }} accent="#10B981">➕ Create Sector Franchise</Btn>
        </div>
      </div>

      {franchises.length === 0 ? (
        <div style={{ ...glass({ bg: 'rgba(255,255,255,0.72)' }), padding: '36px', textAlign: 'center', borderRadius: T.radius.xxl }}>
          <div style={{ fontSize: 42, marginBottom: 16 }}>🏭</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary, fontFamily: T.font, margin: '0 0 8px' }}>
            Sector Franchises Management
          </h3>
          <p style={{ fontSize: 13, color: T.text.muted, fontFamily: T.font, maxWidth: 460, margin: '0 auto 24px' }}>
            Create industry-specific Sector Franchises (e.g. Textile, IT, Agriculture) under your Master network.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Btn onClick={() => { setShowCreate(true); setCreateResult(null); }} accent="#10B981">➕ Create Sector Franchise</Btn>
            <Btn variant="secondary" onClick={() => { setInviteId(''); setInviteResult(null); setShowInvite(true); }} accent="#10B981">🔗 Invite Sector Operator</Btn>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {franchises.map((f, i) => (
            <motion.div key={f.id || i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ ...glass({ bg: '#fff' }), padding: '22px 24px', borderRadius: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid #A7F3D0' }}>🏭</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text.primary }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: T.text.muted, fontWeight: 500 }}>Sector: {f.sector}</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 8, background: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: 11, fontWeight: 700, color: '#047857' }}>
                  ID: {f.id}
                </div>
              </div>
              {f.inviteLink && (
                <div style={{ marginBottom: 12, background: '#F8FAFC', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, fontSize: 11, fontFamily: 'monospace', color: '#000000', fontWeight: 700, wordBreak: 'break-all' }}>{f.inviteLink}</div>
                  <motion.button onClick={() => copyLink(f.inviteLink)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ padding: '4px 10px', borderRadius: 6, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}
                  >📋 Copy</motion.button>
                </div>
              )}
              <Btn variant="secondary" fullWidth onClick={() => { setInviteId(String(f.id)); setInviteResult(null); setShowInvite(true); }} accent="#10B981">
                📨 Invite Operator
              </Btn>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <Modal title="Create Sector Franchise" onClose={() => { setShowCreate(false); setCreateResult(null); }}>
            {!createResult ? (
              <>
                <InputField label="Franchise Name" value={name} onChange={setName} placeholder="e.g. Textile Sector Franchise" />
                <InputField label="Sector Name" value={sector} onChange={setSector} placeholder="e.g. Textile" />
                <div style={{ marginTop: 12 }}>
                  <Btn fullWidth onClick={handleCreate} loading={loading} accent="#10B981">
                    {loading ? 'Creating...' : '🏭 Create Sector Franchise'}
                  </Btn>
                </div>
              </>
            ) : (
              <div style={{ background: '#F0FDF4', padding: 20, borderRadius: 14, border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
                  ✅ Sector Franchise Created!
                </div>
                <div style={{ fontSize: 12, color: '#15803D', marginBottom: 14 }}>
                  Franchise ID: <strong>#{createResult.franchiseId}</strong>
                </div>

                {createResult.inviteLink ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 6 }}>
                      Sector Operator Invite Link:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '10px 12px', borderRadius: 10, border: '1px solid #BBF7D0' }}>
                      <div style={{ flex: 1, fontSize: 11, fontFamily: 'monospace', color: '#000000', fontWeight: 700, wordBreak: 'break-all' }}>
                        {createResult.inviteLink}
                      </div>
                      <motion.button onClick={() => copyLink(createResult.inviteLink)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ padding: '6px 12px', borderRadius: 8, background: '#16A34A', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}
                      >📋 Copy</motion.button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#6B8F71', marginBottom: 16 }}>
                    Franchise created. Click "Invite Operator" anytime to generate a fresh invite link.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <Btn variant="secondary" fullWidth onClick={() => setCreateResult(null)} accent="#10B981">
                    ➕ Create Another
                  </Btn>
                  <Btn fullWidth onClick={() => { setShowCreate(false); setCreateResult(null); }} accent="#10B981">
                    Done
                  </Btn>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <Modal title="Invite Sector Operator" onClose={() => { setShowInvite(false); setInviteResult(null); setInviteId(''); }}>
            {inviteLoading && (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{ width: 40, height: 40, border: '3px solid #A7F3D0', borderTopColor: '#059669', borderRadius: '50%', margin: '0 auto 16px' }}
                />
                <p style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, margin: 0, fontFamily: T.font }}>
                  Generating Operator Invite Link...
                </p>
              </div>
            )}
            {!inviteLoading && inviteResult && (
              <div style={{ marginTop: 8, background: '#F0FDF4', padding: 20, borderRadius: 14, border: '1px solid #BBF7D0' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#166534', margin: '0 0 12px' }}>✅ Sector Operator Invite Link Ready!</p>
                {inviteResult.inviteLink ? (
                  <>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #BBF7D0', color: '#000000', fontWeight: 700, marginBottom: 14 }}>
                      {inviteResult.inviteLink}
                    </div>
                    <Btn fullWidth onClick={() => copyLink(inviteResult.inviteLink)} accent="#10B981">
                      📋 Copy Invite Link
                    </Btn>
                  </>
                ) : (
                  <p style={{ fontSize: 12, color: '#166534' }}>{inviteResult.message || 'Invitation created.'}</p>
                )}
                {inviteResult.expiresAt && (
                  <div style={{ fontSize: 11, color: '#6B8F71', marginTop: 12, textAlign: 'center' }}>
                    ⏰ Expires: {new Date(inviteResult.expiresAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── INVITE TAB (Standalone invite page)
// ══════════════════════════════════════════════════
function InviteTab({ cfg }) {
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = cfg.isMaster ? await fetchMasterDashboard() : await fetchFranchiseDashboard();
        const data = res?.masterDashboardResponse || res?.dashboardResponse || res;
        setInviteData(res?.memberInviteLink || res?.inviteLink || data?.memberInviteLink);
      } catch (err) { setToast({ message: err.message, type: 'error' }); }
      finally { setLoading(false); }
    })();
  }, [cfg.isMaster]);

  const handleRefresh = async () => {
    setRefreshLoading(true);
    try {
      const res = await refreshMemberInvite();
      setInviteData(res.memberInviteLink);
      setToast({ message: res.message || 'Invite link refreshed!', type: 'success' });
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
    finally { setRefreshLoading(false); }
  };

  const copyLink = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Link copied!', type: 'success' });
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 18 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        style={{ width: 46, height: 46, border: `3px solid ${T.border.light}`, borderTopColor: cfg.accent, borderRadius: '50%' }} />
      <p style={{ fontSize: 14, color: T.text.muted, fontWeight: 600, fontFamily: T.font }}>Loading invite link...</p>
    </div>
  );

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text.primary, margin: '0 0 6px', fontFamily: T.font }}>
        Member Invite Link
      </h2>
      <p style={{ fontSize: 11, color: T.text.muted, margin: '0 0 28px', fontWeight: 500, fontFamily: T.font }}>
        Share this link with people to invite them as members to your {cfg.isMaster ? 'master' : (cfg.isSector ? 'sector' : 'general')} franchise
      </p>

      {inviteData ? (
        <InviteLinkCard
          inviteData={inviteData}
          onRefresh={handleRefresh}
          refreshLoading={refreshLoading}
          onCopy={copyLink}
          accent={cfg.accent}
        />
      ) : (
        <EmptyState icon="🔗" title="No Invite Link" desc="No invite link found. Try refreshing." />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── PLACEHOLDER TABS
// ══════════════════════════════════════════════════
// ── APPLICATIONS TAB (Approve / Reject BP Applications)
// ══════════════════════════════════════════════════
function ApplicationsTab({ onCountChange, initialFilter = 'PENDING' }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState(initialFilter);

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

  const handleAction = async (applicationId, action) => {
    const rawNotes = reviewNotes[applicationId]?.trim() || '';

    if (action === 'REJECT' && !rawNotes) {
      setToast({
        message: 'Rejection reason (reviewNotes) is required when rejecting an application.',
        type: 'error',
      });
      return;
    }

    setActionLoading(applicationId);
    try {
      const notes = rawNotes || (action === 'APPROVE' ? 'Application verified and approved.' : '');

      const payload = {
        franchiseOperatorRequestType: action === 'APPROVE'
          ? 'APPROVE_APPLICATION'
          : 'REJECT_APPLICATION',
        applicationId: Number(applicationId),
        ...(notes && { reviewNotes: notes }),
      };

      await authenticatedFetch(`${BASE_URL}/cs-network/franchise-operator`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setToast({
        message: action === 'APPROVE'
          ? `Application #${applicationId} approved! BUSINESS_PARTNER role granted.`
          : `Application #${applicationId} rejected.`,
        type: 'success',
      });

      setApplications((prev) =>
        prev.filter((a) => a.id !== applicationId && a.applicationId !== applicationId)
      );

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

  const filteredApps = filter === 'ALL'
    ? applications
    : filter === 'PENDING'
      ? applications.filter((a) => (a.status || 'PENDING') === 'PENDING')
      : filter === 'APPROVED'
        ? applications.filter((a) => a.status === 'APPROVED')
        : filter === 'REJECTED'
          ? applications.filter((a) => a.status === 'REJECTED')
          : applications;

  return (
    <div>
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text.primary, margin: '0 0 4px', fontFamily: T.font }}>
            Business Partner Approvals
          </h2>
          <p style={{ fontSize: 12, color: T.text.muted, margin: 0, fontFamily: T.font }}>
            Review pending applications and grant Business Partner status
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((f) => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '8px 16px', borderRadius: T.radius.md,
                background: filter === f ? '#059669' : '#fff',
                color: filter === f ? '#fff' : T.text.secondary,
                border: filter === f ? 'none' : `1px solid ${T.border.light}`,
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: T.font,
              }}
            >
              {f === 'PENDING' ? `⏳ Pending (${applications.filter((a) => (a.status || 'PENDING') === 'PENDING').length})`
                : f === 'APPROVED' ? `✅ Approved (${applications.filter((a) => a.status === 'APPROVED').length})`
                  : f === 'REJECTED' ? `❌ Rejected (${applications.filter((a) => a.status === 'REJECTED').length})`
                    : '📋 All'}
            </motion.button>
          ))}

          <motion.button
            onClick={fetchApplications}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            style={{
              padding: '8px 16px', borderRadius: T.radius.md,
              background: '#ECFDF5', border: '1px solid #A7F3D0',
              color: '#059669', fontSize: 12, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: T.font,
            }}
          >
            🔄 Refresh
          </motion.button>
        </div>
      </div>

      {loading && applications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            style={{ width: 44, height: 44, margin: '0 auto 16px', border: `3px solid ${T.border.light}`, borderTopColor: '#059669', borderRadius: '50%' }}
          />
          <p style={{ fontSize: 14, fontWeight: 600, color: T.text.muted, fontFamily: T.font }}>Loading applications...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16, padding: '20px 24px', textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#991B1B', margin: '0 0 12px' }}>❌ {error}</p>
          <Btn onClick={fetchApplications}>🔄 Retry</Btn>
        </div>
      )}

      {!loading && !error && filteredApps.length === 0 && (
        <EmptyState icon="🎉" title="No Applications Found" desc="All Business Partner applications in this status have been reviewed." />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredApps.map((app, i) => {
          const appId = app.id || app.applicationId;
          const isExpanded = expandedId === appId;
          const isActing = actionLoading === appId;
          const status = app.status || 'PENDING';

          return (
            <motion.div key={appId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ ...glass({ bg: '#fff' }), borderRadius: T.radius.xl, border: status === 'PENDING' ? '2px solid #FDE68A' : `1px solid ${T.border.light}`, overflow: 'hidden' }}
            >
              <div onClick={() => setExpandedId(isExpanded ? null : appId)}
                style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#047857', border: '1px solid #A7F3D0', flexShrink: 0 }}>
                  {(app.fullName || app.applicantName || 'U')[0].toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text.primary, marginBottom: 4, fontFamily: T.font }}>
                    {app.fullName || app.applicantName || 'Unknown'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    {(app.applicantEmail || app.email) && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.text.muted, background: '#F8FAFC', padding: '3px 10px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        ✉️ {app.applicantEmail || app.email}
                      </span>
                    )}
                    {app.businessSector && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#7C3AED', background: '#F5F3FF', padding: '3px 10px', borderRadius: 8, border: '1px solid #DDD6FE' }}>
                        🏭 {app.businessSector === 'OTHER' ? `OTHER (${app.otherBusinessSector || 'N/A'})` : app.businessSector.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: status === 'PENDING' ? '#FEF3C7' : status === 'APPROVED' ? '#DCFCE7' : '#FEE2E2', color: status === 'PENDING' ? '#92400E' : status === 'APPROVED' ? '#166534' : '#991B1B' }}>
                    {status === 'PENDING' ? '⏳' : status === 'APPROVED' ? '✅' : '❌'} {status}
                  </span>

                  {status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <motion.button onClick={(e) => { e.stopPropagation(); handleAction(appId, 'APPROVE'); }} disabled={isActing} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ padding: '6px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        ✅ Approve
                      </motion.button>
                      <motion.button onClick={(e) => { e.stopPropagation(); if (!reviewNotes[appId]?.trim()) { setExpandedId(appId); setToast({ message: 'Please enter a rejection reason in the notes field.', type: 'error' }); } else { handleAction(appId, 'REJECT'); } }} disabled={isActing} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ padding: '6px 14px', borderRadius: 10, background: '#fff', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        ❌ Reject
                      </motion.button>
                    </div>
                  )}

                  <motion.button onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : appId); }}
                    style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '6px 10px', color: '#047857', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    <span>{isExpanded ? 'Hide' : 'Details'}</span>
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ padding: '0 24px 24px', borderTop: `1px solid ${T.border.light}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, padding: '20px 0' }}>
                        {[
                          { label: 'Application ID', value: `#${app.applicationId || app.id}`, icon: '🆔' },
                          { label: 'Applicant Name', value: app.applicantName || app.fullName, icon: '👤' },
                          { label: 'Applicant Email', value: app.applicantEmail || app.email, icon: '✉️' },
                          { label: 'Business Sector', value: app.businessSector === 'OTHER' ? `OTHER (${app.otherBusinessSector || 'N/A'})` : app.businessSector?.replace(/_/g, ' '), icon: '🏭' },
                          { label: 'Submitted Date', value: (app.submittedAt || app.createdAt) ? new Date(app.submittedAt || app.createdAt).toLocaleString() : '—', icon: '📆' },
                          { label: 'Company', value: app.companyName, icon: '🏢' },
                          { label: 'Phone', value: app.alternatePhoneNumber || app.phone, icon: '📱' },
                          { label: 'Status', value: app.status || 'PENDING', icon: '📋' },
                          { label: 'Reviewed By', value: app.reviewedBy, icon: '🛡️' },
                          { label: 'Reviewed Date', value: app.reviewedAt ? new Date(app.reviewedAt).toLocaleString() : null, icon: '⏰' },
                          { label: 'Review Notes', value: app.reviewNotes, icon: '📝' },
                        ].filter((d) => d.value).map((detail, di) => (
                          <div key={di} style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', marginBottom: 4 }}>{detail.icon} {detail.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text.primary }}>{detail.value}</div>
                          </div>
                        ))}
                      </div>

                      {status === 'PENDING' && (
                        <div style={{ background: '#F8FAFC', borderRadius: 16, padding: '20px', border: '1px solid #E2E8F0', marginTop: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, marginBottom: 12 }}>
                            📝 Review Notes (Optional for Approve, <span style={{ color: '#DC2626' }}>Mandatory for Reject *</span>)
                          </div>
                          <textarea
                            placeholder="Add notes or mandatory rejection reason..."
                            value={reviewNotes[appId] || ''}
                            onChange={(e) => setReviewNotes((prev) => ({ ...prev, [appId]: e.target.value }))}
                            style={{ width: '100%', minHeight: 80, padding: '12px 16px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 500, color: T.text.primary, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            <motion.button onClick={() => handleAction(appId, 'REJECT')} disabled={isActing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                              style={{ flex: 1, padding: '14px', borderRadius: 12, background: '#fff', border: '2px solid #FCA5A5', color: '#DC2626', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                            >
                              ❌ Reject
                            </motion.button>
                            <motion.button onClick={() => handleAction(appId, 'APPROVE')} disabled={isActing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                              style={{ flex: 2, padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#16A34A,#15803D)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                            >
                              ✅ Approve
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

// ══════════════════════════════════════════════════
// ── OPERATOR COMMISSIONS TAB
// ══════════════════════════════════════════════════
function OperatorCommissionsTab() {
  const [commissions, setCommissions]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [statusFilter, setStatusFilter]       = useState('ALL');
  const [page, setPage]                       = useState(0);
  const [totalPages, setTotalPages]           = useState(1);
  const [totalRecords, setTotalRecords]       = useState(0);
  const [totalPending, setTotalPending]       = useState(0);
  const [totalApproved, setTotalApproved]     = useState(0);
  const [totalPaid, setTotalPaid]             = useState(0);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [reviewNotes, setReviewNotes]         = useState('');
  const [selectedNotesId, setSelectedNotesId] = useState(null);
  const [manualEntryId, setManualEntryId]     = useState('');
  const [showManual, setShowManual]           = useState(false);
  const [toast, setToast]                     = useState(null);

  const loadCommissions = useCallback(async (pg = 0, filter = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchFranchiseCommissions({
        page: pg,
        size: 10,
        commissionStatusFilter: filter,
      });

      setCommissions(res?.commissionEntries || res?.entries || res?.content || []);
      setTotalPending(res?.totalPendingAmount || 0);
      setTotalApproved(res?.totalApprovedAmount || 0);
      setTotalPaid(res?.totalPaidAmount || 0);
      setTotalPages(res?.totalPages || 1);
      setTotalRecords(res?.totalRecords || 0);
      setPage(res?.currentPage || 0);
    } catch (err) {
      console.error('Fetch operator commissions error:', err);
      setError(err.message || 'Failed to load commissions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadCommissions(page, statusFilter);
  }, [page, statusFilter, loadCommissions]);

  const handleApprove = async (entryId, notes = '') => {
    setActionLoadingId(entryId);
    try {
      const res = await approveCommissionEntry(entryId, notes);
      setToast({ message: res?.message || `Commission Entry #${entryId} approved (PENDING → APPROVED)!`, type: 'success' });
      setReviewNotes('');
      setSelectedNotesId(null);
      setManualEntryId('');
      loadCommissions(page, statusFilter);
    } catch (err) {
      setToast({ message: err.message || 'Failed to approve commission entry', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkPaid = async (entryId, notes = '') => {
    setActionLoadingId(entryId);
    try {
      const res = await markCommissionEntryPaid(entryId, notes);
      setToast({ message: res?.message || `Commission Entry #${entryId} marked as PAID (APPROVED → PAID)!`, type: 'success' });
      setReviewNotes('');
      setSelectedNotesId(null);
      setManualEntryId('');
      loadCommissions(page, statusFilter);
    } catch (err) {
      setToast({ message: err.message || 'Failed to mark commission entry paid', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const fmtAmt = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amt || 0);
  };

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text.primary, margin: '0 0 4px', fontFamily: T.font }}>
            Franchise Commission Payouts & Approvals
          </h2>
          <p style={{ fontSize: 12, color: T.text.muted, margin: 0, fontFamily: T.font }}>
            Review and manage Business Partner commission ledger entries with 1-click approvals and payout settlements.
          </p>
        </div>
        <button
          onClick={() => loadCommissions(page, statusFilter)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: T.radius.md,
            border: `1px solid ${T.border.light}`, background: '#fff', fontSize: 12, fontWeight: 700,
            color: T.text.primary, cursor: 'pointer', fontFamily: T.font,
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ ...glass({ bg: '#FFFBEB' }), border: '1px solid #FDE68A', padding: 20, borderRadius: T.radius.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>Pending Approvals</span>
            <span style={{ fontSize: 18 }}>🟡</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#92400E' }}>{fmtAmt(totalPending)}</div>
          <div style={{ fontSize: 11, color: '#B45309', marginTop: 4, fontWeight: 600 }}>Auto-generated on deal closure</div>
        </div>

        <div style={{ ...glass({ bg: '#EFF6FF' }), border: '1px solid #BFDBFE', padding: 20, borderRadius: T.radius.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>Approved for Payout</span>
            <span style={{ fontSize: 18 }}>🟢</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1E40AF' }}>{fmtAmt(totalApproved)}</div>
          <div style={{ fontSize: 11, color: '#1D4ED8', marginTop: 4, fontWeight: 600 }}>Ready for payment settlement</div>
        </div>

        <div style={{ ...glass({ bg: '#F0FDF4' }), border: '1px solid #BBF7D0', padding: 20, borderRadius: T.radius.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>Total Paid Out</span>
            <span style={{ fontSize: 18 }}>✅</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#166534' }}>{fmtAmt(totalPaid)}</div>
          <div style={{ fontSize: 11, color: '#15803D', marginTop: 4, fontWeight: 600 }}>Disbursed settlements</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', 'PENDING', 'APPROVED', 'PAID'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(0); }}
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: statusFilter === st ? 'none' : `1px solid ${T.border.light}`,
                background: statusFilter === st ? 'linear-gradient(135deg, #10B981, #059669)' : '#fff',
                color: statusFilter === st ? '#fff' : T.text.secondary,
                fontFamily: T.font,
              }}
            >
              {st === 'ALL' ? 'All Entries' : st}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text.muted }}>
          {totalRecords} Record{totalRecords !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: 12, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: T.text.muted, fontWeight: 600 }}>
          Loading commission entries...
        </div>
      ) : commissions.length === 0 ? (
        <div style={{ ...glass({ bg: '#fff' }), padding: 40, textAlign: 'center', borderRadius: T.radius.xl }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>💰</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text.primary }}>No commission entries found</div>
          <div style={{ fontSize: 12, color: T.text.muted, marginTop: 4 }}>
            {statusFilter === 'ALL'
              ? 'Commission ledger entries will automatically appear here when deals are brokered.'
              : `No ${statusFilter.toLowerCase()} commission entries found.`}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {commissions.map((item) => {
            const entryId = item.commissionLedgerEntryId || item.id;
            const isPending = item.status === 'PENDING';
            const isApproved = item.status === 'APPROVED';
            const isPaid = item.status === 'PAID';
            const isNotesOpen = selectedNotesId === entryId;

            return (
              <div
                key={entryId}
                style={{
                  ...glass({ bg: '#fff' }),
                  padding: 20, borderRadius: T.radius.xl,
                  borderLeft: `4px solid ${isPending ? '#F59E0B' : isApproved ? '#3B82F6' : '#10B981'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: T.text.primary }}>
                        Entry #{entryId}
                      </span>
                      {item.dealId && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.text.muted, background: '#F3F4F6', padding: '2px 8px', borderRadius: 6 }}>
                          Deal #{item.dealId}
                        </span>
                      )}
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12,
                        background: isPending ? '#FEF3C7' : isApproved ? '#DBEAFE' : '#DCFCE7',
                        color: isPending ? '#92400E' : isApproved ? '#1E40AF' : '#166534',
                      }}>
                        {isPending ? '🟡 PENDING' : isApproved ? '🟢 APPROVED' : '✅ PAID'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.text.muted, flexWrap: 'wrap' }}>
                      <span>Side: <strong style={{ color: T.text.primary }}>{item.side || 'BUYER_SIDE'}</strong></span>
                      <span>Level: <strong style={{ color: T.text.primary }}>Level {item.level || 1}</strong></span>
                      <span>Date: <strong style={{ color: T.text.primary }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</strong></span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: T.text.primary }}>
                      {fmtAmt(item.amount)}
                    </div>
                  </div>
                </div>

                {/* Inline Notes Field (if opened) */}
                {isNotesOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border.light}` }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.text.secondary, marginBottom: 4 }}>
                      Review Notes / Audit Ref (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bank Ref #TXN-9981 or Verified against deal records"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        border: `1px solid ${T.border.light}`, fontSize: 12, outline: 'none',
                        marginBottom: 10,
                      }}
                    />
                  </div>
                )}

                {/* Action Buttons (1-Click Approve / Mark Paid) */}
                {(isPending || isApproved) && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border.light}`, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {!isNotesOpen && (
                      <button
                        onClick={() => setSelectedNotesId(entryId)}
                        style={{
                          padding: '6px 12px', borderRadius: 8, border: `1px solid ${T.border.light}`,
                          background: '#F9FAFB', fontSize: 11, fontWeight: 600, color: T.text.secondary, cursor: 'pointer',
                        }}
                      >
                        ✏️ Add Audit Note
                      </button>
                    )}

                    {isPending && (
                      <button
                        disabled={actionLoadingId === entryId}
                        onClick={() => handleApprove(entryId, reviewNotes)}
                        style={{
                          padding: '8px 18px', borderRadius: 10, border: 'none',
                          background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff',
                          fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: T.shadow.button,
                        }}
                      >
                        {actionLoadingId === entryId ? 'Approving...' : '🟢 Approve (PENDING → APPROVED)'}
                      </button>
                    )}

                    {isApproved && (
                      <button
                        disabled={actionLoadingId === entryId}
                        onClick={() => handleMarkPaid(entryId, reviewNotes)}
                        style={{
                          padding: '8px 18px', borderRadius: 10, border: 'none',
                          background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff',
                          fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: T.shadow.button,
                        }}
                      >
                        {actionLoadingId === entryId ? 'Processing...' : '✅ Mark Paid (APPROVED → PAID)'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${T.border.light}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
          >
            Previous
          </button>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text.muted, alignSelf: 'center' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${T.border.light}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
          >
            Next
          </button>
        </div>
      )}

      {/* Collapsible Manual ID Override Section */}
      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => setShowManual(!showManual)}
          style={{ background: 'none', border: 'none', color: T.text.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>{showManual ? '▼' : '▶'}</span>
          <span>Manual Entry ID Override (Advanced)</span>
        </button>

        {showManual && (
          <div style={{ ...glass({ bg: '#fff' }), padding: 20, borderRadius: T.radius.lg, marginTop: 10, maxWidth: 500 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.text.secondary, marginBottom: 4 }}>
                Commission Ledger Entry ID
              </label>
              <input
                type="number"
                min="0"
                onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                placeholder="e.g. 21"
                value={manualEntryId}
                onChange={(e) => setManualEntryId(e.target.value.replace(/-/g, ''))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border.light}`, fontSize: 13, outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={!manualEntryId}
                onClick={() => handleApprove(Number(manualEntryId), reviewNotes)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Approve ID #{manualEntryId || '—'}
              </button>
              <button
                disabled={!manualEntryId}
                onClick={() => handleMarkPaid(Number(manualEntryId), reviewNotes)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#10B981', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Mark Paid ID #{manualEntryId || '—'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ── PLACEHOLDER TABS
// ══════════════════════════════════════════════════
function PlaceholderTab({ name }) {
  return (
    <EmptyState
      icon="🚧"
      title={`${name.charAt(0).toUpperCase() + name.slice(1)} Module`}
      desc="This section is under development and will be available soon."
    />
  );
}

// ══════════════════════════════════════════════════
// ── MAIN CONTENT ROUTER
// ══════════════════════════════════════════════════
export default function FranchiseOperatorContent({ activeNav, onNavigate, franchiseConfig, initialFilter }) {
  const cfg = franchiseConfig;
  return (
    <>
      {activeNav === 'overview' && <OverviewTab onNavigate={onNavigate} cfg={cfg} />}
      {activeNav === 'leaderboard' && <TrustLeaderboardTab userRole={cfg?.isMaster ? 'MASTER_OPERATOR' : 'OPERATOR'} />}
      {activeNav === 'bp_approvals' && <ApplicationsTab initialFilter={initialFilter} key={initialFilter} />}

      {activeNav === 'commissions' && <OperatorCommissionsTab />}
      {activeNav === 'general' && <GeneralFranchiseTab cfg={cfg} />}
      {activeNav === 'sector' && <SectorFranchiseTab cfg={cfg} />}
      {activeNav === 'members' && <DirectoryTab />}
      {activeNav === 'invite' && <InviteTab cfg={cfg} />}
      {activeNav === 'events' && <RoleEventsTab userRole={cfg.isMaster ? 'MASTER_OPERATOR' : 'FRANCHISE_OPERATOR'} />}
      {activeNav === 'marketplace' && <PlaceholderTab name="marketplace" />}
      {activeNav === 'meetings' && <MeetingsTab />}
      {activeNav === 'partnerships' && <PartnershipsTab />}
      {activeNav === 'settings' && <PlaceholderTab name="settings" />}
    </>
  );
}