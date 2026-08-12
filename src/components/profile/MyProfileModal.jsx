import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, X, Camera, Loader2, Mail, Phone, MessageSquare,
  Building2, Briefcase, MapPin, Globe, Linkedin, CheckCircle2,
  AlertCircle, Sparkles, Award
} from 'lucide-react';
import {
  fetchMyProfile,
  uploadProfilePhoto,
  resolvePhotoUrl,
} from '../../api/profileOperationsApi';

export default function MyProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyProfile();
      if (res?.profile) {
        setProfile(res.profile);
      } else {
        setError('Failed to load profile details.');
      }
    } catch (err) {
      console.error('fetchMyProfile error:', err);
      setError(err.message || 'Unable to fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProfile();
      setSuccessMsg('');
    }
  }, [isOpen]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccessMsg('');

    try {
      const res = await uploadProfilePhoto(file);
      setSuccessMsg(res?.message || 'Profile picture updated successfully.');

      // Refresh profile data immediately as per API spec recommendation
      const updated = await fetchMyProfile();
      if (updated?.profile) {
        setProfile(updated.profile);
        onProfileUpdated?.(updated.profile);
      }
    } catch (err) {
      console.error('Upload profile photo failed:', err);
      setError(err.message || 'Failed to upload profile photo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  const photoSrc = profile?.profilePhotoUrl
    ? resolvePhotoUrl(profile.profilePhotoUrl)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-teal-50/80">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">My Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Notifications */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Fetching profile details...</p>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Profile Header & Avatar Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                {/* Avatar with Upload Trigger */}
                <div className="relative group flex-shrink-0">
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt={profile.fullName || 'User'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.fullName || 'User') + '&background=10B981&color=fff';
                      }}
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-2xl flex items-center justify-center shadow-md">
                      {profile.fullName
                        ? profile.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()
                        : 'CS'}
                    </div>
                  )}

                  {/* Upload Overlay Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 rounded-2xl bg-slate-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        <span>Upload Photo</span>
                      </>
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Name & Basic Info */}
                <div className="text-center sm:text-left flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h4 className="font-extrabold text-slate-900 text-xl">
                      {profile.fullName}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ID #{profile.id}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {profile.position || 'Member'}
                      {profile.companyName ? ` at ${profile.companyName}` : ''}
                    </span>
                  </p>

                  <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.email}</span>
                  </p>

                  {/* Manual trigger button for photo upload below name */}
                  <div className="pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" />
                          <span>Change Profile Picture</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Allowed: JPEG, PNG, WEBP, GIF (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Detail Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Contact Information */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                    Contact Information
                  </span>
                  <div className="space-y-1.5 font-medium text-slate-700">
                    {profile.whatsappNumber && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>WhatsApp: {profile.whatsappNumber}</span>
                      </div>
                    )}
                    {profile.alternatePhoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>Phone: {profile.alternatePhoneNumber}</span>
                      </div>
                    )}
                    {profile.preferredContactMethod && (
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <span>Preferred Contact:</span>
                        <span className="font-bold text-slate-800">{profile.preferredContactMethod}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Details */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                    Business Profile
                  </span>
                  <div className="space-y-1.5 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        Sector:{' '}
                        {profile.businessSector === 'OTHER' && profile.otherBusinessSector
                          ? profile.otherBusinessSector
                          : profile.businessSector || 'N/A'}
                      </span>
                    </div>
                    {profile.businessAge && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span>Age: {profile.businessAge.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {profile.linkedinProfile && (
                      <a
                        href={profile.linkedinProfile.startsWith('http') ? profile.linkedinProfile : `https://${profile.linkedinProfile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>LinkedIn Profile</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Franchise Scope & Membership (Backend 4 Fields) */}
                {(profile.franchiseName || profile.franchiseType || profile.franchiseId || profile.franchiseMembershipType) && (
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-teal-50/60 border border-emerald-100 shadow-xs space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      Franchise & Network Membership
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                      {profile.franchiseName && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-normal">Franchise:</span>
                          <span className="font-extrabold text-slate-900">{profile.franchiseName}</span>
                          {profile.franchiseId && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ID #{profile.franchiseId}
                            </span>
                          )}
                        </div>
                      )}
                      {profile.franchiseType && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-normal">Franchise Type:</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                            {profile.franchiseType}
                          </span>
                        </div>
                      )}
                      {profile.franchiseMembershipType && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-normal">Membership Role:</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 uppercase tracking-wider">
                            {profile.franchiseMembershipType}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location & Language */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                    Location & Preferences
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>
                        Location:{' '}
                        {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'N/A'}
                      </span>
                    </div>
                    {profile.languagePreference && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span>Language: {profile.languagePreference}</span>
                      </div>
                    )}
                    {profile.address && (
                      <div className="sm:col-span-2 text-slate-500 text-[11px] mt-1">
                        <span>Address: {profile.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
