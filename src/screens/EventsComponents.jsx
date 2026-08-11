// ══════════════════════════════════════════════
// EventsComponents.jsx — Events Module for Members
// ══════════════════════════════════════════════
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, forwardRef } from 'react';
import {
  Calendar, MapPin, Users, Clock, Video, Ticket,
  X, RefreshCw, Loader2, AlertCircle, CheckCircle2,
  ChevronLeft, ChevronRight, Eye, Mic, ListChecks,
  Globe, DollarSign, Sparkles, BadgeCheck, CreditCard,
  Copy, Download, Timer,
} from 'lucide-react';
import { authenticatedFetch } from '../api/auth';
import { resolvePhotoUrl, fetchEventCoverPhoto } from '../api/profileOperationsApi';

// ─────────────────────────────────────────────
// ⚠️ IMPORTANT: Match these with your dashboard
// ─────────────────────────────────────────────
const BASE_URL = 'https://connectsouq.sundukpay.com';
const BRAND       = '#A2CB8B';
const BRAND_DARK  = '#7aab65';
const BRAND_LIGHT = '#e8f5e2';

const brandBtn = {
  background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
  color: '#fff',
  boxShadow: `0 4px 14px ${BRAND}55`,
};

// ─────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────
const fmtEventDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) : '—';

const fmtEventTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  }) : '—';

const fmtEventDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';

// ══════════════════════════════════════════════
// API HELPERS
// ══════════════════════════════════════════════
export const fetchMyRegistrations = () =>
  authenticatedFetch(`${BASE_URL}/cs-network/member`, {
    method: 'POST',
    body: JSON.stringify({
      memberRequestType: 'FETCH_MY_REGISTRATIONS',
    }),
  });

export const joinOnlineEvent = (eventId) =>
  authenticatedFetch(`${BASE_URL}/cs-network/member`, {
    method: 'POST',
    body: JSON.stringify({
      memberRequestType: 'JOIN_ONLINE_EVENT',
      eventId: Number(eventId),
    }),
  });

