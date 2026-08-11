import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearTokens, getUserData } from '../../api/auth';
import { fetchMyProfile } from '../../api/profileOperationsApi';
import MyProfileModal from '../profile/MyProfileModal';

import Sidebar from './Sidebar';
import Header from './Header';
import OverviewTab from './tabs/OverviewTab';
import MediaHubTab from './tabs/MediaHubTab';
import FranchisesTab from './tabs/FranchisesTab';
import InvitationsTab from './tabs/InvitationsTab';
import EventsTab from './tabs/EventsTab';
import MeetingsTab from '../meetings/MeetingsTab';
import DirectoryTab from '../directory/DirectoryTab';
import PartnershipsTab from '../partnerships/PartnershipsTab';

import TrustLeaderboardTab from './tabs/TrustLeaderboardTab';

// ── Placeholder Tab ───────────────────────
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

// ── Main Dashboard ────────────────────────
export default function GlobalAdminDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebar] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getUserData() || {});

  useEffect(() => {
    fetchMyProfile()
      .then((res) => {
        if (res?.profile) {
          setUserProfile((prev) => ({ ...prev, ...res.profile }));
        }
      })
      .catch((err) => {
        console.warn('GlobalAdmin fetchMyProfile failed:', err);
      });
  }, []);

  const handleProfileUpdated = (updated) => {
    if (updated) {
      setUserProfile((prev) => ({ ...prev, ...updated }));
    }
  };

  const user = userProfile;

  const handleLogout = () => {
    clearTokens();
    onLogout?.();
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#F7FAF4', fontFamily: 'Manrope, sans-serif',
    }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        user={user}
        onLogout={handleLogout}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        height: '100vh', minWidth: 0, overflow: 'hidden',
      }}>
        {/* Top Bar */}
        <Header
          activeNav={activeNav}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebar(v => !v)}
        />

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
              {activeNav === 'overview' && <OverviewTab onNavigate={setActiveNav} />}
              {activeNav === 'leaderboard' && <TrustLeaderboardTab />}
              {activeNav === 'media_hub' && <MediaHubTab />}
              {activeNav === 'franchises' && <FranchisesTab />}
              {activeNav === 'directory' && <DirectoryTab />}
              {activeNav === 'events' && <EventsTab />}
              {activeNav === 'meetings' && <MeetingsTab />}
              {activeNav === 'partnerships' && <PartnershipsTab />}
              {activeNav === 'users' && <PlaceholderTab name="users" />}
              {activeNav === 'settings' && <PlaceholderTab name="Settings" />}
            </motion.div>
          </AnimatePresence>
          <div style={{ height: 40 }} />
        </main>
      </div>

      {/* My Profile Modal */}
      <MyProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Scrollbar styles */}
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