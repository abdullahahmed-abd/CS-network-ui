import React, { useState, useEffect } from 'react';
import { X, Users, Building2, ShoppingCart, Store, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { INTENT_STATUS } from '../../constants/BpConstants';
import { fmtNumber, fmtCurrency, formatFullDate } from '../../../utils/BpHelpers';
import { authenticatedFetch } from '../../../api/auth';

const BASE_URL = 'https://connectsouq.sundukpay.com';

export function IntentDetailModal({ intent, onClose, onRaiseProposal }) {
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  useEffect(() => {
    if (!intent?.id) return;
    setLoadingProposals(true);
    authenticatedFetch(`${BASE_URL}/cs-network/member`, {
      method: 'POST',
      body: JSON.stringify({
        memberRequestType: 'FETCH_PROPOSALS_FOR_INTENT',
        tradeIntentId: Number(intent.id),
      }),
    })
      .then((data) => setProposals(data?.proposals || []))
      .catch((err) => console.warn('Fetch proposals error:', err))
      .finally(() => setLoadingProposals(false));
  }, [intent?.id]);

  if (!intent) return null;

  const isBuy  = intent.intentType === 'BUY';
  const status = INTENT_STATUS[intent.status] || INTENT_STATUS.OPEN;

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 8, marginBottom: 6, flexWrap: 'wrap',
            }}>
              <span className={`intent-badge ${isBuy ? 'type-buy' : 'type-sell'}`}>
                {isBuy ? <ShoppingCart size={10} /> : <Store size={10} />}
                {intent.intentType}
              </span>
              <span
                className="intent-badge"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
            </div>
            <h2>{intent.title}</h2>
            <p>{intent.category}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Description */}
          {intent.description && (
            <div className="modal-section">
              <div className="modal-section-title">Description</div>
              <div className="modal-notes">{intent.description}</div>
            </div>
          )}

          {/* Details grid */}
          <div className="modal-section">
            <div className="modal-section-title">Details</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}>
              {[
                { label: 'Quantity',    value: `${fmtNumber(intent.quantity)} ${intent.unit}` },
                { label: 'Price/Unit',  value: fmtCurrency(intent.pricePerUnit, intent.currency) },
                { label: 'Total Value', value: fmtCurrency(intent.totalValue, intent.currency) },
                { label: 'Expires',     value: formatFullDate(intent.expiresAt) },
                { label: 'Created',     value: formatFullDate(intent.createdAt) },
                { label: 'Currency',    value: intent.currency || 'INR' },
              ].map(item => (
                <div key={item.label} className="intent-detail-box">
                  <div className="intent-detail-label">{item.label}</div>
                  <div className="intent-detail-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Posted by */}
          <div className="modal-section">
            <div className="modal-section-title">Posted By</div>
            <div className="modal-field">
              <div className="modal-field-icon"><Users /></div>
              <div style={{ minWidth: 0 }}>
                <div className="modal-field-label">Creator</div>
                <div className="modal-field-value">
                  {intent.createdByName || '—'}
                </div>
              </div>
            </div>
            {intent.franchiseName && (
              <div className="modal-field">
                <div className="modal-field-icon"><Building2 /></div>
                <div style={{ minWidth: 0 }}>
                  <div className="modal-field-label">Franchise</div>
                  <div className="modal-field-value">{intent.franchiseName}</div>
                </div>
              </div>
            )}
          </div>

          {/* Proposals for this Intent */}
          <div className="modal-section" style={{ marginTop: 16 }}>
            <div className="modal-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Received Proposals ({proposals.length})</span>
              {loadingProposals && <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />}
            </div>
            {loadingProposals ? (
              <div style={{ padding: 12, textAlign: 'center', color: '#64748B', fontSize: 12 }}>
                Loading proposals...
              </div>
            ) : proposals.length === 0 ? (
              <div style={{ padding: 12, textAlign: 'center', color: '#94A3B8', fontSize: 12, background: '#F8FAFC', borderRadius: 10 }}>
                No proposals received for this intent yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {proposals.map((prop) => (
                  <div key={prop.proposalId || prop.id} style={{
                    padding: 10, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{prop.proposerName || 'Proposer'}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {fmtCurrency(prop.offeredPrice || prop.pricePerUnit, intent.currency)}/unit · {prop.offeredQuantity || prop.quantity} {intent.unit}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      background: prop.status === 'ACCEPTED' ? '#DCFCE7' : '#FEF3C7',
                      color: prop.status === 'ACCEPTED' ? '#15803D' : '#B45309',
                    }}>
                      {prop.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {onRaiseProposal && (
            <div style={{ marginTop: 20 }}>
              <button
                className="form-submit-btn"
                onClick={() => {
                  onClose();
                  onRaiseProposal(intent);
                }}
              >
                Raise Proposal on this Intent
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}