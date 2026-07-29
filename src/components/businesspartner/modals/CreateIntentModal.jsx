import React, { useState } from 'react';
import {
  X, AlertCircle, CheckCircle2,
  Loader2, ShoppingCart, Store,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { authenticatedFetch } from '../../../api/auth';
import { CATEGORIES, UNITS, BASE_URL } from '../../constants/BpConstants';
import { getNowDateTimeString } from '../../../utils/BpHelpers';

export function CreateIntentModal({ onClose, onSuccess, showToast }) {
  const [form, setForm] = useState({
    intentType:   'BUY',
    category:     'Wheat',
    title:        '',
    description:  '',
    quantity:     '',
    unit:         'KG',
    pricePerUnit: '',
    currency:     'INR',
    expiresAt:    '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) return setError('Title is required');
    if (!form.quantity)     return setError('Quantity is required');
    if (!form.pricePerUnit) return setError('Price per unit is required');
    if (!form.expiresAt)    return setError('Expiry date is required');

    setLoading(true);
    try {
      await authenticatedFetch(
        `${BASE_URL}/cs-network/business-partner`,
        {
          method: 'POST',
          body: JSON.stringify({
            businessPartnerRequestType: 'CREATE_INTENT',
            franchiseId:  2,
            intentType:   form.intentType,
            category:     form.category,
            title:        form.title,
            description:  form.description,
            quantity:     Number(form.quantity),
            unit:         form.unit,
            pricePerUnit: Number(form.pricePerUnit),
            currency:     form.currency,
            expiresAt:    new Date(form.expiresAt).toISOString(),
          }),
        }
      );
      showToast('Trade intent created successfully!', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create intent');
    } finally {
      setLoading(false);
    }
  };

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
          <div>
            <h2>Create Trade Intent</h2>
            <p>Post a buy or sell offer to the market</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="form-error">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Intent type toggle */}
            <div className="form-group">
              <label className="form-label">Intent Type</label>
              <div className="intent-type-toggle">
                <button
                  type="button"
                  className={`intent-type-btn ${form.intentType === 'BUY' ? 'active-buy' : ''}`}
                  onClick={() => update('intentType', 'BUY')}
                >
                  <ShoppingCart /> BUY
                </button>
                <button
                  type="button"
                  className={`intent-type-btn ${form.intentType === 'SELL' ? 'active-sell' : ''}`}
                  onClick={() => update('intentType', 'SELL')}
                >
                  <Store /> SELL
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Title</label>
              <input
                className="form-input"
                placeholder="e.g. Premium Basmati Rice"
                value={form.title}
                onChange={e => update('title', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={e => update('category', e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your trade intent..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label form-label-required">Quantity</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.quantity}
                  onChange={e => update('quantity', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select
                  className="form-select"
                  value={form.unit}
                  onChange={e => update('unit', e.target.value)}
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label form-label-required">Price/Unit</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 46"
                  value={form.pricePerUnit}
                  onChange={e => update('pricePerUnit', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  className="form-select"
                  value={form.currency}
                  onChange={e => update('currency', e.target.value)}
                >
                  <option value="INR">INR ₹</option>
                  <option value="USD">USD $</option>
                  <option value="AED">AED د.إ</option>
                  <option value="EUR">EUR €</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Expires At</label>
              <input
                className="form-input"
                type="datetime-local"
                min={getNowDateTimeString()}
                value={form.expiresAt}
                onChange={e => update('expiresAt', e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="form-submit-btn"
              disabled={loading}
            >
              {loading
                ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> Creating…</>
                : <><CheckCircle2 size={15} /> Create Intent</>
              }
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}