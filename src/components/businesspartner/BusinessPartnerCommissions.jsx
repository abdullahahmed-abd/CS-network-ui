import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, DollarSign, Clock, CheckCircle2, CheckCheck,
  RefreshCw, Filter, ChevronLeft, ChevronRight, AlertCircle,
  FileText, ShieldCheck, Sparkles, TrendingUp, Layers, ArrowUpRight,
} from 'lucide-react';
import { fetchMyCommissions } from '../../api/businessPartnerApi';

export function BusinessPartnerCommissions({ showToast }) {
  const [commissions,      setCommissions]      = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [statusFilter,     setStatusFilter]     = useState('ALL');
  const [page,             setPage]             = useState(0);
  const [totalPages,       setTotalPages]       = useState(1);
  const [totalRecords,     setTotalRecords]     = useState(0);
  const [totalPending,     setTotalPending]     = useState(0);
  const [totalApproved,    setTotalApproved]    = useState(0);
  const [totalPaid,        setTotalPaid]        = useState(0);

  const loadCommissions = useCallback(async (pg = 0, filter = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchMyCommissions({
        page: pg,
        size: 10,
        commissionStatusFilter: filter,
      });

      setCommissions(res?.commissionEntries || []);
      setTotalPending(res?.totalPendingAmount || 0);
      setTotalApproved(res?.totalApprovedAmount || 0);
      setTotalPaid(res?.totalPaidAmount || 0);
      setTotalPages(res?.totalPages || 1);
      setTotalRecords(res?.totalRecords || 0);
      setPage(res?.currentPage || 0);
    } catch (err) {
      console.error('Fetch commissions error:', err);
      setError(err.message || 'Failed to load commissions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadCommissions(page, statusFilter);
  }, [page, statusFilter, loadCommissions]);

  const fmtCurr = (amt) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amt || 0);
  };

  const fmtDate = (dt) => {
    if (!dt) return '—';
    try {
      return new Date(dt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dt;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-600" />
            Commission Ledger
          </h2>
          <p className="text-sm text-gray-600">
            Track your brokered deal commissions, level splits, and payout statuses.
          </p>
        </div>

        <button
          onClick={() => loadCommissions(page, statusFilter)}
          className="self-start sm:self-auto flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl bg-amber-50/80 border border-amber-200 p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Payout
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-amber-950">
              {fmtCurr(totalPending)}
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              🟡 Generated upon brokered deal closure
            </p>
          </div>
        </motion.div>

        {/* Approved Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl bg-blue-50/80 border border-blue-200 p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Approved
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-blue-950">
              {fmtCurr(totalApproved)}
            </p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">
              🟢 Ready for scheduled disbursement
            </p>
          </div>
        </motion.div>

        {/* Paid Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Total Paid Out
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-emerald-950">
              {fmtCurr(totalPaid)}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              ✅ Disbursed to your account
            </p>
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'APPROVED', 'PAID'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(0);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {st === 'ALL' ? 'All Entries' : st}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-500 font-medium flex-shrink-0">
          {totalRecords} Record{totalRecords !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="h-7 w-7 animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-gray-500">Loading commission entries...</p>
        </div>
      ) : commissions.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 text-center">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
            <Wallet className="h-6 w-6" />
          </div>
          <p className="font-bold text-gray-800 text-sm">No commissions found</p>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            {statusFilter === 'ALL'
              ? 'When brokered deals are marked as completed by intent owners or assigned BPs, commission ledger entries will automatically appear here.'
              : `No ${statusFilter.toLowerCase()} commission entries found.`}
          </p>
        </div>
      ) : (
        /* Commissions Table / Cards */
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Entry / Deal</th>
                    <th className="py-3.5 px-4">Side</th>
                    <th className="py-3.5 px-4">Level</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4">Approved / Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {commissions.map((item) => {
                    const isBuyer = item.side === 'BUYER_SIDE';
                    const isCloser = item.level === 1;

                    let statusBadge = (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                        <Clock className="h-3 w-3" /> PENDING
                      </span>
                    );

                    if (item.status === 'APPROVED') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                          <CheckCircle2 className="h-3 w-3" /> APPROVED
                        </span>
                      );
                    } else if (item.status === 'PAID') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <CheckCheck className="h-3 w-3" /> PAID
                        </span>
                      );
                    }

                    return (
                      <tr key={item.commissionLedgerEntryId || item.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">
                            Entry #{item.commissionLedgerEntryId}
                          </div>
                          <div className="text-[11px] text-gray-500 font-normal">
                            Deal #{item.dealId}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                              isBuyer
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}
                          >
                            {isBuyer ? '🟦 BUYER SIDE' : '🟧 SELLER SIDE'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                              isCloser
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {isCloser ? '👑 Level 1 — Closer (60%)' : `🔗 Level ${item.level} — Referrer`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-extrabold text-sm text-gray-900">
                          {fmtCurr(item.amount)}
                        </td>

                        <td className="py-3.5 px-4">
                          {statusBadge}
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {fmtDate(item.createdAt)}
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {item.status === 'PAID'
                            ? fmtDate(item.paidAt)
                            : item.status === 'APPROVED'
                            ? fmtDate(item.approvedAt)
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
