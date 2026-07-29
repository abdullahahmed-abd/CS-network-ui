// components/businesspartner/modals/AttachIntentModal.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Briefcase, Link2, Loader2, AlertCircle, CheckCircle, Package, DollarSign } from 'lucide-react';
import { fetchLeadIntent, attachTradeIntentToLead, fetchMemberIntents } from '../../../api/businessPartnerApi';
import { formatEnum } from '../../directory/DirectoryConstants';

export function AttachIntentModal({ lead, onClose, onSuccess, showToast }) {
  const [loading, setLoading] = useState(true);
  const [currentIntent, setCurrentIntent] = useState(null);
  const [memberIntents, setMemberIntents] = useState([]);
  const [selectedIntentId, setSelectedIntentId] = useState('');
  const [manualIntentId, setManualIntentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lead?.id) return;
    let isMounted = true;
    setLoading(true);
    setError('');

    // Fetch existing intent attached to lead
    fetchLeadIntent(lead.id)
      .then((data) => {
        if (!isMounted) return;
        if (data?.intent) {
          setCurrentIntent(data.intent);
        }
      })
      .catch((err) => {
        console.warn('fetchLeadIntent error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // If internal lead with memberId, fetch member's intents
    if (lead.memberId) {
      fetchMemberIntents(lead.memberId)
        .then((data) => {
          if (!isMounted) return;
          const list = data?.intents?.content || data?.intents || [];
          if (Array.isArray(list)) setMemberIntents(list);
        })
        .catch(() => {});
    }
  }, [lead?.id, lead?.memberId]);

  const handleAttach = async (e) => {
    e.preventDefault();
    const intentIdToAttach = selectedIntentId || manualIntentId;
    if (!intentIdToAttach) {
      setError('Please select or enter a Trade Intent ID');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await attachTradeIntentToLead(lead.id, intentIdToAttach);
      showToast?.(res?.message || 'Trade intent attached successfully!', 'success');
      onSuccess?.(res?.lead || lead);
      onClose();
    } catch (err) {
      console.error('attachTradeIntentToLead error:', err);
      setError(err.message || 'Failed to attach trade intent');
    } finally {
      setSubmitting(false);
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
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Trade Intent Details</h3>
              <p className="text-xs text-slate-500">For lead: {lead?.companyName || lead?.contactPerson}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold">Loading intent details...</p>
          </div>
        ) : currentIntent ? (
          /* Already attached intent */
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">Attached Intent</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Attached (ID: #{currentIntent.id})
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm">{currentIntent.title}</h4>
              {currentIntent.description && (
                <p className="text-xs text-slate-600 mt-0.5">{currentIntent.description}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200/60">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Type</span>
                <span className="font-bold text-slate-800">{currentIntent.intentType || 'BUY'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Quantity</span>
                <span className="font-bold text-slate-800">{currentIntent.quantity} {currentIntent.unit || 'units'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Price / Unit</span>
                <span className="font-bold text-emerald-700">${currentIntent.pricePerUnit}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Attach intent form */
          <form onSubmit={handleAttach} className="space-y-4 text-xs">
            <p className="text-slate-600">
              This lead has no trade intent attached yet. Select an intent or enter a Trade Intent ID to link.
            </p>

            {memberIntents.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select from Member's Intents</label>
                <select
                  value={selectedIntentId}
                  onChange={(e) => {
                    setSelectedIntentId(e.target.value);
                    setManualIntentId('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs"
                >
                  <option value="">-- Choose Member Trade Intent --</option>
                  {memberIntents.map((mi) => (
                    <option key={mi.id} value={mi.id}>
                      #{mi.id} - {mi.title} ({mi.intentType || 'INTENT'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Enter Trade Intent ID</label>
              <input
                type="number"
                value={manualIntentId}
                onChange={(e) => {
                  setManualIntentId(e.target.value);
                  setSelectedIntentId('');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs"
                placeholder="e.g. 77"
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
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>Attach Trade Intent</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
