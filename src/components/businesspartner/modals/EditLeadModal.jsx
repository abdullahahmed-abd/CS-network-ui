// components/businesspartner/modals/EditLeadModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Phone, Mail, Building2, Calendar, FileText, Loader2, AlertCircle } from 'lucide-react';
import { updateLeadDetails } from '../../../api/businessPartnerApi';
import { getTodayDateString } from '../../../utils/BpHelpers';
import { COUNTRY_CODES } from '../../../utils/locationData';

export function EditLeadModal({ lead, onClose, onSuccess, showToast }) {
  const [countryCode, setCountryCode] = useState('+971');
  const [formData, setFormData] = useState({
    contactPerson: lead?.contactPerson || '',
    phone: lead?.phone ? lead.phone.replace(/^\+\d+\s*/, '') : '',
    email: lead?.email || '',
    companyName: lead?.companyName || '',
    notes: lead?.notes || '',
    followUpDate: lead?.followUpDate ? lead.followUpDate.split('T')[0] : '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead?.id) return;
    setLoading(true);
    setError('');

    try {
      const fullPhone = formData.phone ? `${countryCode}${formData.phone.replace(/\D/g, '')}` : '';
      const payload = {};
      if (formData.contactPerson !== (lead.contactPerson || '')) payload.contactPerson = formData.contactPerson;
      if (fullPhone && fullPhone !== (lead.phone || '')) payload.phone = fullPhone;
      if (formData.email !== (lead.email || '')) payload.email = formData.email;
      if (formData.companyName !== (lead.companyName || '')) payload.companyName = formData.companyName;
      if (formData.notes !== (lead.notes || '')) payload.notes = formData.notes;
      if (formData.followUpDate) {
        payload.followUpDate = new Date(formData.followUpDate).toISOString();
      }

      const res = await updateLeadDetails(lead.id, payload);
      showToast?.(res?.message || 'Lead details updated successfully!', 'success');
      onSuccess?.(res?.lead || { ...lead, ...payload });
      onClose();
    } catch (err) {
      console.error('updateLeadDetails error:', err);
      setError(err.message || 'Failed to update lead details');
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
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Edit Lead Details</h3>
            <p className="text-xs text-slate-500">Update contact, company, or follow-up notes</p>
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

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" /> Contact Person
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500"
              placeholder="Full Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone
              </label>
              <div className="flex gap-1">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-1 focus:ring-emerald-500 text-xs"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                  className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500"
                  placeholder="10-digit number"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-600" /> Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500"
                placeholder="client@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500"
              placeholder="Company / Business Name"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Follow-up Date
            </label>
            <input
              type="date"
              min={getTodayDateString()}
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600" /> Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-emerald-500 resize-none"
              placeholder="Important notes or lead history..."
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
