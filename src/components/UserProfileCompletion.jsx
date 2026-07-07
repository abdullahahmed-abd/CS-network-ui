// src/components/UserProfileCompletion.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountryPhoneInput from './CountryPhoneInput';
import RippleButton from './RippleButton';
import { submitProfile } from '../services/api';
import {
  User, Building2, Globe, Languages,
  Shield, Check, Info, ArrowRight,
  Phone, MapPin, Briefcase,
} from 'lucide-react';

// ─── Constants (same as before) ───────────────────────────────
const sectors = [
  'Franchise Development',
  'Technology & Software',
  'Real Estate & Construction',
  'Finance & Investment',
  'Healthcare & Pharmaceuticals',
  'Retail & Consumer Goods',
  'Energy & Resources',
  'Logistics & Supply Chain',
  'Professional Services',
];

const geographies = [
  'United Arab Emirates',
  'Saudi Arabia',
  'India',
  'United States',
  'United Kingdom',
  'Singapore',
  'Australia',
  'Canada',
  'European Union',
  'Latin America',
];

const businessAgeOptions = [
  { value: 'LESS_THAN_ONE_YEAR',   label: 'Less than 1 year' },
  { value: 'ONE_TO_THREE_YEARS',   label: '1 – 3 years' },
  { value: 'THREE_TO_FIVE_YEARS',  label: '3 – 5 years' },
  { value: 'MORE_THAN_FIVE_YEARS', label: 'More than 5 years' },
];

const positionOptions = [
  { value: 'FREELANCER',     label: 'Freelancer' },
  { value: 'EMPLOYEE',       label: 'Employee' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner' },
  { value: 'MANAGER',        label: 'Manager' },
  { value: 'DIRECTOR',       label: 'Director' },
  { value: 'C_LEVEL',        label: 'C-Level Executive' },
];

const contactMethodOptions = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'EMAIL',    label: 'Email' },
  { value: 'PHONE',    label: 'Phone Call' },
];

const roleMetadata = {
  BUYER: {
    title: 'Buyer',
    desc: 'Sourcing deals, products, or looking to invest capital.',
    color: 'rgba(0,229,255,0.15)',
    border: '#00E5FF',
  },
  SELLER: {
    title: 'Seller',
    desc: 'Offering products, services, licenses, or assets.',
    color: 'rgba(245,158,11,0.15)',
    border: '#F59E0B',
  },
  CONNECTOR: {
    title: 'Connector',
    desc: 'Connecting buyers and sellers to broker transactions.',
    color: 'rgba(16,185,129,0.15)',
    border: '#10B981',
  },
  FRENCHISE_OPERATOR: {
    title: 'Franchise Operator',
    desc: 'Orchestrating regional franchise groups and networks.',
    color: 'rgba(0,82,255,0.15)',
    border: '#0052FF',
  },
};

