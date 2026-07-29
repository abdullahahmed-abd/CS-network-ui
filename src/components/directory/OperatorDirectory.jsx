// components/directory/OperatorDirectory.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Shield,
  Crown,
  Factory,
  Building,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users,
} from 'lucide-react';
import { searchOperators } from '../../api/directoryApi';
import DirectoryFilters from './DirectoryFilters';
import OperatorCard from './OperatorCard';
import MemberProfileModal from './MemberProfileModal';

export default function OperatorDirectory() {
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    state: '',
    city: '',
    franchiseType: '',
    page: 0,
    size: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const fetchOperators = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchOperators(currentFilters);
      setResponseData(res);
    } catch (err) {
      console.error('searchOperators error:', err);
      setError(err.message || 'Failed to load operator directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperators(filters);
  }, [filters, fetchOperators]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      country: '',
      state: '',
      city: '',
      franchiseType: '',
      page: 0,
      size: 10,
    });
  };

  const operatorsPage = responseData?.operators || { content: [], page: 0, totalPages: 0, totalElements: 0 };
  const operatorsList = operatorsPage.content || [];

  // Group operators by franchise type for hierarchy display (MASTER -> SECTOR -> GENERAL)
  const masterOps = operatorsList.filter((op) => op.franchiseType === 'MASTER');
  const sectorOps = operatorsList.filter((op) => op.franchiseType === 'SECTOR');
  const generalOps = operatorsList.filter((op) => op.franchiseType === 'GENERAL' || !op.franchiseType);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-700/40 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-300 border border-white/10">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Staff-Only Operator Org Chart
            </span>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
              Internal Network Operators & Leadership
            </h2>
            <p className="text-xs text-slate-300">
              Hierarchical view of Master, Sector, and General franchise operators in your scope.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <DirectoryFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        isOperatorView={true}
        totalResults={operatorsPage.totalElements}
        loading={loading}
      />

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold">Loading operator org chart...</p>
        </div>
      ) : operatorsList.length === 0 ? (
        <div className="py-16 px-4 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">No Operators Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No operators match your current filters or hierarchy scope.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* MASTER OPERATORS GROUP */}
          {masterOps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-indigo-100">
                <Crown className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  Master Franchise Operators ({masterOps.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {masterOps.map((op) => (
                  <OperatorCard
                    key={op.userId || op.franchiseId}
                    operator={op}
                    onViewProfile={(id) => setSelectedMemberId(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTOR OPERATORS GROUP */}
          {sectorOps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
                <Factory className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  Sector Franchise Operators ({sectorOps.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectorOps.map((op) => (
                  <OperatorCard
                    key={op.userId || op.franchiseId}
                    operator={op}
                    onViewProfile={(id) => setSelectedMemberId(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* GENERAL OPERATORS GROUP */}
          {generalOps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  General Franchise Operators ({generalOps.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generalOps.map((op) => (
                  <OperatorCard
                    key={op.userId || op.franchiseId}
                    operator={op}
                    onViewProfile={(id) => setSelectedMemberId(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {operatorsPage.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 text-xs">
              <div className="text-slate-500">
                Page <span className="font-bold text-slate-800">{filters.page + 1}</span> of{' '}
                <span className="font-bold text-slate-800">{operatorsPage.totalPages}</span>
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
                  disabled={filters.page >= operatorsPage.totalPages - 1 || loading}
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

      {/* Operator Full Profile Modal */}
      {selectedMemberId && (
        <MemberProfileModal
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
        />
      )}
    </div>
  );
}
