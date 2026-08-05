// components/partnerships/CreatePartnershipModal.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Strategic Partnership Creation Modal (Member Only)
// Implements §5.1 CREATE_PARTNERSHIP with multi-file uploads
// ══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Building2, Upload, FileText, Plus, Trash2, CheckCircle2,
  AlertCircle, ShieldCheck, Sparkles
} from 'lucide-react';
import {
  createPartnership,
  PARTNERSHIP_TIERS,
  PARTNERSHIP_TIER_LABELS
} from '../../api/partnershipsApi';

export default function CreatePartnershipModal({ isOpen, onClose, onSuccess }) {
  const [partnershipTier, setPartnershipTier] = useState(PARTNERSHIP_TIERS.NATIONAL_CHAMBER_OR_MAJOR_CORPORATE);
  const [organisationName, setOrganisationName] = useState('');
  const [description, setDescription] = useState('');
  
  // Documents map: list of { key, label, file }
  const [documentList, setDocumentList] = useState([
    { id: '1', key: 'tradeLicense', label: 'Trade License / Registration', file: null },
    { id: '2', key: 'companyProfile', label: 'Company Profile', file: null },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddDocumentRow = () => {
    const nextIdx = documentList.length + 1;
    setDocumentList((prev) => [
      ...prev,
      { id: String(Date.now()), key: `additionalDoc${nextIdx}`, label: `Supporting Document ${nextIdx}`, file: null },
    ]);
  };

  const handleRemoveDocumentRow = (id) => {
    if (documentList.length <= 1) return;
    setDocumentList((prev) => prev.filter((d) => d.id !== id));
  };

  const handleFileChange = (id, file) => {
    setDocumentList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, file } : d))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!organisationName.trim()) {
      setErrorMsg('Organisation name is required.');
      return;
    }

    const documentsMap = {};
    documentList.forEach((d) => {
      if (d.file) {
        documentsMap[d.key] = d.file;
      }
    });

    if (Object.keys(documentsMap).length === 0) {
      setErrorMsg('At least one supporting document file is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await createPartnership({
        partnershipTier,
        organisationName,
        description,
        documents: documentsMap,
      });

      onSuccess?.(res);
      onClose();
    } catch (err) {
      console.error('❌ Create Partnership Error:', err);
      setErrorMsg(err.message || 'Failed to submit strategic partnership.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Register Strategic Partnership</h2>
              <p className="text-xs text-slate-300">Submit organisation details & documents for 3-tier approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-gray-800">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Partnership Tier */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Partnership Tier <span className="text-rose-500">*</span>
            </label>
            <select
              value={partnershipTier}
              onChange={(e) => setPartnershipTier(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            >
              {Object.entries(PARTNERSHIP_TIER_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Organisation Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Organisation Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gulf Traders Chamber of Commerce"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Partnership Scope & Objective <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe the goals, cross-border logistics, trade scope, or mutual agreement terms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Documents Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Supporting Documents <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddDocumentRow}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Document
              </button>
            </div>

            <div className="space-y-2">
              {documentList.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <input
                        type="text"
                        value={doc.label}
                        onChange={(e) =>
                          setDocumentList((prev) =>
                            prev.map((d) => (d.id === doc.id ? { ...d, label: e.target.value } : d))
                          )
                        }
                        className="text-xs font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:border-blue-500 text-xs font-bold text-gray-700 hover:text-blue-600 transition-all flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      {doc.file ? doc.file.name.slice(0, 18) + (doc.file.name.length > 18 ? '...' : '') : 'Select File'}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileChange(doc.id, e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    {documentList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocumentRow(doc.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Accepts PDF, Word documents, or clear scanned images (max 10MB per document).
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>Submitting...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Submit Partnership for Approval
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
