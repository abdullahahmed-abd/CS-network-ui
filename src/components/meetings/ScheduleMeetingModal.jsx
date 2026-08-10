// components/meetings/ScheduleMeetingModal.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Schedule Meeting Modal — Role-Based Access & UI Mapping
// Implements 5 Scenarios with strict per-role filtering & auto-fill logic (§1, §2, §3)
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Video, MapPin, Users, Building2,
  GitFork, Globe, Lock, AlertCircle, CheckCircle2,
  X, Sparkles, Copy, ExternalLink, RefreshCw, Send,
  MessageSquare, Info, Search, Check, Plus, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  scheduleMeeting,
  MEETING_REQUEST_TYPES,
  MEETING_LOCATION_TYPES,
  validateMeetingPayload,
  getMeetingRoleCategory,
  fetchEligibleFranchises,
  fetchEligibleUsers,
  fetchDownlinePreview,
} from '../../api/meetingsApi';
import { getUserData } from '../../api/auth';
import { getNowDateTimeString } from '../../utils/BpHelpers';

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

export default function ScheduleMeetingModal({
  isOpen,
  onClose,
  initialConversationId = null,
  initialScenario = null,
  onMeetingScheduled = null,
}) {
  const user = getUserData() || {};
  const roleCategory = getMeetingRoleCategory(user);
  const userFranchiseId = user.franchiseId || user.primaryFranchiseId || null;

  // Build dynamic scenarios array allowed for current role category (§2)
  const availableScenarios = useMemo(() => {
    const isChat = !!initialConversationId;

    if (isChat) {
      return [
        {
          id: MEETING_REQUEST_TYPES.DIRECT,
          label: 'Direct 1-to-1 Chat Meeting',
          icon: MessageSquare,
          badge: 'Chat Participant',
          desc: 'Schedule a 1-to-1 meeting with your active conversation partner.',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50/70',
        },
      ];
    }

    if (roleCategory === 'MEMBER') {
      return [
        {
          id: MEETING_REQUEST_TYPES.DIRECT,
          label: 'Direct 1-to-1 Chat Meeting',
          icon: MessageSquare,
          badge: 'Inside Chat Only',
          desc: 'Plain members can only schedule 1-to-1 direct meetings inside an active conversation.',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50/70',
        },
      ];
    }

    if (roleCategory === 'GENERAL_SECTOR_OPERATOR') {
      return [
        {
          id: MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE,
          label: 'Hold Your Franchise Meeting',
          icon: Building2,
          badge: 'Own Franchise',
          desc: `Invites all active primary members directly in your franchise.`,
          borderColor: 'border-amber-200',
          bgColor: 'bg-amber-50/70',
        },
        {
          id: MEETING_REQUEST_TYPES.SPECIFIC_USERS,
          label: 'Meet Specific Members',
          icon: Users,
          badge: 'Own Franchise Members',
          desc: 'Select specific members under your franchise.',
          borderColor: 'border-emerald-200',
          bgColor: 'bg-emerald-50/70',
        },
      ];
    }

    if (roleCategory === 'MASTER_OPERATOR') {
      return [
        {
          id: 'OWN_FRANCHISE',
          requestType: MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE,
          isAutoFill: true,
          label: 'Hold Your Franchise Meeting',
          icon: Building2,
          badge: 'Own Franchise',
          desc: 'Invites direct primary team attached to your Master franchise.',
          borderColor: 'border-amber-200',
          bgColor: 'bg-amber-50/70',
        },
        {
          id: MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE,
          requestType: MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE,
          isAutoFill: false,
          label: 'Meet Specific Franchises',
          icon: Building2,
          badge: 'Downline Franchises',
          desc: 'Select specific General or Sector franchises in your Master hierarchy.',
          borderColor: 'border-orange-200',
          bgColor: 'bg-orange-50/70',
        },
        {
          id: MEETING_REQUEST_TYPES.SPECIFIC_USERS,
          requestType: MEETING_REQUEST_TYPES.SPECIFIC_USERS,
          isAutoFill: false,
          label: 'Meet Specific Members',
          icon: Users,
          badge: 'Hierarchy Members',
          desc: 'Select specific members within your permitted hierarchy.',
          borderColor: 'border-emerald-200',
          bgColor: 'bg-emerald-50/70',
        },
        {
          id: MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE,
          requestType: MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE,
          isAutoFill: false,
          label: 'Meet My Network',
          icon: GitFork,
          badge: 'Downline Network',
          desc: 'Invites all active members across General & Sector franchises beneath your Master network.',
          borderColor: 'border-purple-200',
          bgColor: 'bg-purple-50/70',
        },
      ];
    }

    // GLOBAL_ADMIN
    return [
      {
        id: MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE,
        requestType: MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE,
        label: 'Meet a Specific Franchise',
        icon: Building2,
        badge: 'Platform Franchise',
        desc: 'Select any franchise across the platform.',
        borderColor: 'border-amber-200',
        bgColor: 'bg-amber-50/70',
      },
      {
        id: MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE,
        requestType: MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE,
        label: "Meet a Franchise's Network",
        icon: GitFork,
        badge: 'Admin Downline',
        desc: "Walks downline network derived from your primary membership tree.",
        borderColor: 'border-purple-200',
        bgColor: 'bg-purple-50/70',
      },
      {
        id: MEETING_REQUEST_TYPES.ALL,
        requestType: MEETING_REQUEST_TYPES.ALL,
        label: 'Meet Everyone on the Platform',
        icon: Globe,
        badge: 'Platform Wide',
        desc: 'Invites all active members platform-wide.',
        borderColor: 'border-rose-200',
        bgColor: 'bg-rose-50/70',
      },
      {
        id: MEETING_REQUEST_TYPES.SPECIFIC_USERS,
        requestType: MEETING_REQUEST_TYPES.SPECIFIC_USERS,
        label: 'Meet Specific Members',
        icon: Users,
        badge: 'Platform Members',
        desc: 'Pick individual members platform-wide.',
        borderColor: 'border-emerald-200',
        bgColor: 'bg-emerald-50/70',
      },
    ];
  }, [roleCategory, userFranchiseId, initialConversationId]);

  // Form State
  const defaultScenarioId = availableScenarios[0]?.id || MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE;
  const [requestType, setRequestType] = useState(initialScenario || defaultScenarioId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Scheduled Date Time (default 1 hour in future)
  const getMinDateTimeLocal = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [scheduledAt, setScheduledAt] = useState(getMinDateTimeLocal());
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Location
  const [locationType, setLocationType] = useState(MEETING_LOCATION_TYPES.ONLINE);
  const [meetingLink, setMeetingLink] = useState('');
  const [address, setAddress] = useState('');

  // Scenario Target Fields (Objects storing full metadata for human name chips)
  const [conversationId, setConversationId] = useState(initialConversationId || '');
  const [selectedFranchises, setSelectedFranchises] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Modals & Pickers State
  const [showFranchiseModal, setShowFranchiseModal] = useState(false);
  const [franchiseList, setFranchiseList] = useState([]);
  const [franchiseSearch, setFranchiseSearch] = useState('');
  const [loadingFranchises, setLoadingFranchises] = useState(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [downlinePreview, setDownlinePreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isDownlineListExpanded, setIsDownlineListExpanded] = useState(false);

  // UI & Response States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync initial scenario and conversation ID on modal open
  useEffect(() => {
    if (isOpen) {
      if (initialConversationId) {
        setConversationId(initialConversationId);
        setRequestType(MEETING_REQUEST_TYPES.DIRECT);
      } else {
        const targetSc = initialScenario && availableScenarios.some((s) => s.id === initialScenario)
          ? initialScenario
          : (availableScenarios[0]?.id || MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE);
        setRequestType(targetSc);
      }
      setErrorMsg('');
      setFieldErrors([]);
    }
  }, [isOpen, initialScenario, initialConversationId, availableScenarios]);

  // Current Scenario Object
  const currentScenarioObj = availableScenarios.find((s) => s.id === requestType) || availableScenarios[0];
  const activeReqType = currentScenarioObj?.requestType || requestType;

  // Auto-mapping for operator franchise meetings (§3)
  const isAutoFilledFranchise = Boolean(
    currentScenarioObj?.isAutoFill ||
    (requestType === MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE && roleCategory === 'GENERAL_SECTOR_OPERATOR')
  );

  useEffect(() => {
    if (isAutoFilledFranchise) {
      setSelectedFranchises([{ franchiseId: Number(userFranchiseId), franchiseName: `Your Primary Franchise (#${userFranchiseId})` }]);
    }
  }, [isAutoFilledFranchise, userFranchiseId]);

  // 1. Fetch Eligible Franchises for picker modal or active SPECIFIC_FRANCHISE mode
  useEffect(() => {
    if (!isOpen) return;
    if (!showFranchiseModal && (requestType !== MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE || isAutoFilledFranchise)) return;
    let isMounted = true;
    const timer = setTimeout(() => {
      setLoadingFranchises(true);
      fetchEligibleFranchises({ search: franchiseSearch })
        .then((res) => {
          if (!isMounted) return;
          const list = res?.eligibleFranchises?.content || [];
          setFranchiseList(list);
        })
        .catch((err) => console.warn('fetchEligibleFranchises error:', err))
        .finally(() => { if (isMounted) setLoadingFranchises(false); });
    }, 250);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [isOpen, showFranchiseModal, requestType, isAutoFilledFranchise, franchiseSearch]);

  // 2. Fetch Eligible Users for picker modal or active SPECIFIC_USERS mode
  useEffect(() => {
    if (!isOpen) return;
    if (!showUserModal && requestType !== MEETING_REQUEST_TYPES.SPECIFIC_USERS) return;
    let isMounted = true;
    const timer = setTimeout(() => {
      setLoadingUsers(true);
      fetchEligibleUsers({ search: userSearch })
        .then((res) => {
          if (!isMounted) return;
          const list = res?.eligibleUsers?.content || [];
          setUserList(list);
        })
        .catch((err) => console.warn('fetchEligibleUsers error:', err))
        .finally(() => { if (isMounted) setLoadingUsers(false); });
    }, 250);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [isOpen, showUserModal, requestType, userSearch]);

  // 3. Fetch Downline Preview for confirmation
  useEffect(() => {
    if (!isOpen || (requestType !== MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE && requestType !== MEETING_REQUEST_TYPES.ALL)) return;

    let isMounted = true;
    const isGlobalAdminDownline = requestType === MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE && roleCategory === 'GLOBAL_ADMIN';
    const targetFranchiseId = selectedFranchises[0]?.franchiseId;

    if (isGlobalAdminDownline && !targetFranchiseId) {
      setDownlinePreview(null);
      return;
    }

    setLoadingPreview(true);
    fetchDownlinePreview({ franchiseId: isGlobalAdminDownline ? targetFranchiseId : undefined })
      .then((res) => {
        if (!isMounted) return;
        setDownlinePreview(res?.downlinePreview || null);
      })
      .catch((err) => console.warn('fetchDownlinePreview error:', err))
      .finally(() => { if (isMounted) setLoadingPreview(false); });
    return () => { isMounted = false; };
  }, [isOpen, requestType, roleCategory, selectedFranchises]);

  if (!isOpen) return null;

  const currentScenario = availableScenarios.find((s) => s.id === requestType) || availableScenarios[0];

  const handleToggleFranchise = (fItem) => {
    if (requestType === MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE && roleCategory === 'GLOBAL_ADMIN') {
      // Validate picker to not select more than 1 franchise at a time for Global Admin downline target
      setSelectedFranchises([fItem]);
      return;
    }
    const exists = selectedFranchises.some(sf => sf.franchiseId === fItem.franchiseId);
    if (exists) {
      if (isAutoFilledFranchise) return;
      setSelectedFranchises(selectedFranchises.filter(sf => sf.franchiseId !== fItem.franchiseId));
    } else {
      setSelectedFranchises([...selectedFranchises, fItem]);
    }
  };

  const handleToggleUser = (uItem) => {
    const exists = selectedUsers.some(su => su.userId === uItem.userId);
    if (exists) {
      setSelectedUsers(selectedUsers.filter(su => su.userId !== uItem.userId));
    } else {
      setSelectedUsers([...selectedUsers, uItem]);
    }
  };

  // Quick Preset Link generator
  const generateGoogleMeetLink = () => {
    const randomCode =
      Math.random().toString(36).substring(2, 5) + '-' +
      Math.random().toString(36).substring(2, 6) + '-' +
      Math.random().toString(36).substring(2, 5);
    setMeetingLink(`https://meet.google.com/${randomCode}`);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors([]);

    const finalFranchiseIds = isAutoFilledFranchise
      ? [Number(userFranchiseId)]
      : selectedFranchises.map(f => f.franchiseId);
    const finalUserIds = selectedUsers.map(u => u.userId);
    const targetDownlineFranchiseId = selectedFranchises[0]?.franchiseId;

    const effectiveFranchiseId = targetDownlineFranchiseId
      ? Number(targetDownlineFranchiseId)
      : (userFranchiseId ? Number(userFranchiseId) : null);

    const formPayload = {
      title,
      description,
      scheduledAt,
      durationMinutes,
      locationType,
      meetingLink,
      address,
      audienceScope: activeReqType,
      requestType: activeReqType,
      conversationId: Number(conversationId) || null,
      userIds: finalUserIds,
      franchiseIds: finalFranchiseIds.length > 0
        ? finalFranchiseIds
        : (userFranchiseId ? [Number(userFranchiseId)] : []),
      ...(effectiveFranchiseId && { franchiseId: effectiveFranchiseId }),
    };

    // Client side validation using role category
    const clientValidation = validateMeetingPayload(formPayload, user);
    if (clientValidation.length > 0) {
      setFieldErrors(clientValidation);
      setErrorMsg(clientValidation[0]);
      return;
    }

    setLoading(true);
    try {
      const response = await scheduleMeeting(formPayload);
      console.log('✅ Meeting Scheduled Successfully:', response);
      setCreatedMeeting(response);
      onMeetingScheduled?.(response);
    } catch (err) {
      console.error('❌ Schedule Meeting Error:', err);
      const msg = err.message || 'Failed to schedule meeting.';
      setErrorMsg(msg);

      if (msg.includes(';')) {
        const parts = msg.split(';').map((p) => p.trim());
        setFieldErrors(parts);
      } else {
        setFieldErrors([msg]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdMeeting) return;
    const text = `📅 ${createdMeeting.title}\n⏰ ${new Date(createdMeeting.scheduledAt).toLocaleString()}\n📍 ${
      createdMeeting.locationType === 'ONLINE' ? createdMeeting.meetingLink : createdMeeting.address
    }`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetModal = () => {
    setCreatedMeeting(null);
    setTitle('');
    setDescription('');
    setMeetingLink('');
    setAddress('');
    setErrorMsg('');
    setFieldErrors([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Schedule Network Meeting</h2>
              <p className="text-xs text-slate-300">Invite teams, franchises, or network members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                Scheduling Validation Error
              </div>
              <p className="text-xs">{errorMsg}</p>
            </div>
          )}

          {createdMeeting ? (
            /* SUCCESS CONFIRMATION STATE */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">Meeting Scheduled Successfully!</h3>
                <p className="text-xs text-gray-500 mt-1">Invites have been dispatched to target audience.</p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 max-w-md mx-auto text-left space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Meeting Title</span>
                  <span className="font-bold text-gray-900 text-sm">{createdMeeting.title}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Date & Time</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {new Date(createdMeeting.scheduledAt).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Duration</span>
                    <span className="font-semibold text-gray-800">{createdMeeting.durationMinutes} minutes</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Location</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1 break-all">
                    {createdMeeting.locationType === 'ONLINE' ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <a href={createdMeeting.meetingLink} target="_blank" rel="noreferrer" className="hover:underline">
                          {createdMeeting.meetingLink}
                        </a>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        {createdMeeting.address}
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 max-w-md mx-auto pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied Details!' : 'Copy Meeting Details'}
                </button>

                <button
                  type="button"
                  onClick={handleResetModal}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-4 h-4" /> Schedule Another
                </button>
              </div>
            </motion.div>
          ) : roleCategory === 'MEMBER' && !initialConversationId ? (
            /* PLAIN MEMBER NOTICE ON STANDALONE PAGE */
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Direct 1-to-1 Meetings Only</h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto mt-1">
                  Plain members can only schedule 1-to-1 direct meetings inside active deal room chats.
                  Please open an active conversation and click <strong>"Schedule Meeting"</strong> there.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl"
              >
                Close Window
              </button>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. SCENARIO SELECTOR */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    1. Select Meeting Option <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {availableScenarios.map((sc) => {
                    const Icon = sc.icon;
                    const isSelected = requestType === sc.id;

                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setRequestType(sc.id)}
                        className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? `bg-white ${sc.borderColor} shadow-md ring-2 ring-emerald-500/20`
                            : 'bg-gray-50/70 border-gray-200/80 hover:bg-gray-100/80 text-gray-600'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeTabModal"
                            className="absolute inset-0 rounded-2xl border-2 border-emerald-500 pointer-events-none"
                          />
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200/60 text-gray-500'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {sc.badge}
                            </span>
                          </div>

                          <p className={`text-xs font-extrabold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                            {sc.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Scenario Description Banner */}
                {currentScenario && (
                  <div className={`mt-3 p-3.5 rounded-2xl border flex items-start gap-3 ${currentScenario.bgColor} ${currentScenario.borderColor}`}>
                    <currentScenario.icon className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-extrabold text-gray-900">{currentScenario.label}: </span>
                      <span className="text-gray-700 font-medium">{currentScenario.desc}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. TARGET PARAMETERS */}
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                  2. Target Audience Parameters
                </span>

                {requestType === MEETING_REQUEST_TYPES.DIRECT && (
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-blue-600" /> Target Chat Conversation <span className="text-red-500">*</span>
                    </label>
                    <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl text-blue-950 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-blue-950 font-extrabold text-xs">
                          Direct 1-on-1 Chat Meeting
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                          Auto-Linked
                        </span>
                      </div>
                      <p className="text-blue-800 text-[11px] font-medium leading-relaxed">
                        Meeting will be scheduled directly 1-on-1 with your active conversation partner.
                      </p>
                    </div>
                    <input
                      type="hidden"
                      value={conversationId || initialConversationId || ''}
                    />
                  </div>
                )}

                {/* SPECIFIC MEMBERS / USERS PICKER */}
                {requestType === MEETING_REQUEST_TYPES.SPECIFIC_USERS && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700">
                        Selected Members ({selectedUsers.length}) <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowUserModal(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Open Full Search Window</span>
                      </button>
                    </div>

                    {/* Chips displaying full names */}
                    <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2.5 bg-white rounded-2xl border border-gray-200/80 items-center">
                      {selectedUsers.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">No specific members selected. Type below or open search window to add.</span>
                      ) : (
                        selectedUsers.map((u) => (
                          <span
                            key={u.userId}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200 shadow-2xs"
                          >
                            <span>{u.fullName || `Member #${u.userId}`}</span>
                            {u.franchiseName && <span className="text-[10px] text-emerald-700 font-normal">({u.franchiseName})</span>}
                            <button
                              type="button"
                              onClick={() => handleToggleUser(u)}
                              className="text-emerald-600 hover:text-emerald-950 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Inline Typeahead Member Search */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Type member name to search (e.g. Aman Sheikh)..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                        {loadingUsers && <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
                      </div>

                      {/* Inline Dropdown Results */}
                      {userList.length > 0 && userSearch.trim() !== '' && (
                        <div className="max-h-48 overflow-y-auto rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100 shadow-lg">
                          {userList.map((u) => {
                            const isSelected = selectedUsers.some((su) => su.userId === u.userId);
                            return (
                              <button
                                key={u.userId}
                                type="button"
                                onClick={() => handleToggleUser(u)}
                                className={`w-full text-left p-2.5 hover:bg-emerald-50/60 transition-colors flex items-center justify-between gap-2 text-xs ${
                                  isSelected ? 'bg-emerald-50/80 font-bold' : ''
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-gray-900">{u.fullName || `Member #${u.userId}`}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                      u.membershipType === 'OPERATOR'
                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}>
                                      {u.membershipType || 'MEMBER'}
                                    </span>
                                  </div>
                                  {u.franchiseName && <p className="text-[11px] text-gray-500">{u.franchiseName}</p>}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                  isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                  {isSelected ? 'Selected' : '+ Add'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SPECIFIC FRANCHISE PICKER */}
                {requestType === MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE && (
                  <div className="space-y-3">
                    {isAutoFilledFranchise ? (
                      /* AUTO-FILLED FOR OPERATOR (§3) */
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          Auto-filled Primary Franchise Target:
                        </div>
                        <p>
                          Auto-filled with your primary franchise. All active members attached to your primary franchise will be invited automatically.
                        </p>
                      </div>
                    ) : (
                      /* FREE PICKER FOR GLOBAL ADMIN / MASTER OPERATOR */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-700">
                            Selected Franchises ({selectedFranchises.length}) <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowFranchiseModal(true)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-all"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Search & Select Franchises</span>
                          </button>
                        </div>

                        {/* Chips displaying franchise names */}
                        <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2.5 bg-white rounded-2xl border border-gray-200/80 items-center">
                          {selectedFranchises.length === 0 ? (
                            <span className="text-xs text-gray-400 italic">No franchises selected yet. Click search button to add.</span>
                          ) : (
                            selectedFranchises.map((f) => (
                              <span
                                key={f.franchiseId}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 shadow-2xs"
                              >
                                <span>{f.franchiseName}</span>
                                {f.franchiseType && <span className="text-[10px] text-amber-700 font-normal">({f.franchiseType})</span>}
                                <button
                                  type="button"
                                  onClick={() => handleToggleFranchise(f)}
                                  className="text-amber-600 hover:text-amber-950 p-0.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* GLOBAL ADMIN TARGET FRANCHISE FOR DOWNLINE */}
                {requestType === MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE && roleCategory === 'GLOBAL_ADMIN' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700">
                        Target Franchise Network <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowFranchiseModal(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-all"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Select Target Franchise</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2.5 bg-white rounded-2xl border border-gray-200/80 items-center">
                      {selectedFranchises.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">No target franchise selected yet. Click search button to select one.</span>
                      ) : (
                        selectedFranchises.slice(0, 1).map((f) => (
                          <span
                            key={f.franchiseId}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-900 text-xs font-bold border border-purple-200 shadow-2xs"
                          >
                            <span>{f.franchiseName}</span>
                            {f.franchiseType && <span className="text-[10px] text-purple-700 font-normal">({f.franchiseType})</span>}
                            <button
                              type="button"
                              onClick={() => handleToggleFranchise(f)}
                              className="text-purple-600 hover:text-purple-950 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* DOWNLINE PREVIEW CARD FOR FRANCHISE_DOWNLINE & ALL */}
                {(requestType === MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE || requestType === MEETING_REQUEST_TYPES.ALL) && (
                  <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-purple-950">
                      <span className="flex items-center gap-1.5">
                        <GitFork className="w-4 h-4 text-purple-600" />
                        Network Invitation Preview
                      </span>
                      {loadingPreview && <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />}
                    </div>

                    {downlinePreview ? (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                            <span className="text-[10px] text-purple-600 font-medium block">Downline Franchises</span>
                            <span className="font-extrabold text-purple-950 text-sm">{downlinePreview.franchiseCount || 0}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                            <span className="text-[10px] text-purple-600 font-medium block">Downline Members</span>
                            <span className="font-extrabold text-purple-950 text-sm">{downlinePreview.downlineMemberCount || 0}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-purple-200">
                            <span className="text-[10px] text-purple-600 font-medium block">Own Franchise Team</span>
                            <span className="font-extrabold text-purple-950 text-sm">{downlinePreview.ownFranchiseMemberCount || 0}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-purple-900 leading-relaxed font-medium pt-1">
                          {requestType === MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE ? (
                            <>
                              🌳 <strong>Network Scope:</strong> This meeting will reach{' '}
                              <strong>{downlinePreview.downlineMemberCount || 0} members</strong> across{' '}
                              <strong>{downlinePreview.franchiseCount || 0} descendant franchises</strong>
                              {selectedFranchises[0]?.franchiseName ? ` under ${selectedFranchises[0].franchiseName}` : ''}.
                            </>
                          ) : (
                            <>
                              🌍 <strong>Meet Everyone Scope:</strong> This meeting will reach{' '}
                              <strong>{(downlinePreview.ownFranchiseMemberCount || 0) + (downlinePreview.downlineMemberCount || 0)} total members</strong> (own team + downline network).
                            </>
                          )}
                        </p>

                        {/* EXPANDABLE DOWNLINE FRANCHISES LIST */}
                        {downlinePreview.downlineFranchises?.content?.length > 0 && (
                          <div className="pt-2 border-t border-purple-200/80">
                            <button
                              type="button"
                              onClick={() => setIsDownlineListExpanded(!isDownlineListExpanded)}
                              className="w-full flex items-center justify-between text-xs font-bold text-purple-950 hover:text-purple-700 py-1 transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                                Downline Franchises Breakdown ({downlinePreview.downlineFranchises.content.length})
                              </span>
                              {isDownlineListExpanded ? (
                                <ChevronUp className="w-4 h-4 text-purple-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-purple-600" />
                              )}
                            </button>

                            {isDownlineListExpanded && (
                              <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                {downlinePreview.downlineFranchises.content.map((df) => (
                                  <div
                                    key={df.franchiseId}
                                    className="p-2.5 bg-white rounded-xl border border-purple-100 flex items-center justify-between text-xs shadow-2xs"
                                    style={{ marginLeft: `${(df.depth || 0) * 10}px` }}
                                  >
                                    <div className="min-w-0">
                                      <div className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                                        <span>{df.franchiseName}</span>
                                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                                          {df.franchiseType}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 flex-shrink-0">
                                      {df.directMemberCount} members
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {requestType === MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE && downlinePreview.franchiseCount === 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-bold text-center">
                            ⚠️ No downline franchises found in this hierarchy to invite.
                          </div>
                        )}
                      </div>
                    ) : requestType === MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE && roleCategory === 'GLOBAL_ADMIN' && selectedFranchises.length === 0 ? (
                      <p className="text-purple-700 italic text-center py-2">Please select a target franchise above to preview its downline network reach.</p>
                    ) : (
                      <p className="text-purple-700 italic text-center py-2">Calculating network reach statistics...</p>
                    )}
                  </div>
                )}
              </div>

              {/* 3. CORE DETAILS */}
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  3. Meeting Schedule & Details
                </span>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900 flex items-center justify-between">
                    <span>Meeting Title <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Regional Strategy Review"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ color: '#000000' }}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900">
                    Description <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Meeting agenda, topics, or instructions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ color: '#000000' }}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                {/* Scheduled At & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Scheduled Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      min={getNowDateTimeString()}
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      style={{ color: '#000000' }}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Duration (Minutes) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="5"
                        max="720"
                        required
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        style={{ color: '#000000' }}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-500">Quick Presets:</span>
                  {DURATION_PRESETS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMinutes(m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        Number(durationMinutes) === m
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                {/* Location Type Selector */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">Meeting Location Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLocationType(MEETING_LOCATION_TYPES.ONLINE)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        locationType === MEETING_LOCATION_TYPES.ONLINE
                          ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Video className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Online Meeting</div>
                        <div className="text-[10px] text-gray-500 font-normal">Video conferencing link</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLocationType(MEETING_LOCATION_TYPES.OFFLINE)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        locationType === MEETING_LOCATION_TYPES.OFFLINE
                          ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold">In-Person Meeting</div>
                        <div className="text-[10px] text-gray-500 font-normal">Physical venue address</div>
                      </div>
                    </button>
                  </div>

                  {locationType === MEETING_LOCATION_TYPES.ONLINE ? (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-gray-900 flex items-center justify-between">
                        <span>Meeting Link <span className="text-red-500">*</span></span>
                        <button
                          type="button"
                          onClick={generateGoogleMeetLink}
                          className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-generate Meet Link
                        </button>
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://meet.google.com/xyz-abc-def"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        style={{ color: '#000000' }}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-gray-900">
                        Physical Venue Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Suite 401, ConnectSouq Trade Tower, Business Bay, Dubai"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{ color: '#000000' }}
                        className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    (requestType === MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE && downlinePreview?.franchiseCount === 0)
                  }
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Schedule Meeting Now</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>

      {/* ── FRANCHISE PICKER POP-UP MODAL WINDOW ── */}
      <AnimatePresence>
        {showFranchiseModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-amber-50/80">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-700" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Select Target Franchises</h3>
                    <p className="text-[11px] text-slate-500">Pick eligible franchises in your hierarchy</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFranchiseModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search franchise name..."
                    value={franchiseSearch}
                    onChange={(e) => setFranchiseSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                  {loadingFranchises && (
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              {/* Results List */}
              <div className="p-3 overflow-y-auto space-y-1 flex-1">
                {franchiseList.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    {loadingFranchises ? 'Loading eligible franchises...' : 'No matching franchises found.'}
                  </div>
                ) : (
                  franchiseList.map((f) => {
                    const isSelected = selectedFranchises.some((sf) => sf.franchiseId === f.franchiseId);
                    return (
                      <button
                        key={f.franchiseId}
                        type="button"
                        onClick={() => handleToggleFranchise(f)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 text-xs ${
                          isSelected
                            ? 'bg-amber-50 border-amber-300 font-bold text-amber-950'
                            : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-800'
                        }`}
                        style={{ marginLeft: `${(f.depth || 0) * 12}px` }}
                      >
                        <div className="min-w-0">
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{f.franchiseName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                              {f.franchiseType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {f.directMemberCount} direct members
                          </p>
                        </div>

                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs text-slate-600 font-semibold">
                  {selectedFranchises.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => setShowFranchiseModal(false)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                >
                  Done Selecting
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── USER PICKER POP-UP MODAL WINDOW ── */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-emerald-50/80">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Select Specific Members</h3>
                    <p className="text-[11px] text-slate-500">Pick members across your permitted hierarchy</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search member full name..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                  {loadingUsers && (
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              {/* Results List */}
              <div className="p-3 overflow-y-auto space-y-1 flex-1">
                {userList.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    {loadingUsers ? 'Loading eligible members...' : 'No matching members found.'}
                  </div>
                ) : (
                  userList.map((u) => {
                    const isSelected = selectedUsers.some((su) => su.userId === u.userId);
                    return (
                      <button
                        key={u.userId}
                        type="button"
                        onClick={() => handleToggleUser(u)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 text-xs ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                            : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-800'
                        }`}
                        style={{ marginLeft: `${(u.depth || 0) * 12}px` }}
                      >
                        <div className="min-w-0">
                          <div className="font-bold flex items-center gap-1.5 flex-wrap">
                            <span>{u.fullName || `Member #${u.userId}`}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              u.membershipType === 'OPERATOR'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {u.membershipType || 'MEMBER'}
                            </span>
                          </div>
                          {u.franchiseName && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {u.franchiseName}
                            </p>
                          )}
                        </div>

                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs text-slate-600 font-semibold">
                  {selectedUsers.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Done Selecting
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
