import { motion } from 'framer-motion';
import OAuthButtons from '../components/OAuthButtons';

export default function LoginScreen({ onBack, onOAuthSuccess, onWhatsApp }) {
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
          Welcome Back 👋
        </motion.h2>
        <motion.p
          className="text-[13px] font-medium"
          style={{ color: '#6B7280' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Sign in to your Connect Souq account
        </motion.p>
      </div>

      {/* Quick login methods */}
      <motion.div
        className="grid grid-cols-3 gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[12px] px-3 py-2.5 text-center"
            style={{
              background: 'linear-gradient(135deg, #f8f9fa, #f0f9ea)',
              border: '1px solid rgba(162,203,139,0.25)',
            }}
          >
            <div className="text-lg mb-0.5">{item.icon}</div>
            <div
              className="text-[11px] font-bold"
              style={{ color: '#1F2937' }}
            >
              {item.label}
            </div>
            <div className="text-[10px]" style={{ color: '#9CA3AF' }}>
              {item.desc}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
        <span
          className="text-[12px] font-medium"
          style={{ color: '#9CA3AF' }}
        >
          Choose sign-in method
        </span>
        <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
      </div>

      {/* OAuth Buttons */}
      <OAuthButtons
        showWhatsApp={true}
        onGoogle={onOAuthSuccess}
        onApple={onOAuthSuccess}
        onWhatsApp={onWhatsApp}
      />

      {/* Security note */}
      <motion.div
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
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
          Protected by enterprise-grade security
        </span>
      </motion.div>

      {/* Don't have account */}
      <motion.p
        className="text-center text-[12px]"
        style={{ color: '#9CA3AF' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        New to Connect Souq?{' '}
        <motion.button
          onClick={onBack}
          className="font-semibold"
          style={{
            color: '#A2CB8B',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          whileHover={{ color: '#7FB068' }}
        >
          Create an account
        </motion.button>
      </motion.p>
    </motion.div>
  );
}