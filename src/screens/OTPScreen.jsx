import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import OTPInput from '../components/OTPInput';
import RippleButton from '../components/RippleButton';
import {
  authOperation, saveTokens, getItem,
  setItem, removeItem, saveUserData, getUserData,
} from '../api/auth';

const OTP_LENGTH     = 6;
const RESEND_SECONDS = 60;

export default function OTPScreen({
  phone,
  countryCode,
  onBack,
  onVerified,
  mode,   // 'signup' | 'whatsapp' (login)
}) {
  const [otpValues,   setOtpValues]   = useState(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [canResend,   setCanResend]   = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [shake,       setShake]       = useState(false);

  const otpString  = otpValues.join('');
  const isComplete = otpValues.every((v) => v !== '');

  // ── Countdown ──
  useEffect(() => {
    if (secondsLeft <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  // ── Build verify payload based on mode ──
  const buildVerifyPayload = (otp, fullPhone) => {
    // signup → VERIFY_SIGNUP_OTP
    // whatsapp (login) → VERIFY_LOGIN_OTP
    if (mode === 'signup') {
      return {
        requestType : 'VERIFY_SIGNUP_OTP',
        userId      : getItem('userId'),
        phoneNumber : fullPhone,
        otp,
      };
    }
    // whatsapp / login mode
    return {
      requestType : 'VERIFY_LOGIN_OTP',
      phoneNumber : fullPhone,
      otp,
    };
  };

  // ── Build resend payload based on mode ──
  const buildResendPayload = (fullPhone) => {
    if (mode === 'signup') {
      return {
        requestType : 'SEND_SIGNUP_OTP',
        userId      : getItem('userId'),
        phoneNumber : fullPhone,
      };
    }
    return {
      requestType : 'SEND_LOGIN_OTP',
      phoneNumber : fullPhone,
    };
  };

  // ── Verify OTP ──
  const handleVerify = useCallback(async () => {
    if (loading) return;

    if (otpString.length < OTP_LENGTH) {
      setError('Please enter all 6 digits');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = getItem('pendingPhone') || `${countryCode}${phone}`;
      let payload     = buildVerifyPayload(otpString, fullPhone);

      // Remove null / undefined fields
      Object.keys(payload).forEach(
        (k) => (payload[k] === null || payload[k] === undefined) && delete payload[k]
      );

      console.log('📤 OTP verify payload:', payload);

      const data = await authOperation(payload);

      console.log('✅ OTP response:', data);

      // ── Save tokens ──
      if (data.accessToken && data.refreshToken) {
        saveTokens(data.accessToken, data.refreshToken);
      }
      removeItem('pendingPhone');
      if (mode === 'signup') removeItem('userId');

      // ── Save flags ──
      if (data.formFilled !== undefined)    setItem('formFilled',    String(data.formFilled));
      if (data.phoneVerified !== undefined) setItem('phoneVerified', String(data.phoneVerified));

      // ── Parse roles ──
      const rolesRaw   = data.roles || data.role || [];
      const rolesArray = Array.isArray(rolesRaw)
        ? rolesRaw
        : String(rolesRaw).split(',');

      const roles = rolesArray
        .map((r) => String(r).trim().toUpperCase())
        .filter(Boolean);

      console.log('🎯 Roles from response:', roles);

      // ── Persist roles ──
      if (roles.length) {
        const currentUser = getUserData() || {};
        saveUserData({
          ...currentUser,
          roles,
          phoneVerified : data.phoneVerified,
          formFilled    : data.formFilled,
          ...(data.userId && { userId: data.userId }),
        });
      }

      // ── Notify AuthCard ──
      onVerified({
        phoneVerified : data.phoneVerified,
        formFilled    : data.formFilled,
        roles,
        userId        : data.userId,
      });

    } catch (err) {
      console.error('❌ OTP error:', err);

      let msg = err.message || 'Invalid OTP. Please try again.';
      if (msg.toLowerCase().includes('expired'))  msg = 'OTP has expired. Please request a new one.';
      if (msg.toLowerCase().includes('invalid'))  msg = 'Incorrect OTP. Please check and try again.';
      if (msg.toLowerCase().includes('session'))  msg = 'Session expired. Please go back and retry.';
      if (msg.toLowerCase().includes('not found'))msg = 'Phone number not registered. Please sign up.';

      setError(msg);
      triggerShake();
      setOtpValues(Array(OTP_LENGTH).fill(''));

    } finally {
      setLoading(false);
    }
  }, [otpString, loading, onVerified, mode, phone, countryCode]);

  // ── Auto-submit when all digits entered ──
  useEffect(() => {
    if (isComplete && !loading) {
      const t = setTimeout(handleVerify, 350);
      return () => clearTimeout(t);
    }
  }, [isComplete, loading, handleVerify]);

  // ── Resend OTP ──
  const handleResend = async () => {
    if (!canResend) return;
    setSecondsLeft(RESEND_SECONDS);
    setCanResend(false);
    setOtpValues(Array(OTP_LENGTH).fill(''));
    setError('');

    try {
      const fullPhone = getItem('pendingPhone') || `${countryCode}${phone}`;
      let payload     = buildResendPayload(fullPhone);

      Object.keys(payload).forEach(
        (k) => (payload[k] === null || payload[k] === undefined) && delete payload[k]
      );

      console.log('📲 Resend OTP payload:', payload);
      await authOperation(payload);
      console.log('✅ OTP resent');

    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  // ── UI helpers ──
  const maskedPhone =
    phone.length > 4
      ? phone.slice(0, -4).replace(/\d/g, '•') + phone.slice(-4)
      : phone;

  const minutes       = Math.floor(secondsLeft / 60);
  const secs          = secondsLeft % 60;
  const timerText     = `${minutes}:${secs.toString().padStart(2, '0')}`;
  const timerProgress = secondsLeft / RESEND_SECONDS;

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Back */}
      <motion.button
        onClick={onBack}
        className="self-start flex items-center gap-1.5 text-sm font-medium"
        style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
        whileHover={{ x: -3, color: '#16A34A' }}
        whileTap={{ scale: 0.97 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      {/* Header */}
      <div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold mb-2"
          style={{
            background : 'rgba(37,211,102,0.10)',
            color      : '#16A34A',
            border     : '1px solid rgba(37,211,102,0.20)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
          </svg>
          WhatsApp OTP
        </span>

        <h2 className="text-2xl font-bold" style={{ color: '#1F2937' }}>
          Enter verification code
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6B7280' }}>
          We sent a <span className="font-semibold">6-digit OTP</span> on{' '}
          <span className="font-semibold" style={{ color: '#16A34A' }}>WhatsApp</span> to
        </p>
        <p className="mt-1 text-base font-bold" style={{ color: '#1F2937' }}>
          {countryCode} {maskedPhone}
        </p>
      </div>

      {/* OTP Input */}
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="mt-1"
      >
        <OTPInput value={otpValues} onChange={setOtpValues} length={OTP_LENGTH} />
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background : 'rgba(254,242,242,0.9)',
              border     : '1px solid rgba(239,68,68,0.2)',
            }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#EF4444" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8"  x2="12"    y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-[13px] font-medium" style={{ color: '#DC2626' }}>
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <RippleButton variant="primary" onClick={handleVerify} loading={loading}>
        {loading
          ? 'Verifying...'
          : isComplete
          ? 'Verify & Continue'
          : 'Enter code to continue'}
      </RippleButton>

      {/* Resend / Timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {canResend ? (
            <motion.button
              onClick={handleResend}
              className="text-[13px] font-semibold flex items-center gap-1.5"
              style={{ color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.03" />
              </svg>
              Resend OTP on WhatsApp
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative" style={{ width: 24, height: 24 }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"
                    fill="none" stroke="#F3F4F6" strokeWidth="2.5" />
                  <motion.circle
                    cx="12" cy="12" r="10"
                    fill="none" stroke="#25D366" strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 10}
                    strokeDashoffset={2 * Math.PI * 10 * (1 - timerProgress)}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  />
                </svg>
              </div>
              <span className="text-[13px] font-medium" style={{ color: '#6B7280' }}>
                Resend in{' '}
                <span className="font-bold" style={{ color: '#374151' }}>
                  {timerText}
                </span>
              </span>
            </div>
          )}
        </div>

        <motion.button
          onClick={onBack}
          className="text-[12px] font-medium"
          style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}
          whileHover={{ color: '#6B7280' }}
        >
          Wrong number?
        </motion.button>
      </div>
    </motion.div>
  );
}