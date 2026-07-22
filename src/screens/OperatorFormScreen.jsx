import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  submitMasterOperatorForm,
  submitGeneralOperatorForm,
  acceptInvitation,
} from '../api/adminApi';
import { getUserData, saveUserData, setItem, getItem, removeItem } from '../api/auth';

const positions = ['OWNER', 'CEO', 'DIRECTOR', 'MANAGER', 'PARTNER', 'OTHER'];
const contactMethods = ['WHATSAPP', 'PHONE', 'EMAIL'];
const languages = ['English', 'Arabic', 'Hindi', 'Urdu', 'French', 'Spanish'];

export default function OperatorFormScreen({ inviteData, onComplete, onSessionExpired }) {
  const user = getUserData() || {};

  // ── Determine operator type from invite data ──
  const franchiseType = inviteData?.franchiseType?.toUpperCase() || '';
  const isMasterOperator = franchiseType === 'MASTER';
  const operatorLabel = isMasterOperator ? 'Master Operator' : 'General Operator';
  const roleName = isMasterOperator ? 'MASTER_OPERATOR' : 'GENERAL_OPERATOR';

  const [form, setForm] = useState({
    companyName: '',
    alternatePhoneNumber: '',
    preferredContactMethod: 'WHATSAPP',
    position: 'OWNER',
    linkedinProfile: '',
    country: inviteData?.country || '',
    state: '',
    city: '',
    languagePreference: 'English',
  });

  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [step, setStep]           = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!form.companyName.trim()) return 'Company name is required';
    if (!form.position) return 'Please select your position';
    return null;
  };

  const validateStep2 = () => {
    if (!form.alternatePhoneNumber.trim()) return 'Alternate phone is required';
    return null;
  };

  const validateStep3 = () => {
    if (!form.country.trim()) return 'Country is required';
    if (!form.state.trim()) return 'State is required';
    if (!form.city.trim()) return 'City is required';
    return null;
  };

  const handleNext = () => {
    let err = null;
    if (step === 1) err = validateStep1();
    if (step === 2) err = validateStep2();
    if (err) { setError(err); return; }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const err = validateStep3();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');

    try {
      // ── Step 1: Submit form to correct endpoint ──
      console.log(`📝 Submitting ${operatorLabel} form...`);

      if (isMasterOperator) {
        const formRes = await submitMasterOperatorForm(form);
        console.log('✅ Master operator form submitted:', formRes);
      } else {
        const formRes = await submitGeneralOperatorForm(form);
        console.log('✅ General operator form submitted:', formRes);
      }

      // ── Step 2: Accept invitation ──
      const inviteToken = getItem('pendingInviteToken');
      if (inviteToken) {
        console.log('📨 Accepting invitation AFTER form...');
        try {
          const acceptRes = await acceptInvitation(inviteToken);
          console.log('✅ Invitation accepted:', acceptRes);
        } catch (acceptErr) {
          console.warn('⚠️ Accept failed (form saved):', acceptErr.message);
        }
        removeItem('pendingInviteToken');
      }

      // ── Step 3: Update user data ──
      const currentUser = getUserData() || {};
      saveUserData({
        ...currentUser,
        formFilled: true,
        roles: [...new Set([...(currentUser.roles || []), roleName])],
      });
      setItem('formFilled', 'true');

      setSubmitted(true);
      setTimeout(() => { onComplete?.(); }, 2500);

    } catch (err) {
      console.error('❌ Submit error:', err);
      if (err.message.includes('Session expired')) {
        onSessionExpired?.();
        return;
      }
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // ── Success Screen ──
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F0FDF4, #F7FAF4, #ECFDF5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Manrope, sans-serif', padding: 20,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            maxWidth: 420, width: '100%', background: '#fff',
            borderRadius: 24, padding: '48px 36px',
            textAlign: 'center', border: '1px solid #E8F0E0',
            boxShadow: '0 20px 60px rgba(22,101,52,0.12)',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#F0FDF4', border: '3px solid #BBF7D0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, margin: '0 auto 24px',
            }}
          >🎉</motion.div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#166534', margin: '0 0 10px' }}>
            Welcome, {operatorLabel}!
          </h2>
          <p style={{ fontSize: 14, color: '#6B8F71', margin: '0 0 8px' }}>
            Form submitted & invitation accepted successfully.
          </p>
          <p style={{ fontSize: 13, color: '#6B8F71' }}>
            Redirecting to your dashboard...
          </p>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: 'linear' }}
            style={{
              height: 4, borderRadius: 4,
              background: 'linear-gradient(90deg, #16A34A, #22C55E)',
              marginTop: 28,
            }}
          />
        </motion.div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F0FDF4, #F7FAF4, #ECFDF5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Manrope, sans-serif', padding: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: 520, width: '100%', background: '#fff',
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(22,101,52,0.12)',
          border: '1px solid #E8F0E0',
        }}
      >
        {/* Banner */}
        <div style={{
          background: isMasterOperator
            ? 'linear-gradient(135deg, #166534, #16A34A, #22C55E)'
            : 'linear-gradient(135deg, #0F4C3A, #166534, #16A34A)',
          padding: '28px 28px 24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -10,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>{isMasterOperator ? '🏢' : '🏪'}</div>
              <div>
                <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>
                  {operatorLabel} Onboarding
                </h1>
                <p style={{
                  color: 'rgba(255,255,255,0.8)', fontSize: 12,
                  margin: '2px 0 0', fontWeight: 500,
                }}>
                  {inviteData?.franchiseName
                    ? `${inviteData.franchiseName} — ${inviteData.country || ''}`
                    : 'Complete your profile'}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 10, height: 6, overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                style={{
                  height: '100%', borderRadius: 10,
                  background: 'linear-gradient(90deg, #BBF7D0, #fff)',
                }}
              />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 8,
            }}>
              {['Company', 'Contact', 'Location'].map((label, i) => (
                <span key={i} style={{
                  fontSize: 10, fontWeight: 700,
                  color: step > i ? '#BBF7D0' : 'rgba(255,255,255,0.4)',
                }}>
                  {step > i + 1 ? '✓ ' : ''}{label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div style={{ padding: '28px' }}>

          {/* Type badge */}
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 20,
            background: isMasterOperator ? '#F0FDF4' : '#EFF6FF',
            border: `1px solid ${isMasterOperator ? '#BBF7D0' : '#BFDBFE'}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>
              {isMasterOperator ? '🏢' : '🏪'}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: isMasterOperator ? '#166534' : '#1E40AF',
            }}>
              {operatorLabel} — Invitation accepted after form submission
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <StepHeader icon="🏢" title="Company Information" subtitle="Tell us about your business" />
                <FormInput label="Company Name *" value={form.companyName}
                  onChange={(v) => updateField('companyName', v)} placeholder="e.g. Zaid Enterprises" />
                <FormSelect label="Your Position *" value={form.position}
                  onChange={(v) => updateField('position', v)} options={positions} />
                <FormInput label="LinkedIn Profile" value={form.linkedinProfile}
                  onChange={(v) => updateField('linkedinProfile', v)} placeholder="https://linkedin.com/in/..." />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <StepHeader icon="📞" title="Contact Details" subtitle="How should we reach you?" />
                <FormInput label="Alternate Phone *" value={form.alternatePhoneNumber}
                  onChange={(v) => updateField('alternatePhoneNumber', v)} placeholder="+919876543210" />
                <FormSelect label="Preferred Contact" value={form.preferredContactMethod}
                  onChange={(v) => updateField('preferredContactMethod', v)} options={contactMethods} />
                <FormSelect label="Language" value={form.languagePreference}
                  onChange={(v) => updateField('languagePreference', v)} options={languages} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <StepHeader icon="📍" title="Location" subtitle="Where are you based?" />
                <FormInput label="Country *" value={form.country}
                  onChange={(v) => updateField('country', v)}
                  placeholder="e.g. India" disabled={!!inviteData?.country} />
                <FormInput label="State / Province *" value={form.state}
                  onChange={(v) => updateField('state', v)} placeholder="e.g. Madhya Pradesh" />
                <FormInput label="City *" value={form.city}
                  onChange={(v) => updateField('city', v)} placeholder="e.g. Bhopal" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  marginTop: 16, padding: '12px 16px',
                  background: '#FEF2F2', borderRadius: 12,
                  border: '1px solid #FECACA',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                <span>❌</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {step > 1 && (
              <motion.button onClick={handleBack}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  background: '#fff', border: '1.5px solid #E8F0E0',
                  color: '#6B8F71', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                }}>← Back</motion.button>
            )}

            <motion.button
              onClick={step < totalSteps ? handleNext : handleSubmit}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              style={{
                flex: step > 1 ? 2 : 1, padding: '14px', borderRadius: 14,
                background: 'linear-gradient(135deg, #16A34A, #15803D)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Manrope, sans-serif',
                boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && (
                <motion.div animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                  }} />
              )}
              {loading
                ? 'Submitting...'
                : step < totalSteps
                  ? 'Next →'
                  : '✅ Submit & Accept Invitation'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Components ── */
function StepHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#F0FDF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, border: '1px solid #E8F0E0',
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1A3A1A' }}>{title}</div>
          <div style={{ fontSize: 12, color: '#6B8F71', fontWeight: 500 }}>{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, disabled }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: '#1A3A1A', marginBottom: 6,
      }}>{label}</label>
      <input type="text" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1.5px solid #E8F0E0',
          background: disabled ? '#F7FAF4' : '#fff',
          fontSize: 14, fontWeight: 500, color: '#1A3A1A',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          boxSizing: 'border-box', opacity: disabled ? 0.7 : 1,
        }}
        onFocus={(e) => { if (!disabled) e.target.style.borderColor = '#16A34A'; }}
        onBlur={(e) => { e.target.style.borderColor = '#E8F0E0'; }}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: '#1A3A1A', marginBottom: 6,
      }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1.5px solid #E8F0E0', background: '#fff',
          fontSize: 14, fontWeight: 500, color: '#1A3A1A',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          boxSizing: 'border-box', cursor: 'pointer', appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B8F71' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 16px center', paddingRight: 40,
        }}
        onFocus={(e) => { e.target.style.borderColor = '#16A34A'; }}
        onBlur={(e) => { e.target.style.borderColor = '#E8F0E0'; }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}