// ══════════════════════════════════════════════
// 🎯 CountdownTimer Component (Reusable)
// ══════════════════════════════════════════════
export function CountdownTimer({ targetDate, onComplete, compact = false }) {
  const calculateTimeLeft = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return null;

    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      totalMs: diff,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
      if (!newTime && onComplete) {
        onComplete();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  const pad = (n) => String(n).padStart(2, '0');

  // Compact format: HH:MM:SS
  if (compact) {
    const totalHours = timeLeft.days * 24 + timeLeft.hours;
    return (
      <span className="font-mono font-extrabold tabular-nums">
        {pad(totalHours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    );
  }

  // Full format with labels
  return (
    <div className="flex items-center gap-1.5 justify-center font-mono">
      {timeLeft.days > 0 && (
        <>
          <div className="text-center">
            <div className="text-lg font-extrabold tabular-nums">{pad(timeLeft.days)}</div>
            <div className="text-[8px] font-bold opacity-80 uppercase">Days</div>
          </div>
          <span className="text-lg opacity-60">:</span>
        </>
      )}
      <div className="text-center">
        <div className="text-lg font-extrabold tabular-nums">{pad(timeLeft.hours)}</div>
        <div className="text-[8px] font-bold opacity-80 uppercase">Hrs</div>
      </div>
      <span className="text-lg opacity-60">:</span>
      <div className="text-center">
        <div className="text-lg font-extrabold tabular-nums">{pad(timeLeft.minutes)}</div>
        <div className="text-[8px] font-bold opacity-80 uppercase">Min</div>
      </div>
      <span className="text-lg opacity-60">:</span>
      <div className="text-center">
        <div className="text-lg font-extrabold tabular-nums">{pad(timeLeft.seconds)}</div>
        <div className="text-[8px] font-bold opacity-80 uppercase">Sec</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// 🎯 JoinNowButton Component (with countdown logic)
// ══════════════════════════════════════════════
export function JoinNowButton({ eventId, startDateTime, endDateTime, fallbackLink }) {
  const [now, setNow] = useState(Date.now());
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startMs = new Date(startDateTime).getTime();
  const endMs   = endDateTime ? new Date(endDateTime).getTime() : startMs + 4 * 60 * 60 * 1000;

  const notStarted = now < startMs;
  const ended      = now > endMs;
  const live       = !notStarted && !ended;

  const handleJoinNow = async () => {
    setJoining(true); setError('');
    try {
      // Call backend JOIN_ONLINE_EVENT API (tracks attendance)
      const data = await joinOnlineEvent(eventId);
      const link = data?.eventMeetingUrl || data?.onlineJoinLink || fallbackLink;

      if (link) {
        console.log('🎥 Opening meeting:', link);
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        setError('Meeting link not available');
      }
    } catch (err) {
      console.error('❌ Join event error:', err);
      // Fallback: use the link we already have
      if (fallbackLink) {
        window.open(fallbackLink, '_blank', 'noopener,noreferrer');
      } else {
        setError(err.message || 'Failed to join event');
      }
    } finally {
      setJoining(false);
    }
  };

  // ── Event NOT STARTED — show countdown ──
  if (notStarted) {
    return (
      <div className="rounded-xl overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="p-3 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600">
          <Timer className="h-4 w-4 text-white flex-shrink-0" />
          <p className="text-[11px] font-bold text-white uppercase tracking-wide">
            Event starts in
          </p>
        </div>
        <div className="p-4 text-blue-900">
          <CountdownTimer
            targetDate={startDateTime}
            onComplete={() => setNow(Date.now())}
          />
          <p className="text-[10px] text-center text-blue-600 mt-2 font-semibold">
            "Join Now" button will appear when event begins
          </p>
        </div>
      </div>
    );
  }

  // ── Event ENDED ──
  if (ended) {
    return (
      <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Clock className="h-4 w-4" />
          <p className="text-xs font-bold">Event has ended</p>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          Ended on {fmtEventDateTime(endDateTime)}
        </p>
      </div>
    );
  }

  // ── Event LIVE — Show Join Now ──
  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={handleJoinNow}
        disabled={joining}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:opacity-60 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          boxShadow: '0 4px 20px rgba(16,185,129,0.5)',
        }}
      >
        {/* Animated pulse effect */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: 'linear-gradient(135deg, #fff, transparent)' }}
        />
        <span className="relative z-10 flex items-center gap-2">
          {joining ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Joining...</>
          ) : (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <Video className="h-4 w-4" /> Join Now — Event is LIVE
            </>
          )}
        </span>
      </motion.button>

      {error && (
        <p className="mt-2 text-[10px] text-red-600 font-semibold text-center">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// Image Lightbox Modal — Full Size Uncropped View
// ══════════════════════════════════════════════
export function ImageLightboxModal({ imageUrl, title, onClose }) {
  if (!imageUrl) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
        >
          <img
            src={imageUrl}
            alt={title || 'Full Event Banner'}
            className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
          />
          {title && (
            <p className="mt-3 text-white text-sm font-bold text-center drop-shadow-md">
              {title}
            </p>
          )}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white text-gray-900 font-extrabold flex items-center justify-center shadow-xl hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ══════════════════════════════════════════════
// EventCard
// ══════════════════════════════════════════════
export const EventCard = forwardRef(function EventCard({ event, onView, index = 0 }, ref) {
  const isOnline = event.eventType === 'ONLINE';
  const isPaid   = event.paid;

  const [coverUrl, setCoverUrl] = useState(() => {
    const raw = event?.coverImageUrl || event?.coverPhotoUrl || event?.fileUrl || event?.photoUrl || event?.coverImage;
    return (raw && typeof raw === 'string' && raw.trim() !== '' && raw !== 'null') ? resolvePhotoUrl(raw) : null;
  });

  useEffect(() => {
    const raw = event?.coverImageUrl || event?.coverPhotoUrl || event?.fileUrl || event?.photoUrl || event?.coverImage;
    if (raw && typeof raw === 'string' && raw.trim() !== '' && raw !== 'null') {
      setCoverUrl(resolvePhotoUrl(raw));
    }

    if (event?.id) {
      fetchEventCoverPhoto(event.id)
        .then((res) => {
          if (res?.fileUrl) {
            setCoverUrl(resolvePhotoUrl(res.fileUrl));
          }
        })
        .catch(() => {});
    }
  }, [event?.id, event?.coverImageUrl]);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <motion.div ref={ref} layout
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.985 }} whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.04 }}
        className="relative overflow-hidden rounded-2xl bg-white"
        style={{ boxShadow: `0 10px 40px rgba(0,0,0,0.08), 0 0 0 1px ${BRAND}20` }}
      >
        <div
          className="relative h-48 sm:h-52 overflow-hidden cursor-pointer group bg-slate-100 border-b border-slate-100"
          onClick={() => coverUrl && setLightboxOpen(true)}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={event.title || 'Event Cover'}
              onError={() => setCoverUrl(null)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
              <Calendar className="h-10 w-10 mb-1 opacity-60" />
              <span className="text-xs font-semibold">No Event Image</span>
            </div>
          )}

          {/* Clean Crisp Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
                  style={{ background: isOnline ? '#2563EB' : '#EA580C' }}>
              {isOnline ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
              {isOnline ? 'ONLINE' : 'IN-PERSON'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
                  style={{ background: isPaid ? '#DB2777' : '#059669' }}>
              {isPaid
                ? <><Ticket className="h-3 w-3" /> {event.currency} {event.price}</>
                : <><Sparkles className="h-3 w-3" /> FREE</>}
            </span>
          </div>
        </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: `${BRAND}18`, color: BRAND_DARK }}>
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Event Date</p>
            <p className="text-xs font-bold text-gray-800">{fmtEventDate(event.startDateTime)}</p>
          </div>
        </div>

        {!isOnline && event.city && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: `${BRAND}18`, color: BRAND_DARK }}>
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">City</p>
              <p className="text-xs font-bold text-gray-800 truncate">{event.city}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t"
             style={{ borderColor: `${BRAND}25` }}>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: `${BRAND}18`, color: BRAND_DARK }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND_DARK }} />
            {event.status}
          </span>

          <button
            onClick={() => onView(event)}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:shadow-lg"
            style={brandBtn}
          >
            <Eye className="h-3.5 w-3.5" /> View Details
          </button>
        </div>
      </div>
    </motion.div>

    {lightboxOpen && (
      <ImageLightboxModal
        imageUrl={coverUrl}
        title={event.title}
        onClose={() => setLightboxOpen(false)}
      />
    )}
    </>
  );
});

// ══════════════════════════════════════════════
// EventDetailsModal
// ══════════════════════════════════════════════
export function EventDetailsModal({ eventId, onClose, onRegistered }) {
  const [event,        setEvent]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [registering,  setRegistering]  = useState(false);
  const [registration, setRegistration] = useState(null);
  const [coverUrl,     setCoverUrl]     = useState(null);

  useEffect(() => {
    if (!event) return;
    const raw = event.coverImageUrl || event.coverPhotoUrl || event.fileUrl || event.photoUrl || event.coverImage;
    if (raw && typeof raw === 'string' && raw.trim() !== '' && raw !== 'null') {
      setCoverUrl(resolvePhotoUrl(raw));
    }
    if (event.id) {
      fetchEventCoverPhoto(event.id)
        .then((res) => {
          if (res?.fileUrl) {
            setCoverUrl(resolvePhotoUrl(res.fileUrl));
          }
        })
        .catch(() => {});
    }
  }, [event]);

  const fetchDetails = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST',
        body: JSON.stringify({
          memberRequestType: 'FETCH_EVENT_DETAILS',
          eventId: Number(eventId),
        }),
      });
      setEvent(data?.event || null);
    } catch (err) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true); setError('');
    try {
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST',
        body: JSON.stringify({
          memberRequestType: 'REGISTER_FOR_EVENT',
          eventId: event.id,
        }),
      });

      setRegistration({
        ...data.registration,
        message: data.message,
        eventStartDateTime: event.startDateTime,
        eventEndDateTime: event.endDateTime,
        eventType: event.eventType,
      });
      onRegistered?.();
    } catch (err) {
      setError(err.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const copyToClipboard = (text, label = 'Link') => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copied to clipboard!`);
    }).catch(() => {
      alert('Failed to copy');
    });
  };

  const isOnline = event?.eventType === 'ONLINE';
  const isPaid   = event?.paid;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative z-10 w-full sm:max-w-2xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden rounded-t-3xl max-h-[95vh] flex flex-col"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_DARK }} />
            <p className="text-sm text-gray-600">Loading event details...</p>
          </div>
        ) : !event ? (
          <div className="p-6 text-center">
            <p className="text-sm text-red-600 font-semibold">{error || 'Event not found'}</p>
            <button onClick={onClose}
              className="mt-4 rounded-xl border-2 border-gray-200 px-5 py-2 text-sm font-semibold">
              Close
            </button>
          </div>
        ) : (
          <>
            <div
              className="relative flex-shrink-0 h-56 sm:h-64 overflow-hidden bg-slate-100 border-b border-slate-100"
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={event.title || 'Event Cover'}
                  onError={() => setCoverUrl(null)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                  <Calendar className="h-12 w-12 mb-2 opacity-60" />
                  <span className="text-sm font-semibold">No Cover Photo</span>
                </div>
              )}

              <button onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-full bg-black/50 backdrop-blur-md p-2 text-white hover:bg-black/70 transition shadow-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
                        style={{ background: isOnline ? '#2563EB' : '#EA580C' }}>
                    {isOnline ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {isOnline ? 'ONLINE' : 'IN-PERSON'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
                        style={{ background: isPaid ? '#DB2777' : '#059669' }}>
                    {isPaid
                      ? <><Ticket className="h-3 w-3" /> {event.currency} {event.price}</>
                      : <><Sparkles className="h-3 w-3" /> FREE</>}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-gray-700 bg-gray-100 border border-gray-200">
                    <BadgeCheck className="h-3 w-3 text-green-600" /> {event.status}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
                  {event.title}
                </h2>
              </div>

              <AnimatePresence>
                {registration && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  >
                    <RegistrationStatusCard
                      registration={registration}
                      onCopyLink={copyToClipboard}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-red-600 flex-1">{error}</p>
                    <button onClick={() => setError('')}>
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {event.description && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Start</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{fmtEventDate(event.startDateTime)}</p>
                  <p className="text-xs text-gray-500">{fmtEventTime(event.startDateTime)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">End</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{fmtEventDate(event.endDateTime)}</p>
                  <p className="text-xs text-gray-500">{fmtEventTime(event.endDateTime)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Globe className="h-3 w-3 text-gray-400" />
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Timezone</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate">{event.timezone || '—'}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="h-3 w-3 text-gray-400" />
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Capacity</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {event.confirmedCount || 0} / {event.capacity}
                  </p>
                </div>
              </div>

              {event.capacity > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-gray-500">Registrations</p>
                    <p className="text-xs font-bold" style={{ color: BRAND_DARK }}>
                      {Math.round(((event.confirmedCount || 0) / event.capacity) * 100)}% Full
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((event.confirmedCount || 0) / event.capacity) * 100, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${BRAND}, ${BRAND_DARK})` }}
                    />
                  </div>
                </div>
              )}

              {!isOnline && event.venueName && (
                <div className="rounded-xl border p-4"
                     style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" style={{ color: BRAND_DARK }} /> Venue
                  </p>
                  <p className="text-sm font-bold text-gray-900">{event.venueName}</p>
                  {event.venueAddress && (
                    <p className="text-xs text-gray-600 mt-0.5">{event.venueAddress}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    {[event.city, event.state, event.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {event.speakers?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5" /> Speakers ({event.speakers.length})
                  </p>
                  <div className="space-y-2.5">
                    {event.speakers.map((sp, idx) => (
                      <div key={idx} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                        {sp.photoUrl ? (
                          <img src={sp.photoUrl} alt={sp.name}
                               className="h-11 w-11 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                               style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}>
                            {(sp.name || 'S').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{sp.name}</p>
                          <p className="text-xs font-semibold" style={{ color: BRAND_DARK }}>
                            {sp.designation}
                          </p>
                          {sp.bio && (
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{sp.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.agenda?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5" /> Agenda ({event.agenda.length})
                  </p>
                  <div className="space-y-2">
                    {event.agenda.map((item, idx) => (
                      <div key={idx} className="flex gap-3 rounded-xl bg-gray-50 p-3">
                        <div className="flex-shrink-0 w-16 text-right">
                          <p className="text-xs font-bold" style={{ color: BRAND_DARK }}>
                            {fmtEventTime(item.startTime)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {fmtEventTime(item.endTime)}
                          </p>
                        </div>
                        <div className="w-px" style={{ background: `${BRAND}40` }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isPaid && (
                <div className="rounded-xl p-4 flex items-center justify-between"
                     style={{ background: `${BRAND}12`, border: `1px solid ${BRAND}30` }}>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" style={{ color: BRAND_DARK }} />
                    <span className="text-sm font-semibold text-gray-700">Ticket Price</span>
                  </div>
                  <span className="text-lg font-extrabold" style={{ color: BRAND_DARK }}>
                    {event.currency} {event.price}
                  </span>
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                {!registration && (
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={handleRegister} disabled={registering}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:opacity-60"
                    style={brandBtn}
                  >
                    {registering
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Registering...</>
                      : <><Ticket className="h-4 w-4" /> Register for Event</>}
                  </motion.button>
                )}
                <button onClick={onClose}
                  className="w-full rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                  {registration ? 'Done' : 'Close'}
                </button>
              </div>

              <div className="h-4" />
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════
// RegistrationStatusCard
// ══════════════════════════════════════════════
function RegistrationStatusCard({ registration, onCopyLink }) {
  const status = registration.status;
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const config = {
    CONFIRMED: {
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      badgeBg: '#dcfce7',
      badgeText: '#15803d',
      icon: CheckCircle2,
      title: "You're Confirmed",
    },
    PENDING_APPROVAL: {
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      badgeBg: '#fef3c7',
      badgeText: '#b45309',
      icon: Clock,
      title: 'Waiting Approval',
    },
    PAYMENT_PENDING: {
      bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      badgeBg: '#fce7f3',
      badgeText: '#be185d',
      icon: CreditCard,
      title: 'Payment Pending',
    },
    REJECTED: {
      bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      badgeBg: '#fee2e2',
      badgeText: '#b91c1c',
      icon: X,
      title: 'Rejected',
    },
  };

  const cfg = config[status] || config.PENDING_APPROVAL;
  const StatusIcon = cfg.icon;

  const handlePayNow = () => {
    if (registration.paymentCheckoutUrl) {
      window.location.href = registration.paymentCheckoutUrl;
    }
  };

  const handleDownloadQR = () => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(registration.qrCodeToken)}&margin=10`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-pass-${registration.id}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const eventTitle = registration.eventTitle || registration.event?.title || `Event Pass #${registration.id}`;

  return (
    <>
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
        <div>
          {/* Header row with Status Badge */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono font-bold text-slate-400">
              #{registration.id}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold"
              style={{ background: cfg.badgeBg, color: cfg.badgeText }}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {cfg.title}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1 mb-1">
            {eventTitle}
          </h4>

          {/* Details */}
          <div className="text-[11px] text-slate-600 space-y-1">
            {registration.eventStartDateTime && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>{fmtEventDateTime(registration.eventStartDateTime)}</span>
              </div>
            )}
            {registration.registeredAt && (
              <div className="text-[10px] text-slate-400">
                Registered on {fmtEventDate(registration.registeredAt)}
              </div>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          {status === 'PAYMENT_PENDING' && registration.paymentCheckoutUrl && (
            <button
              onClick={handlePayNow}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ background: cfg.bg }}
            >
              <CreditCard className="h-3.5 w-3.5" /> Pay Now via Stripe
            </button>
          )}

          {status === 'CONFIRMED' && registration.qrCodeToken && (
            <button
              onClick={() => setQrModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 transition hover:bg-emerald-100"
            >
              <Ticket className="h-3.5 w-3.5 text-emerald-600" /> View Entry Pass QR
            </button>
          )}

          {status === 'CONFIRMED' && registration.onlineJoinLink && registration.eventStartDateTime && (
            <div className="flex-1">
              <JoinNowButton
                eventId={registration.eventId}
                startDateTime={registration.eventStartDateTime}
                endDateTime={registration.eventEndDateTime}
                fallbackLink={registration.onlineJoinLink}
              />
            </div>
          )}

          {status === 'PENDING_APPROVAL' && (
            <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-lg p-2 w-full text-center">
              ⏳ Awaiting Organizer Approval
            </div>
          )}
        </div>
      </div>

      {/* Entry Pass Modal with QR */}
      {qrModalOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setQrModalOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center relative"
            >
              <button
                onClick={() => setQrModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>

              <div className="flex items-center justify-center gap-1.5 mb-2 text-emerald-700 font-extrabold text-sm uppercase tracking-wide">
                <BadgeCheck className="h-5 w-5 text-emerald-600" />
                Verified Entry Pass
              </div>
              <p className="text-xs text-slate-500 font-semibold mb-4">{eventTitle}</p>

              <div className="inline-block p-3 bg-white rounded-2xl border-4 border-emerald-500 shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registration.qrCodeToken)}&margin=0`}
                  alt="QR Entry Pass"
                  className="rounded-lg block"
                  width={200}
                  height={200}
                />
              </div>

              <p className="text-xs font-semibold text-slate-700 mt-3">
                📱 Show this QR code at venue for check-in
              </p>

              <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Token ID</p>
                <p className="text-[11px] font-mono text-slate-800 break-all font-bold mt-0.5">
                  {registration.qrCodeToken}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onCopyLink(registration.qrCodeToken, 'Pass Token')}
                  className="py-2 px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  <Copy className="h-3.5 w-3.5 inline mr-1" /> Copy Token
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  <Download className="h-3.5 w-3.5 inline mr-1" /> Download Pass
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}

// ══════════════════════════════════════════════
// EventsTab
// ══════════════════════════════════════════════
export function EventsTab() {
  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [filter,       setFilter]       = useState('ALL');

  const fetchEvents = useCallback(async (pg = 0) => {
    setLoading(true); setError('');
    try {
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST',
        body: JSON.stringify({
          memberRequestType: 'FETCH_EVENT_LIST',
          page: pg,
          size: 10,
        }),
      });
      setEvents(data?.events || []);
      setTotalPages(data?.totalPages || 1);
      setTotalRecords(data?.totalRecords || 0);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(page); }, [page, fetchEvents]);

  const filteredEvents = events.filter(ev => {
    if (filter === 'ALL')       return true;
    if (filter === 'ONLINE')    return ev.eventType === 'ONLINE';
    if (filter === 'IN_PERSON') return ev.eventType === 'IN_PERSON';
    if (filter === 'FREE')      return !ev.paid;
    if (filter === 'PAID')      return ev.paid;
    return true;
  });

  return (
    <>
      <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Upcoming Events</h2>
            <p className="text-sm text-gray-600">
              {totalRecords > 0
                ? `${totalRecords} event${totalRecords > 1 ? 's' : ''} available`
                : 'Discover events from Connect Souq'}
            </p>
          </div>
          <button onClick={() => fetchEvents(page)}
            className="self-start sm:self-auto rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2.5 text-gray-700 hover:bg-white/50 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { id: 'ALL',       label: 'All',       icon: Calendar },
            { id: 'ONLINE',    label: 'Online',    icon: Video    },
            { id: 'IN_PERSON', label: 'In-Person', icon: MapPin   },
            { id: 'FREE',      label: 'Free',      icon: Sparkles },
            { id: 'PAID',      label: 'Paid',      icon: Ticket   },
          ].map(f => {
            const active = filter === f.id;
            return (
              <motion.button
                key={f.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(f.id)}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all"
                style={active
                  ? { background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
                      color: '#fff', boxShadow: `0 4px 14px ${BRAND}55` }
                  : { border: '1px solid rgba(255,255,255,0.6)',
                      background: 'rgba(255,255,255,0.35)',
                      backdropFilter: 'blur(8px)', color: '#374151' }}
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
              </motion.button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-600 flex-1">{error}</p>
            <button onClick={() => setError('')}>
              <X className="h-4 w-4 text-red-400" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_DARK }} />
            <p className="text-sm text-gray-600 font-medium">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="rounded-2xl border border-white/60 bg-white/35 backdrop-blur p-6">
              <Calendar className="h-10 w-10 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800 mb-1">
                {filter === 'ALL' ? 'No upcoming events' : `No ${filter.toLowerCase().replace('_', '-')} events`}
              </p>
              <p className="text-sm text-gray-600">
                {filter === 'ALL'
                  ? 'Check back later for new events'
                  : 'Try a different filter to see more events'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((ev, idx) => (
                  <EventCard key={ev.id} event={ev} index={idx}
                    onView={() => setSelectedEventId(ev.id)} />
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2 text-gray-800 disabled:opacity-40 hover:bg-white/50 transition">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-gray-800">
                  Page {page + 1} of {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2 text-gray-800 disabled:opacity-40 hover:bg-white/50 transition">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedEventId && (
          <EventDetailsModal
            eventId={selectedEventId}
            onClose={() => setSelectedEventId(null)}
            onRegistered={() => fetchEvents(page)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ══════════════════════════════════════════════
// MyRegistrationsTab Component (My Tickets & Passes)
// ══════════════════════════════════════════════
export function MyRegistrationsTab() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchMyRegistrations();
      const list = res?.registrations || res?.data || [];
      setRegistrations(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load tickets/registrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const copyToClipboard = (text, label = 'Link') => {
    navigator.clipboard.writeText(text)
      .then(() => alert(`${label} copied to clipboard!`))
      .catch(() => alert('Failed to copy'));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900">My Event Tickets & Passes</h2>
          <p className="text-sm text-gray-600">Your QR codes, entry passes, and payment status for joined events</p>
        </div>
        <button
          onClick={loadRegistrations}
          className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-semibold flex-1">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_DARK }} />
          <p className="text-sm text-gray-600 font-medium">Loading your tickets...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Ticket className="h-12 w-12 text-gray-400" />
          <div>
            <p className="font-bold text-gray-800">No Tickets Found</p>
            <p className="text-xs text-gray-500 mt-1">You haven't registered for any events yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
          {registrations.map((reg) => (
            <RegistrationStatusCard
              key={reg.id}
              registration={reg}
              onCopyLink={copyToClipboard}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}