import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  submitFranchiseOperatorEventReport,
  submitMasterOperatorEventReport,
  submitGlobalAdminEventReport,
} from '../../api/eventsApi';

export default function SubmitEventReportModal({
  event,
  onClose,
  onSuccess,
  onError,
  userRole = 'FRANCHISE_OPERATOR',
}) {
  const [loading, setLoading] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState('');
  const [totalExpense, setTotalExpense] = useState('');
  const [expenseCurrency, setExpenseCurrency] = useState('INR');
  const [reportNotes, setReportNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attendeeCount || Number(attendeeCount) < 0) {
      onError?.('Please enter a valid attendee count.');
      return;
    }
    if (!totalExpense || Number(totalExpense) < 0) {
      onError?.('Please enter a valid total expense.');
      return;
    }
    if (!reportNotes.trim()) {
      onError?.('Report notes are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        eventId: event.id,
        attendeeCount: Number(attendeeCount),
        totalExpense: Number(totalExpense),
        expenseCurrency,
        reportNotes: reportNotes.trim(),
      };

      let res;
      if (userRole === 'GLOBAL_ADMIN') {
        res = await submitGlobalAdminEventReport(payload);
      } else if (userRole === 'MASTER_OPERATOR') {
        res = await submitMasterOperatorEventReport(payload);
      } else {
        res = await submitFranchiseOperatorEventReport(payload);
      }

      onSuccess?.(res?.message || 'Event report submitted successfully! Event marked as COMPLETED.');
      onClose();
    } catch (err) {
      console.error('Submit report error:', err);
      onError?.(err.message || 'Failed to submit event report');
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
          maxWidth: 520, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
              📝 Submit Event Report
            </h3>
            <p style={{ fontSize: 11, color: '#6B8F71', margin: '4px 0 0', fontWeight: 500 }}>
              {event?.title || 'Completed Event'}
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#94A3B8' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, color: '#000000' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#000000', marginBottom: 6 }}>
              Total Attendees *
            </label>
            <input
              type="number"
              min="0"
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(e.target.value)}
              placeholder="e.g. 45"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 12,
                border: '1px solid #CBD5E1', outline: 'none', fontSize: 13,
                color: '#000000', fontWeight: 700, background: '#FFFFFF', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#000000', marginBottom: 6 }}>
                Total Expense *
              </label>
              <input
                type="number"
                min="0"
                value={totalExpense}
                onChange={(e) => setTotalExpense(e.target.value)}
                placeholder="e.g. 15000"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 12,
                  border: '1px solid #CBD5E1', outline: 'none', fontSize: 13,
                  color: '#000000', fontWeight: 700, background: '#FFFFFF', boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#000000', marginBottom: 6 }}>
                Currency
              </label>
              <select
                value={expenseCurrency}
                onChange={(e) => setExpenseCurrency(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 12,
                  border: '1px solid #CBD5E1', outline: 'none', fontSize: 13,
                  color: '#000000', fontWeight: 700, background: '#FFFFFF', boxSizing: 'border-box'
                }}
              >
                <option value="INR" style={{ color: '#000000', fontWeight: 700 }}>INR ₹</option>
                <option value="AED" style={{ color: '#000000', fontWeight: 700 }}>AED د.إ</option>
                <option value="USD" style={{ color: '#000000', fontWeight: 700 }}>USD $</option>
                <option value="EUR" style={{ color: '#000000', fontWeight: 700 }}>EUR €</option>
                <option value="GBP" style={{ color: '#000000', fontWeight: 700 }}>GBP £</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#000000', marginBottom: 6 }}>
              Report Notes *
            </label>
            <textarea
              rows={3}
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="e.g. Turnout was great, keynote session went well..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 12,
                border: '1px solid #CBD5E1', outline: 'none', fontSize: 13, resize: 'none',
                color: '#000000', fontWeight: 700, background: '#FFFFFF', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
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
                border: 'none', background: 'linear-gradient(135deg, #16A34A, #15803D)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Submitting...' : '🚀 Submit Report'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
