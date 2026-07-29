// components/globalAdmin/events/EventRegistrationsModal.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchEventRegistrations, approveRegistration, rejectRegistration } from '../../../api/adminApi';

// ── Registration Row ──────────────────────
function RegistrationRow({
  reg, index, processing,
  rejectingId, rejectNotes,
  setRejectingId, setRejectNotes,
  onApprove, onReject,
}) {
  const statusConfig = {
    PENDING_APPROVAL: { bg: '#FEF3C7', color: '#92400E', label: '⏳ Pending Approval' },
    CONFIRMED:        { bg: '#DCFCE7', color: '#166534', label: '✅ Confirmed' },
    PAYMENT_PENDING:  { bg: '#FCE7F3', color: '#9F1239', label: '💳 Payment Pending' },
    REJECTED:         { bg: '#FEE2E2', color: '#991B1B', label: '❌ Rejected' },
  };
  const cfg        = statusConfig[reg.status] || statusConfig.PENDING_APPROVAL;
  const isPending  = reg.status === 'PENDING_APPROVAL';
  const isRejecting = rejectingId === reg.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        border: '1px solid #E8F0E0', borderRadius: 12,
        background: '#fff', overflow: 'hidden',
      }}
    >
      <div style={{
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #16A34A, #15803D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 14,
        }}>
          {(reg.userName || 'U').charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A1A' }}>
            {reg.userName}
          </div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
            Reg #{reg.id} • {new Date(reg.registeredAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </div>
        </div>

        {/* Status Badge */}
        <div style={{
          padding: '4px 10px', borderRadius: 8,
          background: cfg.bg, color: cfg.color,
          fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap',
        }}>
          {cfg.label}
        </div>

        {/* Action Buttons */}
        {isPending && !isRejecting && (
          <div style={{ display: 'flex', gap: 6 }}>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onApprove(reg.id)} disabled={processing}
              style={{
                padding: '6px 12px', borderRadius: 8,
                background: '#16A34A', color: '#fff',
                border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
                opacity: processing ? 0.6 : 1,
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {processing ? '⏳ ...' : '✓ Approve'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setRejectingId(reg.id); setRejectNotes(''); }}
              disabled={processing}
              style={{
                padding: '6px 12px', borderRadius: 8,
                background: '#fff', color: '#EF4444',
                border: '1px solid #FECACA', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              ✕ Reject
            </motion.button>
          </div>
        )}
      </div>

      {/* Confirmed banners */}
      {reg.status === 'CONFIRMED' && reg.onlineJoinLink && (
        <div style={{
          padding: '10px 16px', background: '#EFF6FF',
          borderTop: '1px solid #DBEAFE',
          fontSize: 11, color: '#1E40AF',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          🔗 <strong>Meeting Link:</strong>
          <span style={{
            fontFamily: 'monospace', fontSize: 10,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>
            {reg.onlineJoinLink}
          </span>
        </div>
      )}
      {reg.status === 'CONFIRMED' && reg.qrCodeToken && (
        <div style={{
          padding: '10px 16px', background: '#F0FDF4',
          borderTop: '1px solid #BBF7D0',
          fontSize: 11, color: '#166534',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          🎫 <strong>QR Token generated</strong> — Member can show it at venue
        </div>
      )}
      {reg.status === 'PAYMENT_PENDING' && reg.paymentCheckoutUrl && (
        <div style={{
          padding: '10px 16px', background: '#FDF2F8',
          borderTop: '1px solid #FBCFE8',
          fontSize: 11, color: '#9F1239',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          💳 <strong>Stripe checkout link sent</strong> — Waiting for payment
        </div>
      )}

      {/* Reject form */}
      <AnimatePresence>
        {isRejecting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              padding: '12px 16px',
              background: '#FEF2F2', borderTop: '1px solid #FECACA',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', marginBottom: 6 }}>
              Rejection Reason:
            </div>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={2}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8,
                border: '1px solid #FECACA', fontSize: 12,
                fontFamily: 'Manrope, sans-serif', outline: 'none',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setRejectingId(null); setRejectNotes(''); }}
                style={{
                  padding: '6px 14px', borderRadius: 8, background: '#fff',
                  color: '#6B7280', border: '1px solid #E5E7EB',
                  cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  fontFamily: 'Manrope, sans-serif',
                }}
              >Cancel</button>
              <button
                onClick={() => onReject(reg.id)}
                disabled={processing || !rejectNotes.trim()}
                style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: '#EF4444', color: '#fff', border: 'none',
                  cursor: (processing || !rejectNotes.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: 11, fontWeight: 700,
                  opacity: (processing || !rejectNotes.trim()) ? 0.5 : 1,
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                {processing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Modal ────────────────────────────
export default function EventRegistrationsModal({ event, onClose, onToast }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [processingId, setProcessingId]   = useState(null);
  const [rejectingId, setRejectingId]     = useState(null);
  const [rejectNotes, setRejectNotes]     = useState('');
  const [statusFilter, setStatusFilter]   = useState('ALL');

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetchEventRegistrations(event.id);
      setRegistrations(res.registrations || []);
    } catch (err) {
      onToast({ message: err.message || 'Failed to load registrations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRegistrations(); }, [event.id]);

  const handleApprove = async (regId) => {
    setProcessingId(regId);
    try {
      const res = await approveRegistration(regId);
      onToast({ message: res.message || 'Registration approved!', type: 'success' });
      await loadRegistrations();
    } catch (err) {
      onToast({ message: err.message || 'Failed to approve', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (regId) => {
    if (!rejectNotes.trim()) {
      onToast({ message: 'Please enter rejection reason', type: 'error' });
      return;
    }
    setProcessingId(regId);
    try {
      const res = await rejectRegistration(regId, rejectNotes.trim());
      onToast({ message: res.message || 'Registration rejected', type: 'success' });
      setRejectingId(null); setRejectNotes('');
      await loadRegistrations();
    } catch (err) {
      onToast({ message: err.message || 'Failed to reject', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const counts = {
    ALL:              registrations.length,
    PENDING_APPROVAL: registrations.filter(r => r.status === 'PENDING_APPROVAL').length,
    CONFIRMED:        registrations.filter(r => r.status === 'CONFIRMED').length,
    PAYMENT_PENDING:  registrations.filter(r => r.status === 'PAYMENT_PENDING').length,
    REJECTED:         registrations.filter(r => r.status === 'REJECTED').length,
  };

  const filtered = statusFilter === 'ALL'
    ? registrations
    : registrations.filter(r => r.status === statusFilter);

  const filterButtons = [
    { key: 'ALL',              label: 'All',       bg: '#F0FDF4', color: '#166534' },
    { key: 'PENDING_APPROVAL', label: 'Pending',   bg: '#FEF3C7', color: '#92400E' },
    { key: 'CONFIRMED',        label: 'Confirmed', bg: '#DCFCE7', color: '#166534' },
    { key: 'PAYMENT_PENDING',  label: 'Payment',   bg: '#FCE7F3', color: '#9F1239' },
    { key: 'REJECTED',         label: 'Rejected',  bg: '#FEE2E2', color: '#991B1B' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20,
          maxWidth: 820, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          maxHeight: '90vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #166534, #16A34A)',
          padding: '20px 28px', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, opacity: 0.85,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Event #{event.id} • Registrations
            </div>
            <div style={{
              fontSize: 17, fontWeight: 800, marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {event.title}
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
              👥 {registrations.length} total registration{registrations.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: 'none', background: 'rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginLeft: 12,
            }}
          >×</button>
        </div>

        {/* Filter Bar */}
        <div style={{
          padding: '14px 28px', background: '#F9FAFB',
          borderBottom: '1px solid #E8F0E0',
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {filterButtons.map(s => {
            const active = statusFilter === s.key;
            return (
              <motion.button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: active ? s.color : s.bg,
                  color: active ? '#fff' : s.color,
                  border: active ? 'none' : '1px solid transparent',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Manrope, sans-serif', transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800 }}>{counts[s.key]}</span>
                {s.label}
              </motion.button>
            );
          })}
          <button
            onClick={loadRegistrations}
            style={{
              marginLeft: 'auto', padding: '6px 12px', borderRadius: 8,
              border: '1px solid #E8F0E0', background: '#fff',
              cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#16A34A',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '60px 20px', gap: 12,
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: 32, height: 32,
                  border: '3px solid #E8F0E0', borderTopColor: '#16A34A',
                  borderRadius: '50%',
                }}
              />
              <p style={{ fontSize: 12, color: '#6B8F71', fontWeight: 600 }}>
                Loading registrations...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{
                width: 70, height: 70, borderRadius: 20, background: '#F0FDF4',
                margin: '0 auto 16px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 32, border: '1px solid #BBF7D0',
              }}>👥</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1A3A1A', marginBottom: 6 }}>
                {registrations.length === 0 ? 'No Registrations Yet' : 'No matching registrations'}
              </div>
              <div style={{ fontSize: 12, color: '#6B8F71' }}>
                {registrations.length === 0
                  ? 'Members will appear here when they register'
                  : 'Try a different filter'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((reg, i) => (
                <RegistrationRow
                  key={reg.id}
                  reg={reg} index={i}
                  processing={processingId === reg.id}
                  rejectingId={rejectingId}
                  rejectNotes={rejectNotes}
                  setRejectingId={setRejectingId}
                  setRejectNotes={setRejectNotes}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}