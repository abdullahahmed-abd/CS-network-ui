import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchFranchiseOperatorEvents,
  fetchMasterOperatorEvents,
  fetchMasterPendingEventRequests,
  approveMasterEventRequest,
  fetchGlobalAdminMyEvents,
  fetchAllGlobalEvents,
  fetchGlobalAdminPendingEventRequests,
  approveGlobalAdminEventRequest,
  fetchMemberEventList,
} from '../../api/eventsApi';

import CreateEventModal from '../globalAdmin/events/CreateEventModal';
import SubmitEventReportModal from './SubmitEventReportModal';
import RejectEventModal from './RejectEventModal';
import EventCoverUploadModal from './EventCoverUploadModal';
import EventRegistrationsModal from '../globalAdmin/events/EventRegistrationsModal';
import { resolvePhotoUrl, fetchEventCoverPhoto } from '../../api/profileOperationsApi';
import { ImageLightboxModal } from '../../screens/EventsComponents';
import { getUserData } from '../../api/auth';

function RoleEventCardItem({
  ev, activeSubTab, isAdmin, isMaster, handleApprove, setRejectingEvent,
  setEditingEvent, setReportingEvent, setRegistrationsEvent,
  setUploadCoverEvent, getStatusBadge, hasEventPassed,
  handleRegisterForEvent, isRegistered, isRegistering,
}) {
  const [coverUrl, setCoverUrl] = useState(() => {
    const raw = ev.coverImageUrl || ev.coverPhotoUrl || ev.fileUrl || ev.photoUrl || ev.coverImage;
    return (raw && typeof raw === 'string' && raw.trim() !== '' && raw !== 'null') ? resolvePhotoUrl(raw) : null;
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const raw = ev.coverImageUrl || ev.coverPhotoUrl || ev.fileUrl || ev.photoUrl || ev.coverImage;
    if (raw && typeof raw === 'string' && raw.trim() !== '' && raw !== 'null') {
      setCoverUrl(resolvePhotoUrl(raw));
    }
    if (ev.id) {
      fetchEventCoverPhoto(ev.id)
        .then((res) => {
          if (res?.fileUrl) {
            setCoverUrl(resolvePhotoUrl(res.fileUrl));
          }
        })
        .catch(() => { });
    }
  }, [ev?.id, ev?.coverImageUrl]);

  const currentUser = getUserData() || {};
  const currentUserId = String(currentUser.id || currentUser.userId || '');
  const creatorId = String(ev.createdById || ev.userId || ev.creatorId || '');
  const isCreator = activeSubTab === 'MY_EVENTS' || Boolean(creatorId && currentUserId && creatorId === currentUserId);
  const creatorRoleStr = String(ev.createdByRole || ev.creatorRole || '').toUpperCase();

  // Explicit Cover Upload Permission:
  // 1. Global Admin: can upload cover on any event
  // 2. Event Creator: can upload cover on their own event
  // 3. Master Operator: can upload cover on Franchise Operator events under them
  const canUploadCover = isAdmin || isCreator || (isMaster && creatorRoleStr.includes('FRANCHISE'));

  const canManage = isCreator || isAdmin;
  const canReport = canManage && (ev.status === 'PUBLISHED') && hasEventPassed(ev.endDateTime || ev.startDateTime);
  const canEdit = canManage && ev.status === 'PENDING_APPROVAL';

  return (
    <>
      <div
        style={{
          background: '#fff', borderRadius: 18, border: '1px solid #E2E8F0',
          overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Cover Photo Header */}
          <div
            onClick={() => coverUrl && setLightboxOpen(true)}
            style={{
              height: 200, width: '100%', overflow: 'hidden',
              background: '#F1F5F9', borderBottom: '1px solid #E2E8F0',
              position: 'relative', cursor: coverUrl ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={ev.title || 'Event Cover'}
                onError={() => setCoverUrl(null)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                📷 No Event Image
              </div>
            )}

            {canUploadCover && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadCoverEvent(ev);
                }}
                style={{
                  position: 'absolute', top: 10, right: 10, zIndex: 10,
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                  border: '1px solid #CBD5E1',
                  fontSize: 11, fontWeight: 800, color: '#1E293B',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              >
                📷 {coverUrl ? 'Change Cover' : 'Upload Cover'}
              </button>
            )}
          </div>

          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              {getStatusBadge(ev.status, ev.pendingApprovalStage)}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {(ev.isPaid || ev.paid) && (
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: 6 }}>
                    ₹{ev.price} {ev.currency || 'INR'}
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: 700, color: ev.eventType === 'ONLINE' ? '#2563EB' : '#D97706' }}>
                  {ev.eventType === 'ONLINE' ? '💻 Online' : '📍 In-Person'}
                </span>
              </div>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1E293B', margin: '0 0 6px' }}>
              {ev.title}
            </h4>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 12px', lineHeight: 1.4 }}>
              {ev.description ? ev.description.slice(0, 100) + '...' : 'No description'}
            </p>

            <div style={{ fontSize: 11, color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div>📅 {new Date(ev.startDateTime).toLocaleDateString()} at {new Date(ev.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div>📍 {ev.city || ev.eventCity || 'Online'}{ev.country ? `, ${ev.country}` : ''}</div>
              <div>👥 Capacity: {ev.capacity || 'Unlimited'}</div>
              {(ev.createdByName || ev.createdByRole) && (
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
                  👤 Organizer: {ev.createdByName || 'System'} {ev.createdByRole ? `(${ev.createdByRole.replace('_', ' ')})` : ''}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div style={{ borderTop: '1px solid #F1F5F9', padding: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {activeSubTab === 'PENDING_APPROVALS' ? (
            <>
              <button
                onClick={() => handleApprove(ev.id)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                  background: '#16A34A', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => setRejectingEvent(ev)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                  background: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ❌ Reject
              </button>
            </>
          ) : canManage ? (
            <>
              {canEdit && (
                <button
                  onClick={() => setEditingEvent(ev)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid #CBD5E1',
                    background: '#F8FAFC', color: '#334155', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  ✏️ Edit
                </button>
              )}

              {canUploadCover && (
                <button
                  onClick={() => setUploadCoverEvent(ev)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid #16A34A',
                    background: '#F0FDF4', color: '#15803D', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  📷 Upload Cover
                </button>
              )}

              {isAdmin && activeSubTab !== 'PENDING_APPROVALS' && (
                <button
                  onClick={() => setRegistrationsEvent(ev)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #16A34A, #15803D)',
                    color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                  }}
                >
                  👥 Manage Registrations
                </button>
              )}

              {canReport && (
                <button
                  onClick={() => setReportingEvent(ev)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                    background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  📊 Submit Report
                </button>
              )}
            </>
          ) : (
            /* Non-creator role viewing event: Register / Purchase Flow */
            isRegistered ? (
              <button
                disabled
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                  background: '#DCFCE7', color: '#15803D', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                ✅ {ev.isPaid || ev.paid ? 'Purchased & Registered' : 'Registered'}
              </button>
            ) : (
              <button
                onClick={() => handleRegisterForEvent(ev.id)}
                disabled={isRegistering}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #16A34A, #15803D)',
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {isRegistering
                  ? '⏳ Processing...'
                  : (ev.isPaid || ev.paid)
                  ? `💳 Purchase & Register (₹${ev.price || '0'})`
                  : '🎟️ Register / Join Event'}
              </button>
            )
          )}
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightboxModal
          imageUrl={coverUrl}
          title={ev.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

export default function RoleEventsTab({ userRole = 'FRANCHISE_OPERATOR' }) {
  const isOperator = userRole === 'FRANCHISE_OPERATOR';
  const isMaster = userRole === 'MASTER_OPERATOR';
  const isAdmin = userRole === 'GLOBAL_ADMIN';

  const [activeSubTab, setActiveSubTab] = useState('MY_EVENTS');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [toast, setToast] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [reportingEvent, setReportingEvent] = useState(null);
  const [rejectingEvent, setRejectingEvent] = useState(null);
  const [uploadCoverEvent, setUploadCoverEvent] = useState(null);
  const [registrationsEvent, setRegistrationsEvent] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      let res;
      if (activeSubTab === 'MY_EVENTS') {
        if (isOperator) res = await fetchFranchiseOperatorEvents(pg, 100);
        else if (isMaster) res = await fetchMasterOperatorEvents(pg, 100);
        else if (isAdmin) res = await fetchGlobalAdminMyEvents(pg, 100);
      } else if (activeSubTab === 'ALL_EVENTS') {
        if (isAdmin) {
          res = await fetchAllGlobalEvents(pg, 100);
        } else if (isMaster) {
          // Master Operator sees Global Admin events + Master's own events
          // (Does NOT see General/Sector Operator events!)
          res = await fetchMemberEventList(pg, 100);
          if (res?.events && Array.isArray(res.events)) {
            const currentUser = getUserData() || {};
            const currentUserId = String(currentUser.id || currentUser.userId || '');
            res.events = res.events.filter(ev => {
              const creatorRole = String(ev.creatorRole || ev.createdRole || ev.createdByRole || ev.role || ev.creatorType || ev.createdUserType || '').toUpperCase();
              const creatorId = String(ev.createdById || ev.userId || ev.creatorId || '');
              const isGlobal = ev.isGlobalAdmin === true || creatorRole.includes('ADMIN') || creatorRole.includes('GLOBAL');
              const isMasterEv = creatorRole.includes('MASTER') || (creatorId && creatorId === currentUserId);
              const isGeneralOrSector = creatorRole.includes('FRANCHISE') || creatorRole.includes('GENERAL') || creatorRole.includes('SECTOR');

              if (isGeneralOrSector) return false; // Hide general/sector operator events from Master in Network Events tab
              return true;
            });
          }
        } else if (isOperator) {
          // General / Sector Operator sees:
          // Global Admin events + Master Operator events + General/Sector Operator's OWN events
          // (Does NOT see other General/Sector Operators' events!)
          res = await fetchMemberEventList(pg, 100);
          if (res?.events && Array.isArray(res.events)) {
            const currentUser = getUserData() || {};
            const currentUserId = String(currentUser.id || currentUser.userId || '');
            res.events = res.events.filter(ev => {
              const creatorRole = String(ev.creatorRole || ev.createdRole || ev.createdByRole || ev.role || ev.creatorType || ev.createdUserType || '').toUpperCase();
              const creatorId = String(ev.createdById || ev.userId || ev.creatorId || '');
              const isGlobal = ev.isGlobalAdmin === true || creatorRole.includes('ADMIN') || creatorRole.includes('GLOBAL');
              const isMasterEv = creatorRole.includes('MASTER');
              const isMine = creatorId && creatorId === currentUserId;

              // Show Global Admin events, Master Operator events, and MY OWN events
              if (isGlobal || isMasterEv || isMine) return true;

              // Hide other Franchise/General/Sector operators' events
              const isFranchiseRole = creatorRole.includes('FRANCHISE') || creatorRole.includes('GENERAL') || creatorRole.includes('SECTOR');
              if (isFranchiseRole && !isMine) return false;

              return true;
            });
          }
        }
      } else if (activeSubTab === 'PENDING_APPROVALS') {
        if (isMaster) res = await fetchMasterPendingEventRequests(pg, 100);
        else if (isAdmin) res = await fetchGlobalAdminPendingEventRequests(pg, 100);
      }

      setEvents(res?.events || []);
      setTotalPages(res?.totalPages || 1);
      setTotalRecords(res?.events?.length || res?.totalRecords || 0);
    } catch (err) {
      console.error('Failed to load events:', err);
      showToast(err.message || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeSubTab, isOperator, isMaster, isAdmin]);

  useEffect(() => {
    loadData(page);
  }, [page, loadData]);

  const handleApprove = async (eventId) => {
    try {
      let res;
      if (isMaster) {
        res = await approveMasterEventRequest(eventId);
        showToast(res?.message || 'Event approved and forwarded to Global Admin!');
      } else if (isAdmin) {
        res = await approveGlobalAdminEventRequest(eventId);
        showToast(res?.message || 'Event approved and published!');
      }
      loadData(page);
    } catch (err) {
      showToast(err.message || 'Failed to approve event', 'error');
    }
  };

  const getStatusBadge = (status, stage) => {
    switch (status) {
      case 'PUBLISHED':
        return <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>🟢 Published</span>;
      case 'PENDING_APPROVAL':
        return (
          <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
            ⏳ Pending ({stage === 'MASTER_REVIEW' ? 'Master Review' : 'Admin Review'})
          </span>
        );
      case 'REJECTED':
        return <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>🔴 Rejected</span>;
      case 'COMPLETED':
        return <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>🏁 Completed</span>;
      default:
        return <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{status}</span>;
    }
  };

  const hasEventPassed = (endDateTime) => {
    if (!endDateTime) return false;
    return new Date(endDateTime).getTime() < Date.now();
  };

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 2000,
              padding: '12px 20px', borderRadius: 12,
              background: toast.type === 'error' ? '#EF4444' : '#10B981',
              color: '#fff', fontSize: 13, fontWeight: 700,
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setActiveSubTab('MY_EVENTS'); setPage(0); }}
            style={{
              padding: '8px 16px', borderRadius: 12, border: 'none',
              background: activeSubTab === 'MY_EVENTS' ? '#16A34A' : '#E2E8F0',
              color: activeSubTab === 'MY_EVENTS' ? '#fff' : '#475569',
              fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}
          >
            📋 My Events
          </button>

          <button
            onClick={() => { setActiveSubTab('ALL_EVENTS'); setPage(0); }}
            style={{
              padding: '8px 16px', borderRadius: 12, border: 'none',
              background: activeSubTab === 'ALL_EVENTS' ? '#16A34A' : '#E2E8F0',
              color: activeSubTab === 'ALL_EVENTS' ? '#fff' : '#475569',
              fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}
          >
            🌐 {isAdmin ? 'All Global Events' : 'Network Events'}
          </button>

          {(isMaster || isAdmin) && (
            <button
              onClick={() => { setActiveSubTab('PENDING_APPROVALS'); setPage(0); }}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none',
                background: activeSubTab === 'PENDING_APPROVALS' ? '#D97706' : '#E2E8F0',
                color: activeSubTab === 'PENDING_APPROVALS' ? '#fff' : '#475569',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}
            >
              ⏳ Approval Queue {activeSubTab === 'PENDING_APPROVALS' && totalRecords > 0 ? `(${totalRecords})` : ''}
            </button>
          )}
        </div>

        <button
          onClick={() => { setEditingEvent(null); setCreateModalOpen(true); }}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #16A34A, #15803D)',
            color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
          }}
        >
          ➕ Create Event
        </button>
      </div>

      {/* Events List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontWeight: 600 }}>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px', background: '#F8FAFC',
          borderRadius: 20, border: '1px dashed #CBD5E1', color: '#64748B',
        }}>
          <p style={{ fontSize: 24, margin: '0 0 8px' }}>🎉</p>
          <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#334155' }}>
            No events found
          </p>
          <p style={{ fontSize: 12, margin: 0 }}>
            {activeSubTab === 'PENDING_APPROVALS'
              ? 'No event requests sitting in approval queue.'
              : 'Click "Create Event" to schedule a new event.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {events.map((ev) => (
            <RoleEventCardItem
              key={ev.id}
              ev={ev}
              activeSubTab={activeSubTab}
              isAdmin={isAdmin}
              isMaster={isMaster}
              handleApprove={handleApprove}
              setRejectingEvent={setRejectingEvent}
              setEditingEvent={(eventToEdit) => { setEditingEvent(eventToEdit); setCreateModalOpen(true); }}
              setReportingEvent={setReportingEvent}
              setRegistrationsEvent={setRegistrationsEvent}
              setUploadCoverEvent={setUploadCoverEvent}
              getStatusBadge={getStatusBadge}
              hasEventPassed={hasEventPassed}
              handleRegisterForEvent={handleRegisterForEvent}
              isRegistered={registeredIds.includes(Number(ev.id))}
              isRegistering={registeringId === ev.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer' }}
          >
            Previous
          </button>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', alignSelf: 'center' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer' }}
          >
            Next
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {createModalOpen && (
        <CreateEventModal
          userRole={userRole}
          editEvent={editingEvent}
          onClose={() => { setCreateModalOpen(false); setEditingEvent(null); }}
          onCreated={() => {
            showToast(editingEvent ? 'Event updated!' : 'Event submitted successfully!');
            loadData(page);
          }}
          onError={(err) => showToast(err, 'error')}
        />
      )}

      {/* Submit Report Modal */}
      {reportingEvent && (
        <SubmitEventReportModal
          event={reportingEvent}
          userRole={userRole}
          onClose={() => setReportingEvent(null)}
          onSuccess={(msg) => {
            showToast(msg);
            loadData(page);
          }}
          onError={(err) => showToast(err, 'error')}
        />
      )}

      {/* Reject Modal */}
      {rejectingEvent && (
        <RejectEventModal
          event={rejectingEvent}
          userRole={userRole}
          onClose={() => setRejectingEvent(null)}
          onSuccess={(msg) => {
            showToast(msg);
            loadData(page);
          }}
          onError={(err) => showToast(err, 'error')}
        />
      )}

      {/* Event Cover Photo Upload Modal */}
      {uploadCoverEvent && (
        <EventCoverUploadModal
          eventId={uploadCoverEvent.id}
          eventTitle={uploadCoverEvent.title}
          currentCoverUrl={uploadCoverEvent.coverImageUrl}
          isOpen={Boolean(uploadCoverEvent)}
          onClose={() => setUploadCoverEvent(null)}
          onUploadSuccess={() => {
            showToast('Event cover photo updated successfully!');
            loadData(page);
            setUploadCoverEvent(null);
          }}
        />
      )}

      {/* Event Registrations Modal */}
      {registrationsEvent && (
        <EventRegistrationsModal
          event={registrationsEvent}
          onClose={() => setRegistrationsEvent(null)}
          onToast={({ message, type }) => showToast(message, type)}
        />
      )}
    </div>
  );
}
