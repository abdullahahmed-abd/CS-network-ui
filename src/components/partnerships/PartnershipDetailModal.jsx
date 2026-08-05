// components/partnerships/PartnershipDetailModal.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Strategic Partnership Detail & Action Modal
// Implements 3-Stage Approval Timeline, Document Download (§3.6),
// Comments History (§5.4), & Role-Gated Actions with Checkbox Gate (§5.5, §7)
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, Building2, CheckCircle2, Clock, AlertCircle, FileText, Download,
  MessageSquare, User, ShieldCheck, ThumbsUp, ThumbsDown, Sparkles
} from 'lucide-react';
import {
  fetchPartnershipDetails,
  approvePartnership,
  rejectPartnership,
  downloadPartnershipDocument,
  PARTNERSHIP_STATUSES,
  PARTNERSHIP_TIER_LABELS,
  CURRENT_STAGE_LABELS,
  getPartnershipRoleCategory
} from '../../api/partnershipsApi';
import { getUserData } from '../../api/auth';

export default function PartnershipDetailModal({ partnershipId, isOpen, onClose, onActionSuccess }) {
  const user = getUserData() || {};
  const roleCategory = getPartnershipRoleCategory(user);

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Approve / Reject Form States
  const [ackChecked, setAckChecked] = useState(false);
  const [approveComment, setApproveComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!isOpen || !partnershipId) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg('');
    setActionSuccessMsg('');
    setAckChecked(false);
    setShowRejectInput(false);

    fetchPartnershipDetails(partnershipId)
      .then((res) => {
        if (!isMounted) return;
        setDetails(res?.partnershipDetails || null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('fetchPartnershipDetails error:', err);
        setErrorMsg(err.message || 'Failed to load partnership details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, partnershipId]);

  if (!isOpen) return null;

  const currentStatus = details?.status || PARTNERSHIP_STATUSES.PENDING_OPERATOR_APPROVAL;

  // Determine whether current logged in user role can act on this stage (§7 Visibility Matrix)
  const canAct = (() => {
    if (!details) return false;
    if (currentStatus === PARTNERSHIP_STATUSES.APPROVED || currentStatus === PARTNERSHIP_STATUSES.REJECTED) {
      return false;
    }
    if (roleCategory === 'MEMBER') return false;

    if (roleCategory === 'GENERAL_SECTOR_OPERATOR' && currentStatus === PARTNERSHIP_STATUSES.PENDING_OPERATOR_APPROVAL) {
      return true;
    }
    if (roleCategory === 'MASTER_OPERATOR' && currentStatus === PARTNERSHIP_STATUSES.PENDING_MASTER_APPROVAL) {
      return true;
    }
    if (roleCategory === 'GLOBAL_ADMIN' && currentStatus === PARTNERSHIP_STATUSES.PENDING_ADMIN_APPROVAL) {
      return true;
    }
    return false;
  })();

  const handleDownload = async (doc) => {
    try {
      setDownloadingId(doc.documentId);
      await downloadPartnershipDocument(doc.documentId, `${doc.documentName || 'document'}.pdf`);
    } catch (err) {
      alert(err.message || 'Failed to download document.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleApprove = async () => {
    if (!ackChecked) {
      setErrorMsg('You must review and check the acknowledgement box before approving.');
      return;
    }
    setErrorMsg('');
    setSubmittingAction(true);

    try {
      const res = await approvePartnership({
        partnershipId: details.partnershipId,
        comment: approveComment,
      });

      setActionSuccessMsg(res.message || 'Partnership approved successfully.');
      onActionSuccess?.();
      // Refresh details
      const refreshed = await fetchPartnershipDetails(details.partnershipId);
      setDetails(refreshed?.partnershipDetails || null);
    } catch (err) {
      console.error('Approve Error:', err);
      setErrorMsg(err.message || 'Failed to approve partnership.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setErrorMsg('Rejection reason is required.');
      return;
    }
    setErrorMsg('');
    setSubmittingAction(true);

    try {
      const res = await rejectPartnership({
        partnershipId: details.partnershipId,
        rejectionReason,
      });

      setActionSuccessMsg(res.message || 'Partnership rejected.');
      onActionSuccess?.();
      // Refresh details
      const refreshed = await fetchPartnershipDetails(details.partnershipId);
      setDetails(refreshed?.partnershipDetails || null);
    } catch (err) {
      console.error('Reject Error:', err);
      setErrorMsg(err.message || 'Failed to reject partnership.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {details ? details.organisationName : 'Partnership Details'}
              </h2>
              <p className="text-xs text-slate-300">
                {details
                  ? `${PARTNERSHIP_TIER_LABELS[details.partnershipTier] || details.partnershipTier} • ID #${details.partnershipId}`
                  : 'Strategic Partnership Record'}
              </p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
          {loading ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold">Loading partnership record...</p>
            </div>
          ) : errorMsg && !details ? (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : details ? (
            <>
              {/* Action Banner Message */}
              {actionSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-bold">{actionSuccessMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Status Header Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Current Workflow Stage (§6)
                  </span>
                  <div className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                    {CURRENT_STAGE_LABELS[details.status] || details.currentStage || details.status}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Creator & Franchise
                  </span>
                  <p className="text-xs font-bold text-gray-800">
                    {details.createdByName || details.createdBy || 'Member'} • {details.franchiseName}
                  </p>
                </div>
              </div>

              {/* Description */}
              {details.description && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Partnership Scope & Terms
                  </h3>
                  <p className="text-xs text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed font-medium">
                    {details.description}
                  </p>
                </div>
              )}

              {/* 3-Stage Approval Timeline (§1.1 & §5.4) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" /> 3-Stage Approval Chain Workflow (§1.1)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Stage 1: Franchise Operator */}
                  <div
                    className={`p-4 rounded-2xl border ${
                      details.operatorApproval
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : details.status === PARTNERSHIP_STATUSES.PENDING_OPERATOR_APPROVAL
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                        : details.status === PARTNERSHIP_STATUSES.REJECTED
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500">Stage 1</span>
                      {details.operatorApproval ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-gray-900">Franchise Operator</h4>
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">
                      {details.operatorApproval
                        ? `Approved by ${details.operatorApproval.userName}`
                        : details.status === PARTNERSHIP_STATUSES.PENDING_OPERATOR_APPROVAL
                        ? 'Awaiting Operator Approval'
                        : 'Pending'}
                    </p>
                  </div>

                  {/* Stage 2: Master Operator */}
                  <div
                    className={`p-4 rounded-2xl border ${
                      details.masterApproval
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : details.status === PARTNERSHIP_STATUSES.PENDING_MASTER_APPROVAL
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                        : details.status === PARTNERSHIP_STATUSES.REJECTED
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500">Stage 2</span>
                      {details.masterApproval ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-gray-900">Master Operator</h4>
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">
                      {details.masterApproval
                        ? `Approved by ${details.masterApproval.userName}`
                        : details.status === PARTNERSHIP_STATUSES.PENDING_MASTER_APPROVAL
                        ? 'Awaiting Master Approval'
                        : 'Pending'}
                    </p>
                  </div>

                  {/* Stage 3: Global Admin */}
                  <div
                    className={`p-4 rounded-2xl border ${
                      details.adminApproval
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : details.status === PARTNERSHIP_STATUSES.PENDING_ADMIN_APPROVAL
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                        : details.status === PARTNERSHIP_STATUSES.REJECTED
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500">Stage 3</span>
                      {details.adminApproval ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-gray-900">Global Admin</h4>
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">
                      {details.adminApproval
                        ? `Approved by ${details.adminApproval.userName}`
                        : details.status === PARTNERSHIP_STATUSES.PENDING_ADMIN_APPROVAL
                        ? 'Awaiting Global Admin Approval'
                        : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supporting Documents with Download Endpoint (§3.6) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" /> Uploaded Documents (§3.6 Download Endpoint)
                </h3>

                {Array.isArray(details.documents) && details.documents.length > 0 ? (
                  <div className="space-y-2">
                    {details.documents.map((doc) => (
                      <div
                        key={doc.documentId}
                        className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{doc.documentName}</p>
                            <p className="text-[11px] text-gray-500 font-mono">
                              {doc.fileType || 'application/pdf'} • {Math.round((doc.fileSize || 0) / 1024)} KB
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={downloadingId === doc.documentId}
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-300 hover:border-indigo-500 text-xs font-bold text-gray-700 hover:text-indigo-600 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                          {downloadingId === doc.documentId ? 'Downloading...' : 'View / Download'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    No documents attached to this partnership.
                  </p>
                )}
              </div>

              {/* Approval Comments History */}
              {Array.isArray(details.approvalComments) && details.approvalComments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-600" /> Approver Comments Log
                  </h3>
                  <div className="space-y-2">
                    {details.approvalComments.map((c, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{c.userName} ({CURRENT_STAGE_LABELS[c.stepStatus] || c.stepStatus})</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-slate-600">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Role-Gated Action Controls (§5.5, §5.6, §7) */}
              {canAct && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-slate-50 to-blue-50/90 border border-indigo-200 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" /> Action Required: Your Stage Review
                  </div>

                  {/* UI Reminder Gate: Required Checkbox (§5.5) */}
                  <label className="flex items-start gap-2.5 cursor-pointer bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-sm">
                    <input
                      type="checkbox"
                      checked={ackChecked}
                      onChange={(e) => setAckChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-gray-800">
                      I have carefully reviewed all partnership details and supporting documents before approving this partnership.
                    </span>
                  </label>

                  {/* Comment Input */}
                  {!showRejectInput ? (
                    <div>
                      <input
                        type="text"
                        placeholder="Add an optional review comment..."
                        value={approveComment}
                        onChange={(e) => setApproveComment(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                  ) : (
                    <div>
                      <textarea
                        rows={2}
                        placeholder="State reason for rejection (Required)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    {!showRejectInput ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowRejectInput(true)}
                          className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> Reject Partnership
                        </button>
                        <button
                          type="button"
                          disabled={!ackChecked || submittingAction}
                          onClick={handleApprove}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Approve & Advance Stage
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowRejectInput(false)}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200/50"
                        >
                          Cancel Rejection
                        </button>
                        <button
                          type="button"
                          disabled={!rejectionReason.trim() || submittingAction}
                          onClick={handleReject}
                          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          Confirm Rejection
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
