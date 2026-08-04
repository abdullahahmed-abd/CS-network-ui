import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  rejectMasterEventRequest,
  rejectGlobalAdminEventRequest,
} from '../../api/eventsApi';

export default function RejectEventModal({
  event,
  onClose,
  onSuccess,
  onError,
  userRole = 'MASTER_OPERATOR',
}) {
  const [loading, setLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewNotes.trim()) {
      onError?.('Rejection reason (review notes) is mandatory.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (userRole === 'GLOBAL_ADMIN') {
        res = await rejectGlobalAdminEventRequest(event.id, reviewNotes.trim());
      } else {
        res = await rejectMasterEventRequest(event.id, reviewNotes.trim());
      }

      onSuccess?.(res?.message || 'Event request rejected.');
      onClose();
    } catch (err) {
      console.error('Reject event error:', err);
      onError?.(err.message || 'Failed to reject event request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20, fontFamily: 'Manrope, sans-serif',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, padding: '28px 32px',
          maxWidth: 480, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#991B1B', margin: 0 }}>
              ❌ Reject Event Request
            </h3>
            <p style={{ fontSize: 11, color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
              {event?.title || 'Event Request'}
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#94A3B8' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Reason for Rejection (Mandatory) *
            </label>
            <textarea
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g. Venue capacity insufficient or date overlaps with another event..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 12,
                border: '1px solid #FCA5A5', outline: 'none', fontSize: 13, resize: 'none',
                background: '#FEF2F2',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 12,
                border: '1px solid #CBD5E1', background: '#fff', color: '#475569',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 12,
                border: 'none', background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Rejecting...' : '🚫 Confirm Rejection'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
