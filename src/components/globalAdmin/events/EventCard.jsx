// components/globalAdmin/events/EventCard.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import EventCoverUploadModal from '../../events/EventCoverUploadModal';
import { resolvePhotoUrl } from '../../../api/profileOperationsApi';

export default function EventCard({ event: initialEvent, index, onManageRegistrations, onEventUpdated }) {
  const [event, setEvent] = useState(initialEvent);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const isOnline = event.eventType === 'ONLINE';
  const isPaid   = event.paid;
  const coverBg  = event.coverImageUrl
    ? resolvePhotoUrl(event.coverImageUrl)
    : null;

  const handleUploadSuccess = ({ fileUrl }) => {
    const updated = {
      ...event,
      coverImageUrl: fileUrl,
    };
    setEvent(updated);
    onEventUpdated?.(updated);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(22,163,74,0.15)' }}
        style={{
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          border: '1px solid #E8F0E0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.3s',
        }}
      >
        {/* Cover */}
        <div style={{
          height: 130,
          background: coverBg
            ? `url(${coverBg}) center/cover`
            : 'linear-gradient(135deg, #16A34A, #22C55E, #4ADE80)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
          }} />

          {/* Upload Image Badge / Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsUploadModalOpen(true);
            }}
            style={{
              position: 'absolute', top: 10, left: 10,
              padding: '5px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(22,163,74,0.3)',
              fontSize: 10, fontWeight: 800, color: '#15803D',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            📷 Upload Image
          </motion.button>

          <div style={{
            position: 'absolute', top: 10, right: 10,
            padding: '4px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
            fontSize: 10, fontWeight: 700, color: '#166534',
          }}>
            #{event.id}
          </div>

          <div style={{
            position: 'absolute', bottom: 10, left: 10, right: 10,
            display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            <span style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
              background: isOnline ? 'rgba(59,130,246,0.9)' : 'rgba(249,115,22,0.9)',
              color: '#fff', backdropFilter: 'blur(8px)',
            }}>
              {isOnline ? '💻 ONLINE' : '📍 IN-PERSON'}
            </span>
            <span style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
              background: isPaid ? 'rgba(236,72,153,0.9)' : 'rgba(16,185,129,0.9)',
              color: '#fff', backdropFilter: 'blur(8px)',
            }}>
              {isPaid ? '💰 PAID' : '🆓 FREE'}
            </span>
            <span style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
              background: 'rgba(255,255,255,0.25)', color: '#fff', backdropFilter: 'blur(8px)',
            }}>
              ✓ {event.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '18px 20px' }}>
          <div style={{
            fontSize: 15, fontWeight: 800, color: '#1A3A1A',
            marginBottom: 10, lineHeight: 1.35,
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {event.title}
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            fontSize: 12, color: '#6B8F71', marginBottom: 14,
          }}>
            {/* Date row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: '#F0FDF4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>📅</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>DATE</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A1A' }}>
                  {new Date(event.startDateTime).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </div>
              </div>
              <div style={{
                padding: '4px 10px', borderRadius: 8, background: '#F0FDF4',
                border: '1px solid #BBF7D0', fontSize: 11, fontWeight: 700, color: '#166534',
              }}>
                {new Date(event.startDateTime).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </div>

            {/* Location row */}
            {!isOnline && event.city ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: '#FEF3C7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>📍</div>
                <div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>CITY</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A1A' }}>{event.city}</div>
                </div>
              </div>
            ) : isOnline ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: '#DBEAFE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>🌐</div>
                <div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>MODE</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A1A' }}>Virtual Event</div>
                </div>
              </div>
            ) : null}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onManageRegistrations(event)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              background: 'linear-gradient(135deg, #16A34A, #15803D)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'Manrope, sans-serif',
              boxShadow: '0 4px 12px rgba(22,163,74,0.25)',
            }}
          >
            👥 Manage Registrations
          </motion.button>
        </div>
      </motion.div>

      {/* Event Cover Photo Upload Modal */}
      <EventCoverUploadModal
        eventId={event.id}
        eventTitle={event.title}
        currentCoverUrl={event.coverImageUrl}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}