// components/meetings/MeetingsTab.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Meetings Module Dashboard Tab
// SubTab Architecture: "All Meetings" (Fetch Feed) & "Schedule Meeting" (Creation Flows)
// ══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  Calendar, Plus, Users, Building2, GitFork, Globe,
  MessageSquare, Sparkles, ListFilter, PlusCircle
} from 'lucide-react';
import ScheduleMeetingModal from './ScheduleMeetingModal';
import MeetingsList from './MeetingsList';
import { MEETING_REQUEST_TYPES, getMeetingRoleCategory } from '../../api/meetingsApi';
import { getUserData } from '../../api/auth';

export default function MeetingsTab() {
  const user = getUserData() || {};
  const roleCategory = getMeetingRoleCategory(user);
  const userFranchiseId = user.franchiseId || user.primaryFranchiseId || 12;

  // SubTab Navigation: 'list' (All Meetings) vs 'create' (Creation Flows)
  const [activeSubTab, setActiveSubTab] = useState('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenModal = (scenario = null) => {
    setSelectedScenario(scenario);
    setModalOpen(true);
  };

  const handleMeetingScheduled = () => {
    setModalOpen(false);
    // Switch to list tab and force refresh backend meetings list
    setActiveSubTab('list');
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Calendar className="w-3.5 h-3.5" /> ConnectSouq Meetings Engine
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Meetings & Scheduling Dashboard
            </h1>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl font-medium">
              View your scheduled meetings or launch role-mapped creation flows ({roleCategory.replace(/_/g, ' ')}).
            </p>
          </div>

          {/* SubTab Toggle Buttons */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('list')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                activeSubTab === 'list'
                  ? 'bg-white text-emerald-950 shadow-md'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <ListFilter className="w-4 h-4" /> All Meetings
            </button>

            {roleCategory !== 'MEMBER' && (
              <button
                onClick={() => setActiveSubTab('create')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
                  activeSubTab === 'create'
                    ? 'bg-white text-emerald-950 shadow-md'
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <PlusCircle className="w-4 h-4" /> Schedule Meeting
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUBTAB 1: MEETINGS LIST SCREEN */}
      {activeSubTab === 'list' && (
        <MeetingsList
          key={refreshKey}
          onScheduleClick={() => {
            if (roleCategory !== 'MEMBER') {
              setActiveSubTab('create');
            }
          }}
        />
      )}

      {/* SUBTAB 2: SCHEDULE MEETING CREATION FLOWS (UNTOUCHED) */}
      {activeSubTab === 'create' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" /> Choose Meeting Creation Scenario
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Select a role-permitted creation flow to schedule a new meeting.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Custom Creation Form
            </button>
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
                className="p-6 rounded-3xl bg-white border border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-mono">
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
                className="p-6 rounded-3xl bg-white border border-emerald-200/80 hover:border-emerald-400 shadow-sm hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-mono">
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

          {/* GLOBAL ADMIN: 4 Options */}
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
      )}

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
