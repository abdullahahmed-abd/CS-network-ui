import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import SuccessScreen from './SuccessScreen';
import InitialScreen from '../screens/InitialScreen';
import SignUpOAuthScreen from '../screens/SignUpOAuthScreen';
import LoginScreen from '../screens/LoginScreen';
import PhoneScreen from '../screens/PhoneScreen';
import OTPScreen from '../screens/OTPScreen';
import UserProfileCompletion from './UserProfileCompletion';

export default function AuthCard({ onAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [flow, setFlow] = useState('initial');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [profileLoading, setProfileLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // 'A' = Google/Apple → phone verify, 'B' = WhatsApp direct
  const [authFlow, setAuthFlow] = useState('B');

  const [pendingUser, setPendingUser] = useState({
    userId: '',
    fullName: '',
    email: '',
    phone: '',
    isFormFill: false,
  });

  // ── Already logged in? ─────────────────────────────────────
  useEffect(() => {
    // Skip if URL has OAuth params or step param (let those effects handle it)
    const params = new URLSearchParams(location.search);
    if (
      params.get('step') === 'phone-verify' ||
      params.get('userId') ||
      params.get('phoneVerified')
    ) {
      return;
    }

    if (localStorage.getItem('cs_isLoggedIn') === 'true') {
      const raw = localStorage.getItem('cs_userData');
      if (raw) {
        try {
          const data = JSON.parse(raw);

          setPendingUser({
            userId: data.userId || '',
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            isFormFill: data.isFormFill || false,
          });

          if (data.isFormFill) {
            navigate('/dashboard', { replace: true });
          } else {
            setFlow('profile_completion');
          }
        } catch (e) {
          console.error('Failed to parse cs_userData:', e);
        }
      }
    }
  }, [navigate, location.search]);

  // ── Handle ?step=phone-verify (from OAuthCallback screen) ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('step') !== 'phone-verify') return;

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);

    const saved = sessionStorage.getItem('pending_google_user');
    if (!saved) {
      console.warn('No pending_google_user found in sessionStorage');
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      sessionStorage.removeItem('pending_google_user');

      setPendingUser({
        userId: parsed.userId || '',
        fullName: parsed.fullName || '',
        email: parsed.email || '',
        phone: '',
        isFormFill: parsed.isFormFill || false,
      });

      setAuthFlow('A');
      setFlow('signup_phone');
    } catch (e) {
      console.error('Parse error:', e);
    }
  }, [location.search]);

  // ── Handle OAuth params directly on / (fallback if no callback) ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const userId = params.get('userId');
    const phoneVerified = params.get('phoneVerified');
    const isFormFill = params.get('isFormFill');
    const errorParam = params.get('error');

    const fullName = params.get('fullName') || '';
    const email = params.get('email') || '';
    const accessToken = params.get('accessToken') || '';
    const refreshToken = params.get('refreshToken') || '';

    // Only trigger if OAuth params present
    if (!userId && !phoneVerified && !errorParam) return;

    // Clean URL immediately
    window.history.replaceState({}, '', window.location.pathname);

    if (errorParam) {
      setApiError(`Login failed: ${errorParam}`);
      return;
    }

    // Existing verified user
    if (phoneVerified === 'true' && userId) {
      if (accessToken) localStorage.setItem('cs_accessToken', accessToken);
      if (refreshToken) localStorage.setItem('cs_refreshToken', refreshToken);
      localStorage.setItem('cs_isLoggedIn', 'true');
      localStorage.setItem('cs_userId', String(userId));

      const userData = {
        userId: String(userId),
        fullName,
        email,
        phone: '',
        isFormFill: isFormFill === 'true',
      };
      localStorage.setItem('cs_userData', JSON.stringify(userData));
      setPendingUser(userData);

      if (isFormFill === 'true') {
        navigate('/dashboard', { replace: true });
      } else {
        setFlow('profile_completion');
      }
      return;
    }

    // New OAuth user → phone verification needed
    if (phoneVerified === 'false' && userId) {
      setPendingUser({
        userId: String(userId),
        fullName,
        email,
        phone: '',
        isFormFill: false,
      });
      setAuthFlow('A');
      setFlow('signup_phone');
    }
  }, [location.search, navigate]);

  // ── Phone submitted → OTP screen ───────────────────────────
  const handleSendOTP = (ph, cc) => {
    setPhone(ph);
    setCountryCode(cc);
    setPendingUser(prev => ({ ...prev, phone: `${cc}${ph}` }));
    setFlow('otp');
  };

  // ── OTP verified ───────────────────────────────────────────
  const handleVerified = (result) => {
    if (result?.userData) {
      setPendingUser(result.userData);
    }

    if (result?.isFormFill) {
      navigate('/dashboard', { replace: true });
    } else {
      setFlow('profile_completion');
    }
  };

  // ── Profile submitted ──────────────────────────────────────
  const handleProfileSubmit = () => {
    setFlow('success');
  };

  // ── Success done ───────────────────────────────────────────
  const handleSuccessComplete = () => {
    if (onAuthenticated) onAuthenticated();
    navigate('/dashboard', { replace: true });
  };

  const getFlowLabel = () =>
    ({
      initial: '',
      signup_oauth: 'Sign Up',
      login: 'Sign In',
      signup_phone: 'Phone',
      whatsapp_phone: 'WhatsApp',
      otp: 'Verify',
      profile_completion: 'Profile',
      success: 'Success',
    }[flow] || '');

  return (
    <motion.div
      className="relative w-full overflow-hidden"
      style={{
        maxWidth: '400px',
        borderRadius: '24px',
        padding: 'clamp(18px, 4vw, 28px) clamp(16px, 5vw, 28px)',
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow:
          '0 20px 50px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)',
      }}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.34, 1.1, 0.64, 1],
        delay: 0.2,
      }}
    >
      {/* Flow badge */}
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
                background: 'rgba(162,203,139,0.15)',
                color: '#4f7d3d',
                border: '1px solid rgba(162,203,139,0.4)',
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

      {/* API Error banner */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            className="relative z-10 mb-4 rounded-xl px-3 py-2.5 flex items-center gap-2"
            style={{
              background: 'rgba(254,242,242,0.9)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
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
              className="text-[13px] font-medium flex-1"
              style={{ color: '#DC2626' }}
            >
              {apiError}
            </span>
            <button
              onClick={() => setApiError('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#DC2626',
                fontSize: '16px',
                padding: 0,
                marginLeft: '4px',
              }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative z-10"
        style={{
          maxHeight: flow === 'initial' ? 'auto' : '560px',
          overflowY: flow === 'initial' ? 'visible' : 'auto',
          paddingRight: flow === 'initial' ? '0' : '8px',
        }}
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
                // Google/Apple redirect handles callback via /oauth-callback
                // This fires only for local dev/testing fallback
                setAuthFlow('A');
                setFlow('signup_phone');
              }}
            />
          )}

          {flow === 'login' && (
            <LoginScreen
              key="login"
              onBack={() => setFlow('initial')}
              onOAuthSuccess={() => {
                // Google redirect handles callback via /oauth-callback
              }}
              onWhatsApp={() => {
                setAuthFlow('B');
                setPendingUser({
                  userId: '',
                  fullName: '',
                  email: '',
                  phone: '',
                  isFormFill: false,
                });
                setFlow('whatsapp_phone');
              }}
            />
          )}

          {(flow === 'signup_phone' || flow === 'whatsapp_phone') && (
            <PhoneScreen
              key="phone"
              authFlow={authFlow}
              pendingUser={pendingUser}
              onBack={() =>
                flow === 'signup_phone'
                  ? setFlow('signup_oauth')
                  : setFlow('login')
              }
              onSendOTP={handleSendOTP}
            />
          )}

          {flow === 'otp' && (
            <OTPScreen
              key="otp"
              phone={phone}
              countryCode={countryCode}
              authFlow={authFlow}
              pendingUser={pendingUser}
              onBack={() =>
                authFlow === 'A'
                  ? setFlow('signup_phone')
                  : setFlow('whatsapp_phone')
              }
              onVerified={handleVerified}
            />
          )}

          {flow === 'profile_completion' && (
            <UserProfileCompletion
              key="profile_completion"
              initialName={pendingUser.fullName || ''}
              onSubmit={handleProfileSubmit}
              isLoading={profileLoading}
              setIsLoading={setProfileLoading}
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