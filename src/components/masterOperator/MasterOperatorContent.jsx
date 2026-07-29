// components/masterOperator/MasterOperatorContent.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Master & Franchise Operator Content Panel
// Backend API Integration: POST /cs-network/master-operator (FETCH_DASHBOARD)
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchMasterDashboard,
  fetchFranchiseDashboard,
  refreshMemberInvite,
  createGeneralFranchise,
  createSectorFranchise,
  inviteGeneralOperator,
  inviteSectorOperator,
} from '../../api/adminApi';
import { T } from '../masterOperator/MasterOperatorDashboard';
import MeetingsTab from '../meetings/MeetingsTab';
import DirectoryTab from '../directory/DirectoryTab';

// ══════════════════════════════════════════════════
// ── DESIGN HELPERS
// ══════════════════════════════════════════════════
const glass = (opts = {}) => ({
  background:           opts.bg     || 'rgba(255,255,255,0.72)',
  backdropFilter:       opts.blur   || T.blur.md,
  WebkitBackdropFilter: opts.blur   || T.blur.md,
  border:               `1px solid ${opts.border || T.border.light}`,
  borderRadius:         opts.radius || T.radius.xl,
  boxShadow:            opts.shadow || T.shadow.card,
});

// ══════════════════════════════════════════════════
// ── TOAST
// ══════════════════════════════════════════════════
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4200); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success: { gradient:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(52,211,153,0.07))', border:'rgba(16,185,129,0.25)', color:'#065F46', accent:'#10B981', icon:'✅' },
    error:   { gradient:'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(248,113,113,0.07))', border:'rgba(239,68,68,0.25)', color:'#991B1B', accent:'#EF4444', icon:'❌' },
    info:    { gradient:'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(96,165,250,0.07))', border:'rgba(59,130,246,0.25)', color:'#1E3A8A', accent:'#3B82F6', icon:'ℹ️' },
  }[type] || {};
  return (
    <motion.div
      initial={{ opacity:0, y:-28, x:'-50%', scale:0.9 }}
      animate={{ opacity:1, y:0,   x:'-50%', scale:1   }}
      exit={{   opacity:0, y:-18,  x:'-50%', scale:0.95 }}
      transition={{ type:'spring', stiffness:320, damping:26 }}
      style={{
        position:'fixed', top:24, left:'50%',
        background:cfg.gradient, backdropFilter:T.blur.lg, WebkitBackdropFilter:T.blur.lg,
        border:`1px solid ${cfg.border}`, borderRadius:T.radius.lg, padding:'15px 24px',
        boxShadow:T.shadow.xl, zIndex:9999,
        display:'flex', alignItems:'center', gap:12,
        maxWidth:460, minWidth:320,
      }}
    >
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, borderRadius:'12px 0 0 12px', background:cfg.accent }} />
      <span style={{ fontSize:20 }}>{cfg.icon}</span>
      <span style={{ fontSize:13, fontWeight:600, color:cfg.color, flex:1, fontFamily:T.font, lineHeight:1.4 }}>{message}</span>
      <motion.button onClick={onClose} whileHover={{ scale:1.15, rotate:90 }} whileTap={{ scale:0.85 }}
        style={{ background:'rgba(0,0,0,0.05)', border:'none', cursor:'pointer', color:cfg.color, fontSize:14, width:28, height:28, borderRadius:T.radius.sm, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}
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

// ══════════════════════════════════════════════════
// ── BUTTON
// ══════════════════════════════════════════════════
function Btn({ onClick, loading, children, fullWidth, variant = 'primary', size = 'md', accent }) {
  const ac = accent || T.green[500];
  const variants = {
    primary:   { background:`linear-gradient(135deg,${ac},${ac}dd)`, color:'#fff', border:'none', boxShadow:T.shadow.button },
    secondary: { background:'rgba(255,255,255,0.75)', backdropFilter:T.blur.sm, color:ac, border:`1.5px solid ${ac}44`, boxShadow:T.shadow.card },
    danger:    { background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff', border:'none', boxShadow:'0 4px 14px rgba(239,68,68,0.35)' },
  };
  const sizes = { sm:'8px 16px', md:'12px 24px', lg:'14px 32px' };
  const s = variants[variant] || variants.primary;

  return (
    <motion.button onClick={onClick} disabled={loading}
      whileHover={{ scale:loading?1:1.025 }} whileTap={{ scale:loading?1:0.97 }}
      transition={{ type:'spring', stiffness:300, damping:25 }}
      style={{
        ...s, padding:sizes[size]||sizes.md, borderRadius:T.radius.md,
        fontSize:size==='sm'?12:14, fontWeight:700,
        cursor:loading?'not-allowed':'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        width:fullWidth?'100%':'auto', opacity:loading?0.7:1,
        fontFamily:T.font, letterSpacing:'-0.1px',
        position:'relative', overflow:'hidden', transition:'all 0.18s ease',
      }}
    >
      {loading && (
        <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.8, ease:'linear' }}
          style={{ width:16, height:16, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', flexShrink:0 }}
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
      initial={{ opacity:0, y:14, scale:0.96 }}
      animate={{ opacity:1, y:0,  scale:1    }}
      transition={{ delay, type:'spring', stiffness:280, damping:24 }}
      whileHover={{ y:-4, boxShadow:'0 12px 40px rgba(0,0,0,0.08)' }}
      style={{
        ...glass({ bg:'rgba(255,255,255,0.75)' }),
        padding:'20px 22px', display:'flex', alignItems:'center', gap:16,
        position:'relative', overflow:'hidden',
      }}
    >
      <div style={{ position:'absolute', top:-18, right:-18, width:70, height:70, borderRadius:'50%', background:gradient, opacity:0.08, filter:'blur(16px)' }} />
      <div style={{
        width:50, height:50, borderRadius:T.radius.lg,
        background:gradient, display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:22, flexShrink:0, boxShadow:'0 4px 14px rgba(0,0,0,0.09)',
      }}>{icon}</div>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ fontSize:26, fontWeight:800, color:T.text.primary, fontFamily:T.font, letterSpacing:'-0.5px', lineHeight:1 }}>{value ?? 0}</div>
        <div style={{ fontSize:11, color:T.text.muted, fontWeight:600, marginTop:4, fontFamily:T.font }}>{label}</div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// ── INFO TABLE
// ══════════════════════════════════════════════════
function InfoTable({ title, icon, items }) {
  return (
    <div style={{ ...glass({ bg:'rgba(255,255,255,0.72)' }), padding:'22px 24px' }}>
      <div style={{ fontSize:14, fontWeight:800, color:T.text.primary, marginBottom:16, fontFamily:T.font, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:18 }}>{icon}</span>{title}
      </div>
      {items.map((item, i) => (
        <div key={item.label} style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'9px 0',
          borderBottom:i<items.length-1?`1px solid ${T.border.light}`:'none',
          fontSize:13, color:T.text.muted, fontWeight:500, fontFamily:T.font,
        }}>
          <span>{item.label}</span>
          <span style={{ fontWeight:800, color:T.text.primary, fontSize:14 }}>{item.value ?? 0}</span>
        </div>
      ))}
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
        initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
        transition={{ delay:depth*0.05, type:'spring', stiffness:280, damping:24 }}
        whileHover={{ scale:1.01, x:2 }}
        onClick={() => hasChildren && setCollapsed(c => !c)}
        style={{
          ...glass({ bg:'rgba(255,255,255,0.6)', blur:T.blur.sm, border:bdr, radius:T.radius.md }),
          padding:'13px 18px', marginBottom:8,
          display:'flex', alignItems:'center', gap:12, flexWrap:'wrap',
          cursor:hasChildren?'pointer':'default',
        }}
      >
        {hasChildren ? (
          <motion.div animate={{ rotate:collapsed?0:90 }} transition={{ duration:0.2 }}
            style={{ width:24, height:24, borderRadius:6, background:grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}
          >▶</motion.div>
        ) : <div style={{ width:24 }} />}
        <span style={{ padding:'3px 10px', borderRadius:6, fontSize:9, fontWeight:800, background:grad, color:'#fff', letterSpacing:'0.8px', whiteSpace:'nowrap', flexShrink:0 }}>
          {node.franchiseType} #{node.franchiseId}
        </span>
        <div style={{ flex:1, minWidth:100 }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.text.primary, fontFamily:T.font }}>{node.franchiseName}</div>
          <div style={{ fontSize:10, color:T.text.muted, marginTop:2, fontFamily:T.font }}>👤 Operator: {node.operatorName || 'Unassigned'}</div>
        </div>
        <span style={{ padding:'4px 10px', borderRadius:8, fontSize:10, fontWeight:700, background:'rgba(16,185,129,0.1)', color:T.green[700], fontFamily:T.font }}>
          👥 {node.totalMemberCount} Members
        </span>
      </motion.div>
      <AnimatePresence>
        {hasChildren && !collapsed && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }}
            transition={{ duration:0.28, ease:[0.4,0,0.2,1] }}
            style={{ overflow:'hidden', borderLeft:`2px dashed ${bdr}`, marginLeft:12, paddingLeft:10, marginBottom:4 }}
          >
            {node.children.map(child => <HierarchyNode key={child.franchiseId} node={child} depth={depth+1} accent={accent} />)}
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
    <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
      style={{ ...glass({ bg:'rgba(255,255,255,0.72)' }), padding:'72px 40px', textAlign:'center' }}
    >
      <motion.div animate={{ y:[0,-8,0] }} transition={{ repeat:Infinity, duration:3, ease:'easeInOut' }}
        style={{
          width:88, height:88, borderRadius:T.radius.xxl,
          background:'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(59,130,246,0.07))',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:40, margin:'0 auto 24px', border:`1px solid ${T.border.light}`,
        }}>{icon}</motion.div>
      <h3 style={{ fontSize:20, fontWeight:800, color:T.text.primary, marginBottom:8, fontFamily:T.font }}>{title}</h3>
      <p style={{ color:T.text.muted, fontSize:14, fontFamily:T.font, lineHeight:1.5, marginBottom: action ? 20 : 0 }}>{desc}</p>
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
            fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: T.text.primary,
          }}
        />
        <Btn onClick={() => onCopy(inviteLink)} accent={accent}>📋 Copy</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: T.radius.md, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{usesCount}</div>
          <div style={{ fontSize: 10, color: T.text.muted }}>Uses</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: T.radius.md, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{maxUses}</div>
          <div style={{ fontSize: 10, color: T.text.muted }}>Max Uses</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: T.radius.md, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{usesRemaining}</div>
          <div style={{ fontSize: 10, color: T.text.muted }}>Remaining</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: T.radius.md, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{daysRemaining}</div>
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
  const [dashData, setDashData]       = useState(null);
  const [inviteData, setInviteData]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [toast, setToast]             = useState(null);
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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'100px 20px', gap:18 }}>
      <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1.2, ease:'linear' }}
        style={{ width:46, height:46, border:`3px solid ${T.border.light}`, borderTopColor:accent, borderRadius:'50%' }} />
      <p style={{ fontSize:14, color:T.text.muted, fontWeight:600, fontFamily:T.font }}>Loading dashboard...</p>
    </div>
  );

  /* Error */
  if (error) return (
    <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
      style={{ ...glass({ bg:'rgba(239,68,68,0.06)', border:'rgba(239,68,68,0.15)' }), padding:'40px', textAlign:'center' }}>
      <div style={{ fontSize:36, marginBottom:14 }}>⚠️</div>
      <div style={{ fontSize:16, fontWeight:700, color:'#991B1B', marginBottom:8, fontFamily:T.font }}>Failed to load dashboard</div>
      <div style={{ fontSize:13, color:'#DC2626', fontFamily:T.font }}>{error}</div>
    </motion.div>
  );

  const { overview, marketplace, meetings, businessPartners, userGrowth, franchiseGrowth, hierarchy } = dashData || {};

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
        style={{
          background: cfg.isMaster
            ? 'linear-gradient(135deg,#1E1B4B 0%,#312E81 55%,#4F46E5 100%)'
            : (cfg.isGeneral
                ? 'linear-gradient(135deg,#1E3A5F 0%,#2563EB 55%,#60A5FA 100%)'
                : 'linear-gradient(135deg,#064E3B 0%,#059669 55%,#34D399 100%)'),
          borderRadius:T.radius.xxl, padding:'32px 36px',
          marginBottom:28, color:'#fff',
          position:'relative', overflow:'hidden',
        }}
      >
        <div style={{ position:'absolute', top:-50, right:-30, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', bottom:-30, left:'35%', width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <motion.div animate={{ y:[0,-6,0] }} transition={{ repeat:Infinity, duration:4, ease:'easeInOut' }}
          style={{ position:'absolute', top:20, right:44, fontSize:52, opacity:0.12 }}
        >{cfg.icon}</motion.div>

        <h2 style={{ fontSize:26, fontWeight:800, margin:'0 0 8px', position:'relative', zIndex:1, fontFamily:T.font, letterSpacing:'-0.5px' }}>
          Welcome, {cfg.label} 👋
        </h2>
        <p style={{ fontSize:14, margin:0, opacity:0.85, fontWeight:500, position:'relative', zIndex:1, fontFamily:T.font, lineHeight:1.5 }}>
          {overview
            ? `Managing ${overview.totalMembers} members across ${overview.totalActiveFranchises} active franchises`
            : `Manage your ${cfg.label} from here.`}
        </p>
      </motion.div>

      {/* ── Invite Link Card ── */}
      {inviteData && (
        <>
          <div style={{ fontSize:12, fontWeight:800, color:cfg.isMaster?'#4338CA':(cfg.isGeneral?'#1D4ED8':T.green[700]), margin:'0 0 14px', fontFamily:T.font, display:'flex', alignItems:'center', gap:8 }}>
            🔗 Member Invite Link
          </div>
          <div style={{ marginBottom:28 }}>
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
          <div style={{ fontSize:12, fontWeight:800, color:cfg.isMaster?'#4338CA':(cfg.isGeneral?'#1D4ED8':T.green[700]), margin:'0 0 14px', fontFamily:T.font, display:'flex', alignItems:'center', gap:8 }}>
            📊 Overview Stats
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:28 }}>
            <StatCard label="Total Users"        value={overview.totalUsers}             icon="👥" gradient={cfg.isMaster?'linear-gradient(135deg,#4F46E5,#6366F1)':(cfg.isGeneral?'linear-gradient(135deg,#3B82F6,#60A5FA)':'linear-gradient(135deg,#10B981,#34D399)')} delay={0.00} />
            <StatCard label="Members"            value={overview.totalMembers}           icon="🙋" gradient="linear-gradient(135deg,#8B5CF6,#A78BFA)" delay={0.05} />
            <StatCard label="Operators"          value={overview.totalOperators}         icon="🧑‍💼" gradient="linear-gradient(135deg,#F59E0B,#FBBF24)" delay={0.10} />
            <StatCard label="Active Franchises"  value={overview.totalActiveFranchises}  icon="🏢" gradient="linear-gradient(135deg,#EC4899,#F472B6)" delay={0.15} />
            {cfg.isMaster && (
              <>
                <StatCard label="General Franchises" value={overview.totalGeneralFranchises} icon="🏢" gradient="linear-gradient(135deg,#3B82F6,#60A5FA)" delay={0.20} />
                <StatCard label="Sector Franchises"  value={overview.totalSectorFranchises}  icon="🏭" gradient="linear-gradient(135deg,#10B981,#34D399)" delay={0.25} />
              </>
            )}
          </div>
        </>
      )}

      {/* ── Growth ── */}
      {(userGrowth || franchiseGrowth) && (
        <>
          <div style={{ fontSize:12, fontWeight:800, color:cfg.isMaster?'#4338CA':(cfg.isGeneral?'#1D4ED8':T.green[700]), margin:'0 0 14px', fontFamily:T.font, display:'flex', alignItems:'center', gap:8 }}>
            📈 Growth & Analytics
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
            {userGrowth && (
              <InfoTable title="User Growth" icon="👥" items={[
                { label:'New Today',     value:userGrowth.newUsersToday },
                { label:'This Week',     value:userGrowth.newUsersThisWeek },
                { label:'This Month',    value:userGrowth.newUsersThisMonth },
                { label:'New Members',   value:userGrowth.newMembers },
                { label:'New Operators', value:userGrowth.newOperators },
              ]} />
            )}
            {franchiseGrowth && (
              <InfoTable title="Franchise Growth" icon="🏢" items={[
                { label:'New General',   value:franchiseGrowth.newGeneralFranchises },
                { label:'New Sector',    value:franchiseGrowth.newSectorFranchises },
                { label:'New Today',     value:franchiseGrowth.newFranchisesToday },
                { label:'This Week',     value:franchiseGrowth.newFranchisesThisWeek },
                { label:'This Month',    value:franchiseGrowth.newFranchisesThisMonth },
              ]} />
            )}
            {businessPartners && !franchiseGrowth && (
              <InfoTable title="Business Partners" icon="🤝" items={[
                { label:'Pending',    value:businessPartners.pendingApplications },
                { label:'Approved',   value:businessPartners.approvedApplications },
                { label:'Rejected',   value:businessPartners.rejectedApplications },
                { label:'Today',      value:businessPartners.applicationsToday },
              ]} />
            )}
          </div>
        </>
      )}

      {/* ── Activity ── */}
      {(marketplace || meetings) && (
        <>
          <div style={{ fontSize:12, fontWeight:800, color:cfg.isMaster?'#4338CA':(cfg.isGeneral?'#1D4ED8':T.green[700]), margin:'0 0 14px', fontFamily:T.font, display:'flex', items:'center', gap:8 }}>
            🛒 Activity
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
            {marketplace && <InfoTable title="Marketplace" icon="🛒" items={[
              { label:'Active Intents',  value:marketplace.activeTradeIntents },
              { label:'Deals Today',     value:marketplace.dealsToday },
              { label:'Deals This Week', value:marketplace.dealsThisWeek },
              { label:'Completed Deals', value:marketplace.completedDeals },
              { label:'Pending Deals',   value:marketplace.pendingDeals },
            ]} />}
            {meetings && <InfoTable title="Meetings" icon="📅" items={[
              { label:'Today',     value:meetings.meetingsToday },
              { label:'Upcoming',  value:meetings.upcomingMeetings },
              { label:'Completed', value:meetings.completedMeetings },
              { label:'Cancelled', value:meetings.cancelledMeetings },
            ]} />}
          </div>
        </>
      )}

      {/* ── Hierarchy ── */}
      {hierarchy?.roots?.length > 0 && (
        <>
          <div style={{ fontSize:12, fontWeight:800, color:cfg.isMaster?'#4338CA':(cfg.isGeneral?'#1D4ED8':T.green[700]), margin:'0 0 14px', fontFamily:T.font, display:'flex', alignItems:'center', gap:8 }}>
            🌐 Franchise Network Hierarchy
          </div>
          <div style={{ ...glass({ bg:'rgba(255,255,255,0.55)' }), padding:'22px 24px', marginBottom:28 }}>
            {hierarchy.roots.map(root => (
              <HierarchyNode key={root.franchiseId} node={root} depth={0} accent={accentHue} />
            ))}
          </div>
        </>
      )}

      {/* ── Quick Actions ── */}
      <div style={{ fontSize:12, fontWeight:800, color:cfg.isMaster?'#4338CA':(cfg.isGeneral?'#1D4ED8':T.green[700]), margin:'0 0 14px', fontFamily:T.font, display:'flex', alignItems:'center', gap:8 }}>
        ⚡ Quick Actions
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:16 }}>
        {(cfg.isMaster ? [
          { label:'General Franchises', icon:'🏢', desc:'Create & invite general operators', nav:'general', gradient:'linear-gradient(135deg,#3B82F6,#60A5FA)' },
          { label:'Sector Franchises',  icon:'🏭', desc:'Create & invite sector operators',  nav:'sector',  gradient:'linear-gradient(135deg,#10B981,#34D399)' },
          { label:'Members',            icon:'👥', desc:'View network members',               nav:'members', gradient:'linear-gradient(135deg,#8B5CF6,#A78BFA)' },
          { label:'Meetings',           icon:'📅', desc:'Schedule role-based meetings',       nav:'meetings',gradient:'linear-gradient(135deg,#EC4899,#F472B6)' },
        ] : [
          { label:'Members',     icon:'👥', desc:'View and manage members',     nav:'members',     gradient: cfg.isGeneral ? 'linear-gradient(135deg,#3B82F6,#60A5FA)' : 'linear-gradient(135deg,#10B981,#34D399)' },
          { label:'Invite Link', icon:'🔗', desc:'Share member invite link',    nav:'invite',      gradient:'linear-gradient(135deg,#8B5CF6,#A78BFA)' },
          { label:'Marketplace', icon:'🛒', desc:'View marketplace activity',   nav:'marketplace', gradient:'linear-gradient(135deg,#F59E0B,#FBBF24)' },
          { label:'Meetings',    icon:'📅', desc:'Manage scheduled meetings',   nav:'meetings',    gradient:'linear-gradient(135deg,#EC4899,#F472B6)' },
        ]).map((a, i) => (
          <motion.button key={i}
            initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.08, type:'spring', stiffness:280, damping:24 }}
            whileHover={{ y:-6, boxShadow:'0 12px 36px rgba(0,0,0,0.08)' }}
            whileTap={{ scale:0.97 }}
            onClick={() => onNavigate(a.nav)}
            style={{ ...glass({ bg:'rgba(255,255,255,0.72)' }), padding:'24px', cursor:'pointer', textAlign:'left', position:'relative', overflow:'hidden' }}
          >
            <div style={{ position:'absolute', top:-18, right:-18, width:80, height:80, borderRadius:'50%', background:a.gradient, opacity:0.07, filter:'blur(14px)' }} />
            <div style={{ width:50, height:50, borderRadius:T.radius.lg, background:a.gradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:16, boxShadow:'0 4px 14px rgba(0,0,0,0.1)' }}>{a.icon}</div>
            <div style={{ fontSize:15, fontWeight:700, color:T.text.primary, marginBottom:5, fontFamily:T.font }}>{a.label}</div>
            <div style={{ fontSize:12, color:T.text.muted, fontWeight:500, fontFamily:T.font, lineHeight:1.4 }}>{a.desc}</div>
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
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName]       = useState('');
  const [state, setState]     = useState('');
  const [city, setCity]       = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

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
      setToast({ message: res.message || 'General Franchise created successfully!', type: 'success' });
      setName(''); setState(''); setCity('');
      setShowCreate(false);
    } catch (err) {
      setToast({ message: err.message || 'Failed to create General Franchise', type: 'error' });
    } finally { setLoading(false); }
  };

  const handleInvite = async () => {
    if (!inviteId) { setToast({ message: 'Enter Franchise ID', type: 'error' }); return; }
    setInviteLoading(true); setInviteResult(null);
    try {
      const res = await inviteGeneralOperator(Number(inviteId));
      setInviteResult(res);
      setToast({ message: res.message || 'Invite link generated!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to generate invite link', type: 'error' });
    } finally { setInviteLoading(false); }
  };

  const copyLink = (text) => {
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
          <Btn variant="secondary" onClick={() => { setShowInvite(true); setInviteResult(null); }} accent="#3B82F6">
            📨 Invite Operator
          </Btn>
          <Btn onClick={() => setShowCreate(true)} accent="#3B82F6">➕ Create General Franchise</Btn>
        </div>
      </div>

      <div style={{ ...glass({ bg:'rgba(255,255,255,0.72)' }), padding:'36px', textAlign:'center', borderRadius: T.radius.xxl }}>
        <div style={{ fontSize: 42, marginBottom: 16 }}>🏢</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary, fontFamily: T.font, margin: '0 0 8px' }}>
          General Franchises Management
        </h3>
        <p style={{ fontSize: 13, color: T.text.muted, fontFamily: T.font, maxWidth: 460, margin: '0 auto 24px' }}>
          Create General Franchises for states and cities, or generate invite links for General Franchise Operators.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Btn onClick={() => setShowCreate(true)} accent="#3B82F6">➕ Create General Franchise</Btn>
          <Btn variant="secondary" onClick={() => setShowInvite(true)} accent="#3B82F6">🔗 Invite General Operator</Btn>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <Modal title="Create General Franchise" onClose={() => setShowCreate(false)}>
            <InputField label="Franchise Name" value={name} onChange={setName} placeholder="e.g. Bhopal General Franchise" />
            <InputField label="State" value={state} onChange={setState} placeholder="e.g. Madhya Pradesh" />
            <InputField label="City" value={city} onChange={setCity} placeholder="e.g. Bhopal" />
            <div style={{ marginTop: 12 }}>
              <Btn fullWidth onClick={handleCreate} loading={loading} accent="#3B82F6">
                {loading ? 'Creating...' : '🏢 Create General Franchise'}
              </Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <Modal title="Invite General Operator" onClose={() => setShowInvite(false)}>
            <InputField label="Target Franchise ID" value={inviteId} onChange={setInviteId} placeholder="e.g. 6" type="number" />
            {!inviteResult && (
              <Btn fullWidth onClick={handleInvite} loading={inviteLoading} accent="#3B82F6">
                {inviteLoading ? 'Generating...' : '🔗 Generate Operator Invite Link'}
              </Btn>
            )}
            {inviteResult && (
              <div style={{ marginTop: 16, background: '#F0FDF4', padding: 16, borderRadius: 12, border: '1px solid #BBF7D0' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#166534', margin: '0 0 8px' }}>Invite Link Generated!</p>
                <div style={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', background: '#fff', padding: 10, borderRadius: 8, border: '1px solid #E5E7EB', marginBottom: 12 }}>
                  {inviteResult.inviteLink || inviteResult.token || JSON.stringify(inviteResult)}
                </div>
                <Btn fullWidth onClick={() => copyLink(inviteResult.inviteLink || inviteResult.token)} accent="#10B981">
                  📋 Copy Invite Link
                </Btn>
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
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName]         = useState('');
  const [sector, setSector]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const handleCreate = async () => {
    if (!name.trim() || !sector.trim()) {
      setToast({ message: 'All fields required', type: 'error' }); return;
    }
    setLoading(true);
    try {
      const res = await createSectorFranchise(name.trim(), sector.trim());
      setToast({ message: res.message || 'Sector Franchise created successfully!', type: 'success' });
      setName(''); setSector('');
      setShowCreate(false);
    } catch (err) {
      setToast({ message: err.message || 'Failed to create Sector Franchise', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text.primary, margin: 0, fontFamily: T.font }}>Sector Franchises</h2>
          <p style={{ fontSize: 12, color: T.text.muted, margin: '4px 0 0', fontFamily: T.font }}>Create and manage industry sector franchises</p>
        </div>
        <Btn onClick={() => setShowCreate(true)} accent="#10B981">➕ Create Sector Franchise</Btn>
      </div>

      <div style={{ ...glass({ bg:'rgba(255,255,255,0.72)' }), padding:'36px', textAlign:'center', borderRadius: T.radius.xxl }}>
        <div style={{ fontSize: 42, marginBottom: 16 }}>🏭</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary, fontFamily: T.font, margin: '0 0 8px' }}>
          Sector Franchises Management
        </h3>
        <p style={{ fontSize: 13, color: T.text.muted, fontFamily: T.font, maxWidth: 460, margin: '0 auto 24px' }}>
          Create industry-specific Sector Franchises (e.g. Textile, IT, Agriculture) under your Master network.
        </p>
        <Btn onClick={() => setShowCreate(true)} accent="#10B981">➕ Create Sector Franchise</Btn>
      </div>

      <AnimatePresence>
        {showCreate && (
          <Modal title="Create Sector Franchise" onClose={() => setShowCreate(false)}>
            <InputField label="Franchise Name" value={name} onChange={setName} placeholder="e.g. Textile Sector Franchise" />
            <InputField label="Sector Name" value={sector} onChange={setSector} placeholder="e.g. Textile" />
            <div style={{ marginTop: 12 }}>
              <Btn fullWidth onClick={handleCreate} loading={loading} accent="#10B981">
                {loading ? 'Creating...' : '🏭 Create Sector Franchise'}
              </Btn>
            </div>
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
  const [inviteData, setInviteData]         = useState(null);
  const [loading, setLoading]               = useState(true);
  const [toast, setToast]                   = useState(null);
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = cfg.isMaster ? await fetchMasterDashboard() : await fetchFranchiseDashboard();
        const data = res?.masterDashboardResponse || res?.dashboardResponse || res;
        setInviteData(res?.memberInviteLink || res?.inviteLink || data?.memberInviteLink);
      } catch (err) { setToast({ message: err.message, type:'error' }); }
      finally { setLoading(false); }
    })();
  }, [cfg.isMaster]);

  const handleRefresh = async () => {
    setRefreshLoading(true);
    try {
      const res = await refreshMemberInvite();
      setInviteData(res.memberInviteLink);
      setToast({ message: res.message || 'Invite link refreshed!', type:'success' });
    } catch (err) { setToast({ message: err.message, type:'error' }); }
    finally { setRefreshLoading(false); }
  };

  const copyLink = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message:'Link copied!', type:'success' });
  };

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', gap:18 }}>
      <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1.2, ease:'linear' }}
        style={{ width:46, height:46, border:`3px solid ${T.border.light}`, borderTopColor:cfg.accent, borderRadius:'50%' }} />
      <p style={{ fontSize:14, color:T.text.muted, fontWeight:600, fontFamily:T.font }}>Loading invite link...</p>
    </div>
  );

  return (
    <div>
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <h2 style={{ fontSize:22, fontWeight:800, color:T.text.primary, margin:'0 0 6px', fontFamily:T.font }}>
        Member Invite Link
      </h2>
      <p style={{ fontSize:11, color:T.text.muted, margin:'0 0 28px', fontWeight:500, fontFamily:T.font }}>
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
export default function FranchiseOperatorContent({ activeNav, onNavigate, franchiseConfig }) {
  const cfg = franchiseConfig;
  return (
    <>
      {activeNav === 'overview'    && <OverviewTab onNavigate={onNavigate} cfg={cfg} />}
      {activeNav === 'general'     && <GeneralFranchiseTab cfg={cfg} />}
      {activeNav === 'sector'      && <SectorFranchiseTab cfg={cfg} />}
      {activeNav === 'members'     && <DirectoryTab />}
      {activeNav === 'invite'      && <InviteTab cfg={cfg} />}
      {activeNav === 'marketplace' && <PlaceholderTab name="marketplace" />}
      {activeNav === 'meetings'    && <MeetingsTab />}
      {activeNav === 'settings'    && <PlaceholderTab name="settings" />}
    </>
  );
}