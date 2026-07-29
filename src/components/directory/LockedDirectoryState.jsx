// components/directory/LockedDirectoryState.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';

export default function LockedDirectoryState({ message, onUpgradeClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto my-12 p-8 md:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xl text-center space-y-6 relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Lock Icon */}
      <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 border-4 border-amber-100">
        <Lock className="w-10 h-10" />
      </div>

      {/* Text */}
      <div className="relative z-10 space-y-2 max-w-md mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          Subscription Required
        </span>
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Member Directory Access Locked
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {message || 'An active subscription is required to access the member directory.'}
        </p>
      </div>

      {/* Features preview list */}
      <div className="relative z-10 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="font-bold text-xs text-slate-800">Verified Address Book</div>
          <div className="text-[11px] text-slate-500">Search thousands of vetted B2B network members</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="font-bold text-xs text-slate-800">Proximity Matching</div>
          <div className="text-[11px] text-slate-500">Connect with nearby franchises and partners first</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="font-bold text-xs text-slate-800">Direct Contact</div>
          <div className="text-[11px] text-slate-500">Access direct WhatsApp and phone connections</div>
        </div>
      </div>

      {/* Action Button */}
      {onUpgradeClick && (
        <div className="relative z-10 pt-4">
          <button
            onClick={onUpgradeClick}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>View Subscription Plans</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
