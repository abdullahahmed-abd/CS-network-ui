// components/businesspartner/modals/ReferLeadModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, UserCheck, ShieldAlert, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { referLead } from '../../../api/businessPartnerApi';

export function ReferLeadModal({ lead, onClose, onSuccess, showToast }) {
  const [toBpId, setToBpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead?.id) return;
    if (!toBpId || Number(toBpId) <= 0) {
      setError('Target Business Partner ID is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await referLead(lead.id, toBpId);
      showToast?.(res?.message || `Lead referred successfully!`, 'success');
      onSuccess?.(lead.id, res?.lead);
      onClose();
    } catch (err) {
      console.error('referLead error:', err);
      setError(err.message || 'Failed to refer lead');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Refer Lead to Business Partner</h3>
              <p className="text-xs text-slate-500">Hand off lead: {lead?.companyName || lead?.contactPerson}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Ownership Transfer Warning
          </div>
          <p className="text-[11px] text-amber-900/80 leading-relaxed">
            Referring a lead transfers ownership completely. The lead will be removed from your pipeline view immediately. Maximum 7 referral hops allowed network-wide.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Target Business Partner ID
            </label>
            <input
              type="number"
              min="1"
              value={toBpId}
              onChange={(e) => setToBpId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
              placeholder="e.g. 208"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>Refer Lead Now</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
