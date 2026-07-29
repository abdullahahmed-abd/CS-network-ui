import React, { useState } from 'react';
import {
  Eye, ShoppingCart, Store, Package,
  RefreshCw, AlertCircle, Loader2,
  Plus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { IntentDetailModal } from '../businesspartner/modals/IntentDetailModal';
import { INTENT_STATUS }    from '../constants/BpConstants';
import { fmtNumber, fmtCurrency, formatFullDate } from '../../utils/BpHelpers';

/* ════════ IntentCard ════════ */
function IntentCard({ intent, onView }) {
  const isBuy  = intent.intentType === 'BUY';
  const status = INTENT_STATUS[intent.status] || INTENT_STATUS.OPEN;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="intent-card"
      onClick={() => onView(intent)}
    >
      {/* Header */}
      <div className="intent-header">
        <div className={`intent-type-icon ${isBuy ? 'buy' : 'sell'}`}>
          {isBuy ? <ShoppingCart /> : <Store />}
        </div>
        <div className="intent-header-text">
          <div className="intent-title">{intent.title}</div>
          <div className="intent-category">{intent.category}</div>
        </div>
      </div>

      {/* Badges */}
      <div className="intent-badges">
        <span className={`intent-badge ${isBuy ? 'type-buy' : 'type-sell'}`}>
          {isBuy ? 'BUY' : 'SELL'}
        </span>
        <span
          className="intent-badge"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      {/* Detail grid */}
      <div className="intent-grid">
        <div className="intent-detail-box">
          <div className="intent-detail-label">Quantity</div>
          <div className="intent-detail-value">
            {fmtNumber(intent.quantity)} {intent.unit}
          </div>
        </div>
        <div className="intent-detail-box">
          <div className="intent-detail-label">Price/Unit</div>
          <div className="intent-detail-value">
            {fmtCurrency(intent.pricePerUnit, intent.currency)}
          </div>
        </div>
        <div className="intent-detail-box">
          <div className="intent-detail-label">Total Value</div>
          <div className="intent-detail-value highlight">
            {fmtCurrency(intent.totalValue, intent.currency)}
          </div>
        </div>
        <div className="intent-detail-box">
          <div className="intent-detail-label">Expires</div>
          <div className="intent-detail-value">
            {formatFullDate(intent.expiresAt)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="intent-footer">
        <span className="intent-creator">
          By {intent.createdByName || '—'}
        </span>
        <button
          className="intent-view-btn"
          onClick={e => { e.stopPropagation(); onView(intent); }}
        >
          <Eye size={11} /> View
        </button>
      </div>
    </motion.div>
  );
}

/* ════════ BusinessPartnerIntents ════════ */
export default function BusinessPartnerIntents({
  mode,               // 'market' | 'mine'
  intents,
  loading,
  error,
  intentPage,
  setIntentPage,
  intentTotalPages,
  intentFilter,
  setIntentFilter,
  searchQuery,
  onRefresh,
  onCreateIntent,
}) {
  const [selectedIntent, setSelectedIntent] = useState(null);

  const isMarket = mode === 'market';

  const filteredIntents = intents.filter(intent => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (intent.title    || '').toLowerCase().includes(q) ||
      (intent.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">
              {isMarket ? 'Trade Intents Market' : 'My Trade Intents'}
            </div>
            <div className="panel-subtitle">
              {isMarket
                ? 'Live trade opportunities • Click any card for details'
                : 'Intents you have created'}
            </div>
          </div>

          {/* Filter buttons (market only) */}
          {isMarket && (
            <div className="panel-actions">
              <div className="intents-toolbar" style={{ margin: 0 }}>
                {['ALL','BUY','SELL'].map(type => (
                  <button
                    key={type}
                    className={`intents-filter-btn ${intentFilter === type ? 'active' : ''}`}
                    onClick={() => {
                      setIntentFilter(type);
                      setIntentPage(0);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bp-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={32} style={{ color: 'var(--primary)' }} />
            </motion.div>
            <div className="bp-loading-text">
              {isMarket ? 'Loading market intents…' : 'Loading your intents…'}
            </div>
          </div>

        /* Error (market only) */
        ) : error ? (
          <div className="bp-error">
            <AlertCircle size={28} style={{ color: 'var(--danger)' }} />
            <div className="bp-error-text">{error}</div>
            <button className="retry-btn" onClick={onRefresh}>
              <RefreshCw size={13} /> Try Again
            </button>
          </div>

        /* Empty */
        ) : filteredIntents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-box"><Package /></div>
            <div className="empty-state-title">
              {searchQuery
                ? 'No matching intents'
                : isMarket
                ? 'No trade intents available'
                : 'No intents yet'}
            </div>
            <div className="empty-state-desc">
              {searchQuery
                ? 'Try a different search'
                : isMarket
                ? 'Be the first to post a trade intent!'
                : 'Create your first trade intent to get started'}
            </div>
            <button className="add-btn" onClick={onCreateIntent}>
              <Plus size={15} /> Create Intent
            </button>
          </div>

        /* Grid */
        ) : (
          <>
            <div className="intents-grid">
              <AnimatePresence mode="popLayout">
                {filteredIntents.map(intent => (
                  <IntentCard
                    key={intent.id}
                    intent={intent}
                    onView={setSelectedIntent}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination (market only) */}
            {isMarket && intentTotalPages > 1 && (
              <div className="intent-pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setIntentPage(p => Math.max(0, p - 1))}
                  disabled={intentPage === 0}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="pagination-info">
                  Page {intentPage + 1} of {intentTotalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() =>
                    setIntentPage(p => Math.min(intentTotalPages - 1, p + 1))
                  }
                  disabled={intentPage >= intentTotalPages - 1}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Intent Detail Modal */}
      <AnimatePresence>
        {selectedIntent && (
          <IntentDetailModal
            intent={selectedIntent}
            onClose={() => setSelectedIntent(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}