// components/meetings/MeetingsTab.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Meetings Module Dashboard Tab
// Role-Based Access & UI Mapping (v2 Corrected)
// ══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, Video, MapPin, Plus, Users, Building2,
  GitFork, Globe, CheckCircle2, MessageSquare, ExternalLink,
  Copy, Sparkles, Filter, Info, Lock
} from 'lucide-react';
import ScheduleMeetingModal from './ScheduleMeetingModal';
import { MEETING_REQUEST_TYPES, getMeetingRoleCategory } from '../../api/meetingsApi';
import { getUserData } from '../../api/auth';

const INITIAL_DEMO_MEETINGS = [
  {
    meetingId: 981,
    organizerId: 233,
    organizerName: 'Aisha Al-Farsi',
    title: 'Product Demo Discussion',
    description: 'Discuss demo feedback and next steps with buyer & seller',
    scheduledAt: '2026-08-05T09:30:00Z',
    durationMinutes: 30,
    locationType: 'ONLINE',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    address: null,
    audienceScope: 'DIRECT',
    status: 'SCHEDULED',
    inviteeCount: 2,
    createdAt: '2026-07-28T11:12:45.123Z',
  },
  {
    meetingId: 982,
    organizerId: 118,
    organizerName: 'Rashid Al-Mansoori',
    title: 'Quarterly Sync with Key Sellers',
    description: 'Review Q3 performance and targets',
    scheduledAt: '2026-08-10T13:00:00Z',
    durationMinutes: 45,
    locationType: 'OFFLINE',
    meetingLink: null,
    address: 'ConnectSouq HQ, Floor 4, Meeting Room B',
    audienceScope: 'SPECIFIC_USERS',
    status: 'SCHEDULED',
    inviteeCount: 3,
    createdAt: '2026-07-28T11:20:03.987Z',
  },
  {
    meetingId: 983,
    organizerId: 118,
    organizerName: 'Rashid Al-Mansoori',
    title: 'Downtown Sector Briefing',
    description: 'Briefing for downtown sector franchise members',
    scheduledAt: '2026-08-12T10:00:00Z',
    durationMinutes: 60,
    locationType: 'ONLINE',
    meetingLink: 'https://zoom.us/j/998877665',
    address: null,
    audienceScope: 'SPECIFIC_FRANCHISE',
    status: 'SCHEDULED',
    inviteeCount: 27,
    createdAt: '2026-07-28T11:26:41.512Z',
  },
  {
    meetingId: 984,
    organizerId: 118,
    organizerName: 'Rashid Al-Mansoori',
    title: 'Downline All-Hands Sync',
    description: 'Monthly sync with all downline franchises',
    scheduledAt: '2026-08-20T08:00:00Z',
    durationMinutes: 90,
    locationType: 'ONLINE',
    meetingLink: 'https://meet.google.com/downline-sync',
    address: null,
    audienceScope: 'FRANCHISE_DOWNLINE',
    status: 'SCHEDULED',
    inviteeCount: 64,
    createdAt: '2026-07-28T11:34:12.209Z',
  },
];

