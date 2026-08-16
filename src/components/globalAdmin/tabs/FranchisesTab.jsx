// components/globalAdmin/tabs/FranchisesTab.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createMasterFranchise, inviteMasterOperator } from '../../../api/adminApi';
import Toast from '../ui/Toast';
import Modal from '../ui/Modal';
import { InputField, SelectField, GreenButton } from '../FormFields';
import { getCountries } from '../../../utils/locationData';

export default function FranchisesTab() {
  const [showCreate, setShowCreate]           = useState(false);
  const [createResult, setCreateResult]       = useState(null);
  const [showInvite, setShowInvite]           = useState(false);
  const [name, setName]                       = useState('');
  const [country, setCountry]                 = useState('');
  const [loading, setLoading]                 = useState(false);
  const [toast, setToast]                     = useState(null);
  const [franchises, setFranchises]           = useState([]);
  const [inviteFranchiseId, setInviteFranchiseId] = useState('');
  const [inviteLoading, setInviteLoading]     = useState(false);
  const [inviteResult, setInviteResult]       = useState(null);

  const getLinkFromRes = (res) => {
    if (!res) return '';
    if (res.inviteLink) return res.inviteLink;
    if (res.token) return `${window.location.origin}/invite/${res.token}`;
    if (res.inviteUrl) return res.inviteUrl;
    if (typeof res === 'string') return res;
    return '';
  };

  const handleCreate = async () => {
    if (!name.trim() || !country.trim()) {
      setToast({ message: 'Please fill franchise name and country', type: 'error' });
      return;
    }
    setLoading(true);
    setCreateResult(null);
    try {
      const res = await createMasterFranchise(name.trim(), country.trim());
      let link = getLinkFromRes(res);
      const franchiseId = res?.franchiseId || res?.id || Date.now();

      // Auto-generate invite link if creation response didn't contain direct link
      if (!link && franchiseId) {
        try {
          const invRes = await inviteMasterOperator(Number(franchiseId));
          link = getLinkFromRes(invRes);
        } catch (e) {
          console.error('Failed to auto-generate invite link:', e);
        }
      }

      setFranchises((prev) => [...prev, {
        id: franchiseId,
        name: res.franchiseName || name.trim(),
        country: res.country || country.trim(),
        inviteLink: link,
      }]);
      setCreateResult({ ...res, id: franchiseId, inviteLink: link });
      setToast({ message: res.message || 'Master Franchise created successfully!', type: 'success' });
      setName(''); setCountry('');
    } catch (err) {
      setToast({ message: err.message || 'Failed to create franchise', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (overrideId) => {
    const targetId = overrideId || inviteFranchiseId || franchises[0]?.id || 1;
    setInviteLoading(true);
    setInviteResult(null);
    try {
      const res = await inviteMasterOperator(Number(targetId));
      const link = getLinkFromRes(res);
      setInviteResult({ ...res, inviteLink: link });
      setToast({ message: res.message || 'Invitation created!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to generate invite link', type: 'error' });
    } finally {
      setInviteLoading(false);
    }
  };

  useEffect(() => {
    if (showInvite && !inviteResult && !inviteLoading) {
      handleInvite(inviteFranchiseId);
    }
  }, [showInvite]);

  const copyToClipboard = (text) => {
    if (!text) return;
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
          <GreenButton onClick={() => { setShowCreate(true); setCreateResult(null); }}>
            ➕ Create Franchise
          </GreenButton>
        </div>
      </div>

      {/* Empty State / Franchise Cards */}
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
          <GreenButton onClick={() => { setShowCreate(true); setCreateResult(null); }}>
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
              {f.inviteLink && (
                <div style={{ marginBottom: 12, background: '#F8FAFC', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, fontSize: 11, fontFamily: 'monospace', color: '#334155', wordBreak: 'break-all' }}>{f.inviteLink}</div>
                  <motion.button onClick={() => copyToClipboard(f.inviteLink)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ padding: '4px 10px', borderRadius: 6, background: '#16A34A', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}
                  >📋 Copy</motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <Modal title="Create Master Franchise" onClose={() => { setShowCreate(false); setCreateResult(null); }}>
            {!createResult ? (
              <>
                <InputField label="Franchise Name" value={name} onChange={setName}
                  placeholder="e.g. India Master" />
                <SelectField
                  label="Country"
                  value={country}
                  onChange={setCountry}
                  options={[
                    { value: '', label: 'Select Country' },
                    ...getCountries().map((c) => ({ value: c, label: c })),
                  ]}
                />
                <div style={{ marginTop: 8 }}>
                  <GreenButton fullWidth onClick={handleCreate} loading={loading}>
                    {loading ? 'Creating...' : '🏢 Create Master Franchise'}
                  </GreenButton>
                </div>
              </>
            ) : (
              <div style={{ background: '#F0FDF4', padding: 20, borderRadius: 14, border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#166534', marginBottom: 6 }}>
                  ✅ Master Franchise Created!
                </div>
                <div style={{ fontSize: 12, color: '#15803D', marginBottom: 14 }}>
                  Franchise ID: <strong>#{createResult.id}</strong>
                </div>

                {createResult.inviteLink && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 6 }}>
                      Master Operator Invite Link:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '10px 12px', borderRadius: 10, border: '1px solid #BBF7D0' }}>
                      <div style={{ flex: 1, fontSize: 11, fontFamily: 'monospace', color: '#166534', wordBreak: 'break-all' }}>
                        {createResult.inviteLink}
                      </div>
                      <motion.button onClick={() => copyToClipboard(createResult.inviteLink)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ padding: '6px 12px', borderRadius: 8, background: '#16A34A', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}
                      >📋 Copy</motion.button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <GreenButton variant="outline" fullWidth onClick={() => setCreateResult(null)}>
                    ➕ Create Another
                  </GreenButton>
                  <GreenButton fullWidth onClick={() => { setShowCreate(false); setCreateResult(null); }}>
                    Done
                  </GreenButton>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <Modal title="Invite Master Operator" onClose={() => { setShowInvite(false); setInviteResult(null); setInviteFranchiseId(''); }}>
            {inviteLoading && (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{ width: 40, height: 40, border: '3px solid #BBF7D0', borderTopColor: '#16A34A', borderRadius: '50%', margin: '0 auto 16px' }}
                />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1A3A1A', margin: 0 }}>
                  Generating Master Operator Invite Link...
                </p>
              </div>
            )}
            {!inviteLoading && inviteResult && (
              <div style={{ marginTop: 8, background: '#F0FDF4', padding: 20, borderRadius: 14, border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 12 }}>
                  ✅ Master Operator Invite Link Ready!
                </div>
                {inviteResult.inviteLink && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#fff', padding: '10px 14px',
                      borderRadius: 10, border: '1px solid #E8F0E0',
                      marginBottom: 12,
                    }}>
                      <div style={{
                        flex: 1, fontSize: 12, color: '#1A3A1A',
                        wordBreak: 'break-all', fontFamily: 'monospace',
                      }}>
                        {inviteResult.inviteLink}
                      </div>
                    </div>
                    <GreenButton fullWidth onClick={() => copyToClipboard(inviteResult.inviteLink)}>
                      📋 Copy Invite Link
                    </GreenButton>
                  </div>
                )}
                {inviteResult.expiresAt && (
                  <div style={{ fontSize: 11, color: '#6B8F71', textAlign: 'center', marginTop: 10 }}>
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