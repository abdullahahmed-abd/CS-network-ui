import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function OAuthButton({ provider, onClick, disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [ripples, setRipples] = useState([]);
  const rippleId = useRef(0);

  const config = {
    google: {
      label: 'Continue with Google',
      icon: <GoogleIcon />,
      hoverBorder: '#4285F4',
      hoverBg: '#f8f9ff',
    },
    apple: {
      label: 'Continue with Apple',
      icon: <AppleIcon />,
      hoverBorder: '#1F2937',
      hoverBg: '#f8f8f8',
    },
    whatsapp: {
      label: 'Continue with WhatsApp',
      icon: <WhatsAppIcon />,
      hoverBorder: '#25D366',
      hoverBg: '#f0fff6',
    },
  };

  const c = config[provider];

  const handleClick = (e) => {
    if (disabled || loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = rippleId.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClick();
    }, 950);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      className="relative w-full h-[54px] rounded-[14px] flex items-center justify-center gap-3 overflow-hidden"
      style={{
        background: '#fff',
        border: '1.5px solid #E5E7EB',
        fontFamily: 'Inter, sans-serif',
        fontSize: '15px',
        fontWeight: 500,
        color: '#1F2937',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
      whileHover={
        !disabled && !loading
          ? {
              scale: 1.015,
              y: -2,
              borderColor: c.hoverBorder,
              backgroundColor: c.hoverBg,
              boxShadow: '0 6px 20px rgba(0,0,0,0.09)',
            }
          : {}
      }
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {loading ? (
        <motion.span
          className="inline-block w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-700"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <span className="flex-shrink-0">{c.icon}</span>
      )}
      <span>{loading ? 'Connecting...' : c.label}</span>

      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: r.x - 10,
            top: r.y - 10,
            width: 20,
            height: 20,
            background: 'rgba(162,203,139,0.3)',
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 14, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
      ))}
    </motion.button>
  );
}

export default function OAuthButtons({
  showWhatsApp = false,
  onGoogle,
  onApple,
  onWhatsApp,
  disabled = false,
}) {
  return (
    <motion.div
      className="flex flex-col gap-3 w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}
    >
      <OAuthButton provider="google" onClick={onGoogle} disabled={disabled} />
      <OAuthButton provider="apple" onClick={onApple} disabled={disabled} />
      {showWhatsApp && onWhatsApp && (
        <OAuthButton provider="whatsapp" onClick={onWhatsApp} disabled={disabled} />
      )}
    </motion.div>
  );
}