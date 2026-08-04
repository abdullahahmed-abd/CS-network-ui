// ══════════════════════════════════════════════════════════
// BusinessPartnerStatusModal.jsx
// Place at: src/components/businesspartner/BusinessPartnerStatusModal.jsx
// ══════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle2, XCircle, Shield, Sparkles,
  ArrowRight, RefreshCw, Loader2, X, Building2,
  Zap, Star, AlertCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING: {
    emoji: '⏳',
    title: 'Approval Pending',
    subtitle: 'Your application is under review',
    description:
      'Your Business Partner application has been sent to the Franchise Operator. Please wait for their approval. You will be notified once a decision is made.',
    gradientBar: 'from-amber-400 via-orange-500 to-yellow-500',
    iconBg: 'from-amber-400 to-orange-500',
    cardBg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    titleColor: 'text-amber-800',
    subColor: 'text-amber-600',
    btnGradient: 'from-amber-500 via-orange-500 to-amber-600',
    btnShadow: 'shadow-amber-400/40',
    pulseColor: 'bg-amber-400',
    accentColor: 'amber',
  },
  APPROVED: {
    emoji: '🎉',
    title: 'Application Approved!',
    subtitle: 'Welcome aboard, Business Partner!',
    description:
      'Your Franchise Operator has approved your Business Partner application. You now have full access to your Business Partner dashboard.',
    gradientBar: 'from-green-400 via-emerald-500 to-teal-500',
    iconBg: 'from-green-400 to-emerald-500',
    cardBg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    titleColor: 'text-green-800',
    subColor: 'text-green-600',
    btnGradient: 'from-green-500 via-emerald-600 to-green-600',
    btnShadow: 'shadow-green-400/40',
    pulseColor: 'bg-green-400',
    accentColor: 'green',
  },
  REJECTED: {
    emoji: '😔',
    title: 'Application Rejected',
    subtitle: 'Your application was not approved',
    description:
      'Unfortunately, the Franchise Operator has rejected your Business Partner application. You can go back to sign up with a different role.',
    gradientBar: 'from-red-400 via-rose-500 to-pink-500',
    iconBg: 'from-red-400 to-rose-500',
    cardBg: 'from-red-50 to-rose-50',
    border: 'border-red-200',
    titleColor: 'text-red-800',
    subColor: 'text-red-600',
    btnGradient: 'from-red-500 via-rose-500 to-red-600',
    btnShadow: 'shadow-red-400/40',
    pulseColor: 'bg-red-400',
    accentColor: 'red',
  },
};

/* ── Confetti (Approved only) ── */
function Confetti() {
  const items = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    dur: 2.5 + Math.random() * 2.5,
    size: 5 + Math.random() * 8,
    color: ['#10b981','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#ec4899'][i % 6],
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: -12, width: p.size, height: p.size, background: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: 720 * (Math.random() > .5 ? 1 : -1), x: (Math.random() - .5) * 120 }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, repeatDelay: Math.random() * 2, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

