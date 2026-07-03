import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import RippleButton from '../components/RippleButton';

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

export default function PhoneScreen({ onBack, onSendOTP, mode = 'signup' }) {
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const isWhatsApp = mode === 'whatsapp';
  const digits = phone.replace(/\D/g, '');

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const validate = () => {
    if (!digits) return 'Phone number is required';
    if (digits.length < 7) return 'Enter a valid phone number';
    if (digits.length > selectedCountry.maxLen) return 'Phone number is too long';
    return '';
  };

  const handleSend = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSendOTP(digits, selectedCountry.code);
    }, 900);
  };

  const borderColor = error
    ? '#EF4444'
    : focused
    ? isWhatsApp
      ? '#25D366'
      : '#A2CB8B'
    : '#E5E7EB';

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Top Accent */}
      <motion.div
        className="h-1 w-14 rounded-full"
        style={{
          background: isWhatsApp
            ? 'linear-gradient(90deg, #25D366, #86EFAC)'
            : 'linear-gradient(90deg, #A2CB8B, #5A8A45)',
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 56, opacity: 1 }}
        transition={{ duration: 0.45 }}
      />

      {/* Back Button */}
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
        whileHover={{ x: -2, color: '#5A8A45' }}
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
      <div>
        <h2
          className="text-[22px] font-bold tracking-tight"
          style={{ color: '#1F2937' }}
        >
          {isWhatsApp ? 'WhatsApp Verification' : 'Enter phone number'}
        </h2>

        <p
          className="mt-1 text-[13px] leading-relaxed"
          style={{ color: '#6B7280' }}
        >
          {isWhatsApp
            ? "We'll send your code on WhatsApp"
            : "We'll send you a 6-digit verification code"}
        </p>
      </div>

      {/* Phone Input */}
      <div className="relative" ref={dropdownRef}>
        <motion.div
          className="flex items-center overflow-hidden"
          style={{
            minHeight: 52,
            borderRadius: 14,
            border: `1.5px solid ${borderColor}`,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: focused
              ? isWhatsApp
                ? '0 0 0 4px rgba(37,211,102,0.08)'
                : '0 0 0 4px rgba(162,203,139,0.12)'
              : '0 2px 10px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
          }}
          animate={
            error
              ? { x: [-5, 5, -4, 4, -2, 2, 0] }
              : {}
          }
          transition={{ duration: 0.35 }}
        >
          {/* Country Selector */}
          <motion.button
            type="button"
            onClick={() => setShowDropdown((s) => !s)}
            className="flex items-center gap-2 px-3 shrink-0"
            style={{
              minHeight: 52,
              borderRight: '1px solid #E5E7EB',
              background: 'transparent',
              cursor: 'pointer',
            }}
            whileHover={{ background: 'rgba(162,203,139,0.06)' }}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: '#1F2937' }}
            >
              {selectedCountry.code}
            </span>
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={{ rotate: showDropdown ? 180 : 0 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </motion.button>

          {/* Phone Input */}
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="5XXXXXXXX"
            autoFocus
            className="flex-1 bg-transparent outline-none px-3"
            style={{
              minHeight: 52,
              fontSize: 15,
              fontWeight: 600,
              color: '#1F2937',
              fontFamily: 'Inter, sans-serif',
            }}
          />

          {/* Success Check */}
          <AnimatePresence>
            {digits.length >= 7 && !error && (
              <motion.div
                className="pr-3"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: isWhatsApp
                      ? 'rgba(37,211,102,0.12)'
                      : 'rgba(162,203,139,0.18)',
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isWhatsApp ? '#16A34A' : '#5A8A45'}
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

        {/* Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden z-50"
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                width: '100%',
                maxHeight: 220,
                overflowY: 'auto',
                boxShadow: '0 16px 35px rgba(0,0,0,0.08)',
              }}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              {COUNTRY_CODES.map((c) => {
                const active = selectedCountry.code === c.code;

                return (
                  <motion.button
                    key={c.code}
                    onClick={() => {
                      setSelectedCountry(c);
                      setShowDropdown(false);
                      inputRef.current?.focus();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                    style={{
                      background: active ? 'rgba(162,203,139,0.12)' : 'transparent',
                      color: active ? '#5A8A45' : '#1F2937',
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    whileHover={{ background: '#F9FAFB' }}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="flex-1">{c.name}</span>
                    <span
                      className="text-xs font-mono"
                      style={{ color: '#9CA3AF' }}
                    >
                      {c.code}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-[12px] font-medium mt-1.5 ml-1"
              style={{ color: '#EF4444' }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Small Info Note */}
      <motion.div
        className="rounded-xl px-3 py-2.5"
        style={{
          background: isWhatsApp
            ? 'rgba(37,211,102,0.06)'
            : 'rgba(162,203,139,0.08)',
          border: `1px solid ${
            isWhatsApp
              ? 'rgba(37,211,102,0.14)'
              : 'rgba(162,203,139,0.18)'
          }`,
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <p
          className="text-[12px] font-medium leading-relaxed"
          style={{ color: isWhatsApp ? '#16A34A' : '#5A8A45' }}
        >
          {isWhatsApp
            ? 'Make sure this number is active on WhatsApp.'
            : 'Standard SMS charges may apply.'}
        </p>
      </motion.div>

      {/* Send Button */}
      <RippleButton
        variant="primary"
        onClick={handleSend}
        loading={loading}
      >
        {loading
          ? 'Sending...'
          : isWhatsApp
          ? 'Send WhatsApp Code'
          : 'Send Verification Code'}
      </RippleButton>
    </motion.div>
  );
}