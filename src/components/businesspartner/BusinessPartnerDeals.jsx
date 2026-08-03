import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Handshake, CheckCircle2, Clock, Award, ChevronRight,
  ShieldCheck, CheckCheck, Users, RefreshCw, AlertCircle,
  DollarSign, Package, UserCheck, ChevronLeft, Building, Sparkles
} from 'lucide-react';
import { fetchMyCompletedDeals } from '../../api/businessPartnerApi';

export function BusinessPartnerDeals({ leads = {}, onNavigateToCommissions }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadDeals = useCallback(async (pg = 0) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchMyCompletedDeals({ page: pg, size: 10 });
      setDeals(res?.deals || []);
      setTotalPages(res?.totalPages || 1);
      setTotalRecords(res?.totalRecords || 0);
      setPage(res?.currentPage || 0);
    } catch (err) {
      console.error('Fetch completed deals error:', err);
      setError(err.message || 'Failed to load completed deals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeals(page);
  }, [page, loadDeals]);

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
            <Handshake className="h-6 w-6 text-emerald-600" />
            Completed Deals
          </h2>
          <p className="text-sm text-gray-600">
            View fulfilled trade deals, counterparty details, and brokered transaction records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDeals(page)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh
          </button>

          {onNavigateToCommissions && (
            <button
              onClick={onNavigateToCommissions}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
            >
              <Award className="h-4 w-4" />
              View Commissions
            </button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              Intent Owner Deal Closure & Commissions
            </p>
            <p className="text-xs text-emerald-700 mt-0.5 max-w-2xl">
              When an Intent Owner clicks <strong>Mark Complete</strong> inside an active deal room chat, the deal is completed and automatically recorded here, generating commission entries for brokered deals.
            </p>
          </div>
        </div>
      </div>

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
          <p className="text-xs font-semibold text-gray-500">Loading completed deals...</p>
        </div>
      ) : deals.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 text-center">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
            <Handshake className="h-6 w-6" />
          </div>
          <p className="font-bold text-gray-800 text-sm">No Completed Deals Found</p>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            When intent owners mark active deals as completed in chat, the fulfilled deals will appear here automatically.
          </p>
        </div>
      ) : (
        /* Deals Grid */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((item) => {
              const isBuyer = item.yourSide === 'BUYER_SIDE';
              const isBrokered = item.dealType === 'BP_BROKERED';

              return (
                <motion.div
                  key={item.dealId}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            isBuyer ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}
                        >
                          {isBuyer ? '🟦 BUYER SIDE' : '🟧 SELLER SIDE'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            isBrokered ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {isBrokered ? '🤝 BROKERED' : '⚡ DIRECT'}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {item.tradeIntentTitle || `Deal #${item.dealId}`}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Deal #{item.dealId} · Closed by {item.closedByName || 'Intent Owner'}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 text-[10px] font-bold flex-shrink-0">
                      <CheckCheck className="h-3 w-3" /> COMPLETED
                    </span>
                  </div>

                  {/* Financial & Quantities Summary */}
                  <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase block">Total Value</span>
                      <span className="font-extrabold text-gray-900 text-sm">{fmtCurr(item.finalTotalValue)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase block">Price/Unit</span>
                      <span className="font-bold text-gray-800">{fmtCurr(item.finalPricePerUnit)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase block">Quantity</span>
                      <span className="font-bold text-gray-800">{item.finalQuantity}</span>
                    </div>
                  </div>

                  {/* Counterparty & Broker Info */}
                  <div className="flex flex-col gap-1 text-xs text-gray-600 bg-emerald-50/40 rounded-xl p-2.5 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-500">Counterparty:</span>
                      <span className="font-bold text-gray-800">{item.counterpartyName || `Member #${item.counterpartyId}`}</span>
                    </div>
                    {item.brokeredOnYourSide && item.yourBrokerName && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-500">Assigned Broker:</span>
                        <span className="font-bold text-emerald-700">{item.yourBrokerName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400 font-medium">
                    <span>Closed Date: {fmtDate(item.closedAt)}</span>
                    <span className="font-semibold text-emerald-600">Verified Completed ✓</span>
                  </div>
                </motion.div>
              );
            })}
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
