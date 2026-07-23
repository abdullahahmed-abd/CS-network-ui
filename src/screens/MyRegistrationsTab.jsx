// ══════════════════════════════════════════════
// MyRegistrationsTab.jsx
// ══════════════════════════════════════════════
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Clock, CheckCircle2, X, AlertCircle,
  Loader2, RefreshCw, Video, MapPin, Ticket,
  Copy, BadgeCheck, CreditCard, Download, Sparkles,
  Timer,
} from 'lucide-react';
import { authenticatedFetch } from '../api/auth';
import { CountdownTimer, JoinNowButton, fetchMyRegistrations } from './EventsComponents';

// ⚠️ Match with your dashboard
const BASE_URL = 'https://b25e-2401-4900-8821-90cd-dc64-5caf-48da-fbb3.ngrok-free.app';
const BRAND       = '#A2CB8B';
const BRAND_DARK  = '#7aab65';
const BRAND_LIGHT = '#e8f5e2';

const brandBtn = {
  background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
  color: '#fff',
  boxShadow: `0 4px 14px ${BRAND}55`,
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) : '—';

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';

// ══════════════════════════════════════════════
// MyRegistrationsTab
// ══════════════════════════════════════════════
export default function MyRegistrationsTab() {
  const [registrations, setRegistrations] = useState([]);
  const [eventDetails,  setEventDetails]  = useState({}); // eventId -> event data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [qrRegistration, setQrRegistration] = useState(null);

  // ── Load registrations + fetch event details for each ──
  const loadRegistrations = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await fetchMyRegistrations();
      const regs = data?.registrations || [];
      setRegistrations(regs);

      // ── Fetch event details in parallel to get start/end times ──
      const uniqueEventIds = [...new Set(regs.map(r => r.eventId))];
      const eventPromises = uniqueEventIds.map(async (evId) => {
        try {
          const evData = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
            method: 'POST',
            body: JSON.stringify({
              memberRequestType: 'FETCH_EVENT_DETAILS',
              eventId: Number(evId),
            }),
          });
          return { id: evId, event: evData?.event };
        } catch {
          return { id: evId, event: null };
        }
      });

      const results = await Promise.all(eventPromises);
      const eventMap = {};
      results.forEach(r => {
        if (r.event) eventMap[r.id] = r.event;
      });
      setEventDetails(eventMap);
    } catch (err) {
      setError(err.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRegistrations(); }, [loadRegistrations]);

  const filtered = registrations.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const stats = {
    total:     registrations.length,
    pending:   registrations.filter(r => r.status === 'PENDING_APPROVAL').length,
    confirmed: registrations.filter(r => r.status === 'CONFIRMED').length,
    payment:   registrations.filter(r => r.status === 'PAYMENT_PENDING').length,
    rejected:  registrations.filter(r => r.status === 'REJECTED').length,
  };

  const copyLink = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const handlePayNow = (url) => {
    console.log('🔗 Redirecting to Stripe:', url);
    window.location.href = url;
  };

  return (
    <>
      <motion.div key="my-registrations" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">My Registrations</h2>
            <p className="text-sm text-gray-600">
              {stats.total > 0 ? `${stats.total} event${stats.total > 1 ? 's' : ''} registered` : 'Your event registrations'}
            </p>
          </div>
          <button onClick={loadRegistrations}
            className="self-start sm:self-auto rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2.5 text-gray-700 hover:bg-white/50 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Pending',    value: stats.pending,   bg: '#FEF3C7', color: '#92400E', icon: Clock         },
              { label: 'Confirmed',  value: stats.confirmed, bg: '#DCFCE7', color: '#166534', icon: CheckCircle2  },
              { label: 'To Pay',     value: stats.payment,   bg: '#FCE7F3', color: '#9F1239', icon: CreditCard    },
              { label: 'Rejected',   value: stats.rejected,  bg: '#FEE2E2', color: '#991B1B', icon: X             },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                     style={{ background: s.bg }}>
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] font-bold text-gray-600 uppercase">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter chips */}
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { id: 'ALL',              label: 'All'          },
            { id: 'PENDING_APPROVAL', label: 'Pending'      },
            { id: 'CONFIRMED',        label: 'Confirmed'    },
            { id: 'PAYMENT_PENDING',  label: 'Payment Due'  },
            { id: 'REJECTED',         label: 'Rejected'     },
          ].map(f => {
            const active = filter === f.id;
            return (
              <motion.button key={f.id}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(f.id)}
                className="rounded-xl px-4 py-2 text-xs font-bold transition-all"
                style={active
                  ? { background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                      color: '#fff', boxShadow: `0 4px 14px ${BRAND}55` }
                  : { border: '1px solid rgba(255,255,255,0.6)',
                      background: 'rgba(255,255,255,0.35)',
                      backdropFilter: 'blur(8px)', color: '#374151' }}>
                {f.label}
              </motion.button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-600 flex-1">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_DARK }} />
            <p className="text-sm text-gray-600 font-medium">Loading your registrations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="rounded-2xl border border-white/60 bg-white/35 backdrop-blur p-6">
              <Ticket className="h-10 w-10 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800 mb-1">
                {registrations.length === 0 ? 'No registrations yet' : 'No matching registrations'}
              </p>
              <p className="text-sm text-gray-600">
                {registrations.length === 0
                  ? 'Register for events from the Events tab'
                  : 'Try a different filter'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((reg, idx) => (
                <RegistrationCard
                  key={reg.id}
                  reg={reg}
                  event={eventDetails[reg.eventId]}
                  index={idx}
                  onShowQR={() => setQrRegistration(reg)}
                  onCopyLink={copyLink}
                  onPayNow={handlePayNow}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {qrRegistration && (
          <QRCodeModal
            registration={qrRegistration}
            onClose={() => setQrRegistration(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ══════════════════════════════════════════════
// RegistrationCard
// ══════════════════════════════════════════════
function RegistrationCard({ reg, event, index, onShowQR, onCopyLink, onPayNow }) {
  const config = {
    PENDING_APPROVAL: {
      bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      lightBg: '#fffbeb',
      borderColor: '#fde68a',
      icon: Clock,
      label: 'Pending Approval',
      desc: 'Waiting for organizer approval',
    },
    CONFIRMED: {
      bg: 'linear-gradient(135deg, #10b981, #059669)',
      lightBg: '#ecfdf5',
      borderColor: '#a7f3d0',
      icon: CheckCircle2,
      label: 'Confirmed',
      desc: 'You are all set!',
    },
    PAYMENT_PENDING: {
      bg: 'linear-gradient(135deg, #ec4899, #db2777)',
      lightBg: '#fdf2f8',
      borderColor: '#fbcfe8',
      icon: CreditCard,
      label: 'Payment Pending',
      desc: 'Complete payment to confirm',
    },
    REJECTED: {
      bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      lightBg: '#fef2f2',
      borderColor: '#fecaca',
      icon: X,
      label: 'Rejected',
      desc: 'Registration was not approved',
    },
  };

  const cfg = config[reg.status] || config.PENDING_APPROVAL;
  const StatusIcon = cfg.icon;

  // ── Event start/end from fetched details ──
  const eventStart = event?.startDateTime;
  const eventEnd   = event?.endDateTime;

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }} whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.05 }}
      className="rounded-2xl bg-white overflow-hidden border-2"
      style={{
        borderColor: cfg.borderColor,
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      }}
    >
      <div className="p-3 flex items-center gap-2" style={{ background: cfg.bg }}>
        <div className="h-8 w-8 rounded-lg bg-white/25 flex items-center justify-center flex-shrink-0">
          <StatusIcon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-white">{cfg.label}</p>
          <p className="text-[10px] text-white/85 truncate">{cfg.desc}</p>
        </div>
        <span className="text-[9px] font-bold text-white/85 flex-shrink-0">
          #{reg.id}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Event</p>
          <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
            {reg.eventTitle}
          </p>
        </div>

        {/* Event Date Info */}
        {eventStart && (
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>📅 {fmtDateTime(eventStart)}</span>
          </div>
        )}

        <div className="text-[10px] text-gray-500">
          🎫 Registered on {fmtDateTime(reg.registeredAt)}
        </div>

        {/* ═══════ CONFIRMED + Online Meeting Link — WITH COUNTDOWN ═══════ */}
        {reg.status === 'CONFIRMED' && reg.onlineJoinLink && eventStart && (
          <div className="pt-2 border-t border-gray-100">
            <JoinNowButton
              eventId={reg.eventId}
              startDateTime={eventStart}
              endDateTime={eventEnd}
              fallbackLink={reg.onlineJoinLink}
            />
          </div>
        )}

        {/* Fallback: If eventStart not fetched yet, show basic link */}
        {reg.status === 'CONFIRMED' && reg.onlineJoinLink && !eventStart && (
          <div className="pt-2 border-t border-gray-100">
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Video className="h-3 w-3" /> Meeting Link
              </p>
              <div className="flex gap-2">
                <button onClick={() => onCopyLink(reg.onlineJoinLink)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50">
                  <Copy className="h-3 w-3" /> Copy
                </button>
                <a href={reg.onlineJoinLink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                  <Video className="h-3 w-3" /> Join
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ CONFIRMED + QR Code (In-Person) ═══════ */}
        {reg.status === 'CONFIRMED' && reg.qrCodeToken && (
          <div className="pt-2 border-t border-gray-100">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={onShowQR}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white"
              style={brandBtn}>
              <BadgeCheck className="h-4 w-4" /> Show QR Entry Pass
            </motion.button>
          </div>
        )}

        {/* ═══════ PAYMENT_PENDING ═══════ */}
        {reg.status === 'PAYMENT_PENDING' && reg.paymentCheckoutUrl && (
          <div className="pt-2 border-t border-gray-100">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onPayNow(reg.paymentCheckoutUrl)}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                boxShadow: '0 4px 14px rgba(236,72,153,0.4)',
              }}>
              <CreditCard className="h-4 w-4" /> Pay Now via Stripe
            </motion.button>
            <p className="text-[9px] text-center text-gray-400 mt-1.5">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        )}

        {/* ═══════ PENDING_APPROVAL ═══════ */}
        {reg.status === 'PENDING_APPROVAL' && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
            <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your registration is under review. You'll get access once approved.
            </p>
          </div>
        )}

        {/* ═══════ REJECTED ═══════ */}
        {reg.status === 'REJECTED' && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2">
            <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-800 leading-relaxed">
              Your registration was rejected by the organizer.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════
// QR Code Modal
// ══════════════════════════════════════════════
function QRCodeModal({ registration, onClose }) {
  const downloadQR = () => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(registration.qrCodeToken)}&margin=10`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-pass-${registration.id}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(registration.qrCodeToken).then(() => {
      alert('Token copied to clipboard!');
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex items-center justify-between"
             style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-white/85 uppercase tracking-wide">
              Your Entry Pass
            </p>
            <p className="text-sm font-extrabold text-white mt-0.5 truncate">
              {registration.eventTitle}
            </p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white flex-shrink-0 ml-3">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 text-center bg-gradient-to-br from-emerald-50/30 to-green-50/30">
          <div className="inline-block p-4 bg-white rounded-2xl border-4 shadow-lg"
               style={{ borderColor: BRAND }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(registration.qrCodeToken)}&margin=0`}
              alt="QR Code Entry Pass"
              className="rounded-lg block"
              width={240}
              height={240}
            />
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div className="text-left">
                <p className="text-xs font-extrabold text-emerald-700">Ready for Check-In</p>
                <p className="text-[10px] text-emerald-600">Registration confirmed</p>
              </div>
            </div>

            <p className="text-xs text-gray-700 font-semibold">
              📱 Show this QR code at the venue entrance
            </p>

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mb-1">
                Pass Token
              </p>
              <p className="text-[10px] font-mono text-gray-700 break-all leading-relaxed">
                {registration.qrCodeToken}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={copyToken}
                className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white transition hover:opacity-90"
                style={{ background: BRAND_DARK }}>
                <Copy className="h-3.5 w-3.5" /> Copy Token
              </button>
              <button onClick={downloadQR}
                className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white transition hover:opacity-90"
                style={brandBtn}>
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <div className="rounded-lg bg-white p-2 border border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Reg ID</p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">#{registration.id}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-gray-100">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Status</p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">CONFIRMED</p>
              </div>
            </div>

            <button onClick={onClose}
              className="w-full mt-3 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}