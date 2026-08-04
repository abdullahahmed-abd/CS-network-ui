// components/franchiseOperator/FranchiseOperatorDashboard.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearTokens, getUserData } from '../../api/auth';
import FranchiseOperatorContent from '../masterOperator/MasterOperatorContent';

// ── Design Tokens ─────────────────────────────────────────────────
const T = {
  font: "'Inter','SF Pro Display',-apple-system,sans-serif",
  blur: { sm: 'blur(8px)', md: 'blur(16px)', lg: 'blur(24px)', xl: 'blur(40px)' },
  shadow: {
    card:   '0 4px 24px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
    button: '0 4px 14px rgba(5,150,105,0.35)',
    xl:     '0 20px 60px rgba(0,0,0,0.12)',
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999 },
  green: {
    50:'#ECFDF5', 100:'#D1FAE5', 200:'#A7F3D0', 300:'#6EE7B7',
    400:'#34D399', 500:'#10B981', 600:'#059669', 700:'#047857',
    800:'#065F46', 900:'#064E3B',
  },
  border: { light: 'rgba(16,185,129,0.12)', medium: 'rgba(16,185,129,0.2)' },
  text: { primary:'#1C1917', secondary:'#57534E', muted:'#78716C', light:'#A8A29E' },
};

export { T };

// ── Franchise-type-aware config ────────────────────────────────────
const getFranchiseConfig = (type) => {
  const t = (type || 'GENERAL').toUpperCase();
  const isMaster = t === 'MASTER';
  const isGeneral = t === 'GENERAL';
  const isSector = t === 'SECTOR' || (!isMaster && !isGeneral);

  return {
    type: t,
    isMaster,
    isGeneral,
    isSector,
    label: isMaster
      ? 'Master Operator'
      : isGeneral
      ? 'General Operator'
      : 'Sector Operator',
    badge: isMaster
      ? 'Master Franchise'
      : isGeneral
      ? 'General Franchise'
      : 'Sector Franchise',
    icon: isMaster ? '👑' : isGeneral ? '🏢' : '🏭',
    sidebar: isMaster
      ? 'linear-gradient(175deg,#0F172A 0%,#1E1B4B 30%,#312E81 60%,#4338CA 100%)'
      : isGeneral
      ? 'linear-gradient(175deg,#1E3A5F 0%,#1E40AF 30%,#2563EB 60%,#3B82F6 100%)'
      : 'linear-gradient(175deg,#064E3B 0%,#065F46 30%,#047857 60%,#059669 100%)',
    accent: isMaster ? '#6366F1' : isGeneral ? '#3B82F6' : '#10B981',
    accentLight: isMaster
      ? 'rgba(99,102,241,0.12)'
      : isGeneral
      ? 'rgba(59,130,246,0.12)'
      : 'rgba(16,185,129,0.12)',
    accentMed: isMaster
      ? 'rgba(99,102,241,0.2)'
      : isGeneral
      ? 'rgba(59,130,246,0.2)'
      : 'rgba(16,185,129,0.2)',
    navItems: isMaster
      ? [
          { id: 'overview',    label: 'Overview',            icon: '📊' },
          { id: 'general',     label: 'General Franchises',  icon: '🏢' },
          { id: 'sector',      label: 'Sector Franchises',   icon: '🏭' },
          { id: 'members',     label: 'Members',             icon: '👥' },
          { id: 'invite',      label: 'Invite Link',         icon: '🔗' },
          { id: 'events',      label: 'Events',              icon: '🎉' },
          { id: 'meetings',    label: 'Meetings',            icon: '📅' },
          { id: 'settings',    label: 'Settings',            icon: '⚙️' },
        ]
      : [
          { id: 'overview',     label: 'Overview',       icon: '📊' },
          { id: 'bp_approvals', label: 'BP Approvals',   icon: '🛡️' },
          { id: 'commissions',  label: 'Commissions',    icon: '💰' },
          { id: 'members',      label: 'Members',        icon: '👥' },
          { id: 'invite',       label: 'Invite Link',    icon: '🔗' },
          { id: 'events',       label: 'Events',         icon: '🎉' },
          { id: 'marketplace',  label: 'Marketplace',    icon: '🛒' },
          { id: 'meetings',     label: 'Meetings',       icon: '📅' },
          { id: 'settings',     label: 'Settings',       icon: '⚙️' },
        ],
  };
};

