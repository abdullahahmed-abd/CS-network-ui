// components/directory/OperatorCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Building,
  Factory,
  MessageSquare,
  Phone,
  Building2,
  ShieldCheck,
  UserCheck,
  Eye,
  ChevronRight,
} from 'lucide-react';

export default function OperatorCard({ operator, onViewProfile }) {
  if (!operator) return null;

  const {
    userId,
    fullName,
    whatsappNumber,
    franchiseId,
    franchiseName,
    franchiseType,
  } = operator;

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'OP';

  const typeConfig = {
    MASTER: {
      label: 'Master Operator',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      gradient: 'from-indigo-600 to-slate-900',
      icon: Crown,
      iconColor: 'text-amber-400',
      borderHover: 'hover:border-indigo-500/40',
    },
    SECTOR: {
      label: 'Sector Operator',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      gradient: 'from-emerald-600 to-teal-800',
      icon: Factory,
      iconColor: 'text-emerald-300',
      borderHover: 'hover:border-emerald-500/40',
    },
    GENERAL: {
      label: 'General Operator',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      gradient: 'from-blue-600 to-indigo-800',
      icon: Building,
      iconColor: 'text-blue-300',
      borderHover: 'hover:border-blue-500/40',
    },
  };

  const config = typeConfig[franchiseType] || typeConfig.GENERAL;
  const TypeIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md ${config.borderHover} transition-all flex flex-col justify-between overflow-hidden p-5`}
    >
      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex items-start gap-3">
          {/* Avatar with Type Icon */}
          <div className="relative flex-shrink-0">
            <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${config.gradient} text-white font-bold text-base flex items-center justify-center shadow-sm`}>
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white rounded-full p-1 border border-white" title={config.label}>
              <TypeIcon className={`w-3.5 h-3.5 ${config.iconColor}`} />
            </div>
          </div>

          {/* Name & Role Badge */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                {fullName || 'Operator'}
              </h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeBg}`}>
                <TypeIcon className="w-3 h-3" />
                {config.label}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Connect Souq Staff / Operator</span>
            </p>
          </div>
        </div>

        {/* Franchise Detail Card */}
        {franchiseName && (
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-500" />
              Managed Franchise
            </div>
            <p className="text-xs font-semibold text-slate-800 truncate">
              {franchiseName}
              {franchiseId ? ` (ID: #${franchiseId})` : ''}
            </p>
          </div>
        )}

        {/* Unmasked Contact Actions */}
        {whatsappNumber && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold text-xs transition-all border border-emerald-200"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Operator</span>
              </a>

              <a
                href={`tel:${whatsappNumber}`}
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs transition-all border border-slate-200"
                title={`Call ${whatsappNumber}`}
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Card Footer CTA */}
        <div className="pt-2">
          <button
            onClick={() => onViewProfile && onViewProfile(userId)}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-semibold text-xs transition-all shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Full Profile</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
