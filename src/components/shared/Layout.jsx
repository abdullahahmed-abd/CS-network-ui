// src/components/shared/Layout.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Dumbbell, CreditCard,
  Receipt, BarChart3, Settings, LogOut, Menu, X,
  ChevronRight, Shield, Handshake, Bell,
  UserCheck, Package, TrendingUp, Crown,
  Zap, FileText, Wallet,
} from 'lucide-react';

import gymLogo from '../../../../src/assets/gym-logo.png';

const GOLD   = '#C5A059';
const GREEN  = '#22C55E';
const PURPLE = '#A855F7';
const CYAN   = '#22D3EE';
const RED    = '#EF4444';

/* ═══════════════════════════════════════════════════════════════ */
/* NAV ITEMS CONFIG                                                */
/* ═══════════════════════════════════════════════════════════════ */
const ADMIN_NAV = [
  {
    group: 'MAIN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',    path: '/dashboard',   color: GOLD   },
      { icon: Users,           label: 'Members',      path: '/members',     color: PURPLE },
      { icon: UserCheck,       label: 'Live Roster',  path: '/live-roster', color: GREEN  },
      { icon: Dumbbell,        label: 'Trainers',     path: '/trainers',    color: CYAN   },
    ],
  },
  {
    group: 'FINANCE',
    items: [
      { icon: CreditCard,  label: 'Plans',    path: '/plans',    color: GOLD   },
      { icon: Receipt,     label: 'Expenses', path: '/expenses', color: RED    },
      { icon: BarChart3,   label: 'Reports',  path: '/reports',  color: PURPLE },
    ],
  },
  {
    group: 'SYSTEM',
    items: [
      { icon: Shield,    label: 'Admins',   path: '/admins',   color: CYAN },
      { icon: Settings,  label: 'Settings', path: '/settings', color: GOLD },
    ],
  },
];

