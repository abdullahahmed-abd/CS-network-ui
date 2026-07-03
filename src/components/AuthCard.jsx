import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Logo from './Logo';
import SuccessScreen from './SuccessScreen';
import InitialScreen from '../screens/InitialScreen';
import SignUpOAuthScreen from '../screens/SignUpOAuthScreen';
import LoginScreen from '../screens/LoginScreen';
import PhoneScreen from '../screens/PhoneScreen';
import OTPScreen from '../screens/OTPScreen';

export default function AuthCard({ onAuthenticated }) {
  const [flow, setFlow] = useState('initial');
  const [otpMode, setOtpMode] = useState('signup');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+966');

  const handleSendOTP = (ph, cc) => {
    setPhone(ph);
    setCountryCode(cc);
    setFlow('otp');
  };

  const handleVerified = () => setFlow('success');
  const handleSuccessComplete = () => onAuthenticated();

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
    <motion.div
      className="relative w-full overflow-hidden"
      style={{
        maxWidth: '360px', // reduced from 440px
        borderRadius: '24px',
        padding: 'clamp(18px, 4vw, 28px) clamp(16px, 5vw, 28px)', // reduced padding
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.14) 48%, rgba(255,255,255,0.20) 100%)',
        backdropFilter: 'blur(5px) saturate(120%)',
        WebkitBackdropFilter: 'blur(5px) saturate(120%)',
        border: '1px solid rgba(255,255,255,0.42)',
        boxShadow:
          '0 20px 50px rgba(0, 0, 0, 0.10), 0 8px 24px rgba(96, 181, 255, 0.08), inset 0 1px 0 rgba(255,255,255,0.45)',
      }}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.34, 1.1, 0.64, 1],
        delay: 0.2,
      }}
    >
      {/* Soft glass overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 55%, rgba(255,255,255,0.10) 100%)',
        }}
      />

      {/* Corner highlight */}
      <div
        className="absolute -top-16 -right-16 pointer-events-none"
        style={{
          width: '180px',
          height: '180px',
          borderRadius: '999px',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)',
        }}
      />

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-[24px]"
        style={{
          background:
            'linear-gradient(90deg, #A2CB8B 0%, #7FB068 40%, #60B5FF 70%, #A2CB8B 100%)',
          backgroundSize: '200% 100%',
          animation: 'gradient-shift 4s ease infinite',
        }}
      />

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
                background: 'rgba(255,255,255,0.35)',
                color: '#4f7d3d',
                border: '1px solid rgba(255,255,255,0.45)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            >
              {getFlowLabel()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mb-5">
        <Logo size="sm" /> {/* reduced logo size */}
      </div>

      <div
        className="relative z-10 mb-5 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.75) 30%, rgba(255,255,255,0.75) 70%, transparent)',
        }}
      />

      <div
        className="relative z-10"
        style={{ minHeight: flow === 'initial' ? 'auto' : '260px' }} // slightly reduced minHeight
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
              onOAuthSuccess={() => {
                setOtpMode('signup');
                setFlow('signup_phone');
              }}
            />
          )}

          {flow === 'login' && (
            <LoginScreen
              key="login"
              onBack={() => setFlow('initial')}
              onOAuthSuccess={() => setFlow('success')}
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
  );
}