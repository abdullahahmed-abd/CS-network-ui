import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getItem } from '../api/auth';
import { verifyInvitation } from '../api/adminApi';

export default function AcceptInvitationScreen({
  onBack,
  onOperatorForm,
  onMemberForm,
}) {
  const [step, setStep]             = useState('verifying');
  const [verifyData, setVerifyData] = useState(null);
  const [error, setError]           = useState('');
  const [token, setToken]           = useState('');

  useEffect(() => {
    const savedToken = getItem('pendingInviteToken');
    if (!savedToken) {
      setStep('error');
      setError('No invitation token found. The link may have expired.');
      return;
    }
    setToken(savedToken);
    handleVerify(savedToken);
  }, []);

  const handleVerify = async (inviteToken) => {
    setStep('verifying');
    setError('');

    try {
      const res = await verifyInvitation(inviteToken);
      console.log('✅ Invite verified:', res);

      if (res.valid) {
        setVerifyData(res);
        setStep('verified');
      } else {
        setStep('error');
        setError(res.message || 'This invitation is no longer valid.');
      }
    } catch (err) {
      console.error('❌ Verify failed:', err);
      setStep('error');
      setError(err.message || 'Failed to verify invitation.');
    }
  };

  // ✅ NO accept here — just route to correct form
  const handleContinueToForm = () => {
    const purpose = verifyData?.purpose?.toUpperCase();

    if (purpose === 'OPERATOR') {
      console.log('🏢 → Operator Form (accept will happen AFTER form)');
      onOperatorForm?.(verifyData);
    } else {
      console.log('👤 → Member Form (accept will happen AFTER form)');
      onMemberForm?.(verifyData);
    }
  };

  const handleDecline = () => {
    onBack?.();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F0FDF4 0%, #F7FAF4 50%, #ECFDF5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Manrope, sans-serif',
      padding: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: 480, width: '100%',
          background: '#fff', borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(22,101,52,0.12)',
          border: '1px solid #E8F0E0',
        }}
      >
        {/* ── Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #166534, #16A34A, #22C55E)',
          padding: '32px 28px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -10,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, margin: '0 auto 16px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >📨</motion.div>
            <h1 style={{
              color: '#fff', fontSize: 22, fontWeight: 800,
              margin: '0 0 6px',
            }}>You've Been Invited!</h1>
            <p style={{
              color: 'rgba(255,255,255,0.85)', fontSize: 13,
              margin: 0, fontWeight: 500,
            }}>Review your invitation details below</p>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '28px 28px 32px' }}>
          <AnimatePresence mode="wait">

            {/* Verifying */}
            {step === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '20px 0' }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  style={{
                    width: 48, height: 48, margin: '0 auto 20px',
                    border: '3px solid #E8F0E0',
                    borderTopColor: '#16A34A',
                    borderRadius: '50%',
                  }}
                />
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1A3A1A' }}>
                  Verifying invitation...
                </p>
                <p style={{ fontSize: 12, color: '#6B8F71', marginTop: 4 }}>
                  Please wait a moment
                </p>
              </motion.div>
            )}

            {/* Verified — Show Details */}
            {step === 'verified' && verifyData && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Details Card */}
                <div style={{
                  background: '#F0FDF4', borderRadius: 16,
                  padding: '20px 22px', border: '1px solid #BBF7D0',
                  marginBottom: 20,
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#16A34A',
                    textTransform: 'uppercase', letterSpacing: '0.8px',
                    marginBottom: 14,
                  }}>✅ Valid Invitation</div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                  }}>
                    {verifyData.purpose && (
                      <DetailCard label="Role" value={verifyData.purpose} />
                    )}
                    {verifyData.franchiseName && (
                      <DetailCard label="Franchise" value={verifyData.franchiseName} />
                    )}
                    {verifyData.franchiseType && (
                      <DetailCard label="Type" value={verifyData.franchiseType} />
                    )}
                    {verifyData.country && (
                      <DetailCard label="Country" value={verifyData.country} />
                    )}
                  </div>

                  {verifyData.expiresAt && (
                    <div style={{ marginTop: 14, fontSize: 11, color: '#6B8F71' }}>
                      ⏰ Expires: {new Date(verifyData.expiresAt).toLocaleString()}
                    </div>
                  )}

                  {verifyData.message && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px',
                      background: '#fff', borderRadius: 10,
                      border: '1px solid #E8F0E0',
                      fontSize: 13, color: '#1A3A1A', fontWeight: 600,
                    }}>💬 {verifyData.message}</div>
                  )}
                </div>

                {/* What happens next */}
                <div style={{
                  padding: '14px 18px', borderRadius: 14,
                  background: verifyData.purpose?.toUpperCase() === 'OPERATOR'
                    ? '#EFF6FF' : '#F0FDF4',
                  border: `1px solid ${
                    verifyData.purpose?.toUpperCase() === 'OPERATOR'
                      ? '#BFDBFE' : '#BBF7D0'
                  }`,
                  marginBottom: 20,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 20 }}>
                      {verifyData.purpose?.toUpperCase() === 'OPERATOR' ? '🏢' : '👤'}
                    </span>
                    <div>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: verifyData.purpose?.toUpperCase() === 'OPERATOR'
                          ? '#1E40AF' : '#166534',
                      }}>
                        Next: Fill {verifyData.purpose?.toUpperCase() === 'OPERATOR'
                          ? 'Operator Onboarding' : 'Registration'} Form
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 500,
                        color: verifyData.purpose?.toUpperCase() === 'OPERATOR'
                          ? '#3B82F6' : '#6B8F71',
                        marginTop: 2,
                      }}>
                        Your invitation will be accepted after form submission
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button
                    onClick={handleDecline}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1, padding: '14px', borderRadius: 14,
                      background: '#fff', border: '1.5px solid #E8F0E0',
                      color: '#6B8F71', fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                    }}
                  >Decline</motion.button>

                  <motion.button
                    onClick={handleContinueToForm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 2, padding: '14px', borderRadius: 14,
                      background: 'linear-gradient(135deg, #16A34A, #15803D)',
                      border: 'none', color: '#fff',
                      fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                      boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                    }}
                  >📝 Continue to Form →</motion.button>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', padding: '20px 0' }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#FEF2F2', border: '2px solid #FECACA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30, margin: '0 auto 20px',
                }}>❌</div>
                <h3 style={{
                  fontSize: 18, fontWeight: 800, color: '#991B1B',
                  margin: '0 0 8px',
                }}>Something went wrong</h3>
                <p style={{
                  fontSize: 13, color: '#DC2626', margin: '0 0 24px',
                  maxWidth: 300, marginLeft: 'auto', marginRight: 'auto',
                }}>{error}</p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <motion.button
                    onClick={handleDecline}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '12px 24px', borderRadius: 12,
                      background: '#fff', border: '1.5px solid #E8F0E0',
                      color: '#6B8F71', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                    }}
                  >Go Back</motion.button>

                  {token && (
                    <motion.button
                      onClick={() => handleVerify(token)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        padding: '12px 24px', borderRadius: 12,
                        background: 'linear-gradient(135deg, #16A34A, #15803D)',
                        border: 'none', color: '#fff',
                        fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                      }}
                    >🔄 Retry</motion.button>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div style={{
      background: '#fff', padding: '10px 14px',
      borderRadius: 10, border: '1px solid #E8F0E0',
    }}>
      <div style={{
        fontSize: 10, color: '#6B8F71', fontWeight: 600,
        marginBottom: 3, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A3A1A' }}>
        {value}
      </div>
    </div>
  );
}