/* ── Floating orbs ── */
function Orbs({ accentColor }) {
  const cls = {
    amber: 'from-amber-300/25 to-orange-300/10',
    green: 'from-green-300/25 to-emerald-300/10',
    red:   'from-red-300/25 to-rose-300/10',
  }[accentColor] || 'from-gray-300/20 to-gray-200/10';
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      <motion.div
        className={`absolute -left-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br ${cls} blur-2xl`}
        animate={{ scale: [1,1.3,1], x: [0,25,0], y: [0,15,0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br ${cls} blur-2xl`}
        animate={{ scale: [1.3,1,1.3], x: [0,-25,0], y: [0,-15,0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function BusinessPartnerStatusModal({
  status,
  isOpen,
  franchiseName = '',
  onClose,           // PENDING → close (modal reappears on next login)
  onGoToDashboard,   // APPROVED → go to BP dashboard
  onBackToSignup,    // REJECTED → back to signup
  onRefreshStatus,   // optional → check status from backend
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible]       = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  useEffect(() => {
    if (isOpen) setTimeout(() => setVisible(true), 200);
    else setVisible(false);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleRefresh = useCallback(async () => {
    if (!onRefreshStatus || refreshing) return;
    setRefreshing(true);
    try {
      const res = await onRefreshStatus();
      if (res && String(res).toUpperCase() === 'APPROVED') {
        onGoToDashboard?.();
      }
    } finally {
      setTimeout(() => setRefreshing(false), 800);
    }
  }, [onRefreshStatus, refreshing, onGoToDashboard]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 999999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status === 'PENDING' ? onClose : undefined}
          />

          {status === 'APPROVED' && <Confetti />}

          {/* Modal card */}
          <motion.div
            className={`relative w-full max-w-md overflow-hidden rounded-3xl border-2 ${cfg.border} bg-white shadow-2xl`}
            initial={{ opacity: 0, scale: 0.75, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 50 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.08 }}
          >
            <Orbs accentColor={cfg.accentColor} />

            {/* Close (PENDING only) */}
            {status === 'PENDING' && onClose && (
              <motion.button
                onClick={onClose}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-all"
              >
                <X className="h-4 w-4 text-gray-500" />
              </motion.button>
            )}

            {/* Animated top bar */}
            <div className={`relative h-1.5 bg-gradient-to-r ${cfg.gradientBar}`}>
              {status === 'PENDING' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </div>

            {/* Body */}
            <div className="relative px-8 pb-8 pt-8 sm:px-10 sm:pb-10">
              {/* Emoji icon */}
              <motion.div
                className="mx-auto mb-6 flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.25 }}
              >
                <div className="relative">
                  <div className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${cfg.iconBg} shadow-2xl`}>
                    <span className="text-5xl">{cfg.emoji}</span>
                  </div>
                  {status === 'PENDING' && (
                    <>
                      <motion.div
                        className={`absolute inset-0 rounded-3xl ${cfg.pulseColor} opacity-40`}
                        animate={{ scale: [1, 1.45], opacity: [0.4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className={`absolute inset-0 rounded-3xl ${cfg.pulseColor} opacity-30`}
                        animate={{ scale: [1, 1.7], opacity: [0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      />
                    </>
                  )}
                  {status === 'APPROVED' && (
                    <motion.div
                      className="absolute -right-3 -top-3"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="h-8 w-8 text-yellow-400 drop-shadow-lg" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Text */}
              <AnimatePresence>
                {visible && (
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-center"
                  >
                    <h2 className={`mb-1.5 text-2xl font-black ${cfg.titleColor} sm:text-3xl`}>
                      {cfg.title}
                    </h2>
                    <p className={`mb-4 text-sm font-bold ${cfg.subColor}`}>
                      {cfg.subtitle}
                    </p>

                    {/* Franchise badge */}
                    {franchiseName && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45 }}
                        className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border-2 border-gray-200/70 bg-white/90 px-4 py-2 shadow-md"
                      >
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-700">{franchiseName}</span>
                      </motion.div>
                    )}

                    {/* Description */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className={`mx-auto mb-8 max-w-sm rounded-2xl border-2 ${cfg.border} bg-gradient-to-br ${cfg.cardBg} p-4`}
                    >
                      <p className={`text-sm font-semibold leading-relaxed ${cfg.titleColor}`}>
                        {cfg.description}
                      </p>
                    </motion.div>

                    {/* ══ PENDING actions ══ */}
                    {status === 'PENDING' && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-3"
                      >
                        {/* Progress steps */}
                        <div className="mx-auto mb-6 flex max-w-xs items-center">
                          {/* Step 1 — done */}
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 shadow-md">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-[10px] font-bold text-green-600">Submitted</span>
                          </div>

                          {/* Connector 1 */}
                          <div className="relative mx-2 mb-4 h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                            <motion.div
                              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                              animate={{ width: ['15%','85%','15%'] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          </div>

                          {/* Step 2 — active */}
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 shadow-md">
                              <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="text-[10px] font-bold text-amber-600">Reviewing</span>
                          </div>

                          {/* Connector 2 */}
                          <div className="mx-2 mb-4 h-1 flex-1 rounded-full bg-gray-200" />

                          {/* Step 3 — pending */}
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 shadow-md">
                              <Star className="h-5 w-5 text-gray-400" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">Approved</span>
                          </div>
                        </div>

                        {/* Check status button */}
                        {onRefreshStatus && (
                          <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={`mx-auto mb-2 flex items-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-700 transition-all hover:bg-amber-100 disabled:opacity-60`}
                          >
                            {refreshing
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <RefreshCw className="h-4 w-4" />
                            }
                            {refreshing ? 'Checking Status…' : 'Refresh & Check Status'}
                          </button>
                        )}

                        {/* OK button */}
                        <motion.button
                          type="button"
                          onClick={onClose}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className={`mx-auto flex h-13 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${cfg.btnGradient} py-3.5 text-sm font-bold text-white shadow-xl ${cfg.btnShadow}`}
                        >
                          OK, I&apos;ll Wait for Approval
                        </motion.button>
                      </motion.div>
                    )}

                    {/* ══ APPROVED actions ══ */}
                    {status === 'APPROVED' && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <motion.button
                          type="button"
                          onClick={onGoToDashboard}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          className={`group mx-auto flex h-14 w-full max-w-xs items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${cfg.btnGradient} text-base font-bold text-white shadow-2xl ${cfg.btnShadow}`}
                        >
                          <Zap className="h-5 w-5" />
                          Go to Dashboard
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </motion.button>
                      </motion.div>
                    )}

                    {/* ══ REJECTED actions ══ */}
                    {status === 'REJECTED' && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-3"
                      >
                        <motion.button
                          type="button"
                          onClick={onBackToSignup}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`mx-auto flex h-14 w-full max-w-xs items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${cfg.btnGradient} text-base font-bold text-white shadow-2xl ${cfg.btnShadow}`}
                        >
                          <ArrowRight className="h-5 w-5 rotate-180" />
                          Back to Sign Up
                        </motion.button>
                        <p className="text-center text-xs font-medium text-gray-400">
                          Register again with a different role
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="relative border-t border-gray-100 bg-gray-50/60 px-8 py-3">
              <p className="flex items-center justify-center gap-2 text-[10px] font-semibold text-gray-400">
                <Shield className="h-3 w-3 text-green-500" />
                Connect Souq — Secure Business Network
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}