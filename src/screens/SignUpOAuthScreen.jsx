import { motion } from 'framer-motion';
import OAuthButtons from '../components/OAuthButtons';

export default function SignUpOAuthScreen({ onBack, onOAuthSuccess }) {
  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Back button */}
      <motion.button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium self-start"
        style={{
          color: '#6B7280',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        whileHover={{ x: -3, color: '#A2CB8B' }}
        transition={{ duration: 0.2 }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      {/* Header */}
      <div className="space-y-1">
        <motion.h2
          className="text-xl font-bold tracking-tight"
          style={{ color: '#1F2937' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Create Account
        </motion.h2>
        <motion.p
          className="text-[13px] font-medium"
          style={{ color: '#6B7280' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Choose how you'd like to join Connect Souq
        </motion.p>
      </div>

      {/* Info Banner */}
      <motion.div
        className="rounded-[14px] px-4 py-3 flex items-start gap-3"
        style={{
          background: 'linear-gradient(135deg, #f0fae9, #e8f5e0)',
          border: '1px solid rgba(162,203,139,0.4)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-lg mt-0.5">ℹ️</span>
        <div>
          <p
            className="text-[13px] font-semibold"
            style={{ color: '#3d6b2d' }}
          >
            Quick & Secure Sign Up
          </p>
          <p
            className="text-[12px] mt-0.5 leading-relaxed"
            style={{ color: '#5a8a45' }}
          >
            After OAuth, you'll verify your phone number to complete
            registration.
          </p>
        </div>
      </motion.div>

      {/* OAuth Buttons */}
      <OAuthButtons
        showWhatsApp={false}
        onGoogle={onOAuthSuccess}
        onApple={onOAuthSuccess}
      />

      {/* Security note */}
      <motion.div
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span
          className="text-[12px] font-medium"
          style={{ color: '#9CA3AF' }}
        >
          256-bit SSL encrypted · Your data is safe
        </span>
      </motion.div>
    </motion.div>
  );
}