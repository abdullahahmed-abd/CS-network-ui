import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing your login...');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const userId = params.get('userId');
    const phoneVerified = params.get('phoneVerified');
    const isFormFill = params.get('isFormFill');
    const errorParam = params.get('error');

    const fullName = params.get('fullName') || '';
    const email = params.get('email') || '';
    const accessToken = params.get('accessToken') || '';
    const refreshToken = params.get('refreshToken') || '';

    if (errorParam) {
      setError(`Login failed: ${errorParam}`);
      setTimeout(() => navigate('/', { replace: true }), 2200);
      return;
    }

    if (!userId || phoneVerified === null) {
      setError('Invalid callback response. Redirecting...');
      setTimeout(() => navigate('/', { replace: true }), 2200);
      return;
    }

    // Existing verified user
    if (phoneVerified === 'true') {
      setStatus('Welcome back! Setting up your account...');

      if (accessToken) {
        localStorage.setItem('cs_accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('cs_refreshToken', refreshToken);
      }

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

      setTimeout(() => {
        if (isFormFill === 'true') {
          navigate('/plans', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 900);

      return;
    }

    // New OAuth user → phone verification needed
    if (phoneVerified === 'false') {
      setStatus('Phone verification required...');

      const pendingUser = {
        userId: String(userId),
        fullName,
        email,
        phone: '',
        isFormFill: isFormFill === 'true',
      };

      sessionStorage.setItem(
        'pending_google_user',
        JSON.stringify(pendingUser)
      );

      setTimeout(() => {
        navigate('/?step=phone-verify', { replace: true });
      }, 700);

      return;
    }

    setError('Unexpected login response. Redirecting...');
    setTimeout(() => navigate('/', { replace: true }), 2200);
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'radial-gradient(circle at top, rgba(162,203,139,0.18), transparent 35%), linear-gradient(180deg, #f8fafc 0%, #eef5ea 100%)',
      }}
    >
      <motion.div
        className="w-full max-w-[400px] rounded-[24px] border p-8 text-center"
        style={{
          background: '#ffffff',
          borderColor: 'rgba(0,0,0,0.08)',
          boxShadow:
            '0 20px 50px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)',
        }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="flex justify-center mb-6">
          <Logo size="sm" />
        </div>

        {error ? (
          <motion.div
            className="rounded-2xl px-4 py-4"
            style={{
              background: 'rgba(254,242,242,0.9)',
              border: '1px solid rgba(239,68,68,0.18)',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-center mb-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.12)' }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>

            <h2
              className="text-[18px] font-bold mb-1"
              style={{ color: '#1F2937' }}
            >
              Authentication Error
            </h2>
            <p className="text-[13px]" style={{ color: '#DC2626' }}>
              {error}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-center mb-5">
              <div className="relative w-14 h-14">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '3px solid rgba(162,203,139,0.18)',
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '3px solid transparent',
                    borderTopColor: '#A2CB8B',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h2
                className="text-[20px] font-bold tracking-tight mb-2"
                style={{ color: '#1F2937' }}
              >
                Signing you in
              </h2>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: '#6B7280' }}
              >
                {status}
              </p>
            </motion.div>

            <motion.div
              className="mt-6 rounded-2xl px-4 py-3"
              style={{
                background:
                  'linear-gradient(135deg, rgba(162,203,139,0.08), rgba(96,181,255,0.08))',
                border: '1px solid rgba(162,203,139,0.18)',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <p
                className="text-[12px] font-medium"
                style={{ color: '#6B7280' }}
              >
                Please wait while we securely connect your account.
              </p>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}