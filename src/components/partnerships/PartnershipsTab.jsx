// components/partnerships/PartnershipsTab.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Strategic Partnerships Dashboard Tab
// Implements 4 Filter Tabs (§5.3.1), Live Envelope Badges (§5.3.4),
// 2-Level Hierarchy Tree (§5.2), Search & Filter (§5.3), & Modal Integration
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Plus, Search, Filter, Sparkles, CheckCircle2, Clock,
  XCircle, ChevronRight, ChevronDown, Layers, FileText, ExternalLink,
  ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  fetchPartnerships,
  fetchPartnershipHierarchy,
  PARTNERSHIP_FILTERS,
  PARTNERSHIP_TIER_LABELS,
  CURRENT_STAGE_LABELS,
  getPartnershipRoleCategory
} from '../../api/partnershipsApi';
import { getUserData } from '../../api/auth';
import CreatePartnershipModal from './CreatePartnershipModal';
import PartnershipDetailModal from './PartnershipDetailModal';

// Demo Fallback Dataset matching §5.3.4 specification
const DEMO_PARTNERSHIPS = [
  {
    partnershipId: 101,
    organisationName: 'Gulf Traders Chamber of Commerce',
    partnershipTier: 'NATIONAL_CHAMBER_OR_MAJOR_CORPORATE',
    status: 'PENDING_OPERATOR_APPROVAL',
    currentStage: 'Pending Franchise Operator Approval',
    createdBy: 'Ahmed Al Farsi',
    createdByUserId: 55,
    franchiseName: 'Dubai Marina General',
    franchiseId: 4,
    createdAt: '2026-08-01T09:12:44Z',
    rejectionReason: null,
  },
  {
    partnershipId: 102,
    organisationName: 'National Logistics Ministry',
    partnershipTier: 'GOVERNMENT_MINISTRY_OR_AGENCY',
    status: 'PENDING_MASTER_APPROVAL',
    currentStage: 'Pending Master Franchise Approval',
    createdBy: 'Fatima Al-Zahrani',
    createdByUserId: 62,
    franchiseName: 'Abu Dhabi Master Franchise',
    franchiseId: 1,
    createdAt: '2026-08-03T11:20:10Z',
    rejectionReason: null,
  },
  {
    partnershipId: 103,
    organisationName: 'Apex Global Trade Corp',
    partnershipTier: 'STRATEGIC_GLOBAL',
    status: 'APPROVED',
    currentStage: 'Approved',
    createdBy: 'Rashid Al-Mansoori',
    createdByUserId: 118,
    franchiseName: 'India Master Franchise',
    franchiseId: 2,
    createdAt: '2026-07-25T14:05:00Z',
    rejectionReason: null,
  },
];

const DEFAULT_DEMO_HIERARCHY = {
  roots: [
    {
      franchiseId: 1,
      franchiseName: 'India Master Franchise',
      franchiseType: 'MASTER',
      partnershipCount: 1,
      children: [
        { franchiseId: 2, franchiseName: 'M.P General', franchiseType: 'GENERAL', partnershipCount: 1, children: [] },
        { franchiseId: 3, franchiseName: 'Bihar General', franchiseType: 'GENERAL', partnershipCount: 0, children: [] },
        { franchiseId: 4, franchiseName: 'India Drugs Network', franchiseType: 'SECTOR', partnershipCount: 1, children: [] },
      ],
    },
  ],
};

