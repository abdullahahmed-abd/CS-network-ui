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
        maxWidth: '360px',
        borderRadius: '24px',
        padding: 'clamp(18px, 4vw, 28px) clamp(16px, 5vw, 28px)',
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow:
          '0 20px 50px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.06)',
      }}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.34, 1.1, 0.64, 1],
        delay: 0.2,
      }}
    >
      {/* Top accent bar */}
      {/* <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-[24px]"
        style={{
          background:
            'linear-gradient(90deg, #A2CB8B 100%, #7FB068 100%, #60B5FF 70%, #A2CB8B 100%)',
          backgroundSize: '200% 100%',
          animation: 'gradient-shift 4s ease infinite',
        }}
      /> */}

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

      <div className="relative z-10 mb-5">
        <Logo size="sm" />
      </div>

      <div
        className="relative z-10 mb-5 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.08) 70%, transparent)',
        }}
      />

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