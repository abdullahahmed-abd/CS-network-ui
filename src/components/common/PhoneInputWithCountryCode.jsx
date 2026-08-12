import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, ChevronDown, Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India', short: 'IN' },
  { code: '+971', flag: '🇦🇪', name: 'UAE', short: 'AE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', short: 'SA' },
  { code: '+1', flag: '🇺🇸', name: 'USA', short: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'UK', short: 'GB' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait', short: 'KW' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar', short: 'QA' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain', short: 'BH' },
  { code: '+968', flag: '🇴🇲', name: 'Oman', short: 'OM' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt', short: 'EG' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan', short: 'JO' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan', short: 'PK' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh', short: 'BD' },
];

export default function PhoneInputWithCountryCode({
  label = 'Phone Number',
  value = '',
  countryCode = '+91',
  onPhoneChange,
  onCodeChange,
  error = '',
  placeholder = 'Enter 10-digit number',
  required = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current?.contains(e.target)) return;
      if (document.getElementById('common-country-portal')?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const update = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const dropH = 280;
      const openUp = vh - rect.bottom < dropH && rect.top > vh - rect.bottom;
      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: 260,
        zIndex: 999999,
        ...(openUp ? { bottom: vh - rect.top + 4 } : { top: rect.bottom + 4 }),
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search) ||
      c.short.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    // Strictly numeric only, max 10 digits
    const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    onPhoneChange(cleaned);
  };

  return (
    <div className={`w-full ${className}`} ref={wrapperRef}>
      {label && (
        <label className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wide">
          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
            <Phone className="h-3 w-3 text-white" />
          </div>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`flex overflow-hidden rounded-xl border-2 transition-all duration-200 ${
          error
            ? 'border-red-400 bg-red-50/20 ring-2 ring-red-100'
            : focused
            ? 'border-green-600 bg-white ring-2 ring-green-100'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        {/* Country Code Selector Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-1.5 border-r border-gray-200 bg-gray-50 px-3 py-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-100"
        >
          <span className="text-sm">{selectedCountry.flag}</span>
          <span>{selectedCountry.code}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* 10-Digit Numeric Phone Input */}
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent px-3 py-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      {error && <p className="mt-1.5 text-xs font-bold text-red-500">{error}</p>}

      {/* Portal Dropdown */}
      {open &&
        createPortal(
          <div id="common-country-portal" style={dropdownStyle}>
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
            >
              <div className="border-b border-gray-100 bg-gray-50 p-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-7 text-xs font-semibold outline-none focus:border-green-500"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto p-1">
                {filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onCodeChange?.(c.code);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      countryCode === c.code ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </div>
                    <span className="font-bold text-gray-500">{c.code}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
}
