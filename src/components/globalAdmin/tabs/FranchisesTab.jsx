// components/globalAdmin/tabs/FranchisesTab.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createMasterFranchise, inviteMasterOperator } from '../../../api/adminApi';
import Toast from '../ui/Toast';
import Modal from '../ui/Modal';
import { InputField, GreenButton } from '../FormFields';

export default function FranchisesTab() {
  const [showCreate, setShowCreate]           = useState(false);
  const [showInvite, setShowInvite]           = useState(false);
  const [name, setName]                       = useState('');
  const [country, setCountry]                 = useState('');
  const [loading, setLoading]                 = useState(false);
  const [toast, setToast]                     = useState(null);
  const [franchises, setFranchises]           = useState([]);
  const [inviteFranchiseId, setInviteFranchiseId] = useState('');
  const [inviteLoading, setInviteLoading]     = useState(false);
  const [inviteResult, setInviteResult]       = useState(null);

  const handleCreate = async () => {
    if (!name.trim() || !country.trim()) {
      setToast({ message: 'Please fill franchise name and country', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await createMasterFranchise(name.trim(), country.trim());
      setFranchises((prev) => [...prev, {
        id: res.franchiseId,
        name: res.franchiseName || name,
        country: res.country || country,
        inviteLink: res.inviteLink,
      }]);
      setToast({ message: res.message || 'Master Franchise created successfully!', type: 'success' });
      setName(''); setCountry(''); setShowCreate(false);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteFranchiseId) {
      setToast({ message: 'Please enter franchise ID', type: 'error' });
      return;
    }
    setInviteLoading(true);
    setInviteResult(null);
    try {
      const res = await inviteMasterOperator(Number(inviteFranchiseId));
      setInviteResult(res);
      setToast({ message: res.message || 'Invitation created!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() =>
      setToast({ message: 'Link copied to clipboard!', type: 'success' })
    );
  };

  return (
    <div>
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 24,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
            Master Franchises
          </h2>
          <p style={{ fontSize: 12, color: '#6B8F71', margin: '4px 0 0', fontWeight: 500 }}>
            Create and manage country-level franchises
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <GreenButton variant="outline"
            onClick={() => { setShowInvite(true); setInviteResult(null); }}>
            📨 Invite Operator
          </GreenButton>
          <GreenButton onClick={() => setShowCreate(true)}>
            ➕ Create Franchise
          </GreenButton>
        </div>
      </div>

      {/* Empty State */}
      {franchises.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            background: '#fff', borderRadius: 20, padding: '60px 40px',
            textAlign: 'center', border: '1px solid #E8F0E0',
          }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: 24, background: '#F0FDF4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 20px', border: '1px solid #BBF7D0',
          }}>🏢</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', marginBottom: 8 }}>
            No Franchises Yet
          </h3>
          <p style={{ color: '#6B8F71', fontSize: 14, marginBottom: 20 }}>
            Create your first master franchise to get started
          </p>
          <GreenButton onClick={() => setShowCreate(true)}>
            ➕ Create First Franchise
          </GreenButton>
        </motion.div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {franchises.map((f, i) => (
            <motion.div
              key={f.id || i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: '#fff', borderRadius: 16, padding: '22px 24px',
                border: '1px solid #E8F0E0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#F0FDF4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, border: '1px solid #E8F0E0',
                }}>🏢</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1A3A1A' }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: '#6B8F71', fontWeight: 500 }}>
                    🌍 {f.country}
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto', padding: '4px 10px', borderRadius: 8,
                  background: '#F0FDF4', border: '1px solid #BBF7D0',
                  fontSize: 11, fontWeight: 700, color: '#16A34A',
                }}>
                  ID: {f.id}
                </div>
              </div>
              <GreenButton
                variant="outline"
                onClick={() => {
                  setInviteFranchiseId(String(f.id));
                  setInviteResult(null);
                  setShowInvite(true);
                }}
              >
                📨 Invite Operator
              </GreenButton>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <Modal title="Create Master Franchise" onClose={() => setShowCreate(false)}>
            <InputField label="Franchise Name" value={name} onChange={setName}
              placeholder="e.g. India Master" />
            <InputField label="Country" value={country} onChange={setCountry}
              placeholder="e.g. India" />
            <div style={{ marginTop: 8 }}>
              <GreenButton fullWidth onClick={handleCreate} loading={loading}>
                {loading ? 'Creating...' : '🏢 Create Master Franchise'}
              </GreenButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <Modal title="Invite Master Operator" onClose={() => setShowInvite(false)}>
            <InputField label="Franchise ID" value={inviteFranchiseId}
              onChange={setInviteFranchiseId} placeholder="e.g. 1" />
            {!inviteResult && (
              <GreenButton fullWidth onClick={handleInvite} loading={inviteLoading}>
                {inviteLoading ? 'Generating...' : '🔗 Generate Invite Link'}
              </GreenButton>
            )}
            <AnimatePresence>
              {inviteResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 20, padding: '20px', background: '#F0FDF4',
                    borderRadius: 14, border: '1px solid #BBF7D0',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 12 }}>
                    ✅ Invitation Created!
                  </div>
                  {inviteResult.inviteLink && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#6B8F71', marginBottom: 6 }}>
                        Invite Link:
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: '#fff', padding: '10px 14px',
                        borderRadius: 10, border: '1px solid #E8F0E0',
                      }}>
                        <div style={{
                          flex: 1, fontSize: 12, color: '#1A3A1A',
                          wordBreak: 'break-all', fontFamily: 'monospace',
                        }}>
                          {inviteResult.inviteLink}
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(inviteResult.inviteLink)}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={{
                            padding: '6px 12px', borderRadius: 8,
                            background: '#16A34A', color: '#fff',
                            border: 'none', cursor: 'pointer',
                            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                          }}
                        >📋 Copy</motion.button>
                      </div>
                    </div>
                  )}
                  {inviteResult.expiresAt && (
                    <div style={{ fontSize: 11, color: '#6B8F71' }}>
                      ⏰ Expires: {new Date(inviteResult.expiresAt).toLocaleString()}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}