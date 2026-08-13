// components/meetings/MeetingsList.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Meetings List & Search Screen (v2 Implementation)
// Role-Aware Filtering, Real Backend Pagination & Dynamic Status Badges
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Calendar, Clock, Video, MapPin, Users,
  Building2, CheckCircle2, Copy, ExternalLink, RefreshCw,
  ChevronLeft, ChevronRight, X, AlertCircle, Sparkles, UserCheck,
  CheckCircle, Ban, Tag, ArrowUpDown
} from 'lucide-react';
import {
  fetchMeetings,
  fetchEligibleFranchises,
  getMeetingRoleCategory,
  MEETING_STATUSES,
  MEETING_AUDIENCE_SCOPES,
  MEETING_LOCATION_TYPES
} from '../../api/meetingsApi';
import { getUserData } from '../../api/auth';

export default function MeetingsList({ onScheduleClick }) {
  const user = getUserData() || {};
  const roleCategory = getMeetingRoleCategory(user);

  const isGlobalAdmin = roleCategory === 'GLOBAL_ADMIN';
  const isMasterOperator = roleCategory === 'MASTER_OPERATOR';
  const isMember = roleCategory === 'MEMBER';
  const canSeeFranchiseFilter = isGlobalAdmin || isMasterOperator;

  // Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [audienceScopeFilter, setAudienceScopeFilter] = useState('');
  const [scheduledByMe, setScheduledByMe] = useState(false);
  const [invitedToMe, setInvitedToMe] = useState(false);
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [locationTypeFilter, setLocationTypeFilter] = useState('');
  const [targetFranchiseId, setTargetFranchiseId] = useState('');

  // Pagination & Data States
  const [meetings, setMeetings] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState({
    totalPages: 1,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
    first: true,
    last: true,
  });

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Eligible Franchises (for Global Admin & Master)
  const [eligibleFranchises, setEligibleFranchises] = useState([]);
  const [loadingFranchises, setLoadingFranchises] = useState(false);

  // Search debounce timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch eligible franchises if user is Global Admin or Master
  useEffect(() => {
    if (canSeeFranchiseFilter) {
      let isMounted = true;
      setLoadingFranchises(true);
      fetchEligibleFranchises({ size: 100 })
        .then((res) => {
          if (!isMounted) return;
          const list = res?.franchises?.content || res?.content || res?.franchises || [];
          setEligibleFranchises(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          console.warn('Failed to load eligible franchises for filter:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingFranchises(false);
        });
      return () => { isMounted = false; };
    }
  }, [canSeeFranchiseFilter]);

  // Reset page to 0 when filters change
  const handleFilterChange = useCallback(() => {
    setPage(0);
  }, []);

  // Fetch meetings function
  const loadMeetings = useCallback(
    async (targetPage = 0, isAppend = false) => {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const queryParams = {
          page: targetPage,
          size: pageSize,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(statusFilter && { statusFilter }),
          ...(audienceScopeFilter && { audienceScopeFilter }),
          ...(scheduledByMe && { scheduledByMe: true }),
          ...(invitedToMe && { invitedToMe: true }),
          ...(upcomingOnly && { upcomingOnly: true }),
          ...(locationTypeFilter && { locationTypeFilter }),
          ...(targetFranchiseId && { targetFranchiseId }),
        };

        const response = await fetchMeetings(queryParams);
        const meetingPage = response?.meetings || response || {};
        let rawContent = Array.isArray(meetingPage?.content) ? meetingPage.content : [];

        // §4 Client-side workaround for upcomingOnly sort order
        // Re-sort ascending (soonest first) if upcomingOnly is active
        if (upcomingOnly) {
          rawContent = [...rawContent].sort(
            (a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0)
          );
        }

        if (isAppend) {
          setMeetings((prev) => [...prev, ...rawContent]);
        } else {
          setMeetings(rawContent);
        }

        setPageInfo({
          totalPages: meetingPage.totalPages ?? 1,
          totalElements: meetingPage.totalElements ?? rawContent.length,
          hasNext: meetingPage.hasNext ?? false,
          hasPrevious: meetingPage.hasPrevious ?? false,
          first: meetingPage.first ?? (targetPage === 0),
          last: meetingPage.last ?? true,
        });
      } catch (err) {
        console.error('Error fetching meetings list:', err);
        setError(err.message || 'Failed to fetch meetings. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      debouncedSearch,
      statusFilter,
      audienceScopeFilter,
      scheduledByMe,
      invitedToMe,
      upcomingOnly,
      locationTypeFilter,
      targetFranchiseId,
      pageSize,
    ]
  );

  // Trigger load whenever filters or page changes
  useEffect(() => {
    loadMeetings(page, page > 0 && !isGlobalAdmin);
  }, [
    page,
    debouncedSearch,
    statusFilter,
    audienceScopeFilter,
    scheduledByMe,
    invitedToMe,
    upcomingOnly,
    locationTypeFilter,
    targetFranchiseId,
    loadMeetings,
    isGlobalAdmin,
  ]);

  const handleNextPage = () => {
    if (pageInfo.hasNext || page < pageInfo.totalPages - 1) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  const handleLoadMore = () => {
    if (pageInfo.hasNext && !loadingMore) {
      setPage((prev) => prev + 1);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('');
    setAudienceScopeFilter('');
    setScheduledByMe(false);
    setInvitedToMe(false);
    setUpcomingOnly(false);
    setLocationTypeFilter('');
    setTargetFranchiseId('');
    setPage(0);
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(statusFilter) ||
    Boolean(audienceScopeFilter) ||
    scheduledByMe ||
    invitedToMe ||
    upcomingOnly ||
    Boolean(locationTypeFilter) ||
    Boolean(targetFranchiseId);

  const handleCopyLink = (m) => {
    const text = m.meetingLink || m.address || `Meeting #${m.meetingId}`;
    navigator.clipboard.writeText(text);
    setCopiedId(m.meetingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Badge Color & Icon Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Scheduled',
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
          label: 'In Progress',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Completed',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-gray-100 text-gray-600 border-gray-200',
          dot: 'bg-gray-400',
          label: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status || 'Unknown',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────
          FILTER BAR (§2 & §3)
          ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
              placeholder="Search meetings by title or organizer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  handleFilterChange();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action Filter Chips (Boolean include-only toggles per §2) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setScheduledByMe((prev) => !prev);
                handleFilterChange();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                scheduledByMe
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Organized by me
            </button>

            <button
              onClick={() => {
                setInvitedToMe((prev) => !prev);
                handleFilterChange();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                invitedToMe
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Invited to me
            </button>

            <button
              onClick={() => {
                setUpcomingOnly((prev) => !prev);
                handleFilterChange();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                upcomingOnly
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Upcoming only
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Audience Scope Dropdown */}
          {!isMember && (
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                Audience Scope
              </label>
              <select
                value={audienceScopeFilter}
                onChange={(e) => {
                  setAudienceScopeFilter(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="">All Audience Scopes</option>
                <option value="DIRECT">Direct 1-to-1</option>
                <option value="SPECIFIC_USERS">Specific Members</option>
                <option value="SPECIFIC_FRANCHISE">Specific Franchise</option>
                <option value="FRANCHISE_DOWNLINE">Franchise Downline</option>
                {isGlobalAdmin && <option value="ALL">Platform Wide (ALL)</option>}
              </select>
            </div>
          )}

          {/* Location Type Filter */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
              Location Type
            </label>
            <select
              value={locationTypeFilter}
              onChange={(e) => {
                setLocationTypeFilter(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">All Locations</option>
              <option value="ONLINE">Online Video Call</option>
              <option value="OFFLINE">Offline / In-Person</option>
            </select>
          </div>

          {/* Franchise Picker Dropdown — Global Admin & Master Only (§3) */}
          {canSeeFranchiseFilter && (
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                Franchise Scope {loadingFranchises && '(Loading...)'}
              </label>
              <select
                value={targetFranchiseId}
                onChange={(e) => {
                  setTargetFranchiseId(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="">All Franchises</option>
                {eligibleFranchises.map((f) => (
                  <option key={f.franchiseId || f.id} value={f.franchiseId || f.id}>
                    {f.name || f.franchiseName || `Franchise #${f.franchiseId || f.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active Filters Clear Action */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs font-medium text-gray-500">
            <span>
              Showing results for active filter selection
            </span>
            <button
              onClick={clearAllFilters}
              className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────
          MEETINGS CARD LIST & EMPTY STATES (§5 & §6)
          ───────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadMeetings(0)}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-600">Fetching meetings feed from backend...</p>
          </div>
        ) : meetings.length === 0 ? (
          /* Empty States (§6) */
          <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8" />
            </div>

            {targetFranchiseId ? (
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-gray-900">
                  No specifically-targeted meetings found for this franchise
                </h3>
                <p className="text-xs text-gray-500">
                  No meetings matching <code className="bg-gray-100 px-1.5 py-0.5 rounded text-emerald-700">SPECIFIC_FRANCHISE</code> scope were found for the selected franchise.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : hasActiveFilters ? (
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-gray-900">No meetings match these filters</h3>
                <p className="text-xs text-gray-500">
                  Try broadening your search query or adjusting your status and audience scope filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-gray-900">You don't have any meetings yet</h3>
                <p className="text-xs text-gray-500">
                  {roleCategory !== 'MEMBER'
                    ? 'Schedule a new meeting with your franchise, specific members, or network.'
                    : '1-to-1 meetings scheduled in your active deal chats will appear here.'}
                </p>
                {roleCategory !== 'MEMBER' && onScheduleClick && (
                  <button
                    onClick={onScheduleClick}
                    className="mt-3 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md transition"
                  >
                    + Schedule New Meeting
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Cards Grid / List */
          <div className="space-y-3">
            {meetings.map((m) => {
              const statusBadge = getStatusBadge(m.status);
              return (
                <motion.div
                  key={m.meetingId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-3xl bg-white border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    {/* Header Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold font-mono uppercase">
                        ID #{m.meetingId}
                      </span>
                      {m.audienceScope && (
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                          {m.audienceScope}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-md border text-[10px] font-extrabold uppercase flex items-center gap-1.5 ${statusBadge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
                      {m.description && (
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{m.description}</p>
                      )}
                    </div>

                    {/* Information Strip */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1 flex-wrap font-medium">
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : 'TBD'}
                      </span>
                      {m.durationMinutes && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {m.durationMinutes} mins
                        </span>
                      )}
                      {m.inviteeCount !== undefined && (
                        <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] font-bold">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          {m.inviteeCount} invited
                        </span>
                      )}
                      <span className="text-gray-400 text-[11px]">
                        Organizer: <strong className="text-gray-700">{m.organizerName || 'Unknown'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right Action Block */}
                  <div className="flex items-center gap-3 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-5">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-gray-800">
                        {m.locationType === 'ONLINE' ? (
                          <Video className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <MapPin className="w-4 h-4 text-emerald-600" />
                        )}
                        {m.locationType || 'ONLINE'}
                      </div>
                      <p className="text-[11px] text-gray-500 max-w-[180px] truncate font-mono mt-0.5">
                        {m.meetingLink || m.address || 'Link pending'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyLink(m)}
                      className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-gray-200"
                      title="Copy Meeting Link / Info"
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
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────
          PAGINATION STRATEGY (§7)
          Global Admin -> Numbered Pagination
          Operator/Member -> "Load More" Append Button
          ───────────────────────────────────────────────────────── */}
      {!loading && meetings.length > 0 && (
        <div className="bg-white rounded-3xl p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing <strong className="text-gray-900">{meetings.length}</strong> of{' '}
            <strong className="text-gray-900">{pageInfo.totalElements}</strong> total meetings
          </div>

          {isGlobalAdmin ? (
            /* Global Admin: Numbered Pagination */
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 0 || loading}
                className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="font-extrabold text-gray-800 px-2 font-mono">
                Page {page + 1} of {pageInfo.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!pageInfo.hasNext && page >= pageInfo.totalPages - 1}
                className="px-3 py-1.5 rounded-xl border border-gray-200 font-bold bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Operator / Member: "Load More" Button */
            pageInfo.hasNext && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs transition flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" /> Loading...
                  </>
                ) : (
                  'Load More Meetings'
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
