import React from 'react';
import { 
  List, LogOut, Star, ShieldCheck,
  Users, Handshake, Trophy
} from 'lucide-react';

const BRAND = '#A2CB8B';
const BRAND_DARK = '#7aab65';

const PIPELINE_STAGES = [
  { id: 'NEW_LEAD',     label: 'New Lead',     color: '#66BB6A', colorDark: '#43A047', IconComp: () => '🌱' },
  { id: 'CONTACTED',    label: 'Contacted',    color: '#26A69A', colorDark: '#00897B', IconComp: () => '📞' },
  { id: 'QUALIFIED',    label: 'Qualified',    color: '#66BB6A', colorDark: '#43A047', IconComp: () => '✓' },
  { id: 'INTRODUCED',   label: 'Introduced',   color: '#7E57C2', colorDark: '#5E35B1', IconComp: () => '👋' },
  { id: 'NEGOTIATION',  label: 'Negotiation',  color: '#FFA726', colorDark: '#FB8C00', IconComp: () => '⚖️' },
  { id: 'CLOSED_WON',   label: 'Closed Won',   color: '#43A047', colorDark: '#2E7D32', IconComp: () => '🏆' },
  { id: 'CLOSED_LOST',  label: 'Closed Lost',  color: '#EF5350', colorDark: '#C62828', IconComp: () => '✕' },
];

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
      {/* Brand */}
      <div className="brand">
        <div className="brand-diamond" />
        <div>
          <div className="brand-text">CONNECT SOUQ</div>
          <div className="brand-sub">Business Partner</div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="nav">
        <div className="nav-label">Main Menu</div>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => setActiveNav(item.id)}
          >
            <item.icon /> <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Pipeline Stages (shown when pipeline active) */}
      {activeNav === 'pipeline' && (
        <>
          <div className="nav-divider" />
          <div>
            <div className="nav-label">Pipeline Stages</div>
            <div
              className={`nav-stage ${activeStage === 'all' ? 'active' : ''}`}
              onClick={() => setActiveStage('all')}
            >
              <div className="nav-stage-icon-box" style={{ background: `${BRAND}20` }}>
                <List style={{ color: BRAND }} />
              </div>
              <span style={{ flex: 1 }}>All Stages</span>
              <span className="nav-stage-count">{getTotalLeads()}</span>
            </div>

            {PIPELINE_STAGES.map((stage) => {
              const StageIcon = stage.IconComp;
              return (
                <div
                  key={stage.id}
                  className={`nav-stage ${activeStage === stage.id ? 'active' : ''}`}
                  onClick={() => setActiveStage(stage.id)}
                >
                  <div className="nav-stage-icon-box" style={{ background: `${stage.color}20` }}>
                    <StageIcon style={{ color: stage.color }} />
                  </div>
                  <span style={{ flex: 1 }}>{stage.label}</span>
                  <span className="nav-stage-count">{stageCounts[stage.id] || 0}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Profile Card */}
      <div className="sidebar-foot">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{getInitials(userData?.fullName || 'BP')}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="profile-name">{(userData?.fullName || 'PARTNER').toUpperCase()}</div>
              <div className="profile-role">
                <ShieldCheck size={10} /> Verified Broker
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-val">{stageCounts['CLOSED_WON'] || 0}</div>
              <div className="profile-stat-label">Won</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-val">{getTotalLeads()}</div>
              <div className="profile-stat-label">Leads</div>
            </div>
          </div>

          <div className="profile-rating">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={11}
                fill={i <= 4 ? BRAND : 'none'}
                stroke={BRAND}
              />
            ))}
            <span
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                color: BRAND_DARK,
                marginLeft: 4,
              }}
            >
              4.8
            </span>
          </div>

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