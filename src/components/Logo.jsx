import { motion } from 'framer-motion';

export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg', sub: 'text-xs' },
    md: { icon: 42, text: 'text-2xl', sub: 'text-xs' },
    lg: { icon: 54, text: 'text-3xl', sub: 'text-sm' },
  };

  const s = sizes[size];

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <motion.div
        className="relative flex items-center justify-center rounded-2xl"
        style={{
          width: s.icon,
          height: s.icon,
          background: 'linear-gradient(135deg, #A2CB8B 0%, #7FB068 100%)',
          boxShadow: '0 8px 24px rgba(162, 203, 139, 0.45), 0 2px 8px rgba(0,0,0,0.1)',
        }}
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <svg
          width={s.icon * 0.55}
          height={s.icon * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.5 12L4 9.5L7 6.5L9.5 9L12 6.5L15 9.5L17.5 7L21 10.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 12L7 16L10 13L13 16L17 12L21 16"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2" fill="white" opacity="0.9" />
        </svg>
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 60%)',
          }}
        />
      </motion.div>

      <div className="text-center">
        <div
          className={`font-bold tracking-tight ${s.text} leading-none`}
          style={{
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #5a8a45 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Connect Souq
        </div>
        <div
          className={`${s.sub} font-medium mt-0.5`}
          style={{ color: '#9CA3AF', letterSpacing: '0.05em' }}
        >
          TRUSTED MARKETPLACE
        </div>
      </div>
    </motion.div>
  );
}