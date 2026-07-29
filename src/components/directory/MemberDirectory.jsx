// components/directory/MemberDirectory.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { searchDirectory } from '../../api/directoryApi';
import { getUserData } from '../../api/auth';
import DirectoryBanner from './DirectoryBanner';
import DirectoryFilters from './DirectoryFilters';
import MemberCard from './MemberCard';
import MemberProfileModal from './MemberProfileModal';
import LockedDirectoryState from './LockedDirectoryState';

export default function MemberDirectory({ onUpgradeClick }) {
  const user = getUserData() || {};
  const roles = user.roles || [];
  const isOperatorOrAdmin =
    roles.includes('GLOBAL_ADMIN') ||
    roles.includes('OPERATOR') ||
    roles.includes('MASTER_OPERATOR') ||
    roles.includes('GENERAL_OPERATOR') ||
    roles.includes('ADMIN') ||
    user?.isOperator === true ||
    user?.membershipType === 'OPERATOR';
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    state: '',
    city: '',
    businessSector: '',
    position: '',
    businessAge: '',
    franchiseType: '',
    page: 0,
    size: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const fetchMembers = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchDirectory(currentFilters);
      setResponseData(res);
    } catch (err) {
      console.error('searchDirectory error:', err);
      setError(err.message || 'Failed to load member directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers(filters);
  }, [filters, fetchMembers]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      country: '',
      state: '',
      city: '',
      businessSector: '',
      position: '',
      businessAge: '',
      franchiseType: '',
      page: 0,
      size: 10,
    });
  };

  const membersPage = responseData?.members || { content: [], page: 0, totalPages: 0, totalElements: 0 };
  const membersList = membersPage.content || [];
  const reachPercentage = responseData?.reachPercentage ?? 100;
  const totalNetworkSize = responseData?.totalNetworkSize ?? 0;
  const visibleNetworkSize = responseData?.visibleNetworkSize ?? 0;
  const apiMessage = responseData?.message || '';

  // Check if directory is locked (no active subscription)
  const isLocked =
    (reachPercentage === 0 && totalNetworkSize > 0) ||
    (membersList.length === 0 && apiMessage.toLowerCase().includes('subscription'));

  return (
    <div className="space-y-6">
      {/* Top Banner (Reach & Tier) */}
      {!isLocked && (
        <DirectoryBanner
          reachPercentage={reachPercentage}
          totalNetworkSize={totalNetworkSize}
          visibleNetworkSize={visibleNetworkSize}
          isOperatorOrAdmin={isOperatorOrAdmin}
          onUpgradeClick={onUpgradeClick}
        />
      )}

      {/* Locked State Screen */}
      {isLocked ? (
        <LockedDirectoryState message={apiMessage} onUpgradeClick={onUpgradeClick} />
      ) : (
        <>
          {/* Filters Bar */}
          <DirectoryFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            isOperatorView={false}
            totalResults={membersPage.totalElements}
            loading={loading}
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
              <p className="text-sm font-semibold">Loading member directory...</p>
            </div>
          ) : membersList.length === 0 ? (
            /* Empty Results State */
            <div className="py-16 px-4 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">No Members Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No member cards matched your criteria. Try adjusting your search term or clearing location and business filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Results Grid */
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span>
                  Showing {membersList.length} of {membersPage.totalElements} members
                </span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                  Sorted by Proximity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {membersList.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onViewProfile={(id) => setSelectedMemberId(id)}
                      onUpgradeClick={onUpgradeClick}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination Controls */}
              {membersPage.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 text-xs">
                  <div className="text-slate-500">
                    Page <span className="font-bold text-slate-800">{filters.page + 1}</span> of{' '}
                    <span className="font-bold text-slate-800">{membersPage.totalPages}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={filters.page === 0 || loading}
                      onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      disabled={filters.page >= membersPage.totalPages - 1 || loading}
                      onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Single Member Profile Modal */}
      {selectedMemberId && (
        <MemberProfileModal
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
          onUpgradeClick={onUpgradeClick}
        />
      )}
    </div>
  );
}
