// components/globalAdmin/tabs/EventsTab.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllEvents } from '../../../api/adminApi';
import Toast from '../ui/Toast';
import { GreenButton } from '../FormFields';
import EventCard from '../events/EventCard';
import CreateEventModal from '../events/CreateEventModal';
import EventRegistrationsModal from '../events/EventRegistrationsModal';

const FILTER_CHIPS = [
  { id: 'ALL',       label: 'All Events', icon: '📋' },
  { id: 'ONLINE',    label: 'Online',     icon: '💻' },
  { id: 'IN_PERSON', label: 'In-Person',  icon: '📍' },
  { id: 'FREE',      label: 'Free',       icon: '🆓' },
  { id: 'PAID',      label: 'Paid',       icon: '💰' },
];

export default function EventsTab() {
  const [showCreate, setShowCreate]     = useState(false);
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filter, setFilter]             = useState('ALL');
  const [managingEvent, setManagingEvent] = useState(null);

  const loadEvents = async (pg = 0) => {
    setLoading(true);
    try {
      const res = await fetchAllEvents(pg, 10);
      setEvents(res.events || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.totalRecords || 0);
    } catch (err) {
      setToast({ message: err.message || 'Failed to load events', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(page); }, [page]);

  const filteredEvents = events.filter(ev => {
    if (filter === 'ALL')       return true;
    if (filter === 'ONLINE')    return ev.eventType === 'ONLINE';
    if (filter === 'IN_PERSON') return ev.eventType === 'IN_PERSON';
    if (filter === 'FREE')      return !ev.paid;
    if (filter === 'PAID')      return ev.paid;
    return true;
  });

  const stats = [
    { label: 'Total Events', value: totalRecords,                                     icon: '🎉', bg: '#F0FDF4', color: '#16A34A' },
    { label: 'Online',       value: events.filter(e => e.eventType === 'ONLINE').length, icon: '💻', bg: '#DBEAFE', color: '#1E40AF' },
    { label: 'In-Person',    value: events.filter(e => e.eventType === 'IN_PERSON').length, icon: '📍', bg: '#FEF3C7', color: '#92400E' },
    { label: 'Paid',         value: events.filter(e => e.paid).length,                 icon: '💰', bg: '#FCE7F3', color: '#9F1239' },
    { label: 'Free',         value: events.filter(e => !e.paid).length,                icon: '🆓', bg: '#DCFCE7', color: '#166534' },
  ];

  return (
    <div>
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
            Events Management
          </h2>
          <p style={{ fontSize: 12, color: '#6B8F71', margin: '4px 0 0', fontWeight: 500 }}>
            {totalRecords > 0
              ? `${totalRecords} event${totalRecords > 1 ? 's' : ''} published`
              : 'Create and manage events'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <GreenButton variant="outline" onClick={() => loadEvents(page)} loading={loading}>
            🔄 Refresh
          </GreenButton>
          <GreenButton onClick={() => setShowCreate(true)}>
            ➕ Create Event
          </GreenButton>
        </div>
      </div>

      {/* Stats */}
      {events.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12, marginBottom: 20,
        }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: '#fff', borderRadius: 14, padding: '14px 16px',
                border: '1px solid #E8F0E0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: s.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#6B8F71', fontWeight: 600 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter chips */}
      {events.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {FILTER_CHIPS.map(f => {
            const active = filter === f.id;
            return (
              <motion.button
                key={f.id}
                onClick={() => setFilter(f.id)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  padding: '8px 16px', borderRadius: 20,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  border: active ? 'none' : '1px solid #E8F0E0',
                  background: active ? 'linear-gradient(135deg, #16A34A, #15803D)' : '#fff',
                  color: active ? '#fff' : '#6B8F71',
                  boxShadow: active ? '0 4px 12px rgba(22,163,74,0.25)' : 'none',
                  transition: 'all 0.2s', fontFamily: 'Manrope, sans-serif',
                }}
              >
                <span>{f.icon}</span>
                {f.label}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 20px', gap: 16,
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{
              width: 40, height: 40,
              border: '3px solid #E8F0E0', borderTopColor: '#16A34A',
              borderRadius: '50%',
            }}
          />
          <p style={{ fontSize: 13, color: '#6B8F71', fontWeight: 600 }}>Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            background: '#fff', borderRadius: 20, padding: '60px 40px',
            textAlign: 'center', border: '1px solid #E8F0E0',
          }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: 24, background: '#F0FDF4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 20px', border: '1px solid #BBF7D0',
          }}>🎉</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', marginBottom: 8 }}>
            {events.length === 0 ? 'No Events Yet' : `No ${filter.toLowerCase().replace('_', '-')} events`}
          </h3>
          <p style={{ color: '#6B8F71', fontSize: 14, marginBottom: 20 }}>
            {events.length === 0 ? 'Create your first event to get started' : 'Try a different filter'}
          </p>
          {events.length === 0 && (
            <GreenButton onClick={() => setShowCreate(true)}>➕ Create First Event</GreenButton>
          )}
        </motion.div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 18,
          }}>
            {filteredEvents.map((e, i) => (
              <EventCard
                key={e.id || i} event={e} index={i}
                onManageRegistrations={setManagingEvent}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 12, marginTop: 32,
            }}>
              <motion.button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                whileHover={{ scale: page === 0 ? 1 : 1.05 }}
                whileTap={{ scale: page === 0 ? 1 : 0.95 }}
                style={{
                  padding: '8px 14px', borderRadius: 10,
                  border: '1px solid #E8F0E0', background: '#fff',
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  opacity: page === 0 ? 0.4 : 1,
                  fontSize: 14, fontWeight: 700, color: '#16A34A',
                }}
              >← Prev</motion.button>

              <span style={{
                padding: '8px 16px', borderRadius: 10,
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                fontSize: 12, fontWeight: 700, color: '#166534',
              }}>
                Page {page + 1} of {totalPages}
              </span>

              <motion.button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                whileHover={{ scale: page >= totalPages - 1 ? 1 : 1.05 }}
                whileTap={{ scale: page >= totalPages - 1 ? 1 : 0.95 }}
                style={{
                  padding: '8px 14px', borderRadius: 10,
                  border: '1px solid #E8F0E0', background: '#fff',
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages - 1 ? 0.4 : 1,
                  fontSize: 14, fontWeight: 700, color: '#16A34A',
                }}
              >Next →</motion.button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateEventModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setToast({ message: 'Event created and published!', type: 'success' });
              setShowCreate(false);
              loadEvents(0); setPage(0);
            }}
            onError={(msg) => setToast({ message: msg, type: 'error' })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {managingEvent && (
          <EventRegistrationsModal
            event={managingEvent}
            onClose={() => setManagingEvent(null)}
            onToast={setToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}