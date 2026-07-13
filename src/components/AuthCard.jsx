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

export default function AuthCard({
  onAuthenticated,
  onSignupComplete,
  onFormRequired,
  initialFlow = null,
}) {
  const [flow, setFlow] = useState(initialFlow || 'initial');
  const [otpMode, setOtpMode] = useState('signup');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+966');

  useEffect(() => {
    if (initialFlow === 'signup_phone') {
      setOtpMode('signup');
      setFlow('signup_phone');
    }
  }, [initialFlow]);

  const handleSendOTP = (ph, cc) => {
    setPhone(ph);
    setCountryCode(cc);
    setFlow('otp');
  };

  const handleVerified = (data = {}) => {
    const { phoneVerified, formFilled } = data;

    if (otpMode === 'signup') {
      onSignupComplete?.({ phone, countryCode });
      return;
    }

    if (phoneVerified === true && formFilled === false) {
      onFormRequired?.({ phone, countryCode });
    } else {
      setFlow('success');
    }
  };

  const handleSuccessComplete = () => onAuthenticated?.();

  const getFlowLabel = () => {
    const labels = {
      initial: '',
      signup_oauth: 'Sign Up',
      login: 'Sign In',
      signup_phone: 'Phone',
      whatsapp_phone: 'WhatsApp',
      otp: 'Verify',
      success: 'Success',
    };
    return labels[flow];
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
      {/* ── Dark overlay for readability ── */}
      <div
        className="absolute inset-0"
        
      />

      {/* ── Auth Card ── */}
      <motion.div
        className="relative z-10 w-full overflow-hidden"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          maxWidth: '360px',
          borderRadius: '24px',
          padding: 'clamp(18px, 4vw, 28px) clamp(16px, 5vw, 28px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow:
            '0 20px 50px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* ── Flow Label Badge ── */}
        <AnimatePresence>
          {flow !== 'initial' && (
            <motion.div
              className="absolute top-4 right-4 z-20"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className="px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  background: 'rgba(162, 203, 139, 0.15)',
                  color: '#4f7d3d',
                  border: '1px solid rgba(162, 203, 139, 0.4)',
                }}
              >
                {getFlowLabel()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Logo ── */}
        <div className="relative z-10 mb-5">
          <Logo size="sm" />
        </div>

        {/* ── Divider ── */}
        <div
          className="relative z-10 mb-5 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.08) 70%, transparent)',
          }}
        />

        {/* ── Screens ── */}
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