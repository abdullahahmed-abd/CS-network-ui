// components/businesspartner/modals/LeadModal.jsx
import React, { useState } from 'react';
import {
  X, Hash, Phone, Mail, Building2,
  Users, Calendar, MessageSquare,
  Link2, Globe, Briefcase, Edit,
  Send, Trash2, FileText, Sparkles,
  Loader2, AlertCircle, ArrowUpRight, Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFollowUp } from '../../../utils/BpHelpers';
import { updateLeadStage, deleteLead } from '../../../api/businessPartnerApi';

import { EditLeadModal } from './EditLeadModal';
import { CreateProposalModal } from './CreateProposalModal';
import { ViewProposalsModal } from './ViewProposalsModal';
import { ReferLeadModal } from './ReferLeadModal';
import { AttachIntentModal } from './AttachIntentModal';

export function LeadModal({ lead, currentStageId, stages, onClose, onRefresh, showToast, onBrowseLeadIntents }) {
  if (!lead) return null;

  const [currentLead, setCurrentLead] = useState(lead);
  const [activeStage, setActiveStage] = useState(currentStageId || lead.stage || 'NEW_LEAD');

  // Modals state
  const [showEdit, setShowEdit] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [showViewProposals, setShowViewProposals] = useState(false);
  const [showRefer, setShowRefer] = useState(false);
  const [showAttachIntent, setShowAttachIntent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [updatingStage, setUpdatingStage] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const stage = stages.find((s) => s.id === activeStage);
  const followUp = formatFollowUp(currentLead.followUpDate);
  const isInternal = currentLead.leadType === 'INTERNAL';
  const StageIcon = stage?.IconComp;

  const handleStageChange = async (newStage) => {
    if (newStage === activeStage || updatingStage) return;
    setUpdatingStage(true);
    setError('');

    try {
      const res = await updateLeadStage(currentLead.id, newStage);
      setActiveStage(newStage);
      if (res?.lead) setCurrentLead(res.lead);
      showToast?.(`Moved lead to ${newStage.replace(/_/g, ' ')}`, 'success');
      onRefresh?.();
    } catch (err) {
      console.error('updateLeadStage error:', err);
      setError(err.message || 'Failed to update stage');
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleDelete = async () => {
    if (!currentLead?.id || deleting) return;
    setDeleting(true);
    setError('');

    try {
      const res = await deleteLead(currentLead.id);
      showToast?.(res?.message || 'Lead deleted permanently.', 'success');
      onRefresh?.();
      onClose();
    } catch (err) {
      console.error('deleteLead error:', err);
      setError(err.message || 'Failed to delete lead');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-5 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="font-bold text-slate-900 text-lg">
                {currentLead.companyName || currentLead.contactPerson || 'Lead Details'}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                isInternal ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {isInternal ? <Link2 className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {currentLead.leadType || (isInternal ? 'INTERNAL' : 'EXTERNAL')}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {currentLead.contactPerson ? `Contact: ${currentLead.contactPerson}` : 'No contact person'}
            </p>

            {/* Stage Selector */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stage:</span>
              <select
                disabled={updatingStage}
                value={activeStage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {stages.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
              {updatingStage && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />}

              <span className="text-[11px] text-slate-400 font-semibold ml-auto flex items-center gap-1">
                <Hash className="w-3 h-3" /> ID: #{currentLead.id}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* Quick Action Toolbar */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                onClose();
                onBrowseLeadIntents?.(currentLead);
              }}
              className="inline-flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Intents</span>
            </button>

            <button
              onClick={() => setShowEdit(true)}
              className="inline-flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 shadow-2xs transition-all"
            >
              <Edit className="w-3.5 h-3.5 text-emerald-600" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={() => setShowAttachIntent(true)}
              className="inline-flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 shadow-2xs transition-all"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Intent Details</span>
            </button>

            <button
              onClick={() => setShowRefer(true)}
              className="inline-flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 font-semibold border border-slate-200 hover:border-indigo-300 shadow-2xs transition-all"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>Refer Lead</span>
            </button>
          </div>



          {/* Trade Intent Overview */}
          {(currentLead.tradeIntentTitle || currentLead.tradeIntent) && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Trade Intent Attached</h4>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">
                    {currentLead.tradeIntentTitle || currentLead.tradeIntent?.title}
                  </h5>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {currentLead.tradeIntentDescription || currentLead.tradeIntent?.description || 'No additional description'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAttachIntent(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 shadow-2xs text-xs"
                >
                  View Intent
                </button>
              </div>
            </div>
          )}

          {/* Contact Details Grid */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Contact Information</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Contact Person</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {currentLead.contactPerson || '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Company</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {currentLead.companyName || '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Phone</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {currentLead.phone ? (
                    <a href={`tel:${currentLead.phone}`} className="text-emerald-700 hover:underline">
                      {currentLead.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Email</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  {currentLead.email ? (
                    <a href={`mailto:${currentLead.email}`} className="text-emerald-700 hover:underline truncate">
                      {currentLead.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Follow-up Date Chip */}
          {followUp && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Scheduled Follow-up</h4>
              <div className={`p-3 rounded-2xl border flex items-center gap-2 ${
                followUp.overdue ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <Calendar className={`w-4 h-4 ${followUp.overdue ? 'text-rose-600' : 'text-slate-500'}`} />
                <span className="font-semibold">{followUp.text}</span>
                {followUp.overdue && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">
                    OVERDUE
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {currentLead.notes && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Lead Notes</h4>
              <p className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {currentLead.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer / Delete Lead Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all border border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Lead</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>
      </motion.div>

      {/* Sub-Modals */}
      {showEdit && (
        <EditLeadModal
          lead={currentLead}
          onClose={() => setShowEdit(false)}
          onSuccess={(updated) => {
            setCurrentLead(updated);
            onRefresh?.();
          }}
          showToast={showToast}
        />
      )}

      {showProposal && (
        <CreateProposalModal
          lead={currentLead}
          onClose={() => setShowProposal(false)}
          onSuccess={(propId, updatedLead) => {
            if (updatedLead) {
              setCurrentLead(updatedLead);
              if (updatedLead.stage) setActiveStage(updatedLead.stage);
            }
            onRefresh?.();
          }}
          showToast={showToast}
        />
      )}

      {showViewProposals && (
        <ViewProposalsModal
          lead={currentLead}
          onClose={() => setShowViewProposals(false)}
        />
      )}

      {showRefer && (
        <ReferLeadModal
          lead={currentLead}
          onClose={() => setShowRefer(false)}
          onSuccess={() => {
            onRefresh?.();
            onClose();
          }}
          showToast={showToast}
        />
      )}

      {showAttachIntent && (
        <AttachIntentModal
          lead={currentLead}
          onClose={() => setShowAttachIntent(false)}
          onSuccess={(updated) => {
            if (updated) setCurrentLead(updated);
            onRefresh?.();
          }}
          showToast={showToast}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 text-center border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Delete Lead Permanently?</h4>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently delete this lead and its metadata. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}