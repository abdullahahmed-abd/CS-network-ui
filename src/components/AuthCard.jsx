import Backgroundimage from '../assets/image/Backgroundimg19.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import SuccessScreen from './SuccessScreen';
import InitialScreen from '../screens/InitialScreen';
import SignUpOAuthScreen from '../screens/SignUpOAuthScreen';
import LoginScreen from '../screens/LoginScreen';
import PhoneScreen from '../screens/PhoneScreen';
import OTPScreen from '../screens/OTPScreen';
import { saveUserData, getUserData, setItem, getItem } from '../api/auth';

export default function AuthCard({
  onAuthenticated,
  onSignupComplete,
  onFormRequired,
  initialFlow = null,
}) {
  const [flow, setFlow]               = useState(initialFlow || 'initial');
  const [otpMode, setOtpMode]         = useState('signup');
  const [phone, setPhone]             = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [hasInvite, setHasInvite]     = useState(false);

  // ── Check for pending invite (NO API call — just check localStorage) ──
  useEffect(() => {
    const pendingToken = getItem('pendingInviteToken');
    if (pendingToken) {
      console.log('📨 Pending invite token found — showing banner');
      setHasInvite(true);
    }
  }, []);

  useEffect(() => {
    if (initialFlow === 'signup_phone') {
      setOtpMode('signup');
      setFlow('signup_phone');
    } else if (initialFlow === 'invite') {
      setFlow('initial');
    }
  }, [initialFlow]);

  const handleSendOTP = (ph, cc) => {
    setPhone(ph);
    setCountryCode(cc);
    setFlow('otp');
  };

  const handleVerified = async (data = {}) => {
    const { phoneVerified, formFilled, roles = [], userId } = data;
    console.log('✅ handleVerified →', { phoneVerified, formFilled, roles, otpMode });

    // ── GLOBAL_ADMIN ──
    if (roles.includes('GLOBAL_ADMIN')) {
      console.log('🛡️ GLOBAL_ADMIN detected');
      const currentUser = getUserData() || {};
      saveUserData({
        ...currentUser, roles,
        phoneVerified: true, formFilled: true,
        ...(userId && { userId }),
      });
      setItem('formFilled', 'true');
      setItem('phoneVerified', 'true');
      onAuthenticated?.();
      return;
    }

    // ── Signup flow ──
    if (otpMode === 'signup') {
      onSignupComplete?.({ phone, countryCode });
      return;
    }

    // ── Login / WhatsApp flow ──
    if (phoneVerified === true && formFilled === false) {
      onFormRequired?.({ phone, countryCode });
    } else if (phoneVerified === true && formFilled === true) {
      setFlow('success');
    } else {
      setFlow('success');
    }
  };

  const handleSuccessComplete = () => onAuthenticated?.();

  const getFlowLabel = () => {
    const labels = {
      initial: '', signup_oauth: 'Sign Up', login: 'Sign In',
      signup_phone: 'Phone', whatsapp_phone: 'WhatsApp',
      otp: 'Verify', success: 'Success',
    };
    return labels[flow] || '';
  };

  return (
    <div
      className="relative flex items-center justify-center w-full"
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${Backgroundimage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0" />

      <motion.div
        className="relative z-10 w-full overflow-hidden"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          maxWidth: '360px', borderRadius: '24px',
          padding: 'clamp(18px, 4vw, 28px) clamp(16px, 5vw, 28px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Flow Label Badge */}
        <AnimatePresence>
          {flow !== 'initial' && (
            <motion.div
              className="absolute top-4 right-4 z-20"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
            >
              <div
                className="px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  background: 'rgba(162, 203, 139, 0.15)',
                  color: '#4f7d3d',
                  border: '1px solid rgba(162, 203, 139, 0.4)',
                }}
              >{getFlowLabel()}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Invitation Banner (NO API call — just shows if token exists) ── */}
        <AnimatePresence>
          {hasInvite && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
              style={{
                background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                borderRadius: 14,
                padding: '16px 18px',
                border: '1px solid #BBF7D0',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #16A34A, #15803D)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(22,163,74,0.25)',
                }}>
                  📨
                </div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 800, color: '#166534',
                    lineHeight: 1.3,
                  }}>
                    You've been invited!
                  </div>
                  <div style={{
                    fontSize: 12, color: '#15803D', fontWeight: 500,
                    lineHeight: 1.4, marginTop: 4,
                  }}>
                    You have a pending invitation to join Connect Souq. 
                    Please sign up or login to view and accept it.
                  </div>
                </div>
              </div>

              {/* Arrow indicator */}
              <div style={{
                marginTop: 12,
                padding: '8px 14px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 10,
                border: '1px solid rgba(22,163,74,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#16A34A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', fontWeight: 800,
                  flexShrink: 0,
                }}>
                  1
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: '#166534',
                }}>
                  Sign up or Login below to continue
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo */}
        <div className="relative z-10 mb-5">
          <Logo size="sm" />
        </div>

        {/* Divider */}
        <div
          className="relative z-10 mb-5 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.08) 70%, transparent)',
          }}
        />

        {/* Screens */}
        <div
          className="relative z-10"
          style={{ minHeight: flow === 'initial' ? 'auto' : '260px' }}
        >
          <AnimatePresence mode="wait">

            {flow === 'initial' && (
              <InitialScreen
                key="initial"
                onSignUp={() => setFlow('signup_oauth')}
                onLogin={() => setFlow('login')}
              />
            )}

            {flow === 'signup_oauth' && (
              <SignUpOAuthScreen
                key="signup_oauth"
                onBack={() => setFlow('initial')}
              />
            )}

            {flow === 'login' && (
              <LoginScreen
                key="login"
                onBack={() => setFlow('initial')}
                onWhatsApp={() => {
                  setOtpMode('whatsapp');
                  setFlow('whatsapp_phone');
                }}
              />
            )}

            {(flow === 'signup_phone' || flow === 'whatsapp_phone') && (
              <PhoneScreen
                key="phone"
                onBack={() =>
                  flow === 'signup_phone'
                    ? setFlow('signup_oauth')
                    : setFlow('login')
                }
                onSendOTP={handleSendOTP}
                mode={flow === 'whatsapp_phone' ? 'whatsapp' : 'signup'}
              />
            )}

            {flow === 'otp' && (
              <OTPScreen
                key="otp"
                phone={phone}
                countryCode={countryCode}
                onBack={() =>
                  otpMode === 'signup'
                    ? setFlow('signup_phone')
                    : setFlow('whatsapp_phone')
                }
                onVerified={handleVerified}
                mode={otpMode}
              />
            )}

            {flow === 'success' && (
              <SuccessScreen
                key="success"
                title="Welcome to Connect Souq!"
                subtitle="Connecting you to the marketplace..."
                onComplete={handleSuccessComplete}
              />
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}