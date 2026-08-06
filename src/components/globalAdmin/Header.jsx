// components/globalAdmin/Header.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { navItems } from './Sidebar';
import MyProfileModal from '../profile/MyProfileModal';
import { getUserData } from '../../api/auth';
import { resolvePhotoUrl } from '../../api/profileOperationsApi';

export default function Header({ activeNav, sidebarOpen, onToggleSidebar }) {
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Store photoUrl in state so it updates after upload without page reload
  const [photoUrl, setPhotoUrl] = useState(() => {
    const user = getUserData() || {};
    return resolvePhotoUrl(user.profilePhotoUrl);
  });

  const handleProfileUpdated = (updatedProfile) => {
    if (updatedProfile?.profilePhotoUrl) {
      setPhotoUrl(resolvePhotoUrl(updatedProfile.profilePhotoUrl));
    }
  };

  return (
    <>
      <header style={{
        background: '#fff', padding: '14px 28px',
        borderBottom: '1px solid #E8F0E0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(22,101,52,0.04)', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <motion.button
            onClick={onToggleSidebar}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: sidebarOpen ? 'transparent' : '#F0FDF4',
              border: sidebarOpen ? 'none' : '1px solid #BBF7D0',
              cursor: 'pointer', padding: 8, borderRadius: 10,
              color: '#16A34A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            <h1 style={{
              fontSize: 20, fontWeight: 800, color: '#1A3A1A',
              margin: 0, letterSpacing: '-0.3px',
            }}>
              {navItems.find((n) => n.id === activeNav)?.label}
            </h1>
            <p style={{ fontSize: 11, color: '#6B8F71', margin: 0, fontWeight: 500 }}>
              Global Admin Panel
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* My Profile Trigger */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setProfileModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 20,
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{
                width: 26, height: 26, borderRadius: '50%', background: '#16A34A',
                color: '#fff', fontSize: 11, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                👤
              </div>
            )}
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
              My Profile
            </span>
          </motion.button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 20,
            background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
            border: '1px solid #BBF7D0',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#22C55E',
              boxShadow: '0 0 6px rgba(34,197,94,0.5)',
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
              🛡️ Admin
            </span>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <MyProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
}
