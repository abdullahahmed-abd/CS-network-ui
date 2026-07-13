import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import RippleButton from '../components/RippleButton';
import { authOperation, getItem, setItem } from '../api/auth'; // ✅ fixed

const COUNTRY_CODES = [
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', short: 'SA', maxLen: 9 },
  { code: '+971', flag: '🇦🇪', name: 'UAE', short: 'AE', maxLen: 9 },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait', short: 'KW', maxLen: 8 },
  { code: '+974', flag: '🇶🇦', name: 'Qatar', short: 'QA', maxLen: 8 },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain', short: 'BH', maxLen: 8 },
  { code: '+968', flag: '🇴🇲', name: 'Oman', short: 'OM', maxLen: 8 },
  { code: '+20', flag: '🇪🇬', name: 'Egypt', short: 'EG', maxLen: 10 },
  { code: '+962', flag: '🇯🇴', name: 'Jordan', short: 'JO', maxLen: 9 },
  { code: '+1', flag: '🇺🇸', name: 'USA', short: 'US', maxLen: 10 },
  { code: '+44', flag: '🇬🇧', name: 'UK', short: 'GB', maxLen: 10 },
  { code: '+91', flag: '🇮🇳', name: 'India', short: 'IN', maxLen: 10 },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan', short: 'PK', maxLen: 10 },
];

const WhatsAppIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94
      1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173
      -.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52
      -.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074
      -.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487
      .709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248
      -1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214
      -3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122
      1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815
      11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882
      11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function PhoneScreen({ onBack, onSendOTP, mode = 'signup' }) {
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const searchRef = useRef(null);

  const digits = phone.replace(/\D/g, '');
  const canSubmit =
    digits.length >= 7 && digits.length <= selectedCountry.maxLen && !loading;

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery) ||
      c.short.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // ── Auto-focus search when dropdown opens ──
  useEffect(() => {
    if (showDropdown) {
      const t = setTimeout(() => searchRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [showDropdown]);

  // ── Validation ──
  const validate = () => {
    if (!digits) return 'Phone number is required';
    if (digits.length < 7) return 'Enter a valid phone number';
    if (digits.length > selectedCountry.maxLen) return 'Phone number is too long';
    return '';
  };

  // ── Send OTP — real API call ──
  const handleSend = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const fullPhone = `${selectedCountry.code}${digits}`;
      const requestType =
        mode === 'signup' ? 'SEND_SIGNUP_OTP' : 'SEND_LOGIN_OTP';

      const payload =
        requestType === 'SEND_SIGNUP_OTP'
          ? {
              userId: getItem('userId'),
              phoneNumber: fullPhone,
              requestType,
            }
          : {
              phoneNumber: fullPhone,
              requestType,
            };

      await authOperation(payload);

      setItem('pendingPhone', fullPhone);
      onSendOTP(digits, selectedCountry.code);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Select country ──
  const handleSelectCountry = (c) => {
    setSelectedCountry(c);
    setPhone('');
    setError('');
    setShowDropdown(false);
    setSearchQuery('');
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const borderColor = error ? '#EF4444' : focused ? '#25D366' : '#E5E7EB';

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Accent bar */}
      <motion.div
        className="h-1 rounded-full"
        style={{ background: 'linear-gradient(90deg,#25D366,#86EFAC)' }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 56, opacity: 1 }}
        transition={{ duration: 0.45 }}
      />

      {/* Back */}
      <motion.button
        onClick={onBack}
        className="self-start flex items-center gap-1.5 text-sm font-medium"
        style={{
          color: '#6B7280',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 0',
        }}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      {/* Header */}
      <div className="space-y-1">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{
            background: 'rgba(37,211,102,0.10)',
            color: '#16A34A',
            border: '1px solid rgba(37,211,102,0.20)',
          }}
        >
          <WhatsAppIcon size={11} color="#25D366" />
          WhatsApp Verification
        </span>

        <h2
          className="text-[22px] font-bold tracking-tight"
          style={{ color: '#1F2937' }}
        >
          Verify via WhatsApp
        </h2>
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: '#6B7280' }}
        >
          We'll send a{' '}
          <span className="font-semibold" style={{ color: '#16A34A' }}>
            6-digit OTP
          </span>{' '}
          to your WhatsApp — make sure WhatsApp is active on this number.
        </p>
      </div>

      {/* Trust card */}
      <motion.div
        className="rounded-2xl p-3.5 flex items-start gap-2.5"
        style={{
          background:
            'linear-gradient(135deg,rgba(37,211,102,0.06) 0%,rgba(134,239,172,0.10) 100%)',
          border: '1px solid rgba(37,211,102,0.18)',
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(37,211,102,0.14)' }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16A34A"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-semibold" style={{ color: '#1F2937' }}>
            Secure WhatsApp OTP
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: '#6B7280' }}>
            The OTP will arrive on{' '}
            <span className="font-medium">WhatsApp</span>, not SMS. Your number
            is never shared or used for marketing.
          </p>
        </div>
      </motion.div>

      {/* ═══ Phone Input + Dropdown ═══ */}
      <div className="relative" ref={wrapperRef}>
        {/* Input row */}
        <motion.div
          className="flex items-center"
          style={{
            minHeight: 54,
            borderRadius: 16,
            border: `1.5px solid ${borderColor}`,
            background: '#FFFFFF',
            boxShadow: focused
              ? '0 0 0 4px rgba(37,211,102,0.08)'
              : '0 2px 10px rgba(0,0,0,0.03)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            overflow: 'hidden',
          }}
          animate={error ? { x: [-5, 5, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          {/* Country trigger */}
          <motion.button
            type="button"
            onClick={() => {
              setShowDropdown((s) => !s);
              setSearchQuery('');
            }}
            className="flex items-center gap-1.5 shrink-0"
            style={{
              height: 54,
              width: 96,
              paddingLeft: 10,
              paddingRight: 8,
              borderRight: '1px solid #E5E7EB',
              background: 'transparent',
              cursor: 'pointer',
              border: 'none',
              borderRight: '1px solid #E5E7EB',
            }}
            whileHover={{ backgroundColor: 'rgba(37,211,102,0.04)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
              {selectedCountry.flag}
            </span>
            <div
              className="flex flex-col items-start leading-none"
              style={{ minWidth: 0 }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#1F2937',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedCountry.code}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: '#9CA3AF',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedCountry.short}
              </span>
            </div>
            <motion.svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ flexShrink: 0, marginLeft: 'auto' }}
              animate={{ rotate: showDropdown ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </motion.button>

          {/* Phone input */}
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            value={phone}
            maxLength={selectedCountry.maxLen}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, '');
              setPhone(cleaned.slice(0, selectedCountry.maxLen));
              setError('');
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`${selectedCountry.maxLen}-digit number`}
            autoFocus
            className="flex-1 bg-transparent outline-none"
            style={{
              minHeight: 54,
              paddingLeft: 10,
              paddingRight: 8,
              fontSize: 15,
              fontWeight: 600,
              color: '#1F2937',
              fontFamily: 'Inter, sans-serif',
              minWidth: 0,
            }}
          />

          {/* Valid tick */}
          <AnimatePresence>
            {digits.length >= 7 && !error && (
              <motion.div
                className="pr-3 shrink-0"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(37,211,102,0.14)' }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ═══ Dropdown ═══ */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              style={{
                position: 'absolute',
                bottom: 'calc(110% + 8px)',
                left: 0,
                width: '100%',
                borderRadius: 16,
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow:
                  '0 20px 50px rgba(0,0,0,0.12),0 4px 12px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                zIndex: 9999,
              }}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{
                duration: 0.18,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {/* Search bar */}
              <div
                style={{
                  padding: '10px 10px 8px',
                  borderBottom: '1px solid #F3F4F6',
                  background: '#FAFAFA',
                }}
              >
                <div
                  className="flex items-center gap-2"
                  style={{
                    background: '#fff',
                    borderRadius: 10,
                    border: '1px solid #E5E7EB',
                    padding: '6px 10px',
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country..."
                    className="outline-none bg-transparent flex-1"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#1F2937',
                      fontFamily: 'Inter,sans-serif',
                    }}
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        onClick={() => setSearchQuery('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                        }}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9CA3AF"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* List */}
              <div
                style={{ maxHeight: 210, overflowY: 'auto', padding: '4px' }}
                className="custom-scrollbar"
              >
                {filteredCountries.length === 0 ? (
                  <div
                    style={{
                      padding: '20px 12px',
                      textAlign: 'center',
                      color: '#9CA3AF',
                      fontSize: 12,
                    }}
                  >
                    No country found
                  </div>
                ) : (
                  filteredCountries.map((c, i) => {
                    const active = selectedCountry.short === c.short;
                    return (
                      <motion.button
                        key={c.short}
                        onClick={() => handleSelectCountry(c)}
                        className="w-full flex items-center text-left"
                        style={{
                          padding: '9px 10px',
                          borderRadius: 10,
                          background: active
                            ? 'rgba(37,211,102,0.08)'
                            : 'transparent',
                          border: `1px solid ${
                            active ? 'rgba(37,211,102,0.18)' : 'transparent'
                          }`,
                          cursor: 'pointer',
                          gap: 10,
                          marginBottom:
                            i < filteredCountries.length - 1 ? 2 : 0,
                        }}
                        whileHover={{
                          background: active
                            ? 'rgba(37,211,102,0.12)'
                            : 'rgba(0,0,0,0.03)',
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span
                          style={{
                            fontSize: 20,
                            lineHeight: 1,
                            flexShrink: 0,
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 8,
                            background: active
                              ? 'rgba(37,211,102,0.10)'
                              : 'rgba(0,0,0,0.04)',
                          }}
                        >
                          {c.flag}
                        </span>
                        <div className="flex-1" style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: active ? 600 : 500,
                              color: active ? '#16A34A' : '#1F2937',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {c.name}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: '#9CA3AF',
                              fontWeight: 500,
                              marginTop: 1,
                            }}
                          >
                            {c.short}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            flexShrink: 0,
                            color: active ? '#16A34A' : '#6B7280',
                            fontFamily: "'SF Mono','Fira Code',monospace",
                            background: active
                              ? 'rgba(37,211,102,0.10)'
                              : 'rgba(0,0,0,0.04)',
                            padding: '3px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {c.code}
                        </span>
                        <AnimatePresence>
                          {active && (
                            <motion.div
                              style={{ flexShrink: 0 }}
                              initial={{ opacity: 0, scale: 0.4 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.4 }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#16A34A"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper / error / counter */}
        <div className="mt-1.5 flex items-center justify-between px-1">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="err"
                className="text-[12px] font-medium"
                style={{ color: '#EF4444' }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                ⚠️ {error}
              </motion.p>
            ) : (
              <motion.p
                key="help"
                className="text-[12px]"
                style={{ color: '#9CA3AF' }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                OTP will be sent via WhatsApp
              </motion.p>
            )}
          </AnimatePresence>
          <span
            className="text-[11px] font-medium tabular-nums"
            style={{
              color:
                digits.length === selectedCountry.maxLen ? '#16A34A' : '#9CA3AF',
            }}
          >
            {digits.length}/{selectedCountry.maxLen}
          </span>
        </div>
      </div>

      {/* Send button */}
      <RippleButton
        variant="primary"
        onClick={handleSend}
        loading={loading}
        disabled={!canSubmit}
      >
        {loading ? (
          'Sending OTP…'
        ) : (
          <span className="flex items-center justify-center gap-2">
            <WhatsAppIcon size={16} color="currentColor" />
            Send OTP on WhatsApp
          </span>
        )}
      </RippleButton>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.10); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.20); }
      `}</style>
    </motion.div>
  );
}