// components/businesspartner/modals/ViewProposalsModal.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Loader2, MessageCircle, AlertCircle, Clock, DollarSign, Package } from 'lucide-react';
import { fetchLeadProposals } from '../../../api/businessPartnerApi';

export function ViewProposalsModal({ lead, onClose, onOpenChat }) {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lead?.id) return;
    let isMounted = true;
    setLoading(true);
    setError('');

    fetchLeadProposals(lead.id)
      .then((data) => {
        if (!isMounted) return;
        setMessage(data?.message || '');
        setProposals(Array.isArray(data?.proposals) ? data.proposals : []);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('fetchLeadProposals error:', err);
        setError(err.message || 'Failed to load lead proposals');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lead?.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Trade Proposals</h3>
              <p className="text-xs text-slate-500">For lead: {lead?.companyName || lead?.contactPerson}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            <p className="text-xs font-semibold">Loading proposals...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : proposals.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Proposals Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {message || 'No proposals have been submitted for this lead yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {proposals.map((prop, idx) => (
              <div key={prop.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">Proposal #{prop.id || idx + 1}</span>
                  {prop.status && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {prop.status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Qty</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-0.5">
                      <Package className="w-3 h-3 text-slate-400" />
                      {prop.quantityRequested}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Price / Unit</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      {prop.pricePerUnit}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Timeline</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {prop.timelineDays} days
                    </span>
                  </div>
                </div>

                {prop.conversationId && onOpenChat && (
                  <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                    <button
                      onClick={() => onOpenChat(prop.conversationId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Open Proposal Chat</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
