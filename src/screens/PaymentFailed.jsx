import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle, ShieldX } from 'lucide-react';
import Backgroundimage from '../assets/image/Backgroundimg19.png';

export default function PaymentFailed({ onRetry, onBackToPlans }) {
  const [planName, setPlanName] = useState('');
  const [failReason, setFailReason] = useState('');

  useEffect(() => {
    const savedPlanName = localStorage.getItem('cs_pendingPlanName') || 'Selected';
    setPlanName(savedPlanName);

    // ✅ URL se failure reason read karo
    const params = new URLSearchParams(window.location.search);
    const reason =
      params.get('reason') ||
      params.get('error') ||
      params.get('message') ||
      '';

    if (reason) {
      setFailReason(decodeURIComponent(reason));
    }

    // ✅ URL clean karo
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <img
          src={Backgroundimage}
          alt="Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-gray-900/40 to-red-800/30" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-red-400/15"
            style={{
              width: 6 + Math.random() * 10,
              height: 6 + Math.random() * 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.15, 0.5, 0.15],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          {/* Failed Icon */}
          <div className="mb-6 flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 shadow-xl shadow-red-500/15">
                <XCircle className="h-14 w-14 text-red-500" strokeWidth={1.5} />
              </div>
              {/* Warning badge */}
              <motion.div
                className="absolute -right-2 -top-2"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: 'spring' }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 shadow-lg shadow-amber-400/40">
                  <AlertTriangle className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-2 text-center"
          >
            <h1 className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Payment Failed
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8 text-center text-gray-600"
          >
            Don't worry — no charges were made to your account
          </motion.p>

          {/* Failure details card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6 space-y-4 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-5"
          >
            {/* Plan info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-orange-400 shadow-md">
                  <ShieldX className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{planName} Plan</p>
                  <p className="text-xs text-gray-500">Payment not completed</p>
                </div>
              </div>
              <div className="rounded-full bg-red-100 px-3 py-1">
                <span className="text-xs font-bold text-red-600">Failed ✗</span>
              </div>
            </div>

            {/* Failure reason */}
            {failReason && (
              <>
                <div className="h-px bg-red-200" />
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-sm text-gray-700">{failReason}</p>
                </div>
              </>
            )}
          </motion.div>

          {/* Common reasons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8 rounded-2xl bg-gray-50 p-5"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Common reasons for failure
            </p>
            <div className="space-y-3">
              {[
                { icon: '💳', text: 'Insufficient funds or card limit reached' },
                { icon: '🚫', text: 'Payment was cancelled by user' },
                { icon: '🔒', text: 'Card declined by issuing bank' },
                { icon: '⏱️', text: 'Session timed out during checkout' },
                { icon: '🌐', text: 'Network connection interrupted' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="shrink-0 text-base">{item.icon}</span>
                  <p className="text-sm text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            {/* Retry Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRetry?.()}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-green-500/30 transition-all hover:shadow-green-500/40"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <RefreshCw className="h-5 w-5 transition-transform group-hover:rotate-180" style={{ transition: 'transform 0.5s' }} />
                Try Again
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-700 via-emerald-700 to-green-700"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>

            {/* Back to Plans */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onBackToPlans?.()}
              className="group w-full rounded-2xl border-2 border-gray-200 bg-white px-8 py-4 text-base font-bold text-gray-700 shadow-md transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg"
            >
              <span className="flex items-center justify-center gap-3">
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                Choose a Different Plan
              </span>
            </motion.button>
          </motion.div>

          {/* Help text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-400">
              Need help?{' '}
              <a
                href="mailto:support@connectsouq.com"
                className="font-semibold text-green-600 underline underline-offset-2 hover:text-green-700"
              >
                Contact Support
              </a>
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your payment info is never stored on our servers
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}