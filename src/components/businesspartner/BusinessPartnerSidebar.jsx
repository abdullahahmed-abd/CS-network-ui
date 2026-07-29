import React from 'react';
import {
  List, LogOut, Star, ShieldCheck,
  Sprout, PhoneCall, BadgeCheck,
  UserPlus, Scale, Trophy, XCircle,
} from 'lucide-react';

import { THEME, PIPELINE_STAGES } from '../constants/BpConstants';

/* ── Attach Lucide icons to each stage ── */
const STAGE_ICON_MAP = {
  NEW_LEAD:    Sprout,
  CONTACTED:   PhoneCall,
  QUALIFIED:   BadgeCheck,
  INTRODUCED:  UserPlus,
  NEGOTIATION: Scale,
  CLOSED_WON:  Trophy,
  CLOSED_LOST: XCircle,
};

const STAGES_WITH_ICONS = PIPELINE_STAGES.map(s => ({
  ...s,
  IconComp: STAGE_ICON_MAP[s.id],
}));

const getInitials = (name) => {
  if (!name) return 'BP';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

export default function BusinessPartnerSidebar({
  navItems,
  activeNav,
  setActiveNav,
  activeStage,
  setActiveStage,
  stageCounts,
  getTotalLeads,
  userData,
  onLogout,
}) {
  return (
    <aside className="sidebar">

      {/* ── Brand ── */}
      <div className="brand">
        <div className="brand-diamond" />
        <div>
          <div className="brand-text">CONNECT SOUQ</div>
          <div className="brand-sub">Business Partner</div>
        </div>
      </div>

      {/* ── Main Navigation ── */}
      <nav className="nav">
        <div className="nav-label">Main Menu</div>
        {navItems.map((item) => {
          const NavIcon = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <NavIcon size={16} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* ── Pipeline Stages (only when pipeline tab is active) ── */}
      {activeNav === 'pipeline' && (
        <>
          <div className="nav-divider" />

          <div>
            <div className="nav-label">Pipeline Stages</div>

            {/* All Stages */}
            <div
              className={`nav-stage ${activeStage === 'all' ? 'active' : ''}`}
              onClick={() => setActiveStage('all')}
            >
              <div
                className="nav-stage-icon-box"
                style={{ background: `${THEME.primary}20` }}
              >
                <List size={13} style={{ color: THEME.primary }} />
              </div>
              <span style={{ flex: 1 }}>All Stages</span>
              <span className="nav-stage-count">{getTotalLeads()}</span>
            </div>

            {/* Individual Stages */}
            {STAGES_WITH_ICONS.map((stage) => {
              const StageIcon = stage.IconComp;
              return (
                <div
                  key={stage.id}
                  className={`nav-stage ${activeStage === stage.id ? 'active' : ''}`}
                  onClick={() => setActiveStage(stage.id)}
                >
                  <div
                    className="nav-stage-icon-box"
                    style={{ background: `${stage.color}20` }}
                  >
                    <StageIcon size={13} style={{ color: stage.color }} />
                  </div>
                  <span style={{ flex: 1 }}>{stage.label}</span>
                  <span className="nav-stage-count">
                    {stageCounts[stage.id] || 0}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Profile Card ── */}
      <div className="sidebar-foot">
        <div className="profile-card">

          {/* Avatar + Name */}
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitials(userData?.fullName || 'BP')}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="profile-name">
                {(userData?.fullName || 'PARTNER').toUpperCase()}
              </div>
              <div className="profile-role">
                <ShieldCheck size={10} /> Verified Broker
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-val">
                {stageCounts['CLOSED_WON'] || 0}
              </div>
              <div className="profile-stat-label">Won</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-val">{getTotalLeads()}</div>
              <div className="profile-stat-label">Leads</div>
            </div>
          </div>

          {/* Star Rating */}
          <div className="profile-rating">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={11}
                fill={i <= 4 ? THEME.primary : 'none'}
                stroke={THEME.primary}
              />
            ))}
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                color: THEME.primaryDark,
                marginLeft: 4,
              }}
            >
              4.8
            </span>
          </div>

          {/* Logout */}
          {onLogout && (
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={12} /> Logout
            </button>
          )}

        </div>
      </div>

    </aside>
  );
}