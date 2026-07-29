// components/directory/MemberProfileModal.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  Building2,
  MapPin,
  BadgeCheck,
  Phone,
  MessageSquare,
  Linkedin,
  Lock,
  Briefcase,
  AlertCircle,
  Sparkles,
  User,
} from 'lucide-react';
import { getMemberProfile } from '../../api/directoryApi';
import { formatEnum } from './DirectoryConstants';

export default function MemberProfileModal({ memberId, onClose, onUpgradeClick }) {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [error, setError] = useState(null);
  const [is403, setIs403] = useState(false);

  useEffect(() => {
    if (!memberId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setIs403(false);

    getMemberProfile(memberId)
      .then((data) => {
        if (!isMounted) return;
        if (data?.member) {
          setMember(data.member);
        } else {
          setError('Profile unavailable');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('getMemberProfile error:', err);
        if (err.status === 403 || err.message?.includes('Elite') || err.message?.includes('reach')) {
          setIs403(true);
        }
        setError(err.message || 'Unable to load member profile');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  if (!memberId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Member Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Fetching profile details...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="font-bold text-slate-900 text-base">
                  {is403 ? 'Profile Reach Capped' : 'Access Restricted'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {error}
                </p>
              </div>

              {is403 && onUpgradeClick && (
                <button
                  onClick={() => {
                    onClose();
                    onUpgradeClick();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:scale-[1.02] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Upgrade to CS Elite for Full Reach
                </button>
              )}
            </div>
          ) : member ? (
            <div className="space-y-6">
              {/* Profile Top Banner */}
              <div className="flex items-start gap-4">
                {member.profilePicture ? (
                  <img
                    src={member.profilePicture}
                    alt={member.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold text-xl flex items-center justify-center shadow-md">
                    {member.fullName
                      ? member.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      : 'M'}
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-lg">
                      {member.fullName}
                    </h4>
                    {member.businessPartner && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <BadgeCheck className="w-3.5 h-3.5 text-amber-600" />
                        Verified Business Partner
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {formatEnum(member.position)}
                      {member.companyName ? ` at ${member.companyName}` : ''}
                    </span>
                  </p>

                  {member.franchiseName && (
                    <p className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{member.franchiseName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                    Business Sector
                  </span>
                  <span className="font-bold text-slate-800">
                    {member.businessSector === 'OTHER' && member.otherBusinessSector
                      ? member.otherBusinessSector
                      : formatEnum(member.businessSector) || 'Not specified'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                    Location
                  </span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    {[member.city, member.state, member.country].filter(Boolean).join(', ') || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Contact & Connections
                </h5>

                {member.contactVisible ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {member.whatsappNumber && (
                      <a
                        href={`https://wa.me/${member.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold text-xs transition-all border border-emerald-200"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp: {member.whatsappNumber}</span>
                      </a>
                    )}

                    {member.alternatePhoneNumber && (
                      <a
                        href={`tel:${member.alternatePhoneNumber}`}
                        className="inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold text-xs transition-all border border-slate-200"
                      >
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span>Phone: {member.alternatePhoneNumber}</span>
                      </a>
                    )}

                    {member.linkedinProfile && (
                      <a
                        href={
                          member.linkedinProfile.startsWith('http')
                            ? member.linkedinProfile
                            : `https://${member.linkedinProfile}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="sm:col-span-2 inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold text-xs transition-all border border-blue-200"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn Profile</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-900">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Contact Details Masked on CS Plus Tier</span>
                    </div>
                    <p className="text-[11px] text-amber-800/80">
                      Upgrade to CS Elite to view direct phone numbers, WhatsApp, and LinkedIn profiles for all members.
                    </p>
                    {onUpgradeClick && (
                      <button
                        onClick={() => {
                          onClose();
                          onUpgradeClick();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>Upgrade to CS Elite</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
