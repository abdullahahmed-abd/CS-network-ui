import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

const colors = [
  '#A2CB8B', '#7FB068', '#C8E4B8',
  '#60B5FF', '#FFD700', '#FF6B8A',
  '#B8E6FF', '#FFB347', '#98D4A3',
  '#F0A8D0', '#87CEEB', '#FFC0CB',
];

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: 45 + (Math.random() - 0.5) * 20,
    y: 40,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 10 + 6,
    vx: (Math.random() - 0.5) * 250,
    vy: -(Math.random() * 200 + 80),
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 720,
    shape: ['rect', 'circle', 'triangle'][Math.floor(Math.random() * 3)],
    delay: Math.random() * 0.3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 50 }}>
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.shape === 'circle' ? piece.size : piece.size * 0.6,
            background: piece.color,
            borderRadius:
              piece.shape === 'circle' ? '50%' : piece.shape === 'rect' ? '2px' : '0',
            clipPath:
              piece.shape === 'triangle'
                ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                : 'none',
          }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: piece.rotation, scale: 1 }}
          animate={{
            opacity: [1, 1, 0],
            x: piece.vx,
            y: [0, piece.vy, -piece.vy * 0.3 + 300],
            rotate: piece.rotation + piece.rotationSpeed,
            scale: [1, 1, 0.5],
          }}
          transition={{
            duration: 2.5,
            delay: piece.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
}

export default function SuccessScreen({
  title = 'Welcome to Connect Souq!',
  subtitle = "You're all set. Connecting you to the marketplace...",
  onComplete,
}) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onComplete?.();
    }, 3500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center gap-8 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Confetti />

      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 140,
            height: 140,
            background: 'radial-gradient(circle, rgba(162,203,139,0.3) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {[0, 120, 240].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{ background: '#A2CB8B' }}
            animate={{ rotate: [angle, angle + 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
            transformTemplate={({ rotate }) =>
              `rotate(${rotate}) translateX(55px) rotate(-${rotate})`
            }
          />
        ))}

        <motion.div
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 96,
            height: 96,
            background: 'linear-gradient(135deg, #A2CB8B 0%, #7FB068 100%)',
            boxShadow: '0 16px 48px rgba(162,203,139,0.5), 0 4px 16px rgba(0,0,0,0.1)',
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
        >
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
            <motion.path
              d="M10 24L19 33L36 14"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#1F2937' }}>
          {title}
        </h2>
        <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
          {subtitle}
        </p>
      </motion.div>

      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ background: '#A2CB8B' }}
            animate={{ width: [8, 24, 8], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            initial={{ width: 8, height: 8 }}
          />
        ))}
      </motion.div>

      {[
        { x: -70, y: -30, delay: 0.3 },
        { x: 70, y: -40, delay: 0.5 },
        { x: -80, y: 20, delay: 0.7 },
        { x: 80, y: 30, delay: 0.4 },
      ].map((spark, i) => (
        <motion.div
          key={i}
          className="absolute text-xl pointer-events-none select-none"
          style={{
            left: `calc(50% + ${spark.x}px)`,
            top: `calc(50% + ${spark.y}px)`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0], rotate: [0, 180, 360] }}
          transition={{
            duration: 1.5,
            delay: spark.delay,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          ✨
        </motion.div>
      ))}
    </motion.div>
  );
}