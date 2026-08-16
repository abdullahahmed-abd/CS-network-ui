import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  createGlobalAdminEvent,
  updateGlobalAdminEvent,
  createMasterOperatorEvent,
  createFranchiseOperatorEvent,
  updateFranchiseOperatorEvent,
  updateMasterOperatorEvent,
} from '../../../api/eventsApi';
import { uploadEventCoverPhoto, resolvePhotoUrl } from '../../../api/profileOperationsApi';
import {
  InputField, TextareaField, SelectField,
  DateTimeField, CheckboxField, GreenButton,
  SectionTitle, sectionAddBtnStyle, removeBtnStyle,
} from '../FormFields';
import { getCountries, getStates, getCities } from '../../../utils/locationData';

export default function CreateEventModal({
  onClose,
  onCreated,
  onError,
  userRole = 'GLOBAL_ADMIN',
  editEvent = null,
}) {
  const isOperator = userRole === 'FRANCHISE_OPERATOR';
  const isMaster = userRole === 'MASTER_OPERATOR';
  const isEditing = Boolean(editEvent);

  const [loading, setLoading]           = useState(false);
  const [createdEvent, setCreatedEvent]   = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError]     = useState(null);
  const [coverSuccess, setCoverSuccess] = useState('');
  const [title, setTitle]               = useState(editEvent?.title || '');
  const [description, setDescription]   = useState(editEvent?.description || '');
  const [eventType, setEventType]       = useState(editEvent?.eventType || 'ONLINE');
  const [startDateTime, setStartDateTime] = useState(
    editEvent?.startDateTime ? editEvent.startDateTime.slice(0, 16) : ''
  );
  const [endDateTime, setEndDateTime]   = useState(
    editEvent?.endDateTime ? editEvent.endDateTime.slice(0, 16) : ''
  );
  const [timezone, setTimezone]         = useState(editEvent?.timezone || 'Asia/Kolkata');
  const [capacity, setCapacity]         = useState(editEvent?.capacity || 100);
  const [onlineJoinLink, setOnlineJoinLink] = useState(editEvent?.onlineJoinLink || '');
  const [venueName, setVenueName]       = useState(editEvent?.venueName || '');
  const [venueAddress, setVenueAddress] = useState(editEvent?.venueAddress || '');
  const [city, setCity]                 = useState(editEvent?.city || editEvent?.eventCity || '');
  const [state, setState]               = useState(editEvent?.state || editEvent?.eventState || '');
  const [country, setCountry]           = useState(editEvent?.country || '');
  const [coverImageUrl, setCoverImageUrl] = useState(editEvent?.coverImageUrl || '');
  
  // Paid option only available for Global Admin
  const [isPaid, setIsPaid]             = useState(isOperator || isMaster ? false : Boolean(editEvent?.isPaid || editEvent?.paid));
  const [price, setPrice]               = useState(editEvent?.price || '');
  const [currency, setCurrency]         = useState(editEvent?.currency || 'INR');

  // Speakers (photoUrl field completely removed per user request)
  const [speakers, setSpeakers]         = useState(
    editEvent?.speakers?.length
      ? editEvent.speakers.map((s, i) => ({
          name: s.name || '',
          designation: s.designation || '',
          bio: s.bio || '',
          displayOrder: i + 1,
        }))
      : [{ name: '', designation: '', bio: '', displayOrder: 1 }]
  );

  const [agenda, setAgenda]             = useState(
    editEvent?.agenda?.length
      ? editEvent.agenda.map((a, i) => ({
          title: a.title || '',
          description: a.description || '',
          startTime: a.startTime ? a.startTime.slice(0, 16) : '',
          endTime: a.endTime ? a.endTime.slice(0, 16) : '',
          displayOrder: i + 1,
        }))
      : [{ title: '', description: '', startTime: '', endTime: '', displayOrder: 1 }]
  );

  const isOnline = eventType === 'ONLINE';
  const toISO = (local) => local ? new Date(local).toISOString() : '';

  const addSpeaker    = () => setSpeakers([...speakers, { name: '', designation: '', bio: '', displayOrder: speakers.length + 1 }]);
  const removeSpeaker = (idx) => setSpeakers(speakers.filter((_, i) => i !== idx));
  const updateSpeaker = (idx, key, val) => {
    const u = [...speakers]; u[idx][key] = val; setSpeakers(u);
  };

  const addAgenda    = () => setAgenda([...agenda, { title: '', description: '', startTime: '', endTime: '', displayOrder: agenda.length + 1 }]);
  const removeAgenda = (idx) => setAgenda(agenda.filter((_, i) => i !== idx));
  const updateAgenda = (idx, key, val) => {
    const u = [...agenda]; u[idx][key] = val; setAgenda(u);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) { onError?.('Please fill title and description'); return; }
    if (!startDateTime || !endDateTime)        { onError?.('Please select start and end date/time'); return; }
    if (isOnline && !onlineJoinLink.trim())    { onError?.('Online events need a join link'); return; }
    if (!isOnline && (!venueName.trim() || !city.trim() || !country.trim())) {
      onError?.('In-person events need venue, city and country'); return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      eventType,
      startDateTime: toISO(startDateTime),
      endDateTime: toISO(endDateTime),
      timezone,
      capacity: Number(capacity),
      speakers: speakers.filter(s => s.name.trim()).map((s, i) => ({
        name: s.name.trim(),
        designation: s.designation.trim(),
        bio: s.bio.trim(),
        displayOrder: i + 1,
      })),
      agenda: agenda.filter(a => a.title.trim()).map((a, i) => ({
        title: a.title.trim(),
        description: a.description.trim(),
        startTime: toISO(a.startTime),
        endTime: toISO(a.endTime),
        displayOrder: i + 1,
      })),
    };

    if (isOnline) {
      payload.onlineJoinLink = onlineJoinLink.trim();
    } else {
      payload.venueName    = venueName.trim();
      payload.venueAddress = venueAddress.trim();
      payload.country      = country.trim();
      if (coverImageUrl.trim()) payload.coverImageUrl = coverImageUrl.trim();

      // Master Operator uses eventCity / eventState
      if (isMaster) {
        payload.eventCity  = city.trim();
        payload.eventState = state.trim();
      } else {
        payload.city       = city.trim();
        payload.state      = state.trim();
      }
    }

    if (!isOperator && !isMaster && isPaid) {
      payload.isPaid   = true;
      payload.paid     = true;
      payload.price    = Number(price);
      payload.currency = currency;
    } else {
      payload.isPaid   = false;
      payload.paid     = false;
      payload.price    = null;
      payload.currency = null;
    }

    setLoading(true);
    try {
      let res;
      if (isEditing) {
        if (isOperator) {
          res = await updateFranchiseOperatorEvent(editEvent.id, payload);
        } else if (isMaster) {
          res = await updateMasterOperatorEvent(editEvent.id, payload);
        } else {
          res = await updateGlobalAdminEvent(editEvent.id, payload);
        }
      } else {
        if (isOperator) {
          res = await createFranchiseOperatorEvent(payload);
        } else if (isMaster) {
          res = await createMasterOperatorEvent(payload);
        } else {
          res = await createGlobalAdminEvent(payload);
        }
      }
      const savedEvent = res?.event || res;
      onCreated?.(savedEvent);

      const savedId = savedEvent?.id || savedEvent?.eventId;
      if (!isEditing && savedId) {
        setCreatedEvent({
          id: savedId,
          title: title.trim(),
          coverImageUrl: coverImageUrl,
        });
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Event save error:', err);
      onError?.(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !createdEvent?.id) return;

    setCoverUploading(true);
    setCoverError(null);
    setCoverSuccess('');

    try {
      const res = await uploadEventCoverPhoto(createdEvent.id, file);
      const formattedUrl = res?.fileUrl ? resolvePhotoUrl(res.fileUrl) : null;
      setCoverSuccess(res?.message || 'Event photo updated successfully.');
      setCreatedEvent((prev) => ({
        ...prev,
        coverImageUrl: formattedUrl || prev.coverImageUrl,
      }));
    } catch (err) {
      console.error('Failed to upload event cover photo:', err);
      setCoverError(err.message || 'Failed to upload cover photo.');
    } finally {
      setCoverUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
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
          background: '#fff', borderRadius: 20, padding: '28px 32px',
          maxWidth: 720, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          maxHeight: '90vh', overflowY: 'auto',
          fontFamily: 'Manrope, sans-serif',
        }}
      >
        {/* Post-Creation Cover Upload View */}
        {createdEvent ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#DCFCE7',
              color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, margin: '0 auto 16px', border: '1px solid #BBF7D0',
            }}>
              🎉
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: '0 0 6px' }}>
              Event #{createdEvent.id} Created!
            </h3>
            <p style={{ fontSize: 13, color: '#6B8F71', margin: '0 0 20px', fontWeight: 600 }}>
              {createdEvent.title}
            </p>

            {coverError && (
              <div style={{
                padding: '10px 14px', borderRadius: 12, background: '#FEE2E2',
                border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 12,
                fontWeight: 700, marginBottom: 16,
              }}>
                ⚠️ {coverError}
              </div>
            )}
            {coverSuccess && (
              <div style={{
                padding: '10px 14px', borderRadius: 12, background: '#DCFCE7',
                border: '1px solid #86EFAC', color: '#166534', fontSize: 12,
                fontWeight: 700, marginBottom: 16,
              }}>
                ✅ {coverSuccess}
              </div>
            )}

            {/* Upload Area / Cover Preview */}
            <div style={{
              background: createdEvent.coverImageUrl
                ? `url(${resolvePhotoUrl(createdEvent.coverImageUrl)}) center/cover`
                : '#F8FAFC',
              height: 180, borderRadius: 16, border: '2px dashed #CBD5E1',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden', marginBottom: 20,
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: createdEvent.coverImageUrl ? 'rgba(0,0,0,0.35)' : 'transparent',
              }} />

              <label
                style={{
                  position: 'relative', zIndex: 2, cursor: coverUploading ? 'not-allowed' : 'pointer',
                  padding: '10px 20px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #16A34A, #15803D)',
                  color: '#fff', fontSize: 13, fontWeight: 800,
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(22,163,74,0.4)',
                }}
              >
                <span>{coverUploading ? '⏳ Uploading...' : '📷 Upload Cover Image'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleCoverUpload}
                  disabled={coverUploading}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{
                position: 'relative', zIndex: 2, fontSize: 11,
                color: createdEvent.coverImageUrl ? '#fff' : '#64748B',
                marginTop: 8, fontWeight: 600,
              }}>
                Allowed: JPEG, PNG, WEBP, GIF (Max 5MB)
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <GreenButton onClick={onClose}>
                ✅ Finish & Close
              </GreenButton>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, position: 'sticky', top: 0,
              background: '#fff', zIndex: 2, paddingBottom: 10,
              borderBottom: '1px solid #F0F0F0',
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
                  🎉 {isEditing ? 'Edit Event' : 'Create Event'}
                </h3>
                <p style={{ fontSize: 11, color: '#6B8F71', margin: '4px 0 0', fontWeight: 500 }}>
                  {isOperator
                    ? 'Submitted for approval. Your Master Operator will review first.'
                    : isMaster
                    ? 'Submitted for approval. Global Admin will review.'
                    : 'Create & publish a new event'}
                </p>
                {isEditing && isOperator && (
                  <div style={{
                    marginTop: 8, padding: '6px 12px', borderRadius: 8,
                    background: '#FEF3C7', border: '1px solid #FDE68A',
                    color: '#92400E', fontSize: 11, fontWeight: 700,
                  }}>
                    ⚠️ Note: Re-editing this event will reset its approval status back to Master Review!
                  </div>
                )}
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, background: '#FEE2E2' }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  border: '1px solid #F0F0F0', background: '#F9FAFB',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#6B7280',
                }}
              >×</motion.button>
            </div>

        {/* Warning banner when editing an operator event */}
        {isEditing && isOperator && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            background: '#FFFBEB', border: '1px solid #FCD34D',
            fontSize: 11, fontWeight: 600, color: '#92400E',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>⚠️</span>
            <span>Editing this event will reset its approval stage back to Master Review.</span>
          </div>
        )}

        {/* Basic Info */}
        <SectionTitle>📋 Basic Information</SectionTitle>
        <InputField label="Event Title *" value={title} onChange={setTitle}
          placeholder="e.g. Export Documentation Workshop" />
        <TextareaField label="Description *" value={description} onChange={setDescription}
          placeholder="Describe your event..." rows={3} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SelectField label="Event Type *" value={eventType} onChange={setEventType}
            options={[
              { value: 'ONLINE', label: '💻 Online' },
              { value: 'IN_PERSON', label: '📍 In-Person' },
            ]} />
          <InputField label="Capacity *" value={capacity}
            onChange={(v) => setCapacity(v.replace(/\D/g, ''))} placeholder="100" />
        </div>

        {/* Date & Time */}
        <SectionTitle>📅 Date & Time</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <DateTimeField
            label="Start Date & Time *"
            value={startDateTime}
            onChange={(val) => {
              setStartDateTime(val);
              if (endDateTime && endDateTime < val) {
                setEndDateTime(val);
              }
            }}
          />
          <DateTimeField
            label="End Date & Time *"
            value={endDateTime}
            onChange={setEndDateTime}
            min={startDateTime || undefined}
          />
        </div>
        <InputField label="Timezone *" value={timezone} onChange={setTimezone}
          placeholder="e.g. Asia/Kolkata" />

        {/* Online / In-Person */}
        {isOnline ? (
          <>
            <SectionTitle>💻 Online Details</SectionTitle>
            <InputField label="Meeting Link *" value={onlineJoinLink} onChange={setOnlineJoinLink}
              placeholder="https://meet.example.com/..." />
          </>
        ) : (
          <>
            <SectionTitle>📍 Venue Details</SectionTitle>
            <InputField label="Venue Name *" value={venueName} onChange={setVenueName}
              placeholder="e.g. City Business Hub" />
            <InputField label="Venue Address" value={venueAddress} onChange={setVenueAddress}
              placeholder="Street address" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <SelectField
                label="Country *"
                value={country}
                onChange={(val) => { setCountry(val); setState(''); setCity(''); }}
                options={[
                  { value: '', label: 'Select Country' },
                  ...getCountries().map(c => ({ value: c, label: c })),
                ]}
              />
              <SelectField
                label="State"
                value={state}
                onChange={(val) => { setState(val); setCity(''); }}
                options={[
                  { value: '', label: country ? 'Select State' : '—' },
                  ...getStates(country).map(s => ({ value: s, label: s })),
                ]}
              />
              <SelectField
                label="City *"
                value={city}
                onChange={setCity}
                options={[
                  { value: '', label: state ? 'Select City' : '—' },
                  ...getCities(country, state).map(ci => ({ value: ci, label: ci })),
                ]}
              />
            </div>
          </>
        )}

        {/* Pricing (Global Admin Only) */}
        {!isOperator && !isMaster && (
          <>
            <SectionTitle>💰 Pricing</SectionTitle>
            <CheckboxField label="This is a paid event" checked={isPaid} onChange={setIsPaid} />
            {isPaid && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <InputField label="Price *" value={price} onChange={setPrice} placeholder="199.99" />
                <SelectField label="Currency *" value={currency} onChange={setCurrency}
                  options={[
                    { value: 'INR', label: 'INR ₹' },
                    { value: 'AED', label: 'AED د.إ' },
                    { value: 'USD', label: 'USD $' },
                    { value: 'EUR', label: 'EUR €' },
                    { value: 'GBP', label: 'GBP £' },
                  ]} />
              </div>
            )}
          </>
        )}

        {/* Speakers (photoUrl removed) */}
        <SectionTitle>
          🎤 Speakers
          <button onClick={addSpeaker} style={sectionAddBtnStyle}>+ Add</button>
        </SectionTitle>
        {speakers.map((s, idx) => (
          <div key={idx} style={{
            padding: '16px', background: '#F9FAFB',
            borderRadius: 12, border: '1px solid #E8F0E0', marginBottom: 12,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 12,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>
                Speaker #{idx + 1}
              </span>
              {speakers.length > 1 && (
                <button onClick={() => removeSpeaker(idx)} style={removeBtnStyle}>× Remove</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InputField label="Name *"       value={s.name}        onChange={(v) => updateSpeaker(idx, 'name', v)}        placeholder="Full name" />
              <InputField label="Designation" value={s.designation} onChange={(v) => updateSpeaker(idx, 'designation', v)} placeholder="Role/Title" />
            </div>
            <TextareaField label="Bio" value={s.bio} onChange={(v) => updateSpeaker(idx, 'bio', v)} placeholder="Short bio..." rows={2} />
          </div>
        ))}

        {/* Agenda */}
        <SectionTitle>
          📋 Agenda
          <button onClick={addAgenda} style={sectionAddBtnStyle}>+ Add</button>
        </SectionTitle>
        {agenda.map((a, idx) => (
          <div key={idx} style={{
            padding: '16px', background: '#F9FAFB',
            borderRadius: 12, border: '1px solid #E8F0E0', marginBottom: 12,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 12,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>
                Session #{idx + 1}
              </span>
              {agenda.length > 1 && (
                <button onClick={() => removeAgenda(idx)} style={removeBtnStyle}>× Remove</button>
              )}
            </div>
            <InputField label="Title *"      value={a.title}       onChange={(v) => updateAgenda(idx, 'title', v)}       placeholder="Session title" />
            <TextareaField label="Description" value={a.description} onChange={(v) => updateAgenda(idx, 'description', v)} placeholder="Details..." rows={2} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <DateTimeField label="Start Time" value={a.startTime} onChange={(v) => updateAgenda(idx, 'startTime', v)} />
              <DateTimeField label="End Time"   value={a.endTime}   onChange={(v) => updateAgenda(idx, 'endTime', v)} />
            </div>
          </div>
        ))}

        {/* Footer Buttons */}
        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <GreenButton variant="outline" onClick={onClose}>Cancel</GreenButton>
          <div style={{ flex: 1 }}>
            <GreenButton fullWidth onClick={handleSubmit} loading={loading}>
              {loading
                ? 'Saving Event...'
                : isEditing
                ? '💾 Update Event'
                : isOperator || isMaster
                ? '📨 Submit for Approval'
                : '🚀 Create & Publish Event'}
            </GreenButton>
          </div>
        </div>
        </>
        )}
      </motion.div>
    </motion.div>
  );
}