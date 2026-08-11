import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Check, Zap, TrendingUp, Building2,
  Star, Loader2, Shield, ArrowLeft,
} from 'lucide-react';
import Backgroundimage from '../assets/image/Backgroundimg19.png';
import { authenticatedFetch, setItem } from '../api/auth';

const BASE_URL = 'https://connectsouq.sundukpay.com';

const PLANS = [
  {
    id: '1',
    name: 'Growth',
    price: 5.00,
    period: 'MONTHLY',
    badge: 'Most Popular',
    icon: TrendingUp,
    trialText: '30 days free, then $5/mo',
    color: {
      gradient: 'from-green-50 to-emerald-50',
      border: 'border-green-300',
      iconBg: 'from-green-100 to-emerald-100',
      iconColor: 'text-green-600',
      button: 'from-green-600 via-emerald-600 to-green-600',
      shadow: 'shadow-green-500/30',
      badge: 'bg-gradient-to-r from-green-500 to-emerald-500',
      check: 'text-green-600',
      checkBg: 'bg-green-100',
    },
    features: [
      'Up to 75 connections/month',
      '60 deal inquiries/month',
      'Priority member directory',
      'WhatsApp support',
      '30-day free trial included',
      'Analytics dashboard',
    ],
  },
  {
    id: '2',
    name: 'Enterprise',
    price: 10.00,
    period: 'MONTHLY',
    badge: 'Best Value',
    icon: Building2,
    trialText: '30 days free, then $10/mo',
    color: {
      gradient: 'from-amber-50 to-yellow-50',
      border: 'border-amber-300',
      iconBg: 'from-amber-100 to-yellow-100',
      iconColor: 'text-amber-600',
      button: 'from-amber-600 via-yellow-600 to-amber-600',
      shadow: 'shadow-amber-500/30',
      badge: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      check: 'text-amber-600',
      checkBg: 'bg-amber-100',
    },
    features: [
      'Unlimited connections',
      'Unlimited deal inquiries',
      'Premium member directory',
      'Dedicated account manager',
      '30-day free trial included',
      'Advanced analytics',
      'Custom integrations',
    ],
  },
];

export default function PlansScreen({ roles = [], onPlanSelect, onBack }) {
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [error, setError] = useState('');

  /* ═══════════════════════════════════════════════════════
   * Plan select → API call → directly go to Dashboard
   * No Stripe redirect — backend handles 30-day free trial
   * ═══════════════════════════════════════════════════════ */
  const handleSelectPlan = async (planId) => {
    setLoadingPlanId(planId);
    setError('');

    try {
      console.log('🛒 Selecting plan:', planId);

      const data = await authenticatedFetch(
        `${BASE_URL}/cs-network/member`,
        {
          method: 'POST',
          body: JSON.stringify({
            memberRequestType: 'PURCHASE_PLAN',
            planId: Number(planId),
          }),
        }
      );

      console.log('✅ Plan response:', data);

      // ✅ Store flags locally before navigating
      try {
        setItem('selectedPlanId', String(planId));
        setItem('planPurchased', 'true');
        setItem('formFilled', 'true');
      } catch (e) {}

      // Directly go to dashboard via onPlanSelect
      onPlanSelect?.(planId);

    } catch (err) {
      console.error('❌ Plan selection error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <style>{`
        .plans-scroll::-webkit-scrollbar { display: none; }
        .plans-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Background ── */}
      <div className="fixed inset-0">
        <img
          src={Backgroundimage}
          alt="Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/25 to-green-100/30" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ── Floating blobs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-green-200/20 to-emerald-300/15"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-200/20 to-green-300/15"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Content ── */}
      <div className="plans-scroll relative z-10 h-screen overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 pb-20">

          {/* ── Header ── */}
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-white/90 px-5 py-2.5 shadow-lg ring-1 ring-green-200/50"
            >
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-green-700">
                30-Day Free Trial — No charge until trial ends
              </span>
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4 text-4xl font-bold text-white drop-shadow-lg sm:text-5xl"
            >
              Choose Your Plan
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/90 drop-shadow"
            >
              Selected roles:{' '}
              <span className="font-bold text-green-300">
                {roles.join(' + ')}
              </span>
            </motion.p>

            {/* Trial info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/20"
            >
              <span className="text-sm text-white/90">
                🎉 All plans include{' '}
                <strong className="text-green-300">30 days free trial</strong>
                {' '}— billing starts after trial period
              </span>
            </motion.div>
          </motion.div>

          {/* ── Error message ── */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 mx-auto max-w-xl flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
            >
              <svg
                className="h-5 w-5 shrink-0 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600 text-lg font-bold"
              >
                ✕
              </button>
            </motion.div>
          )}

          {/* ── Plans Grid ── */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan, index) => {
              const Icon = plan.icon;
              const isLoading = loadingPlanId === plan.id;
              const isDisabled = loadingPlanId !== null;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.15 }}
                  whileHover={!isDisabled ? { y: -6, scale: 1.02 } : {}}
                  className={`
                    relative flex flex-col overflow-hidden rounded-3xl border-2
                    bg-gradient-to-br ${plan.color.gradient} ${plan.color.border}
                    p-7 shadow-xl ${plan.color.shadow} backdrop-blur-sm
                    ${isDisabled && !isLoading ? 'opacity-60' : ''}
                  `}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div
                      className={`
                        absolute -right-8 top-6 rotate-45
                        ${plan.color.badge} px-10 py-1.5
                        text-xs font-bold text-white shadow-lg
                      `}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Plan icon + name */}
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className={`
                        flex h-13 w-13 items-center justify-center
                        rounded-2xl bg-gradient-to-br ${plan.color.iconBg}
                        p-3 shadow-md
                      `}
                    >
                      <Icon className={`h-7 w-7 ${plan.color.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {plan.period}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-2 flex items-end gap-1">
                    <span className="text-5xl font-black text-gray-900">
                      ${plan.price.toFixed(2)}
                    </span>
                    <span className="mb-2 text-sm font-semibold text-gray-500">
                      /mo
                    </span>
                  </div>

                  {/* Trial badge */}
                  <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 w-fit">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                    <span className="text-xs font-bold text-green-700">
                      {plan.trialText}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div
                          className={`
                            mt-0.5 flex h-5 w-5 shrink-0 items-center
                            justify-center rounded-full ${plan.color.checkBg}
                          `}
                        >
                          <Check
                            className={`h-3 w-3 ${plan.color.check} font-bold`}
                            strokeWidth={3}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* ✅ CTA Button — "Start Free Trial" → goes to Dashboard */}
                  <motion.button
                    whileHover={!isDisabled ? { scale: 1.03 } : {}}
                    whileTap={!isDisabled ? { scale: 0.97 } : {}}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isDisabled}
                    className={`
                      relative w-full overflow-hidden rounded-2xl
                      bg-gradient-to-r ${plan.color.button}
                      px-6 py-4 text-base font-bold text-white shadow-lg
                      ${plan.color.shadow} transition-all
                      disabled:cursor-not-allowed disabled:opacity-70
                    `}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Activating Trial...
                        </>
                      ) : (
                        <>
                          Start Free Trial
                          <motion.svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            animate={!isDisabled ? { x: [0, 4, 0] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </motion.svg>
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* ── Security badge — No Stripe mention ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <div className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 border border-white/20">
              <svg
                className="h-4 w-4 text-white/80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-xs font-semibold text-white/80">
                30-day free trial • No payment required now • Cancel anytime
              </span>
            </div>
          </motion.div>

          {/* ── Back link ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            <button
              onClick={onBack}
              disabled={loadingPlanId !== null}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back to form
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}