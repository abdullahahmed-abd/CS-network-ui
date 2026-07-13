import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CheckCircle2, PartyPopper, Crown, Sparkles, ArrowRight } from 'lucide-react';
import Backgroundimage from '../assets/image/Backgroundimg19.png';

export default function PaymentSuccessScreen({ onContinue }) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [countdown, setCountdown] = useState(5);

  // Auto redirect after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Hide confetti after 3s
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(confettiTimer);
    };
  }, [onContinue]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <style>{`
        .success-scroll::-webkit-scrollbar { display: none; }
        .success-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: fixed;
          width: 10px;
          height: 10px;
          top: -10px;
          z-index: 100;
          animation: confetti-fall linear forwards;
        }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0">
        <img
          src={Backgroundimage}
          alt="Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-green-800/40" />
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 30 }).map((_, i) => {
            const colors = ['#A2CB8B', '#F0D090', '#C9973A', '#4f7d3d', '#FF6B6B', '#4ECDC4', '#FFE66D'];
            const color = colors[i % colors.length];
            const left = `${Math.random() * 100}%`;
            const delay = `${Math.random() * 2}s`;
            const duration = `${2 + Math.random() * 2}s`;
            const size = `${6 + Math.random() * 8}px`;
            const shape = i % 3 === 0 ? '50%' : i % 3 === 1 ? '0%' : '2px';

            return (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left,
                  width: size,
                  height: size,
                  backgroundColor: color,
                  borderRadius: shape,
                  animationDelay: delay,
                  animationDuration: duration,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Floating blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-green-400/15 to-emerald-500/10"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-400/15 to-yellow-500/10"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="success-scroll relative z-10 flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
          className="w-full max-w-lg"
        >
          {/* Main card */}
          <div className="relative overflow-hidden rounded-3xl border border-green-200/50 bg-white/95 p-10 shadow-2xl backdrop-blur-xl text-center">

            {/* Glow effect */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-green-400/30 blur-3xl" />

            {/* Success icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="relative mx-auto mb-6"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 shadow-xl shadow-green-500/30">
                <CheckCircle2 className="h-14 w-14 text-green-600" strokeWidth={2} />
              </div>

              {/* Sparkle decorations */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6 text-amber-400" />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-3"
                animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <PartyPopper className="h-5 w-5 text-green-500" />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="mb-3 text-3xl font-bold text-gray-900">
                Payment Successful! 🎉
              </h1>
              <p className="mb-2 text-gray-600 text-base">
                Your subscription has been activated successfully.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 border border-green-200 mb-6">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-bold text-green-700">
                  30-day free trial started!
                </span>
              </div>
            </motion.div>

            {/* Trial info card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-5"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-green-800">Trial Period Active</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                You won't be charged during the 30-day trial period.
                Your plan billing will start automatically after the trial ends.
                You can cancel anytime.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onContinue?.()}
              className="group w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-green-500/30 transition-all hover:shadow-green-500/40"
            >
              <span className="flex items-center justify-center gap-3">
                Go to Dashboard
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>

            {/* Countdown */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-xs text-gray-400"
            >
              Auto-redirecting in {countdown}s...
            </motion.p>

            {/* Security badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 flex items-center justify-center gap-2"
            >
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs text-gray-400">
                Secured by Stripe — Your payment is safe
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}