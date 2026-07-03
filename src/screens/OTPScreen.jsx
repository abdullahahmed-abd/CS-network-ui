import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import OTPInput from '../components/OTPInput';
import RippleButton from '../components/RippleButton';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const DEMO_OTP = '123456';

export default function OTPScreen({
  phone,
  countryCode,
  onBack,
  onVerified,
  mode,
}) {
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const otpString = otpValues.join('');
  const isComplete = otpValues.every((v) => v !== '');
  const channel = mode === 'whatsapp' ? 'WhatsApp' : 'SMS';

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleVerify = useCallback(() => {
    if (loading) return;

    if (otpString.length < OTP_LENGTH) {
      setError('Please enter all 6 digits');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      if (otpString === DEMO_OTP) {
        onVerified();
      } else {
        setError('Invalid code. Use 123456 for demo.');
        triggerShake();
        setOtpValues(Array(OTP_LENGTH).fill(''));
      }
    }, 1200);
  }, [otpString, loading, onVerified]);

  // Auto verify when all filled
  useEffect(() => {
    if (isComplete && !loading) {
      const timer = setTimeout(handleVerify, 350);
      return () => clearTimeout(timer);
    }
  }, [isComplete, loading, handleVerify]);

  const handleResend = () => {
    if (!canResend) return;
    setSecondsLeft(RESEND_SECONDS);
    setCanResend(false);
    setOtpValues(Array(OTP_LENGTH).fill(''));
    setError('');
  };

  const maskedPhone =
    phone.length > 4
      ? phone.slice(0, -4).replace(/\d/g, '•') + phone.slice(-4)
      : phone;

  // Timer formatting
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const timerProgress = secondsLeft / RESEND_SECONDS;

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Back Button */}
      <motion.button
        onClick={onBack}
        className="self-start flex items-center gap-1.5 text-sm font-medium"
        style={{
          color: '#6B7280',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
        }}
        whileHover={{ x: -3, color: '#5A8A45' }}
        whileTap={{ scale: 0.97 }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      {/* Title */}
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: '#1F2937' }}
        >
          Enter verification code
        </h2>

        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: '#6B7280' }}
        >
          We sent a 6-digit code via{' '}
          <span className="font-semibold" style={{ color: '#374151' }}>
            {channel}
          </span>{' '}
          to
        </p>

        <p
          className="mt-1 text-base font-bold"
          style={{ color: '#1F2937' }}
        >
          {countryCode} {maskedPhone}
        </p>
      </div>

      {/* OTP Input */}
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="mt-1"
      >
        <OTPInput
          value={otpValues}
          onChange={setOtpValues}
          length={OTP_LENGTH}
        />
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background: 'rgba(254,242,242,0.9)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>

            <span
              className="text-[13px] font-medium"
              style={{ color: '#DC2626' }}
            >
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify Button */}
      <RippleButton
        variant="primary"
        onClick={handleVerify}
        loading={loading}
      >
        {loading
          ? 'Verifying...'
          : isComplete
          ? 'Verify & Continue'
          : 'Enter code to continue'}
      </RippleButton>

      {/* Timer / Resend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {canResend ? (
            <motion.button
              onClick={handleResend}
              className="text-[13px] font-semibold flex items-center gap-1.5"
              style={{
                color: '#5A8A45',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.03" />
              </svg>
              Resend Code
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              {/* Mini circular timer */}
              <div className="relative" style={{ width: 24, height: 24 }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="2.5"
                  />

                  <motion.circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#A2CB8B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 10}
                    strokeDashoffset={
                      2 * Math.PI * 10 * (1 - timerProgress)
                    }
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center',
                    }}
                  />
                </svg>
              </div>

              <span
                className="text-[13px] font-medium"
                style={{ color: '#6B7280' }}
              >
                Resend in{' '}
                <span
                  className="font-bold"
                  style={{ color: '#374151' }}
                >
                  {timerText}
                </span>
              </span>
            </div>
          )}
        </div>

        <motion.button
          onClick={onBack}
          className="text-[12px] font-medium"
          style={{
            color: '#9CA3AF',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          whileHover={{ color: '#6B7280' }}
        >
          Wrong number?
        </motion.button>
      </div>

      {/* Demo Hint */}
      <motion.div
        className="rounded-xl px-3.5 py-2.5 flex items-center gap-2"
        style={{
          background: 'rgba(255,251,235,0.9)',
          border: '1px solid rgba(245,158,11,0.2)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D97706"
          strokeWidth="2"
          className="shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>

        <p
          className="text-[12px] font-medium"
          style={{ color: '#92400E' }}
        >
          Demo:{' '}
          <code
            className="font-mono font-bold px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(245,158,11,0.12)' }}
          >
            123456
          </code>
        </p>
      </motion.div>
    </motion.div>
  );
}