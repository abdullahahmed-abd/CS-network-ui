// components/directory/DirectoryBanner.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Compass, ArrowUpRight, Network } from 'lucide-react';

export default function DirectoryBanner({
  reachPercentage = 100,
  totalNetworkSize = 0,
  visibleNetworkSize = 0,
  isOperatorOrAdmin = false,
  onUpgradeClick,
}) {
  const isFullAccess = reachPercentage >= 100;
  const isLocked = reachPercentage === 0;

  if (isLocked) return null; // Locked screen is handled separately

  // 1. Operator / Admin View (Downline hierarchy scope, NO upsell banner)
  if (isOperatorOrAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-700/40 shadow-sm"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-300 border border-white/10">
                <Network className="w-3.5 h-3.5 text-indigo-400" />
                Organization Downline Scope
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Hierarchy Restricted
              </span>
            </div>

            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Downline Franchise Members ({visibleNetworkSize.toLocaleString()})
            </h2>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Showing members in your franchise and assigned downline hierarchy ({visibleNetworkSize.toLocaleString()} of {totalNetworkSize.toLocaleString()} total in scope).
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 2. Member View (Subscription tier reach & upgrade prompt)
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-5 mb-6 border shadow-sm ${
        isFullAccess
          ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-700/50'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white border-indigo-700/40'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-emerald-300 border border-white/10">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Proximity-Ordered Directory
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Nearest Franchises First
            </span>
          </div>

          <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            {isFullAccess ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Unrestricted Network Reach
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-400" />
                You’re seeing {reachPercentage}% of the Network
              </>
            )}
          </h2>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {isFullAccess
              ? `You have full visibility across all ${totalNetworkSize.toLocaleString()} members in the global network.`
              : `Showing nearest ${visibleNetworkSize.toLocaleString()} of ${totalNetworkSize.toLocaleString()} network members in your proximity tier.`}
          </p>

          {/* Progress Bar */}
          {!isFullAccess && (
            <div className="pt-1.5 max-w-md">
              <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium">
                <span>Reach Allowance</span>
                <span className="text-emerald-400 font-semibold">{reachPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, reachPercentage)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 h-full rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right CTA for non-full access */}
        {!isFullAccess && onUpgradeClick && (
          <div className="flex-shrink-0 pt-2 md:pt-0">
            <button
              onClick={onUpgradeClick}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs md:text-sm shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Upgrade to CS Elite</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