const PARTNER_NAV = [
  {
    group: 'MAIN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',  path: '/partner-dashboard', color: GOLD   },
      { icon: Users,           label: 'Referrals',  path: '/referrals',         color: PURPLE },
      { icon: TrendingUp,      label: 'Analytics',  path: '/analytics',         color: CYAN   },
    ],
  },
  {
    group: 'FINANCE',
    items: [
      { icon: Wallet,    label: 'Payouts',  path: '/payouts',  color: GREEN },
      { icon: FileText,  label: 'Reports',  path: '/reports',  color: GOLD  },
    ],
  },
  {
    group: 'SYSTEM',
    items: [
      { icon: Settings, label: 'Settings', path: '/settings', color: CYAN },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════ */
/* SINGLE NAV ITEM                                                 */
/* ═══════════════════════════════════════════════════════════════ */
const NavItem = ({ icon: Icon, label, path, color, active, collapsed, onClick }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : ''}
    className="group relative flex items-center gap-3 w-full px-3 py-3
               rounded-2xl transition-all duration-300 hover:scale-[1.02]"
    style={{
      background: active
        ? `linear-gradient(135deg, ${color}15, ${color}06)`
        : 'transparent',
      border: active
        ? `1px solid ${color}22`
        : '1px solid transparent',
    }}
  >
    {/* Active left bar */}
    {active && (
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{
          background: `linear-gradient(180deg, ${color}, ${color}40)`,
          boxShadow: `0 0 8px ${color}60`,
        }}
      />
    )}

    {/* Hover glow */}
    {!active && (
      <div
        className="absolute inset-0 rounded-2xl opacity-0
                   group-hover:opacity-100 transition-opacity duration-300
                   pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 50%, ${color}06, transparent 70%)`,
        }}
      />
    )}

    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center
                 flex-shrink-0 transition-all duration-300
                 group-hover:scale-110 group-hover:rotate-6"
      style={{
        background: active ? `${color}18` : `${color}08`,
        border: `1px solid ${active ? `${color}30` : `${color}12`}`,
      }}
    >
      <Icon size={16} style={{ color: active ? color : `${color}80` }} />
    </div>

    {!collapsed && (
      <span
        className="font-rajdhani text-[12px] font-bold
                   tracking-[0.12em] uppercase transition-colors
                   duration-300 truncate"
        style={{ color: active ? 'white' : 'rgba(161,161,170,0.8)' }}
      >
        {label}
      </span>
    )}

    {!collapsed && active && (
      <ChevronRight
        size={14}
        className="ml-auto flex-shrink-0"
        style={{ color: `${color}60` }}
      />
    )}
  </button>
);

/* ═══════════════════════════════════════════════════════════════ */
/* SIDEBAR                                                         */
/* ═══════════════════════════════════════════════════════════════ */
const Sidebar = ({ role = 'admin', onLogout, collapsed, setCollapsed }) => {
  const nav      = useNavigate();
  const location = useLocation();
  const navItems = role === 'admin' ? ADMIN_NAV : PARTNER_NAV;

  const handleNav = (path) => {
    nav(path);
    // Auto-close on mobile
    if (window.innerWidth < 1024) setCollapsed(true);
  };

  return (
    <aside
      className="relative flex flex-col h-full transition-all duration-500 ease-in-out"
      style={{
        width:      collapsed ? '72px' : '240px',
        minWidth:   collapsed ? '72px' : '240px',
        background: '#000000',
        borderRight:'1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(197,160,89,0.4), transparent)',
        }}
      />

      {/* Logo + Collapse toggle */}
      <div
        className="flex items-center gap-3 p-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Logo */}
        <div
          className="w-10 h-10 rounded-xl overflow-hidden flex
                     items-center justify-center p-1.5 flex-shrink-0"
          style={{
            background: '#0A0A0A',
            border:     '1px solid rgba(197,160,89,0.20)',
            boxShadow:  '0 4px 16px rgba(197,160,89,0.08)',
          }}
        >
          <img
            src={gymLogo}
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p
              className="font-orbitron text-white font-bold
                         text-[13px] tracking-[0.15em] leading-none"
            >
              GYM
            </p>
            <p
              className="font-rajdhani text-[10px]
                         tracking-[0.2em] uppercase font-semibold mt-0.5"
              style={{ color: GOLD }}
            >
              {role === 'admin' ? 'ADMIN' : 'PARTNER'}
            </p>
          </div>
        )}

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-8 h-8 rounded-xl flex items-center justify-center
                     flex-shrink-0 transition-all duration-300
                     hover:scale-110 hover:bg-white/[0.06]"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {collapsed
            ? <ChevronRight size={14} className="text-zinc-500" />
            : <X           size={14} className="text-zinc-500" />
          }
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: role === 'admin'
                ? 'rgba(197,160,89,0.08)'
                : 'rgba(168,85,247,0.08)',
              border: role === 'admin'
                ? '1px solid rgba(197,160,89,0.15)'
                : '1px solid rgba(168,85,247,0.15)',
            }}
          >
            {role === 'admin'
              ? <Shield   size={12} style={{ color: GOLD,   flexShrink: 0 }} />
              : <Handshake size={12} style={{ color: PURPLE, flexShrink: 0 }} />
            }
            <span
              className="font-rajdhani text-[10px] font-bold
                         tracking-[0.18em] uppercase"
              style={{ color: role === 'admin' ? GOLD : PURPLE }}
            >
              {role === 'admin' ? 'Super Admin' : 'Business Partner'}
            </span>
          </div>
        </div>
      )}

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1
                      scrollbar-none">
        {navItems.map((group) => (
          <div key={group.group} className="mb-4">
            {/* Group label */}
            {!collapsed && (
              <p
                className="font-rajdhani text-[9px] tracking-[0.25em]
                           uppercase font-bold px-3 py-2"
                style={{ color: 'rgba(113,113,122,0.5)' }}
              >
                {group.group}
              </p>
            )}
            {collapsed && (
              <div
                className="h-[1px] mx-2 my-3 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              />
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  active={location.pathname === item.path ||
                          location.pathname.startsWith(item.path + '/')}
                  collapsed={collapsed}
                  onClick={() => handleNav(item.path)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : ''}
          className="group flex items-center gap-3 w-full px-3 py-3
                     rounded-2xl transition-all duration-300
                     hover:scale-[1.02]"
          style={{
            background: 'rgba(239,68,68,0.05)',
            border:     '1px solid rgba(239,68,68,0.10)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center
                       justify-center flex-shrink-0 transition-all
                       duration-300 group-hover:scale-110
                       group-hover:rotate-6"
            style={{
              background: 'rgba(239,68,68,0.10)',
              border:     '1px solid rgba(239,68,68,0.18)',
            }}
          >
            <LogOut size={16} className="text-red-400" />
          </div>
          {!collapsed && (
            <span
              className="font-rajdhani text-red-400/70 text-[12px]
                         font-bold tracking-[0.12em] uppercase
                         group-hover:text-red-400 transition-colors"
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
/* MOBILE TOP BAR                                                  */
/* ═══════════════════════════════════════════════════════════════ */
const MobileTopBar = ({ title, onMenuOpen }) => (
  <div
    className="lg:hidden flex items-center justify-between
               px-5 py-4 flex-shrink-0"
    style={{
      background:   '#000000',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl overflow-hidden
                   flex items-center justify-center p-1.5"
        style={{
          background: '#0A0A0A',
          border:     '1px solid rgba(197,160,89,0.20)',
        }}
      >
        <img
          src={gymLogo}
          alt="Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <span
        className="font-orbitron text-white font-bold
                   text-[13px] tracking-[0.15em]"
      >
        {title}
      </span>
    </div>

    <button
      onClick={onMenuOpen}
      className="w-10 h-10 rounded-xl flex items-center
                 justify-center transition-all hover:scale-105"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border:     '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Menu size={18} className="text-zinc-400" />
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
/* MOBILE DRAWER                                                   */
/* ═══════════════════════════════════════════════════════════════ */
const MobileDrawer = ({ open, onClose, role, onLogout }) => {
  const nav      = useNavigate();
  const location = useLocation();
  const navItems = role === 'admin' ? ADMIN_NAV : PARTNER_NAV;

  const handleNav = (path) => { nav(path); onClose(); };

  return (
    <>
      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-[9990]
                    transition-opacity duration-300
                    ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-[9995]
                    flex flex-col transition-transform duration-500
                    ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width:      '260px',
          background: '#000000',
          borderRight:'1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl overflow-hidden
                         flex items-center justify-center p-1.5"
              style={{
                background: '#0A0A0A',
                border:     '1px solid rgba(197,160,89,0.20)',
              }}
            >
              <img
                src={gymLogo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p
                className="font-orbitron text-white font-bold
                           text-[13px] tracking-[0.15em]"
              >
                GYM
              </p>
              <p
                className="font-rajdhani text-[10px]
                           tracking-[0.2em] uppercase font-semibold"
                style={{ color: GOLD }}
              >
                {role === 'admin' ? 'ADMIN' : 'PARTNER'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center
                       justify-center hover:bg-white/[0.06]
                       transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X size={15} className="text-zinc-500" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((group) => (
            <div key={group.group} className="mb-4">
              <p
                className="font-rajdhani text-[9px] tracking-[0.25em]
                           uppercase font-bold px-3 py-2"
                style={{ color: 'rgba(113,113,122,0.5)' }}
              >
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem
                    key={item.path}
                    {...item}
                    active={location.pathname === item.path}
                    collapsed={false}
                    onClick={() => handleNav(item.path)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div
          className="p-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <button
            onClick={onLogout}
            className="group flex items-center gap-3 w-full px-3 py-3
                       rounded-2xl transition-all duration-300"
            style={{
              background: 'rgba(239,68,68,0.05)',
              border:     '1px solid rgba(239,68,68,0.10)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center
                         justify-center"
              style={{
                background: 'rgba(239,68,68,0.10)',
                border:     '1px solid rgba(239,68,68,0.18)',
              }}
            >
              <LogOut size={16} className="text-red-400" />
            </div>
            <span
              className="font-rajdhani text-red-400/70 text-[12px]
                         font-bold tracking-[0.12em] uppercase
                         group-hover:text-red-400 transition-colors"
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
/* MAIN LAYOUT                                                     */
/* ═══════════════════════════════════════════════════════════════ */
const Layout = ({
  children,
  title    = 'DASHBOARD',
  onLogout,
  role     = 'admin',   // 'admin' | 'partner'
}) => {
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: '#000000' }}
    >
      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          role={role}
          onLogout={onLogout}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* ── Mobile Drawer ── */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={role}
        onLogout={onLogout}
      />

      {/* ── Main Content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <MobileTopBar
          title={title}
          onMenuOpen={() => setMobileOpen(true)}
        />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;