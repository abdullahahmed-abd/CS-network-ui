import React from 'react';
import { X, Users, Building2, ShoppingCart, Store } from 'lucide-react';
import { motion } from 'framer-motion';

import { INTENT_STATUS } from '../../constants/BpConstants';
import { fmtNumber, fmtCurrency, formatFullDate } from '../../../utils/BpHelpers';

export function IntentDetailModal({ intent, onClose, onRaiseProposal }) {
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