export default function MeetingsTab() {
  const user = getUserData() || {};
  const roleCategory = getMeetingRoleCategory(user);
  const userFranchiseId = user.franchiseId || user.primaryFranchiseId || 12;

  const [meetings, setMeetings] = useState(INITIAL_DEMO_MEETINGS);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [filterScope, setFilterScope] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleOpenModal = (scenario = null) => {
    setSelectedScenario(scenario);
    setModalOpen(true);
  };

  const handleMeetingScheduled = (newMeeting) => {
    setMeetings((prev) => [newMeeting, ...prev]);
  };

  const handleCopyLink = (m) => {
    const text = m.meetingLink || m.address || `Meeting #${m.meetingId}`;
    navigator.clipboard.writeText(text);
    setCopiedId(m.meetingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter meetings list
  const filteredMeetings = meetings.filter((m) => {
    const matchesScope = filterScope === 'ALL' || m.audienceScope === filterScope;
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScope && matchesSearch;
  });

  return (
    <div className="space-y-6 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Calendar className="w-3.5 h-3.5" /> Role-Mapped Meetings Module
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Meetings & Scheduling Dashboard
            </h1>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl font-medium">
              View and manage your scheduled meetings. Options are dynamically mapped based on your user role ({roleCategory.replace(/_/g, ' ')}).
            </p>
          </div>

          {roleCategory !== 'MEMBER' && (
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Plus className="w-5 h-5" /> Schedule New Meeting
            </button>
          )}
        </div>
      </div>

      {/* Role-Based Quick-Launch Menu (§2) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Available Meeting Creation Flows (§2)
          </h2>
          <span className="text-xs font-semibold text-gray-500">
            Role Category: <strong className="text-emerald-700 font-bold uppercase">{roleCategory.replace(/_/g, ' ')}</strong>
          </span>
        </div>

        {/* MEMBER: No standalone creation options */}
        {roleCategory === 'MEMBER' && (
          <div className="p-5 rounded-3xl bg-blue-50/80 border border-blue-200 flex items-start gap-4 text-blue-900">
            <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold">1-to-1 Direct Meetings Only</h3>
              <p className="text-xs text-blue-800">
                As a member, meeting creation options are handled inside active deal room chats.
                Open any active buyer↔seller chat to schedule a <strong>Direct 1-to-1</strong> meeting with your deal partner.
              </p>
            </div>
          </div>
        )}

        {/* GENERAL / SECTOR OPERATOR: 2 Options */}
        {roleCategory === 'GENERAL_SECTOR_OPERATOR' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => handleOpenModal(MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE)}
              className="p-5 rounded-3xl bg-white border border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-mono">
                  Franchise #{userFranchiseId}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Hold Your Franchise Meeting</h3>
              <p className="text-xs text-gray-500 mt-1">
                Invites all active primary members directly in your franchise ({user.franchiseType || 'Franchise'} #{userFranchiseId}). Auto-filled by frontend.
              </p>
            </div>

            <div
              onClick={() => handleOpenModal(MEETING_REQUEST_TYPES.SPECIFIC_USERS)}
              className="p-5 rounded-3xl bg-white border border-emerald-200/80 hover:border-emerald-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                  SPECIFIC_USERS
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Meet Specific Members</h3>
              <p className="text-xs text-gray-500 mt-1">
                Pick specific member IDs under your franchise hierarchy.
              </p>
            </div>
          </div>
        )}

        {/* MASTER OPERATOR: 4 Separate Options */}
        {roleCategory === 'MASTER_OPERATOR' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => handleOpenModal('OWN_FRANCHISE')}
              className="p-5 rounded-3xl bg-white border border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-mono">
                  Own Franchise
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Hold Your Franchise Meeting</h3>
              <p className="text-xs text-gray-500 mt-1">
                Invites direct primary team attached directly to your Master franchise.
              </p>
            </div>

            <div
              onClick={() => handleOpenModal(MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE)}
              className="p-5 rounded-3xl bg-white border border-orange-200/80 hover:border-orange-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 font-mono">
                  Downline Franchises
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Meet Specific Franchises</h3>
              <p className="text-xs text-gray-500 mt-1">
                Select specific General or Sector franchises in your Master hierarchy.
              </p>
            </div>

            <div
              onClick={() => handleOpenModal(MEETING_REQUEST_TYPES.SPECIFIC_USERS)}
              className="p-5 rounded-3xl bg-white border border-emerald-200/80 hover:border-emerald-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                  Hierarchy Members
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Meet Specific Members</h3>
              <p className="text-xs text-gray-500 mt-1">
                Select specific members across your Master network hierarchy.
              </p>
            </div>

            <div
              onClick={() => handleOpenModal(MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE)}
              className="p-5 rounded-3xl bg-white border border-purple-200/80 hover:border-purple-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GitFork className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 font-mono">
                  Downline Network
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Meet My Network</h3>
              <p className="text-xs text-gray-500 mt-1">
                Reaches all General/Sector downline franchises beneath your Master network.
              </p>
            </div>
          </div>
        )}

        {/* GLOBAL ADMIN: 3 / 4 Options */}
        {roleCategory === 'GLOBAL_ADMIN' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => handleOpenModal(MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE)}
              className="p-5 rounded-3xl bg-white border border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-mono">
                  Free Picker
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Meet a Specific Franchise</h3>
              <p className="text-xs text-gray-500 mt-1">
                Free franchise picker across every franchise platform-wide.
              </p>
            </div>

            <div
              onClick={() => handleOpenModal(MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE)}
              className="p-5 rounded-3xl bg-white border border-purple-200/80 hover:border-purple-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GitFork className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 font-mono">
                  Admin Downline
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Meet a Franchise's Network</h3>
              <p className="text-xs text-gray-500 mt-1">
                Walks downline network derived from admin's primary membership tree.
              </p>
            </div>

            <div
              onClick={() => handleOpenModal(MEETING_REQUEST_TYPES.ALL)}
              className="p-5 rounded-3xl bg-white border border-rose-200/80 hover:border-rose-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 font-mono">
                  Platform Wide
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Meet Everyone on Platform</h3>
              <p className="text-xs text-gray-500 mt-1">
                Invites all active members platform-wide.
              </p>
            </div>

            <div
              onClick={() => handleOpenModal(MEETING_REQUEST_TYPES.SPECIFIC_USERS)}
              className="p-5 rounded-3xl bg-white border border-emerald-200/80 hover:border-emerald-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                  User Picker
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Meet Specific Members</h3>
              <p className="text-xs text-gray-500 mt-1">
                Select individual user IDs across the platform.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Meetings Filter Bar & List */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Filter Audience Scope:</span>
          </div>

          {/* Scope Filters */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'DIRECT', 'SPECIFIC_USERS', 'SPECIFIC_FRANCHISE', 'FRANCHISE_DOWNLINE'].map((scope) => (
              <button
                key={scope}
                onClick={() => setFilterScope(scope)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterScope === scope
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {scope}
              </button>
            ))}
          </div>
        </div>

        {/* Meeting Cards List */}
        <div className="space-y-3">
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No meetings found matching current criteria.</p>
            </div>
          ) : (
            filteredMeetings.map((m) => (
              <motion.div
                key={m.meetingId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold font-mono uppercase">
                      ID #{m.meetingId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wider">
                      {m.audienceScope}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                      {m.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
                  {m.description && <p className="text-xs text-gray-600">{m.description}</p>}

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 flex-wrap font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {new Date(m.scheduledAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {m.durationMinutes} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <strong>{m.inviteeCount}</strong> invitees
                    </span>
                    <span className="text-gray-400">
                      Organizer: <strong>{m.organizerName}</strong> (#{m.organizerId})
                    </span>
                  </div>
                </div>

                {/* Right side Location & Action */}
                <div className="flex items-center gap-3 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-5">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center justify-end gap-1 text-xs font-bold text-gray-800">
                      {m.locationType === 'ONLINE' ? (
                        <Video className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <MapPin className="w-4 h-4 text-emerald-600" />
                      )}
                      {m.locationType}
                    </div>
                    <p className="text-[11px] text-gray-500 max-w-[180px] truncate font-mono">
                      {m.meetingLink || m.address}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyLink(m)}
                    className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-gray-200"
                    title="Copy Meeting Details"
                  >
                    {copiedId === m.meetingId ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {m.meetingLink && (
                    <a
                      href={m.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                    >
                      Join <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialScenario={selectedScenario}
        onMeetingScheduled={handleMeetingScheduled}
      />
    </div>
  );
}