const getFranchiseTypeBadgeStyle = (type) => {
  const t = String(type || 'FRANCHISE').toUpperCase();
  if (t === 'MASTER') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (t === 'GENERAL') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (t === 'SECTOR') return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

export default function PartnershipsTab() {
  const user = getUserData() || {};
  const roleCategory = getPartnershipRoleCategory(user);

  // Filter & Search State
  const [activeFilter, setActiveFilter] = useState(PARTNERSHIP_FILTERS.MY_PENDING);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFranchiseId, setSelectedFranchiseId] = useState(null);

  // Data & Counts
  const [partnerships, setPartnerships] = useState(DEMO_PARTNERSHIPS);
  const [counts, setCounts] = useState({
    totalCount: 3,
    pendingCount: 2,
    approvedCount: 1,
    rejectedCount: 0,
  });
  const [hierarchy, setHierarchy] = useState(DEFAULT_DEMO_HIERARCHY);
  const [isHierarchyExpanded, setIsHierarchyExpanded] = useState(true);

  // UI State
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPartnershipId, setSelectedPartnershipId] = useState(null);

  // 1. Fetch Hierarchy (§5.2) once per session
  useEffect(() => {
    if (roleCategory === 'MEMBER') return;

    fetchPartnershipHierarchy()
      .then((res) => {
        if (res?.hierarchy) {
          setHierarchy(res.hierarchy);
        }
      })
      .catch((err) => console.warn('fetchPartnershipHierarchy error:', err));
  }, [roleCategory]);

  // 2. Fetch Partnerships (§5.3) whenever filter, search, or selected franchise changes
  const loadPartnerships = async () => {
    setLoading(true);
    try {
      const res = await fetchPartnerships({
        filter: activeFilter,
        page: 0,
        size: 50,
        search: searchQuery,
        franchiseId: selectedFranchiseId,
      });

      if (Array.isArray(res?.partnerships)) {
        setPartnerships(res.partnerships);
      }
      if (res?.totalCount !== undefined) {
        setCounts({
          totalCount: res.totalCount || 0,
          pendingCount: res.pendingCount || 0,
          approvedCount: res.approvedCount || 0,
          rejectedCount: res.rejectedCount || 0,
        });
      }
    } catch (err) {
      console.warn('fetchPartnerships failed, relying on demo state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerships();
  }, [activeFilter, searchQuery, selectedFranchiseId]);

  // Filtered Client Fallback
  const displayPartnerships = partnerships.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.organisationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.createdBy && p.createdBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.franchiseName && p.franchiseName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFranchise = !selectedFranchiseId || String(p.franchiseId) === String(selectedFranchiseId);

    return matchesSearch && matchesFranchise;
  });

  return (
    <div className="space-y-6 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5" /> Strategic Partnership Module (v1.1)
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Strategic Partnerships Dashboard
            </h1>
            <p className="text-sm text-blue-100/80 mt-1 max-w-2xl font-medium">
              Register and manage corporate & government partnerships across the 3-tier approval hierarchy ({roleCategory.replace(/_/g, ' ')}).
            </p>
          </div>

          {roleCategory === 'MEMBER' && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Register Partnership
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Hierarchy Tree + Right Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Franchise Hierarchy Tree Panel (§5.2) */}
        {roleCategory !== 'MEMBER' && (
          <div className="lg:col-span-1 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" /> Franchise Tree (§5.2)
              </h3>
              {selectedFranchiseId && (
                <button
                  onClick={() => setSelectedFranchiseId(null)}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedFranchiseId(null)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  selectedFranchiseId === null
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>All Franchises</span>
                <span className="text-[10px] font-extrabold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                  {counts.totalCount}
                </span>
              </button>

              {/* Render hierarchy tree nodes */}
              {hierarchy?.roots?.map((masterNode) => (
                <div key={masterNode.franchiseId} className="space-y-1 pt-1">
                  <button
                    onClick={() => setSelectedFranchiseId(masterNode.franchiseId)}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      selectedFranchiseId === masterNode.franchiseId
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{masterNode.franchiseName}</span>
                    <span className={`text-[10px] font-extrabold border px-1.5 py-0.5 rounded font-mono ${getFranchiseTypeBadgeStyle(masterNode.franchiseType)}`}>
                      {masterNode.franchiseType || 'MASTER'}
                    </span>
                  </button>

                  {/* Children (General / Sector) */}
                  {Array.isArray(masterNode.children) && masterNode.children.length > 0 && (
                    <div className="pl-4 border-l border-gray-200 ml-3 space-y-1">
                      {masterNode.children.map((child) => (
                        <button
                          key={child.franchiseId}
                          onClick={() => setSelectedFranchiseId(child.franchiseId)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                            selectedFranchiseId === child.franchiseId
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate">{child.franchiseName}</span>
                          <span className={`text-[9px] font-extrabold border px-1.5 py-0.5 rounded font-mono ${getFranchiseTypeBadgeStyle(child.franchiseType)}`}>
                            {child.franchiseType || 'GENERAL'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Dashboard Table & Controls */}
        <div className={`space-y-4 ${roleCategory === 'MEMBER' ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
          {/* 4 Filter Tabs (§5.3.1) with Count Badges (§5.3.4) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 overflow-x-auto p-1">
              {[
                { id: PARTNERSHIP_FILTERS.MY_PENDING, label: 'Pending Review', count: counts.pendingCount, color: 'amber' },
                { id: PARTNERSHIP_FILTERS.APPROVED, label: 'Approved', count: counts.approvedCount, color: 'emerald' },
                { id: PARTNERSHIP_FILTERS.REJECTED, label: 'Rejected', count: counts.rejectedCount, color: 'rose' },
                { id: PARTNERSHIP_FILTERS.ALL, label: 'All Partnerships', count: counts.totalCount, color: 'blue' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100/80'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      activeFilter === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 px-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-5 top-3" />
              <input
                type="text"
                placeholder="Search organisation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Partnerships List Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-gray-400 space-y-2">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold">Loading partnerships...</p>
              </div>
            ) : displayPartnerships.length === 0 ? (
              <div className="py-16 text-center text-gray-400 space-y-3">
                <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">No strategic partnerships found.</p>
                <p className="text-xs text-gray-500">Try adjusting your filter, search, or hierarchy selection.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Organisation</th>
                      <th className="px-6 py-4">Tier</th>
                      <th className="px-6 py-4">Creator / Franchise</th>
                      <th className="px-6 py-4">Current Workflow Stage (§6)</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayPartnerships.map((p) => (
                      <tr key={p.partnershipId} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 text-sm">{p.organisationName}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">ID #{p.partnershipId}</p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100 text-[11px]">
                            {PARTNERSHIP_TIER_LABELS[p.partnershipTier] || p.partnershipTier}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800">{p.createdBy || p.createdByName || 'Member'}</p>
                          <p className="text-[11px] text-gray-500">{p.franchiseName}</p>
                        </td>

                        <td className="px-6 py-4 font-semibold text-gray-700">
                          {CURRENT_STAGE_LABELS[p.status] || p.currentStage || p.status}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5 ${
                              p.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {p.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {p.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                            {p.status.includes('PENDING') && <Clock className="w-3.5 h-3.5" />}
                            {p.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedPartnershipId(p.partnershipId)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreatePartnershipModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          loadPartnerships();
        }}
      />

      {/* Detail Modal */}
      <PartnershipDetailModal
        partnershipId={selectedPartnershipId}
        isOpen={!!selectedPartnershipId}
        onClose={() => setSelectedPartnershipId(null)}
        onActionSuccess={() => {
          loadPartnerships();
        }}
      />
    </div>
  );
}
