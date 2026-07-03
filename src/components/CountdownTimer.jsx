import { motion } from 'framer-motion';

export default function CountdownTimer({ seconds, totalSeconds }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / totalSeconds;
  const dashOffset = circumference * (1 - progress);

  const color =
    seconds > totalSeconds * 0.5
      ? '#A2CB8B'
      : seconds > totalSeconds * 0.25
      ? '#F59E0B'
      : '#EF4444';

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="3"
          />
          <motion.circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            initial={false}
            animate={{ strokeDashoffset: dashOffset, stroke: color }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <span
          className="absolute font-bold text-[13px]"
          style={{ color, fontVariantNumeric: 'tabular-nums' }}
        >
          {seconds}
        </span>
      </div>
      <span className="text-sm font-medium" style={{ color: '#6B7280' }}>
        Resend in {seconds}s
      </span>
    </div>
  );
}