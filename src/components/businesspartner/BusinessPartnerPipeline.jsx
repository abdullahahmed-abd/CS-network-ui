import React, { useState } from 'react';
import {
  Plus, Phone, Mail, MessageSquare,
  Clock, Hash, Calendar, Briefcase,
  User, Link2, Globe, RefreshCw,
  AlertCircle, Loader2, ChevronRight,
  Sprout, PhoneCall, BadgeCheck,
  UserPlus, Scale, Trophy, XCircle, Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { LeadModal } from '../businesspartner/modals/LeadModal';
import { PIPELINE_STAGES } from '../constants/BpConstants';
import {
  formatDate,
  formatFollowUp,
  getInitials,
  getStageConfig,
} from '../../utils/BpHelpers';

/* Attach icon components to stages */
const STAGE_ICONS = {
  NEW_LEAD:    Sprout,
  CONTACTED:   PhoneCall,
  QUALIFIED:   BadgeCheck,
  INTRODUCED:  UserPlus,
  NEGOTIATION: Scale,
  CLOSED_WON:  Trophy,
  CLOSED_LOST: XCircle,
};

const STAGES_WITH_ICONS = PIPELINE_STAGES.map(s => ({
  ...s,
  IconComp: STAGE_ICONS[s.id],
}));

export default function BusinessPartnerPipeline({
  leads,
  loading,
  error,
  refreshing,
  activeStage,
  setActiveStage,
  searchQuery,
  onFetchPipeline,
  onAddLead,
  showToast,
  onBrowseLeadIntents,
}) {
  const [selectedLead,  setSelectedLead]  = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);

  const filteredStages =
    activeStage === 'all'
      ? STAGES_WITH_ICONS
      : STAGES_WITH_ICONS.filter(s => s.id === activeStage);

  const filterLeads = (stageLeads) => {
    if (!searchQuery.trim()) return stageLeads;
    const q = searchQuery.toLowerCase();
    return stageLeads.filter(l =>
      (l.companyName      || '').toLowerCase().includes(q) ||
      (l.contactPerson    || '').toLowerCase().includes(q) ||
      (l.email            || '').toLowerCase().includes(q) ||
      (l.phone            || '').includes(searchQuery)     ||
      (l.tradeIntentTitle || '').toLowerCase().includes(q) ||
      (l.notes            || '').toLowerCase().includes(q)
    );
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="bp-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={32} style={{ color: 'var(--primary)' }} />
        </motion.div>
        <div className="bp-loading-text">Loading your pipeline…</div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="bp-error">
        <AlertCircle size={28} style={{ color: 'var(--danger)' }} />
        <div className="bp-error-text">{error}</div>
        <button className="retry-btn" onClick={() => onFetchPipeline()}>
          <RefreshCw size={13} /> Try Again
        </button>
      </div>
    );
  }

  /* ── Kanban Board ── */
  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">
              {activeStage === 'all'
                ? 'Deal Pipeline Board'
                : getStageConfig(activeStage, STAGES_WITH_ICONS)?.label}
            </div>
            <div className="panel-subtitle">
              {searchQuery
                ? `Searching: "${searchQuery}"`
                : 'Click any card for details'}
            </div>
          </div>
          <div className="panel-actions">
            <div
              className="panel-link"
              onClick={() => setActiveStage('all')}
            >
              View All <ChevronRight size={13} />
            </div>
          </div>
        </div>

        <div className="kanban-board">
          {filteredStages.map((stage) => {
            const stageLeads = filterLeads(leads[stage.id] || []);
            const StageIcon  = stage.IconComp;

            return (
              <div className="kanban-column" key={stage.id}>
                {/* Column header */}
                <div
                  className="kanban-col-header"
                  style={{ '--col-color': stage.color }}
                >
                  <div className="kanban-col-title">
                    <div
                      className="kanban-stage-icon"
                      style={{ background: stage.color }}
                    >
                      <StageIcon />
                    </div>
                    {stage.label}
                    <span
                      className="kanban-col-count"
                      style={{ background: stage.color }}
                    >
                      {stageLeads.length}
                    </span>
                  </div>
                  <button
                    className="kanban-col-add"
                    onClick={onAddLead}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Cards */}
                <div className="kanban-cards">
                  <AnimatePresence>
                    {stageLeads.map((lead, li) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        stage={stage}
                        index={li}
                        onClick={() => {
                          setSelectedLead(lead);
                          setSelectedStage(stage.id);
                        }}
                        onBrowseLeadIntents={onBrowseLeadIntents}
                      />
                    ))}
                  </AnimatePresence>

                  {stageLeads.length === 0 && (
                    <div className="kanban-empty">
                      <div className="kanban-empty-icon">
                        <StageIcon />
                      </div>
                      {searchQuery ? 'No matching leads' : 'No leads yet'}
                      <div className="kanban-empty-sub">
                        {searchQuery
                          ? 'Try a different search'
                          : 'Add your first lead to get started'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <LeadModal
            lead={selectedLead}
            currentStageId={selectedStage}
            stages={STAGES_WITH_ICONS}
            onClose={() => {
              setSelectedLead(null);
              setSelectedStage(null);
            }}
            onRefresh={() => onFetchPipeline && onFetchPipeline(true)}
            showToast={showToast}
            onBrowseLeadIntents={onBrowseLeadIntents}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ════════ LeadCard (internal to Pipeline) ════════ */
function LeadCard({ lead, stage, index, onClick, onBrowseLeadIntents }) {
  const isInternal = lead.leadType === 'INTERNAL';
  const followUp   = formatFollowUp(lead.followUpDate);
  const initials   = getInitials(lead.companyName || lead.contactPerson);

  return (
    <motion.div
      className="lead-card"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      onClick={onClick}
      style={{
        '--card-color':       stage.color,
        '--card-color-light': stage.color,
        '--card-color-dark':  stage.colorDark,
      }}
    >
      {/* ID badge */}
      <div className="lead-card-id">
        <Hash /> {lead.id}
      </div>

      {/* Header */}
      <div className="lead-card-header">
        <div className="lead-card-avatar-wrap">
          <div className="lead-card-diamond">
            <span className="lead-card-initials">{initials}</span>
          </div>
        </div>
        <div className="lead-card-name-block">
          <div className="lead-card-company">
            {lead.companyName || lead.contactPerson}
          </div>
          {lead.companyName && lead.contactPerson && (
            <div className="lead-card-title">{lead.contactPerson}</div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="lead-card-divider-fancy">
        <div className="lead-card-divider-dot" />
      </div>

      {/* Info rows */}
      <div className="lead-card-info">
        {lead.phone && (
          <div className="lead-info-row">
            <div className="lead-info-icon"><Phone /></div>
            <span className="lead-info-text">{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="lead-info-row">
            <div className="lead-info-icon"><Mail /></div>
            <span className="lead-info-text">{lead.email}</span>
          </div>
        )}
        {isInternal && lead.memberName && (
          <div className="lead-info-row">
            <div className="lead-info-icon"><User /></div>
            <span className="lead-info-text">{lead.memberName}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="lead-card-badges-row">
        <span className={`chip ${isInternal ? 'internal' : 'external'}`}>
          {isInternal ? <Link2 /> : <Globe />}
          {isInternal ? 'Internal' : 'External'}
        </span>
        {followUp && (
          <span className={`lead-tag ${followUp.overdue ? 'overdue' : 'followup'}`}>
            <Calendar /> {followUp.text}
          </span>
        )}
      </div>

      {/* Trade intent */}
      {isInternal && lead.tradeIntentTitle && (
        <div className="lead-card-intent">
          <div className="lead-card-intent-icon"><Briefcase /></div>
          <span className="lead-card-intent-text">{lead.tradeIntentTitle}</span>
        </div>
      )}

      {/* Notes */}
      {lead.notes && (
        <div className="lead-card-notes">{lead.notes}</div>
      )}

      {/* Footer */}
      <div className="lead-card-footer">
        <div className="lead-card-time">
          <Clock /> {formatDate(lead.updatedAt)}
        </div>
        <div className="lead-card-actions">
          <button
            className="lead-action-btn browse"
            title="Browse Trade Intents for this lead"
            onClick={e => {
              e.stopPropagation();
              onBrowseLeadIntents?.(lead);
            }}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
              marginRight: 'auto',
            }}
          >
            <Search size={11} /> Browse
          </button>
          {lead.phone && (
            <button
              className="lead-action-btn call"
              title="Call"
              onClick={e => {
                e.stopPropagation();
                window.location.href = `tel:${lead.phone}`;
              }}
            >
              <Phone size={13} />
            </button>
          )}
          {lead.email && (
            <button
              className="lead-action-btn email"
              title="Email"
              onClick={e => {
                e.stopPropagation();
                window.location.href = `mailto:${lead.email}`;
              }}
            >
              <Mail size={13} />
            </button>
          )}
          {lead.phone && (
            <button
              className="lead-action-btn whatsapp"
              title="WhatsApp"
              onClick={e => {
                e.stopPropagation();
                window.open(
                  `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`,
                  '_blank'
                );
              }}
            >
              <MessageSquare size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}