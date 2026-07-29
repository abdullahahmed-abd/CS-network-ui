// components/globalAdmin/events/CreateEventModal.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { createEvent } from '../../../api/adminApi';
import {
  InputField, TextareaField, SelectField,
  DateTimeField, CheckboxField, GreenButton,
  SectionTitle, sectionAddBtnStyle, removeBtnStyle,
} from '../FormFields';

export default function CreateEventModal({ onClose, onCreated, onError }) {
  const [loading, setLoading]           = useState(false);
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [eventType, setEventType]       = useState('ONLINE');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime]   = useState('');
  const [timezone, setTimezone]         = useState('Asia/Kolkata');
  const [capacity, setCapacity]         = useState(100);
  const [onlineJoinLink, setOnlineJoinLink] = useState('');
  const [venueName, setVenueName]       = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [city, setCity]                 = useState('');
  const [state, setState]               = useState('');
  const [country, setCountry]           = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPaid, setIsPaid]             = useState(false);
  const [price, setPrice]               = useState('');
  const [currency, setCurrency]         = useState('INR');
  const [speakers, setSpeakers]         = useState([
    { name: '', designation: '', bio: '', photoUrl: '', displayOrder: 1 },
  ]);
  const [agenda, setAgenda]             = useState([
    { title: '', description: '', startTime: '', endTime: '', displayOrder: 1 },
  ]);

  const isOnline = eventType === 'ONLINE';
  const toISO = (local) => local ? new Date(local).toISOString() : '';

  const addSpeaker    = () => setSpeakers([...speakers, { name: '', designation: '', bio: '', photoUrl: '', displayOrder: speakers.length + 1 }]);
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
    if (!title.trim() || !description.trim()) { onError('Please fill title and description'); return; }
    if (!startDateTime || !endDateTime)        { onError('Please select start and end date/time'); return; }
    if (isOnline && !onlineJoinLink.trim())    { onError('Online events need a join link'); return; }
    if (!isOnline && (!venueName.trim() || !city.trim() || !country.trim())) {
      onError('In-person events need venue, city and country'); return;
    }
    if (isPaid && (!price || Number(price) <= 0)) { onError('Please enter a valid price for paid event'); return; }

    const payload = {
      title: title.trim(), description: description.trim(),
      eventType, startDateTime: toISO(startDateTime),
      endDateTime: toISO(endDateTime), timezone,
      isPaid, capacity: Number(capacity),
      speakers: speakers.filter(s => s.name.trim()).map((s, i) => ({ ...s, displayOrder: i + 1 })),
      agenda: agenda.filter(a => a.title.trim()).map((a, i) => ({
        ...a, startTime: toISO(a.startTime), endTime: toISO(a.endTime), displayOrder: i + 1,
      })),
    };

    if (isOnline) {
      payload.onlineJoinLink = onlineJoinLink.trim();
    } else {
      payload.venueName    = venueName.trim();
      payload.venueAddress = venueAddress.trim();
      payload.city         = city.trim();
      payload.state        = state.trim();
      payload.country      = country.trim();
      if (coverImageUrl.trim()) payload.coverImageUrl = coverImageUrl.trim();
    }

    if (isPaid) {
      payload.price    = Number(price);
      payload.currency = currency;
    }

    setLoading(true);
    try {
      const res = await createEvent(payload);
      onCreated(res.event);
    } catch (err) {
      onError(err.message || 'Failed to create event');
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
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, position: 'sticky', top: 0,
          background: '#fff', zIndex: 2,
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
              🎉 Create Event
            </h3>
            <p style={{ fontSize: 11, color: '#6B8F71', margin: '4px 0 0', fontWeight: 500 }}>
              Fill in details to create and publish a new event
            </p>
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

        {/* Basic Info */}
        <SectionTitle>📋 Basic Information</SectionTitle>
        <InputField label="Event Title *" value={title} onChange={setTitle}
          placeholder="e.g. Connect Souq Meetup 2026" />
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
          <DateTimeField label="Start Date & Time *" value={startDateTime} onChange={setStartDateTime} />
          <DateTimeField label="End Date & Time *"   value={endDateTime}   onChange={setEndDateTime} />
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
              placeholder="e.g. Dubai World Trade Centre" />
            <InputField label="Venue Address" value={venueAddress} onChange={setVenueAddress}
              placeholder="Street address" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <InputField label="City *"    value={city}    onChange={setCity}    placeholder="Dubai" />
              <InputField label="State"     value={state}   onChange={setState}   placeholder="Dubai" />
              <InputField label="Country *" value={country} onChange={setCountry} placeholder="UAE" />
            </div>
            <InputField label="Cover Image URL" value={coverImageUrl} onChange={setCoverImageUrl}
              placeholder="https://example.com/image.jpg" />
          </>
        )}

        {/* Pricing */}
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

        {/* Speakers */}
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
              <InputField label="Name"        value={s.name}        onChange={(v) => updateSpeaker(idx, 'name', v)}        placeholder="Full name" />
              <InputField label="Designation" value={s.designation} onChange={(v) => updateSpeaker(idx, 'designation', v)} placeholder="Role/Title" />
            </div>
            <TextareaField label="Bio" value={s.bio} onChange={(v) => updateSpeaker(idx, 'bio', v)} placeholder="Short bio..." rows={2} />
            <InputField label="Photo URL" value={s.photoUrl} onChange={(v) => updateSpeaker(idx, 'photoUrl', v)} placeholder="https://..." />
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
            <InputField label="Title"       value={a.title}       onChange={(v) => updateAgenda(idx, 'title', v)}       placeholder="Session title" />
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
              {loading ? 'Creating Event...' : '🚀 Create & Publish Event'}
            </GreenButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}