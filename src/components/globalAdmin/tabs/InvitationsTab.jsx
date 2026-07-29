// components/globalAdmin/tabs/InvitationsTab.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyInvitation, acceptInvitation } from '../../../api/adminApi';
import Toast from '../ui/Toast';
import { InputField, GreenButton } from '../FormFields';

export default function InvitationsTab() {
  const [token, setToken]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);

  const handleVerify = async () => {
    if (!token.trim()) {
      setToast({ message: 'Please enter invitation token', type: 'error' });
      return;
    }
    setLoading(true);
    setVerifyResult(null);
    try {
      const res = await verifyInvitation(token.trim());
      setVerifyResult(res);
      setToast({ message: 'Invitation verified successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token.trim()) return;
    setAcceptLoading(true);
    try {
      const res = await acceptInvitation(token.trim());
      setToast({ message: res.message || 'Invitation accepted!', type: 'success' });
      setVerifyResult(null);
      setToken('');
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setAcceptLoading(false);
    }
  };

  return (
    <div>
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: '0 0 6px' }}>
        Verify & Accept Invitations
      </h2>
      <p style={{ fontSize: 12, color: '#6B8F71', margin: '0 0 24px', fontWeight: 500 }}>
        Paste an invitation token to verify and accept it
      </p>

      <div style={{
        background: '#fff', borderRadius: 18, padding: '28px 30px',
        border: '1px solid #E8F0E0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', maxWidth: 600,
      }}>
        <InputField
          label="Invitation Token"
          value={token}
          onChange={setToken}
          placeholder="Paste invitation token here..."
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <GreenButton onClick={handleVerify} loading={loading}>
            {loading ? 'Verifying...' : '🔍 Verify Token'}
          </GreenButton>
        </div>

        <AnimatePresence>
          {verifyResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginTop: 24, padding: '24px',
                background: verifyResult.valid ? '#F0FDF4' : '#FEF2F2',
                borderRadius: 16,
                border: `1px solid ${verifyResult.valid ? '#BBF7D0' : '#FECACA'}`,
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
              }}>
                <span style={{ fontSize: 24 }}>
                  {verifyResult.valid ? '✅' : '❌'}
                </span>
                <div>
                  <div style={{
                    fontSize: 15, fontWeight: 800,
                    color: verifyResult.valid ? '#166534' : '#991B1B',
                  }}>
                    {verifyResult.valid ? 'Valid Invitation' : 'Invalid Invitation'}
                  </div>
                  {verifyResult.message && (
                    <div style={{
                      fontSize: 12,
                      color: verifyResult.valid ? '#6B8F71' : '#DC2626',
                      marginTop: 2,
                    }}>
                      {verifyResult.message}
                    </div>
                  )}
                </div>
              </div>

              {verifyResult.valid && (
                <>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 12, marginBottom: 16,
                  }}>
                    {[
                      { label: 'Purpose',  value: verifyResult.purpose },
                      { label: 'Franchise',value: verifyResult.franchiseName },
                      { label: 'Type',     value: verifyResult.franchiseType },
                      { label: 'Country',  value: verifyResult.country },
                    ].filter(x => x.value).map((item, i) => (
                      <div key={i} style={{
                        background: '#fff', padding: '10px 14px',
                        borderRadius: 10, border: '1px solid #E8F0E0',
                      }}>
                        <div style={{ fontSize: 10, color: '#6B8F71', fontWeight: 600, marginBottom: 2 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A3A1A' }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {verifyResult.expiresAt && (
                    <div style={{ fontSize: 11, color: '#6B8F71', marginBottom: 16 }}>
                      ⏰ Expires: {new Date(verifyResult.expiresAt).toLocaleString()}
                    </div>
                  )}

                  <GreenButton fullWidth onClick={handleAccept} loading={acceptLoading}>
                    {acceptLoading ? 'Accepting...' : '✅ Accept Invitation'}
                  </GreenButton>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}