import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

export default function RippleButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  loading = false,
  icon,
}) {
  const [ripples, setRipples] = useState([]);
  const btnRef = useRef(null);
  const rippleId = useRef(0);

  const handleClick = (e) => {
    if (disabled || loading) return;

    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleId.current++;

      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);
    }

    onClick?.();
  };

  const baseStyle = {
    width: '100%',
    height: '56px',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    position: 'relative',
    overflow: 'hidden',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    outline: 'none',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.25s ease',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '-0.01em',
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #A2CB8B 0%, #7FB068 60%, #6aa055 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 8px 24px rgba(162,203,139,0.45), 0 2px 8px rgba(0,0,0,0.1)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.96)',
      color: '#1F2937',
      border: '1.5px solid #E5E7EB',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    outline: {
      background: 'transparent',
      color: '#5a8a45',
      border: '2px solid #A2CB8B',
      boxShadow: 'none',
    },
  };

  const buttonStyle = {
    ...baseStyle,
    ...variantStyles[variant],
  };

  return (
    <motion.button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      style={buttonStyle}
      whileHover={!disabled && !loading ? { scale: 1.018, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <motion.span
            className="inline-block w-5 h-5 rounded-full border-2 border-current border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}

      {/* Ripple */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            background:
              variant === 'primary'
                ? 'rgba(255,255,255,0.4)'
                : 'rgba(162,203,139,0.35)',
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 15, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
      ))}

      {/* Shimmer only on primary */}
      {variant === 'primary' && !loading && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[14px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 50%, transparent 100%)',
            transform: 'translateX(-100%)',
          }}
          whileHover={{ transform: 'translateX(100%)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
}