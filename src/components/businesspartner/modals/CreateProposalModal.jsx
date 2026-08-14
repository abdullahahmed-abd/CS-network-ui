import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, DollarSign, Package, Clock, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { createProposalForLead, createProposalForIntent } from '../../../api/businessPartnerApi';

export function CreateProposalModal({ intent, lead, onClose, onSuccess, showToast }) {
  const targetIntent = intent || lead?.tradeIntent;

  const [formData, setFormData] = useState({
    quantityRequested: targetIntent?.quantity ? String(targetIntent.quantity) : '',
    pricePerUnit: targetIntent?.pricePerUnit ? String(targetIntent.pricePerUnit) : '',
    timelineDays: '30',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const targetIntentId = intent?.id || intent?.tradeIntentId || intent?.intentId || lead?.tradeIntentId || lead?.tradeIntent?.id;

    if (!formData.quantityRequested || Number(formData.quantityRequested) <= 0) {
      setError('Quantity requested must be greater than 0');
      return;
    }
    if (!formData.pricePerUnit || Number(formData.pricePerUnit) <= 0) {
      setError('Price per unit must be greater than 0');
      return;
    }
    if (!formData.timelineDays || Number(formData.timelineDays) <= 0) {
      setError('Timeline in days is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let res;
      // ✅ STRICT CONTEXT SEPARATION:
      // If lead.id is present, it's a Business Partner submitting for a lead -> ONLY call createProposalForLead
      // Otherwise, it's a normal user submitting for an intent -> ONLY call createProposalForIntent
      if (lead?.id) {
        res = await createProposalForLead(lead.id, {
          tradeIntentId: targetIntentId,
          quantityRequested: formData.quantityRequested,
          pricePerUnit: formData.pricePerUnit,
          timelineDays: formData.timelineDays,
        });
      } else if (targetIntentId) {
        res = await createProposalForIntent(targetIntentId, {
          quantityRequested: formData.quantityRequested,
          pricePerUnit: formData.pricePerUnit,
          timelineDays: formData.timelineDays,
        });
      }

      showToast?.(res?.message || 'Trade proposal submitted successfully!', 'success');
      onSuccess?.(res?.proposalId, res?.lead);
      onClose();
    } catch (err) {
      console.error('createProposal error:', err);
      setError(err.message || 'Failed to submit proposal');
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
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Raise Trade Proposal</h3>
              <p className="text-xs text-slate-500">
                {intent ? `For Intent: ${intent.title || 'Trade Intent'}` : `For Lead: ${lead?.companyName || lead?.contactPerson}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {lead?.id && (
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Raising a proposal will automatically advance this lead to the <strong>NEGOTIATION</strong> stage.
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-emerald-600" /> Quantity Requested
            </label>
            <input
              type="number"
              min="0"
              onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
              value={formData.quantityRequested}
              onChange={(e) => setFormData({ ...formData, quantityRequested: e.target.value.replace(/-/g, '') })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. 200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Price Per Unit
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value.replace(/-/g, '') })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. 11.50"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> Timeline (Days)
              </label>
              <input
                type="number"
                min="0"
                onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                value={formData.timelineDays}
                onChange={(e) => setFormData({ ...formData, timelineDays: e.target.value.replace(/-/g, '') })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. 30"
                required
              />
            </div>
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold shadow-xs disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit Proposal</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