// ─── Component ────────────────────────────────────────────────
export default function UserProfileCompletion({
  initialName,
  onSubmit,
  isLoading,
  setIsLoading,
}) {
  const [name,          setName]          = useState(initialName || '');
  const [company,       setCompany]       = useState('');
  const [sector,        setSector]        = useState('');
  const [country,       setCountry]       = useState('');
  const [state,         setState]         = useState('');
  const [city,          setCity]          = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [language,      setLanguage]      = useState('English');
  const [altPhone,      setAltPhone]      = useState('');
  const [contactMethod, setContactMethod] = useState('WHATSAPP');
  const [businessAge,   setBusinessAge]   = useState('');
  const [position,      setPosition]      = useState('');
  const [error,         setError]         = useState('');

  const savedUser      = JSON.parse(localStorage.getItem('cs_userData') || '{}');
  const whatsappNumber = savedUser.phone || '';

  const toggleRole = (roleKey) => {
    setError('');
    setSelectedRoles(prev =>
      prev.includes(roleKey)
        ? prev.filter(r => r !== roleKey)
        : [...prev, roleKey]
    );
  };

  // ── REAL API SUBMIT ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim())               return setError('Please enter your full name.');
    if (selectedRoles.length === 0) return setError('Please select at least one role.');
    if (!company.trim())            return setError('Please enter your company name.');
    if (!sector)                    return setError('Please select your business sector.');
    if (!country)                   return setError('Please select your country.');
    if (!state.trim())              return setError('Please enter your state.');
    if (!city.trim())               return setError('Please enter your city.');
    if (!businessAge)               return setError('Please select your business age.');
    if (!position)                  return setError('Please select your position.');
    if (altPhone && altPhone === whatsappNumber) {
      return setError("Alternate phone number cannot be the same as your WhatsApp number.");
    }

    setError('');

    const payload = {
      memberRequestType:      'SUBMIT_PERSONAL_FORM',
      alternatePhoneNumber:   altPhone || null,
      preferredContactMethod: contactMethod,
      companyName:            company,
      businessAge,
      position,
      country,
      state,
      city,
      languagePreference:     language,
      roles:                  selectedRoles,
    };

    if (setIsLoading) setIsLoading(true);

    try {
      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
      console.log('🔑 Access Token:', localStorage.getItem('cs_accessToken'));

      const data = await submitProfile(payload);
      console.log('📥 Response:', data);

      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('cs_userData') || '{}');
      localStorage.setItem('cs_userData', JSON.stringify({
        ...userData,
        company: payload.companyName,
        country: payload.country,
        state: payload.state,
        city: payload.city,
        roles: payload.roles,
        position: payload.position,
        isFormFill: true,
      }));

      onSubmit(payload);
    } catch (err) {
      console.error('❌ Profile submit error:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  // ── Input styles ────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    height: '48px',
    padding: '0 14px',
    background: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderRadius: '12px',
    color: '#1F2937',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: '40px',
  };

  const focusIn = (e) => {
    e.target.style.borderColor = '#A2CB8B';
    e.target.style.boxShadow   = '0 0 0 3px rgba(162,203,139,0.12)';
  };
  const focusOut = (e) => {
    e.target.style.borderColor = '#E5E7EB';
    e.target.style.boxShadow   = '0 2px 6px rgba(15,23,42,0.04)';
  };

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        maxHeight: '480px',
        overflowY: 'auto',
        paddingRight: '4px',
      }}
    >
      {/* Header */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <motion.div
          className="h-1 rounded-full mx-auto"
          style={{
            width: 48,
            background: 'linear-gradient(90deg, #A2CB8B, #7FB068)',
          }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 48, opacity: 1 }}
          transition={{ duration: 0.45 }}
        />
        <h2
          className="text-[20px] font-bold tracking-tight"
          style={{ color: '#1F2937' }}
        >
          Complete Operator Profile
        </h2>
        <p
          className="text-sm font-medium leading-relaxed"
          style={{ color: '#6B7280' }}
        >
          Provide details to finalize your CS Network membership.
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: '#374151' }}
          >
            <User size={14} /> Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="e.g. John Doe"
            style={inputStyle}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        {/* Roles */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-semibold"
            style={{ color: '#374151' }}
          >
            Deal Participation Role(s)
          </label>
          <span
            className="text-xs"
            style={{ color: '#9CA3AF', marginBottom: '4px' }}
          >
            Select all that apply to your participation model.
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {Object.entries(roleMetadata).map(([key, role]) => {
              const isSelected = selectedRoles.includes(key);
              return (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => toggleRole(key)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: isSelected ? role.color : '#FFFFFF',
                    border: `1.5px solid ${
                      isSelected ? role.border : '#E5E7EB'
                    }`,
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    width: '100%',
                    boxShadow: isSelected
                      ? '0 3px 10px rgba(0,0,0,0.1)'
                      : '0 2px 6px rgba(15,23,42,0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: isSelected ? role.border : '#1F2937',
                      }}
                    >
                      {role.title}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          background: role.border,
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Check size={10} strokeWidth={3} color="#fff" />
                      </motion.div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#9CA3AF',
                      lineHeight: '1.3',
                    }}
                  >
                    {role.desc}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: '#374151' }}
          >
            <Building2 size={14} /> Company / Organization
          </label>
          <input
            type="text"
            value={company}
            onChange={e => { setCompany(e.target.value); setError(''); }}
            placeholder="e.g. Global Trade Corp"
            style={inputStyle}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        {/* Position + Business Age */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: '#374151' }}
            >
              <Briefcase size={14} /> Position
            </label>
            <select
              value={position}
              onChange={e => { setPosition(e.target.value); setError(''); }}
              style={selectStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            >
              <option value="" disabled>
                Select position...
              </option>
              {positionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: '#374151' }}
            >
              <Briefcase size={14} /> Business Age
            </label>
            <select
              value={businessAge}
              onChange={e => { setBusinessAge(e.target.value); setError(''); }}
              style={selectStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            >
              <option value="" disabled>
                Select age...
              </option>
              {businessAgeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Country + Sector */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: '#374151' }}
            >
              <Globe size={14} /> Country
            </label>
            <select
              value={country}
              onChange={e => { setCountry(e.target.value); setError(''); }}
              style={selectStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            >
              <option value="" disabled>
                Select country...
              </option>
              {geographies.map(geo => (
                <option key={geo} value={geo}>
                  {geo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: '#374151' }}
            >
              <Shield size={14} /> Business Sector
            </label>
            <select
              value={sector}
              onChange={e => { setSector(e.target.value); setError(''); }}
              style={selectStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            >
              <option value="" disabled>
                Select sector...
              </option>
              {sectors.map(sec => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State + City */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: '#374151' }}
            >
              <MapPin size={14} /> State / Province
            </label>
            <input
              type="text"
              value={state}
              onChange={e => { setState(e.target.value); setError(''); }}
              placeholder="e.g. Dubai"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: '#374151' }}
            >
              <MapPin size={14} /> City
            </label>
            <input
              type="text"
              value={city}
              onChange={e => { setCity(e.target.value); setError(''); }}
              placeholder="e.g. Dubai"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>
        </div>

        {/* Alternate Phone */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: '#374151' }}
          >
            <Phone size={14} /> Alternate Phone{' '}
            <span
              className="text-xs font-normal"
              style={{ color: '#9CA3AF' }}
            >
              (optional)
            </span>
          </label>
          <CountryPhoneInput
            value={altPhone}
            onChange={setAltPhone}
            error=""
            setError={() => {}}
          />
        </div>

        {/* Preferred Contact Method */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-semibold"
            style={{ color: '#374151' }}
          >
            Preferred Contact Method
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {contactMethodOptions.map(opt => {
              const isActive = contactMethod === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  onClick={() => setContactMethod(opt.value)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    background: isActive
                      ? 'rgba(162,203,139,0.12)'
                      : '#FFFFFF',
                    border: `1.5px solid ${
                      isActive ? '#A2CB8B' : '#E5E7EB'
                    }`,
                    borderRadius: '12px',
                    padding: '12px 8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isActive ? '#1F2937' : '#6B7280',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    boxShadow: isActive
                      ? '0 3px 10px rgba(162,203,139,0.2)'
                      : '0 2px 6px rgba(15,23,42,0.04)',
                  }}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: '#374151' }}
          >
            <Languages size={14} /> Language Preference
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { lang: 'English', flag: '🇬🇧', label: 'English (EN)' },
              { lang: 'Spanish', flag: '🇪🇸', label: 'Spanish (ES)' },
            ].map(({ lang, flag, label }) => {
              const isActive = language === lang;
              return (
                <motion.button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    background: isActive
                      ? 'rgba(162,203,139,0.12)'
                      : '#FFFFFF',
                    border: `1.5px solid ${
                      isActive ? '#A2CB8B' : '#E5E7EB'
                    }`,
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isActive ? '#1F2937' : '#6B7280',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: isActive
                      ? '0 3px 10px rgba(162,203,139,0.2)'
                      : '0 2px 6px rgba(15,23,42,0.04)',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{flag}</span> {label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl p-3 flex items-center gap-2"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <RippleButton
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
          style={{ height: '48px', fontSize: '14px' }}
        >
          {isLoading ? (
            'Saving Profile...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              Save & Continue <ArrowRight size={16} />
            </span>
          )}
        </RippleButton>
      </motion.form>
    </motion.div>
  );
}