export default function FranchiseOperatorDashboard({ onLogout }) {
  const user = getUserData() || {};
  const userRoles = user.roles || [];
  const rawType = (
    user.franchiseType ||
    (userRoles.includes('MASTER_OPERATOR') ? 'MASTER' : 'GENERAL')
  ).toUpperCase();
  const cfg = getFranchiseConfig(rawType);

  const [activeNav, setActiveNav] = useState('overview');
  const [appFilter, setAppFilter] = useState('PENDING');
  const [sidebarOpen, setSidebar] = useState(true);

  const handleNavigate = (nav, filter = 'PENDING') => {
    setActiveNav(nav);
    if (filter) setAppFilter(filter);
  };

  const handleLogout = () => { clearTokens(); onLogout?.(); };

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: cfg.isMaster
        ? 'linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 50%,#F5F3FF 100%)'
        : cfg.isGeneral
        ? 'linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 50%,#EFF6FF 100%)'
        : 'linear-gradient(135deg,#F0F7F4 0%,#E8F5EE 50%,#F0F4F0 100%)',
      fontFamily: T.font,
    }}>

      {/* ═══ SIDEBAR ═══ */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 264, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: cfg.sidebar,
              flexShrink: 0, display: 'flex', flexDirection: 'column',
              height: '100vh', overflow: 'hidden', position: 'relative',
              boxShadow: '4px 0 32px rgba(0,0,0,0.18)',
            }}
          >
            {/* Glow */}
            <div style={{
              position:'absolute', top:-60, right:-60,
              width:200, height:200, borderRadius:'50%',
              background: cfg.isGeneral ? 'rgba(59,130,246,0.07)' : 'rgba(52,211,153,0.07)',
              filter:'blur(60px)', pointerEvents:'none',
            }} />
            <div style={{
              position:'absolute', bottom:-40, left:-40,
              width:150, height:150, borderRadius:'50%',
              background: cfg.isGeneral ? 'rgba(99,102,241,0.05)' : 'rgba(6,182,212,0.05)',
              filter:'blur(50px)', pointerEvents:'none',
            }} />

            {/* Logo */}
            <div style={{
              padding:'28px 24px 22px',
              borderBottom:'1px solid rgba(255,255,255,0.07)',
              flexShrink:0, position:'relative', zIndex:1,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <motion.div
                  whileHover={{ rotate:[0,-8,8,0], scale:1.06 }}
                  transition={{ duration:0.5 }}
                  style={{
                    width:44, height:44, borderRadius:14,
                    background: cfg.isGeneral
                      ? 'linear-gradient(135deg,rgba(59,130,246,0.28),rgba(99,102,241,0.18))'
                      : 'linear-gradient(135deg,rgba(52,211,153,0.28),rgba(6,182,212,0.18))',
                    backdropFilter: T.blur.sm,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:22, flexShrink:0,
                    border:'1px solid rgba(255,255,255,0.14)',
                    boxShadow:'0 4px 16px rgba(0,0,0,0.1)',
                  }}
                >{cfg.icon}</motion.div>
                <div>
                  <div style={{
                    color:'#fff', fontWeight:800, fontSize:16,
                    whiteSpace:'nowrap', letterSpacing:'-0.4px', fontFamily:T.font,
                  }}>Connect Souq</div>
                  <div style={{
                    fontSize:9, fontWeight:700,
                    color: cfg.isGeneral ? '#93C5FD' : T.green[300],
                    background:'rgba(255,255,255,0.09)',
                    backdropFilter: T.blur.sm,
                    borderRadius:5, padding:'3px 10px',
                    display:'inline-block', marginTop:4,
                    letterSpacing:'1px', textTransform:'uppercase',
                    border:'1px solid rgba(255,255,255,0.07)',
                  }}>{cfg.badge}</div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav style={{
              flex:1, padding:'20px 14px',
              overflowY:'auto', overflowX:'hidden', minHeight:0,
              position:'relative', zIndex:1,
            }}>
              <div style={{
                fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.28)',
                textTransform:'uppercase', letterSpacing:'1.5px',
                padding:'0 14px 12px', fontFamily:T.font,
              }}>Navigation</div>

              {cfg.navItems.map((item, i) => {
                const isActive = activeNav === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    whileHover={{ x:4 }}
                    whileTap={{ scale:0.97 }}
                    initial={{ opacity:0, x:-16 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay:i*0.05, type:'spring', stiffness:300, damping:25 }}
                    style={{
                      width:'100%', display:'flex', alignItems:'center',
                      gap:12, padding:'12px 16px', borderRadius:T.radius.md,
                      marginBottom:3, border:'none', cursor:'pointer',
                      textAlign:'left', fontSize:13, fontFamily:T.font,
                      fontWeight:isActive?700:600, whiteSpace:'nowrap',
                      background: isActive
                        ? 'linear-gradient(135deg,rgba(255,255,255,0.17),rgba(255,255,255,0.07))'
                        : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.52)',
                      backdropFilter: isActive ? T.blur.sm : 'none',
                      boxShadow: isActive
                        ? 'inset 0 1px 0 rgba(255,255,255,0.1),0 2px 8px rgba(0,0,0,0.07)'
                        : 'none',
                      transition:'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                      position:'relative', overflow:'hidden',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="fo-active"
                        style={{
                          position:'absolute', left:0, top:0, bottom:0,
                          width:3, borderRadius:2,
                          background: cfg.isGeneral ? '#93C5FD' : T.green[300],
                          boxShadow: `0 0 10px ${cfg.isGeneral ? '#93C5FD' : T.green[300]}`,
                        }}
                        transition={{ duration:0.22 }}
                      />
                    )}
                    <span style={{
                      fontSize:18,
                      filter: isActive ? 'none' : 'grayscale(40%) brightness(0.75)',
                      transition:'filter 0.18s',
                    }}>{item.icon}</span>
                    {item.label}
                    {isActive && (
                      <motion.div
                        initial={{ scale:0 }} animate={{ scale:1 }}
                        style={{
                          marginLeft:'auto', width:7, height:7, borderRadius:'50%',
                          background: cfg.isGeneral ? '#93C5FD' : T.green[300],
                          boxShadow: `0 0 10px ${cfg.isGeneral ? '#93C5FD' : T.green[300]}`,
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* User + Logout */}
            <div style={{
              padding:'16px 16px 24px',
              borderTop:'1px solid rgba(255,255,255,0.06)',
              flexShrink:0, position:'relative', zIndex:1,
            }}>
              <div style={{
                display:'flex', alignItems:'center', gap:11,
                marginBottom:13, padding:'12px 14px', borderRadius:T.radius.md,
                background:'rgba(255,255,255,0.06)',
                backdropFilter:T.blur.sm,
                border:'1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  width:38, height:38, borderRadius:12, flexShrink:0,
                  background: cfg.isGeneral
                    ? 'linear-gradient(135deg,#60A5FA,#818CF8)'
                    : 'linear-gradient(135deg,#34D399,#06B6D4)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color: cfg.isGeneral ? '#1E3A8A' : '#064E3B',
                  fontWeight:800, fontSize:15,
                  border:'2px solid rgba(255,255,255,0.18)',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  {(user.fullName || 'O')[0].toUpperCase()}
                </div>
                <div style={{ overflow:'hidden', flex:1 }}>
                  <div style={{
                    color:'#fff', fontWeight:700, fontSize:12,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                    fontFamily:T.font,
                  }}>{user.fullName || 'Franchise Operator'}</div>
                  <div style={{
                    color:'rgba(255,255,255,0.38)', fontSize:10,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                    fontFamily:T.font,
                  }}>{user.email || ''}</div>
                </div>
              </div>

              <motion.button
                onClick={handleLogout}
                whileHover={{ scale:1.02, background:'rgba(239,68,68,0.14)', borderColor:'rgba(239,68,68,0.28)' }}
                whileTap={{ scale:0.97 }}
                style={{
                  width:'100%', padding:'11px 14px', borderRadius:T.radius.md,
                  background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.07)',
                  color:'#FCA5A5', fontSize:12, fontWeight:700,
                  cursor:'pointer', display:'flex', alignItems:'center',
                  gap:8, justifyContent:'center', fontFamily:T.font,
                  backdropFilter:T.blur.sm, transition:'all 0.18s ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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

      {/* ═══ MAIN AREA ═══ */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        height:'100vh', minWidth:0, overflow:'hidden',
      }}>
        {/* Top Bar */}
        <header style={{
          background:'rgba(255,255,255,0.75)',
          backdropFilter:T.blur.lg, WebkitBackdropFilter:T.blur.lg,
          padding:'14px 30px',
          borderBottom:`1px solid ${cfg.accentLight}`,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexShrink:0, zIndex:10,
          boxShadow:'0 1px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:18 }}>
            <motion.button
              onClick={() => setSidebar(v => !v)}
              whileHover={{ scale:1.08, background:cfg.accentLight }}
              whileTap={{ scale:0.92 }}
              style={{
                background: sidebarOpen ? 'transparent' : cfg.accentLight,
                border: sidebarOpen ? 'none' : `1px solid ${cfg.accentMed}`,
                cursor:'pointer', padding:9, borderRadius:T.radius.md,
                color: cfg.accent, display:'flex',
                alignItems:'center', justifyContent:'center',
                transition:'all 0.18s ease',
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6"  x2="21" y2="6" />
                <line x1="3" y1="12" x2="15" y2="12" />
                <line x1="3" y1="18" x2="18" y2="18" />
              </svg>
            </motion.button>
            <div>
              <h1 style={{
                fontSize:20, fontWeight:800, color:T.text.primary,
                margin:0, letterSpacing:'-0.4px', fontFamily:T.font,
                display:'flex', alignItems:'center', gap:8,
              }}>
                <span style={{ fontSize:20 }}>
                  {cfg.navItems.find(n => n.id === activeNav)?.icon}
                </span>
                {cfg.navItems.find(n => n.id === activeNav)?.label}
              </h1>
              <p style={{
                fontSize:11, color:T.text.light, margin:'2px 0 0',
                fontWeight:500, fontFamily:T.font,
              }}>{cfg.label} Panel</p>
            </div>
          </div>

          {/* Live badge */}
          <motion.div
            animate={{
              boxShadow: [
                `0 0 0 0 ${cfg.isGeneral ? 'rgba(59,130,246,0.4)' : 'rgba(16,185,129,0.4)'}`,
                `0 0 0 8px ${cfg.isGeneral ? 'rgba(59,130,246,0)' : 'rgba(16,185,129,0)'}`,
              ],
            }}
            transition={{ repeat:Infinity, duration:2 }}
            style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'8px 18px', borderRadius:T.radius.full,
              background:cfg.accentLight,
              backdropFilter:T.blur.sm,
              border:`1px solid ${cfg.accentMed}`,
            }}
          >
            <div style={{
              width:8, height:8, borderRadius:'50%',
              background:cfg.accent,
              boxShadow:`0 0 8px ${cfg.accent}`,
            }} />
            <span style={{
              fontSize:12, fontWeight:700,
              color: cfg.isGeneral ? '#1D4ED8' : T.green[700],
              fontFamily:T.font,
            }}>{cfg.icon} {cfg.label}</span>
          </motion.div>
        </header>

        {/* Content */}
        <main style={{
          flex:1, overflowY:'auto', overflowX:'hidden',
          padding:'28px 30px',
          background: cfg.isGeneral
            ? 'linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 50%,#EFF6FF 100%)'
            : 'linear-gradient(135deg,#F0F7F4 0%,#E8F5EE 50%,#F0F4F0 100%)',
          minHeight:0, WebkitOverflowScrolling:'touch',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity:0, y:18, scale:0.99 }}
              animate={{ opacity:1, y:0,  scale:1    }}
              exit={{ opacity:0, y:-10, scale:0.99  }}
              transition={{ duration:0.24, ease:[0.4,0,0.2,1] }}
            >
              <FranchiseOperatorContent
                activeNav={activeNav}
                onNavigate={handleNavigate}
                franchiseConfig={cfg}
                initialFilter={appFilter}
              />
            </motion.div>
          </AnimatePresence>
          <div style={{ height:48 }} />
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{scrollbar-width:thin;scrollbar-color:${cfg.accentMed} transparent;}
        *::-webkit-scrollbar{width:6px;}
        *::-webkit-scrollbar-track{background:transparent;}
        *::-webkit-scrollbar-thumb{background:${cfg.accentMed};border-radius:10px;}
        *::-webkit-scrollbar-thumb:hover{background:${cfg.accent}44;}
      `}</style>
    </div>
  );
}