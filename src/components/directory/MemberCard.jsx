// components/directory/MemberCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  BadgeCheck,
  Phone,
  MessageSquare,
  Linkedin,
  Lock,
  Eye,
  ChevronRight,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { formatEnum } from './DirectoryConstants';
import { resolvePhotoUrl } from '../../api/profileOperationsApi';

export default function MemberCard({ member, onViewProfile, onUpgradeClick }) {
  if (!member) return null;

  const {
    id,
    fullName,
    profilePicture,
    companyName,
    position,
    businessSector,
    otherBusinessSector,
    country,
    state,
    city,
    franchiseId,
    franchiseName,
    businessPartner,
    contactVisible,
    whatsappNumber,
    alternatePhoneNumber,
    linkedinProfile,
  } = member;

  const initials = fullName
    ? fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'M';

  const sectorDisplay =
    businessSector === 'OTHER' && otherBusinessSector
      ? otherBusinessSector
      : formatEnum(businessSector);

  const locationText = [city, state, country].filter(Boolean).join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col justify-between overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header: Avatar, Name, BP Badge */}
        <div>
          <div className="flex items-start gap-3">
            {/* Profile Avatar */}
            <div className="relative flex-shrink-0">
              {profilePicture ? (
                <img
                  src={resolvePhotoUrl(profilePicture)}
                  alt={fullName || 'Member'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Member')}&background=10B981&color=fff`;
                  }}
                  className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold text-base flex items-center justify-center shadow-sm">
                  {initials}
                </div>
              )}

              {businessPartner && (
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 shadow border border-white" title="Verified Business Partner">
                  <BadgeCheck className="w-4 h-4 text-slate-950 fill-amber-400" />
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base leading-tight truncate group-hover:text-emerald-700 transition-colors">
                  {fullName || 'Unnamed Member'}
                </h3>
                {businessPartner && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <BadgeCheck className="w-3 h-3 text-amber-600" />
                    Verified Partner
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center gap-1 truncate">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>
                  {formatEnum(position)}
                  {companyName ? ` at ${companyName}` : ''}
                </span>
              </p>

              {/* Franchise Subtitle / Chip */}
              {franchiseName && (
                <p className="text-[11px] text-emerald-800 font-medium mt-1 inline-flex items-center gap-1 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60 max-w-full truncate">
                  <Building2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{franchiseName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Badges row: Sector & Location */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {sectorDisplay && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200/60">
                {sectorDisplay}
              </span>
            )}
            {locationText && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/60 truncate">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="truncate">{locationText}</span>
              </span>
            )}
          </div>
        </div>

        {/* Contact Actions Area */}
        <div className="pt-3 border-t border-slate-100">
          {contactVisible ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold text-xs transition-all border border-emerald-200 hover:border-emerald-600"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {alternatePhoneNumber && (
                  <a
                    href={`tel:${alternatePhoneNumber}`}
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs transition-all border border-slate-200"
                    title={alternatePhoneNumber}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}

                {linkedinProfile && (
                  <a
                    href={
                      linkedinProfile.startsWith('http')
                        ? linkedinProfile
                        : `https://${linkedinProfile}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-medium text-xs transition-all border border-blue-200 hover:border-blue-600"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            /* Contact Masked / Tier Lock Box */
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Contact details locked on CS Plus</span>
              </div>
              {onUpgradeClick && (
                <button
                  onClick={onUpgradeClick}
                  className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-xs transition-all"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Upgrade to Elite</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Card Footer CTA */}
        <div className="pt-2">
          <button
            onClick={() => onViewProfile && onViewProfile(id)}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-900 text-white font-semibold text-xs transition-all shadow-xs"
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
