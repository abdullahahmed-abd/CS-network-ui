import { motion } from 'framer-motion';
import RippleButton from '../components/RippleButton';

export default function InitialScreen({ onSignUp, onLogin }) {
  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Tagline */}
      <motion.div
        className="text-center space-y-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <h1
          className="text-[22px] font-bold tracking-tight"
          style={{ color: '#1F2937' }}
        >
          Connect Buyers &amp; Sellers
        </h1>
        <p
          className="text-sm font-medium leading-relaxed"
          style={{ color: '#6B7280' }}
        >
          Join the trusted marketplace built for
          <br />
          secure business connections.
        </p>
      </motion.div>

      {/* Trust Badges */}
      <motion.div
        className="flex items-center justify-center gap-4 py-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[
          
        ].map((badge, i) => (
          <motion.div
            key={badge.label}
            className="flex flex-col items-center gap-0.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #f0fae9, #e8f5e0)',
                border: '1px solid rgba(162,203,139,0.3)',
              }}
            >
              {badge.icon}
            </div>
            <span
              className="text-[10px] font-medium"
              style={{ color: '#9CA3AF' }}
            >
              {badge.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="h-px mx-2"
        style={{
          background:
            'linear-gradient(90deg, transparent, #E5E7EB, transparent)',
        }}
      />

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <RippleButton variant="primary" onClick={onSignUp}>
          <span className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Create Account
          </span>
        </RippleButton>

        <RippleButton variant="secondary" onClick={onLogin}>
          <span className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F2937"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign In
          </span>
        </RippleButton>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="flex items-center justify-center gap-6 pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { value: '50K+', label: 'Businesses' },
          { value: '120+', label: 'Countries' },
          { value: '4.9★', label: 'Rating' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.08 }}
          >
            <span className="text-base font-bold" style={{ color: '#1F2937' }}>
              {stat.value}
            </span>
            <span
              className="text-[10px] font-medium"
              style={{ color: '#9CA3AF' }}
            >
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Terms */}
      <motion.p
        className="text-center text-[11px] leading-relaxed"
        style={{ color: '#9CA3AF' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        By continuing, you agree to our{' '}
        <motion.a
          href="#"
          className="font-semibold"
          style={{ color: '#A2CB8B' }}
          whileHover={{ color: '#7FB068' }}
          onClick={(e) => e.preventDefault()}
        >
          Terms
        </motion.a>{' '}
        &amp;{' '}
        <motion.a
          href="#"
          className="font-semibold"
          style={{ color: '#A2CB8B' }}
          whileHover={{ color: '#7FB068' }}
          onClick={(e) => e.preventDefault()}
        >
          Privacy Policy
        </motion.a>
      </motion.p>
    </motion.div>
  );
}