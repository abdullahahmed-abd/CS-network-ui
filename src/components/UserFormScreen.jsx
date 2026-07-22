import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2, Phone, MapPin, User, ChevronDown, Loader2, Shield,
  Sparkles, CheckCircle2, AlertCircle, ArrowRight, Globe, Search,
  X, Star, Zap, Award, TrendingUp, Clock, Briefcase, Factory, Layers,
} from 'lucide-react';
import Backgroundimage from '../assets/image/Backgroundimg19.png';
import { authenticatedFetch, removeItem, clearTokens } from '../api/auth';

const BASE_URL = 'https://099e-2409-40c4-5f-5c06-f132-c99e-1b37-e348.ngrok-free.app';

const COUNTRY_CODES = [
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', short: 'SA', maxLen: 9 },
  { code: '+971', flag: '🇦🇪', name: 'UAE',          short: 'AE', maxLen: 9 },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait',       short: 'KW', maxLen: 8 },
  { code: '+974', flag: '🇶🇦', name: 'Qatar',        short: 'QA', maxLen: 8 },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain',      short: 'BH', maxLen: 8 },
  { code: '+968', flag: '🇴🇲', name: 'Oman',         short: 'OM', maxLen: 8 },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt',        short: 'EG', maxLen: 10 },
  { code: '+962', flag: '🇯🇴', name: 'Jordan',       short: 'JO', maxLen: 9 },
  { code: '+1',   flag: '🇺🇸', name: 'USA',          short: 'US', maxLen: 10 },
  { code: '+44',  flag: '🇬🇧', name: 'UK',           short: 'GB', maxLen: 10 },
  { code: '+91',  flag: '🇮🇳', name: 'India',        short: 'IN', maxLen: 10 },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan',     short: 'PK', maxLen: 10 },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh',   short: 'BD', maxLen: 10 },
];

const COUNTRY_TO_CODE_MAP = {
  'India': '+91', 'United Arab Emirates': '+971',
  'Saudi Arabia': '+966', 'Pakistan': '+92',
  'Bangladesh': '+880', 'United States': '+1', 'United Kingdom': '+44',
};

const BUSINESS_SECTOR_OPTIONS = [
  { label: 'Agriculture',             value: 'AGRICULTURE',              icon: '🌾', color: 'from-green-400 to-lime-500' },
  { label: 'Textile',                 value: 'TEXTILE',                  icon: '🧵', color: 'from-pink-400 to-rose-500' },
  { label: 'Electronics',             value: 'ELECTRONICS',              icon: '💻', color: 'from-blue-400 to-cyan-500' },
  { label: 'Manufacturing',           value: 'MANUFACTURING',            icon: '🏭', color: 'from-gray-400 to-slate-500' },
  { label: 'Food & Beverage',         value: 'FOOD_AND_BEVERAGE',        icon: '🍽️', color: 'from-orange-400 to-amber-500' },
  { label: 'Construction',            value: 'CONSTRUCTION',             icon: '🏗️', color: 'from-yellow-400 to-orange-500' },
  { label: 'Automotive',              value: 'AUTOMOTIVE',               icon: '🚗', color: 'from-red-400 to-rose-500' },
  { label: 'Chemicals',               value: 'CHEMICALS',                icon: '⚗️', color: 'from-purple-400 to-violet-500' },
  { label: 'Pharmaceuticals',         value: 'PHARMACEUTICALS',          icon: '💊', color: 'from-teal-400 to-emerald-500' },
  { label: 'IT & Software',           value: 'IT_AND_SOFTWARE',          icon: '💾', color: 'from-indigo-400 to-blue-500' },
  { label: 'Real Estate',             value: 'REAL_ESTATE',              icon: '🏘️', color: 'from-emerald-400 to-green-500' },
  { label: 'Logistics & Transportation', value: 'LOGISTICS_AND_TRANSPORTATION', icon: '🚛', color: 'from-blue-400 to-indigo-500' },
  { label: 'Retail',                  value: 'RETAIL',                   icon: '🛒', color: 'from-pink-400 to-fuchsia-500' },
  { label: 'Handicrafts',             value: 'HANDICRAFTS',              icon: '🎨', color: 'from-amber-400 to-yellow-500' },
  { label: 'Energy',                  value: 'ENERGY',                   icon: '⚡', color: 'from-yellow-400 to-lime-500' },
  { label: 'Mining',                  value: 'MINING',                   icon: '⛏️', color: 'from-stone-400 to-gray-500' },
  { label: 'Other',                   value: 'OTHER',                    icon: '🔧', color: 'from-gray-400 to-slate-500' },
];

const BUSINESS_AGE_OPTIONS = [
  { label: 'Less than 1 year',   value: 'LESS_THAN_ONE_YEAR',    icon: '🌱' },
  { label: '1 to 3 years',       value: 'ONE_TO_THREE_YEARS',    icon: '🌿' },
  { label: '3 to 5 years',       value: 'THREE_TO_FIVE_YEARS',   icon: '🌳' },
  { label: 'More than 5 years',  value: 'MORE_THAN_FIVE_YEARS',  icon: '🏆' },
];

const POSITION_OPTIONS = [
  { label: 'Freelancer', value: 'FREELANCER', icon: '💼' },
  { label: 'Owner',      value: 'OWNER',      icon: '👑' },
  { label: 'Manager',    value: 'MANAGER',    icon: '📊' },
  { label: 'Employee',   value: 'EMPLOYEE',   icon: '👤' },
];

const CONTACT_METHOD_OPTIONS = [
  { label: 'WhatsApp', value: 'WHATSAPP', icon: '💬' },
  { label: 'Call',     value: 'CALL',     icon: '📞' },
  { label: 'Email',    value: 'EMAIL',    icon: '📧' },
];

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en', flag: '🇬🇧' },
  { label: 'Arabic',  value: 'ar', flag: '🇸🇦' },
  { label: 'Hindi',   value: 'hi', flag: '🇮🇳' },
  { label: 'Urdu',    value: 'ur', flag: '🇵🇰' },
];

// ✅ Event Interest Options (matches backend enum)
const EVENT_INTEREST_OPTIONS = [
  { label: 'Networking',       value: 'NETWORKING',      icon: '🤝', desc: 'Connect with professionals' },
  { label: 'Business Growth',  value: 'BUSINESS_GROWTH', icon: '📈', desc: 'Expand your business' },
  { label: 'Online Event',     value: 'ONLINE_EVENT',    icon: '💻', desc: 'Virtual events & webinars' },
  { label: 'In-Person Event',  value: 'IN_PERSON_EVENT', icon: '🏢', desc: 'Physical meetups' },
  { label: 'In Country',       value: 'IN_COUNTRY',      icon: '🌍', desc: 'Local country events' },
  { label: 'Overseas',         value: 'OVERSEAS',         icon: '✈️', desc: 'International events' },
];

const ROLE_OPTIONS = [
  { label: 'Buyer',            value: 'BUYER',            icon: '🛒', desc: 'Purchase products & services',   color: 'from-blue-500 via-indigo-500 to-purple-600' },
  { label: 'Seller',           value: 'SELLER',           icon: '🏪', desc: 'Sell your products & services',  color: 'from-emerald-500 via-green-500 to-teal-600' },
  { label: 'Business Partner', value: 'BUSINESS_PARTNER', icon: '🤝', desc: 'Partner with businesses',        color: 'from-amber-500 via-orange-500 to-red-600' },
];

const LOCATION_DATA = {
  India: {
    'Madhya Pradesh': ['Bhopal','Indore','Gwalior','Jabalpur','Ujjain'],
    Maharashtra:      ['Mumbai','Pune','Nagpur','Nashik','Aurangabad'],
    Bihar:            ['Patna','Gaya','Muzaffarpur','Bhagalpur','Darbhanga'],
    'Uttar Pradesh':  ['Lucknow','Kanpur','Varanasi','Agra','Noida'],
    Karnataka:        ['Bangalore','Mysore','Hubli','Mangalore','Belgaum'],
    Gujarat:          ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar'],
    Rajasthan:        ['Jaipur','Jodhpur','Udaipur','Kota','Ajmer'],
    'Tamil Nadu':     ['Chennai','Coimbatore','Madurai','Salem','Trichy'],
    'West Bengal':    ['Kolkata','Howrah','Durgapur','Siliguri','Asansol'],
    Delhi:            ['New Delhi','Dwarka','Rohini','Saket','Karol Bagh'],
    Telangana:        ['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam'],
    Kerala:           ['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam'],
    Punjab:           ['Chandigarh','Ludhiana','Amritsar','Jalandhar','Patiala'],
    Haryana:          ['Gurugram','Faridabad','Panipat','Ambala','Karnal'],
  },
  'United Arab Emirates': {
    Dubai:       ['Dubai City','Deira','Jumeirah','Marina','Silicon Oasis'],
    'Abu Dhabi': ['Abu Dhabi City','Al Ain','Khalifa City','Yas Island','Saadiyat'],
    Sharjah:     ['Sharjah City','Al Nahda','Al Majaz','Al Qasimia','Muwaileh'],
    Ajman:       ['Ajman City','Al Nuaimiya','Al Rashidiya','Al Jurf','Al Hamidiya'],
  },
  'Saudi Arabia': {
    Riyadh:             ['Riyadh City','Al Olaya','Al Malaz','Al Muruj','Al Rawdah'],
    Makkah:             ['Mecca','Jeddah','Taif','Rabigh','Al Qunfudhah'],
    'Eastern Province': ['Dammam','Dhahran','Al Khobar','Jubail','Qatif'],
  },
  Pakistan: {
    Punjab:                  ['Lahore','Faisalabad','Rawalpindi','Multan','Gujranwala'],
    Sindh:                   ['Karachi','Hyderabad','Sukkur','Larkana','Nawabshah'],
    'Khyber Pakhtunkhwa':    ['Peshawar','Mardan','Abbottabad','Swat','Kohat'],
    Balochistan:             ['Quetta','Gwadar','Turbat','Khuzdar','Hub'],
  },
  Bangladesh: {
    Dhaka:      ['Dhaka City','Gazipur','Narayanganj','Tangail','Manikganj'],
    Chittagong: ['Chittagong City','Comilla','Noakhali','Feni','Chandpur'],
    Rajshahi:   ['Rajshahi City','Bogra','Pabna','Sirajganj','Natore'],
  },
  'United States': {
    California: ['Los Angeles','San Francisco','San Diego','San Jose','Sacramento'],
    Texas:      ['Houston','Dallas','Austin','San Antonio','Fort Worth'],
    'New York': ['New York City','Buffalo','Rochester','Albany','Syracuse'],
    Florida:    ['Miami','Orlando','Tampa','Jacksonville','Fort Lauderdale'],
  },
  'United Kingdom': {
    England:  ['London','Manchester','Birmingham','Liverpool','Leeds'],
    Scotland: ['Edinburgh','Glasgow','Aberdeen','Dundee','Inverness'],
    Wales:    ['Cardiff','Swansea','Newport','Bangor','Wrexham'],
  },
};

const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const getPlanId = (roles) => {
  if (roles.includes('BUSINESS_PARTNER')) return null;
  if (roles.includes('BUYER') && roles.includes('SELLER')) return 3;
  if (roles.includes('SELLER')) return 2;
  if (roles.includes('BUYER')) return 1;
  return null;
};

// ══════════════════════════════════════════════════════════
// COUNTRY CODE SELECTOR
// ══════════════════════════════════════════════════════════
function CountryCodeSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const buttonRef  = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const selected = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[10];

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current?.contains(e.target)) return;
      if (document.getElementById('country-code-portal')?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom;
    const openUp = spaceBelow < 320 && rect.top > spaceBelow;
    setDropdownStyle({
      position: 'fixed', left: rect.left,
      width: Math.max(rect.width, 260), zIndex: 999999,
      ...(openUp ? { bottom: vh - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
  }, [open]);

  const filtered = COUNTRY_CODES.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef} type="button"
        onClick={() => { setOpen((p) => !p); if (open) setSearch(''); }}
        className={`flex h-full items-center gap-1.5 rounded-l-2xl border-2 border-r-0 bg-white/80 px-3 py-4 text-sm font-bold transition-all duration-200 ${
          open ? 'border-green-400 bg-white ring-4 ring-green-100' : 'border-gray-200/60 hover:border-green-300'
        }`}
      >
        <span className="text-base">{selected?.flag}</span>
        <span className="text-gray-700">{selected?.code}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </motion.div>
      </button>

      {open && createPortal(
        <div id="country-code-portal" style={dropdownStyle}>
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-2xl"
          >
            <div className="border-b border-gray-100 bg-gray-50 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input autoFocus type="text" placeholder="Search country..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-2 pl-10 pr-8 text-sm font-semibold outline-none focus:border-green-400"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
              {filtered.map((c) => (
                <button key={c.code} type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all hover:bg-gray-50 ${
                    value === c.code ? 'bg-green-50 text-green-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="flex-1 font-semibold">{c.name}</span>
                  <span className="font-bold text-gray-500">{c.code}</span>
                  {value === c.code && <CheckCircle2 className="h-4 w-4 text-green-600" />}
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

// ══════════════════════════════════════════════════════════
// PHONE INPUT
// ══════════════════════════════════════════════════════════
function PhoneInputWithCode({ value, countryCode, onPhoneChange, onCodeChange, error }) {
  const [focused, setFocused] = useState(false);
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);
  const maxLen = selectedCountry?.maxLen || 15;

  return (
    <div>
      <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-500">
          <Phone className="h-3 w-3 text-white" />
        </div>
        Alternate Phone Number
      </label>
      <div className={`flex overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
        error ? 'ring-4 ring-red-100' : focused ? 'ring-4 ring-green-100' : ''
      }`}>
        <CountryCodeSelector value={countryCode} onChange={onCodeChange} />
        <input
          type="tel" inputMode="numeric" placeholder={`Enter ${maxLen}-digit number`}
          value={value} maxLength={maxLen}
          onChange={(e) => onPhoneChange(e.target.value.replace(/[^0-9]/g, ''))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 rounded-r-2xl border-2 border-l-0 bg-white/80 px-4 py-4 text-sm font-semibold text-gray-900 outline-none transition-all duration-300 placeholder:font-medium placeholder:text-gray-400 ${
            error ? 'border-red-300' : focused ? 'border-green-400 bg-white' : 'border-gray-200/60 hover:border-green-300'
          }`}
        />
      </div>
      {value && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 text-xs font-semibold text-gray-500"
        >
          <span>Full number:</span>
          <span className="font-black text-green-700">{countryCode} {value}</span>
        </motion.p>
      )}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 text-xs font-bold text-red-500"
        >
          <AlertCircle className="h-4 w-4" /> {error}
        </motion.p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PORTAL DROPDOWN
// ══════════════════════════════════════════════════════════
function PortalDropdown({ anchorRef, open, children }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const dropH = 380;
      const dropW = rect.width;
      const openUp = (vh - rect.bottom) < dropH && rect.top > (vh - rect.bottom);
      let left = rect.left;
      if (left + dropW > vw) left = vw - dropW - 8;
      if (left < 8) left = 8;
      setStyle({
        position: 'fixed', left, width: rect.width, zIndex: 999999,
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
  }, [open, anchorRef]);

  if (!open) return null;
  return createPortal(<div style={style}>{children}</div>, document.body);
}

// ══════════════════════════════════════════════════════════
// BUSINESS SECTOR DROPDOWN
// ══════════════════════════════════════════════════════════
function BusinessSectorDropdown({ value, onSelect, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const buttonRef  = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current?.contains(e.target)) return;
      if (document.getElementById('sector-portal-content')?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedOption = BUSINESS_SECTOR_OPTIONS.find((o) => o.value === value);
  const filtered = BUSINESS_SECTOR_OPTIONS.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef}>
      <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-pink-500">
          <Factory className="h-3 w-3 text-white" />
        </div>
        Business Sector
      </label>
      <motion.button ref={buttonRef} type="button"
        onClick={() => { setOpen((p) => !p); if (open) setSearch(''); }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        className={`relative flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-sm font-semibold shadow-lg backdrop-blur-xl transition-all duration-300 ${
          error ? 'border-2 border-red-300 bg-white/90 ring-4 ring-red-100'
          : open ? 'border-2 border-green-400 bg-white ring-4 ring-green-100'
          : 'border-2 border-gray-200/60 bg-white/80 hover:border-green-300'
        }`}
      >
        {selectedOption ? (
          <div className="flex items-center gap-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${selectedOption.color} text-base shadow-md`}>
              {selectedOption.icon}
            </span>
            <span className="font-bold text-gray-800">{selectedOption.label}</span>
          </div>
        ) : (
          <span className="font-medium text-gray-400">Select your business sector</span>
        )}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className={`ml-2 h-5 w-5 shrink-0 ${open ? 'text-green-600' : 'text-gray-400'}`} />
        </motion.div>
      </motion.button>

      <PortalDropdown anchorRef={buttonRef} open={open}>
        <div id="sector-portal-content">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="overflow-hidden rounded-2xl border-2 border-gray-200/60 bg-white shadow-2xl"
                style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
              >
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-purple-50/40 p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search sector..." value={search}
                      onChange={(e) => setSearch(e.target.value)} autoFocus
                      className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm font-semibold outline-none focus:border-green-400"
                    />
                    {search && (
                      <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto p-3" style={{ maxHeight: 280 }}>
                  {filtered.length === 0 ? (
                    <p className="py-8 text-center text-sm font-semibold text-gray-400">No sectors found</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {filtered.map((opt) => {
                        const sel = value === opt.value;
                        return (
                          <motion.button key={opt.value} type="button"
                            whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { onSelect(opt.value); setOpen(false); setSearch(''); }}
                            className={`group relative flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all duration-200 ${
                              sel ? 'bg-gradient-to-br from-green-50 to-emerald-50 ring-2 ring-green-400' : 'bg-gray-50 hover:bg-white hover:shadow-md'
                            }`}
                          >
                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${opt.color} text-xl shadow-md`}>
                              {opt.icon}
                            </span>
                            <span className={`text-[11px] font-bold leading-tight ${sel ? 'text-green-700' : 'text-gray-700'}`}>
                              {opt.label}
                            </span>
                            {sel && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500"
                              >
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PortalDropdown>

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 text-xs font-bold text-red-500"
        >
          <AlertCircle className="h-4 w-4" /> {error}
        </motion.p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SEARCHABLE DROPDOWN
// ══════════════════════════════════════════════════════════
function SearchableDropdown({
  label, placeholder, value, displayValue, options, onSelect,
  error, disabled, renderItem, emptyText = 'No options available',
  loading: externalLoading, onOpen, icon: Icon, dropdownId,
}) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef          = useRef(null);
  const buttonRef           = useRef(null);
  const portalId = dropdownId || `dropdown-portal-${label}`;

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current?.contains(e.target)) return;
      if (document.getElementById(portalId)?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [portalId]);

  const filtered = options.filter((opt) => {
    const text = typeof opt === 'string' ? opt : opt.label || opt.name || '';
    return text.toLowerCase().includes(search.toLowerCase());
  });

  const handleOpen = () => {
    if (disabled) return;
    const next = !open;
    setOpen(next);
    if (!next) setSearch('');
    if (next && onOpen) onOpen();
  };

  return (
    <div ref={wrapperRef}>
      {label && (
        <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
          {Icon && (
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-500">
              <Icon className="h-3 w-3 text-white" />
            </div>
          )}
          {label}
        </label>
      )}
      <motion.button ref={buttonRef} type="button" disabled={disabled} onClick={handleOpen}
        whileHover={{ scale: disabled ? 1 : 1.01 }} whileTap={{ scale: disabled ? 1 : 0.99 }}
        className={`relative flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-sm font-semibold shadow-lg backdrop-blur-xl transition-all duration-300 ${
          disabled ? 'cursor-not-allowed border-2 border-gray-200 bg-white/40 text-gray-400'
          : error  ? 'border-2 border-red-300 bg-white/90 text-gray-900 ring-4 ring-red-100'
          : open   ? 'border-2 border-green-400 bg-white ring-4 ring-green-100'
          : 'border-2 border-gray-200/60 bg-white/80 text-gray-800 hover:border-green-300'
        }`}
      >
        <span className="truncate">
          {displayValue || value || <span className="font-medium text-gray-400">{placeholder}</span>}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className={`ml-2 h-5 w-5 shrink-0 ${open ? 'text-green-600' : 'text-gray-400'}`} />
        </motion.div>
      </motion.button>

      <PortalDropdown anchorRef={buttonRef} open={open && !disabled}>
        <div id={portalId}>
          <AnimatePresence>
            {open && !disabled && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="overflow-hidden rounded-2xl border-2 border-gray-200/60 bg-white"
                style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
              >
                {options.length > 4 && (
                  <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-green-50/30 p-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Type to search..." value={search}
                        onChange={(e) => setSearch(e.target.value)} autoFocus
                        className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm font-semibold outline-none focus:border-green-400"
                      />
                      {search && (
                        <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
                  {externalLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10">
                      <Loader2 className="h-7 w-7 animate-spin text-green-600" />
                      <span className="text-sm font-semibold text-gray-500">Loading…</span>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-10 text-center">
                      <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                      <p className="text-sm font-semibold text-gray-400">{emptyText}</p>
                    </div>
                  ) : (
                    filtered.map((opt, i) => {
                      const optVal   = typeof opt === 'string' ? opt : opt.value ?? opt.id;
                      const optLabel = typeof opt === 'string' ? opt : opt.label ?? opt.name;
                      const sel = typeof value === 'string'
                        ? value === String(optVal) || value === optLabel
                        : value?.id === opt?.id;

                      if (renderItem) {
                        return (
                          <div key={`${optVal}-${i}`}>
                            {renderItem(opt, sel, () => { onSelect(opt); setOpen(false); setSearch(''); })}
                          </div>
                        );
                      }
                      return (
                        <button key={`${optVal}-${i}`} type="button"
                          onClick={() => { onSelect(opt); setOpen(false); setSearch(''); }}
                          className={`flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm font-semibold transition-all ${
                            sel ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex-1">{optLabel}</span>
                          {sel && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PortalDropdown>

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 text-xs font-bold text-red-500"
        >
          <AlertCircle className="h-4 w-4" /> {error}
        </motion.p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// LOCATION ROW
// ══════════════════════════════════════════════════════════
function LocationRow({ form, errors, updateField, availableStates, availableCities }) {
  const countries = Object.keys(LOCATION_DATA);
  return (
    <div className="rounded-2xl border-2 border-gray-100/80 bg-gradient-to-br from-gray-50/60 to-green-50/30 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-red-500 shadow-md">
          <Globe className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-black uppercase tracking-wider text-gray-700">Location Details</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <SearchableDropdown
          label="Country" placeholder="Select country"
          value={form.country} options={countries}
          onSelect={(v) => updateField('country', v)}
          error={errors.country} icon={Globe} dropdownId="country-dd"
        />
        <SearchableDropdown
          label="State / Province" placeholder={form.country ? 'Select state (optional)' : '—'}
          value={form.state} options={availableStates}
          onSelect={(v) => updateField('state', v)}
          error={errors.state} disabled={!form.country} icon={MapPin} dropdownId="state-dd"
        />
        <SearchableDropdown
          label="City" placeholder={form.state ? 'Select city (optional)' : '—'}
          value={form.city} options={availableCities}
          onSelect={(v) => updateField('city', v)}
          error={errors.city} disabled={!form.state} icon={MapPin} dropdownId="city-dd"
        />
      </div>

      {(form.country || form.state || form.city) && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-100 bg-white/70 px-4 py-2.5"
        >
          <MapPin className="h-4 w-4 shrink-0 text-green-600" />
          {form.country && <span className="rounded-lg bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{form.country}</span>}
          {form.state  && <><ChevronDown className="h-3 w-3 -rotate-90 text-gray-400" /><span className="rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{form.state}</span></>}
          {form.city   && <><ChevronDown className="h-3 w-3 -rotate-90 text-gray-400" /><span className="rounded-lg bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">{form.city}</span></>}
        </motion.div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// FLOATING INPUT
// ══════════════════════════════════════════════════════════
function FloatingInput({ label, error, icon: Icon, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
          {Icon && (
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-500">
              <Icon className="h-3 w-3 text-white" />
            </div>
          )}
          {label}
        </label>
      )}
      <input {...props}
        onFocus={(e) => { setFocused(true);  props.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e);  }}
        className={`w-full rounded-2xl border-2 bg-white/80 px-5 py-4 text-sm font-semibold text-gray-900 shadow-lg outline-none transition-all duration-300 placeholder:font-medium placeholder:text-gray-400 ${
          error   ? 'border-red-300 ring-4 ring-red-100'
          : focused ? 'border-green-400 bg-white ring-4 ring-green-100'
          : 'border-gray-200/60 hover:border-green-300'
        }`}
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 text-xs font-bold text-red-500"
        >
          <AlertCircle className="h-4 w-4" /> {error}
        </motion.p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ENHANCED SELECT
// ══════════════════════════════════════════════════════════
function EnhancedSelect({ label, options, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="mb-3 block text-sm font-bold text-gray-800">{label}</label>
      <div className="relative">
        <select {...props}
          onFocus={(e) => { setFocused(true);  props.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); props.onBlur?.(e);  }}
          className={`w-full appearance-none rounded-2xl border-2 bg-white/80 px-5 py-4 pr-12 text-sm font-semibold text-gray-900 shadow-lg outline-none transition-all duration-300 ${
            error   ? 'border-red-300 ring-4 ring-red-100'
            : focused ? 'border-green-400 bg-white ring-4 ring-green-100'
            : 'border-gray-200/60 hover:border-green-300'
          }`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.icon ? `${o.icon} ${o.label}` : o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <ChevronDown className={`h-5 w-5 transition-all duration-300 ${focused ? 'rotate-180 text-green-600' : 'text-gray-400'}`} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SUMMARY CARD
// ══════════════════════════════════════════════════════════
function SummaryCard({ label, value, icon }) {
  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-xl border-2 border-gray-200/60 bg-white/80 p-3 shadow-md transition-all hover:border-green-300"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
      </div>
      <p className="truncate text-sm font-black text-gray-800">{value || '-'}</p>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function UserFormScreen({
  phone,
  countryCode,
  onComplete,
  onSessionExpired,
  inviteData = null,   // ✅ NEW: inviteData from invite link
}) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [form, setForm] = useState({
    fullName: '',
    alternatePhoneNumber: '',
    alternatePhoneCountryCode: '+91',
    preferredContactMethod: 'WHATSAPP',
    companyName: '',
    businessAge: 'ONE_TO_THREE_YEARS',
    businessSector: '',
    otherBusinessSector: '',
    position: 'OWNER',
    country: '',
    state: '',
    city: '',
    languagePreference: 'en',
    roles: [],
    franchiseId: '',
    eventInterests: [],   // ✅ NEW
  });

  const [errors, setErrors]                 = useState({});
  const [loading, setLoading]               = useState(false);
  const [submitError, setSubmitError]       = useState('');
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [franchises, setFranchises]         = useState([]);
  const [franchiseLoading, setFranchiseLoading] = useState(false);
  const [franchiseError, setFranchiseError] = useState('');
  const [franchiseFetched, setFranchiseFetched] = useState(false);

  // ✅ Pre-fill from inviteData (no API call needed)
  useEffect(() => {
    if (!inviteData) return;
    console.log('📨 InviteData in UserForm:', inviteData);

    setForm((prev) => ({
      ...prev,
      // Pre-fill country from invite if available
      ...(inviteData.country && { country: inviteData.country }),
      // DO NOT set franchiseId — backend handles it via invite token
    }));
  }, [inviteData]);

  // Auto-set country code from location country
  useEffect(() => {
    if (form.country && COUNTRY_TO_CODE_MAP[form.country]) {
      setForm((p) => ({ ...p, alternatePhoneCountryCode: COUNTRY_TO_CODE_MAP[form.country] }));
    }
  }, [form.country]);

  // Cascading location
  useEffect(() => {
    if (form.country && LOCATION_DATA[form.country]) {
      setAvailableStates(Object.keys(LOCATION_DATA[form.country]));
    } else {
      setAvailableStates([]);
    }
    setAvailableCities([]);
    setForm((p) => ({ ...p, state: '', city: '', franchiseId: '' }));
    setFranchises([]);
    setFranchiseFetched(false);
  }, [form.country]);

  useEffect(() => {
    if (form.country && form.state && LOCATION_DATA[form.country]?.[form.state]) {
      setAvailableCities(LOCATION_DATA[form.country][form.state]);
    } else {
      setAvailableCities([]);
    }
    setForm((p) => ({ ...p, city: '', franchiseId: '' }));
    setFranchises([]);
    setFranchiseFetched(false);
  }, [form.state]);

  useEffect(() => {
    setForm((p) => ({ ...p, franchiseId: '' }));
    setFranchises([]);
    setFranchiseFetched(false);
  }, [form.city]);

  // Fetch franchises
  const fetchFranchises = useCallback(async () => {
    if (!form.country) { setFranchiseError('Select a country first'); return; }
    setFranchiseLoading(true);
    setFranchiseError('');
    setFranchises([]);
    setFranchiseFetched(false);
    try {
      const payload = {
        requestType: 'FETCH_FRANCHISES_BY_COUNTRY',
        country: capitalizeFirstLetter(form.country),
        ...(form.state && { state: capitalizeFirstLetter(form.state) }),
        ...(form.city  && { city: capitalizeFirstLetter(form.city) }),
      };
      const res = await fetch(`${BASE_URL}/cs-network/auth-operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.franchises?.length > 0) {
        setFranchises(data.franchises);
      } else {
        setFranchiseError('No franchises found for this location');
      }
      setFranchiseFetched(true);
    } catch {
      setFranchiseError('Failed to load franchises');
      setFranchiseFetched(true);
    } finally {
      setFranchiseLoading(false);
    }
  }, [form.country, form.state, form.city]);

  const updateField = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: '' }));
    setSubmitError('');
  };

  const toggleRole = (role) => {
    setForm((prev) => {
      let roles;
      if (role === 'BUSINESS_PARTNER') {
        roles = prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : ['BUSINESS_PARTNER'];
      } else {
        const exists = prev.roles.includes(role);
        roles = exists
          ? prev.roles.filter((r) => r !== role)
          : [...prev.roles.filter((r) => r !== 'BUSINESS_PARTNER'), role];
      }
      return { ...prev, roles };
    });
    setErrors((p) => ({ ...p, roles: '' }));
  };

  // ✅ Toggle event interest
  const toggleEventInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      eventInterests: prev.eventInterests.includes(interest)
        ? prev.eventInterests.filter((i) => i !== interest)
        : [...prev.eventInterests, interest],
    }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.fullName.trim())    e.fullName    = 'Full name is required';
      if (!form.companyName.trim()) e.companyName = 'Company name is required';
      if (!form.businessSector)    e.businessSector = 'Select your business sector';
      if (form.businessSector === 'OTHER' && !form.otherBusinessSector.trim())
        e.otherBusinessSector = 'Please describe your business sector';
    }
    if (s === 2) {
      const clean = form.alternatePhoneNumber.replace(/\s+/g, '');
      if (!clean) e.alternatePhoneNumber = 'Phone number is required';
      else if (!/^\d{7,15}$/.test(clean)) e.alternatePhoneNumber = 'Enter 7–15 digits only';
    }
    if (s === 3) {
      if (!form.country) e.country = 'Select a country';
      // ✅ franchiseId required ONLY if NOT coming via invite link
      if (!inviteData && !form.franchiseId) e.franchiseId = 'Select a franchise';
    }
    if (s === 4) {
      if (!form.roles.length) e.roles = 'Select at least one role';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, totalSteps)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setLoading(true);
    setSubmitError('');
    try {
      const isBusinessPartner = form.roles.includes('BUSINESS_PARTNER');
      const planId = isBusinessPartner ? null : getPlanId(form.roles);

      const payload = {
        memberRequestType: 'SUBMIT_PERSONAL_FORM',
        fullName: form.fullName.trim(),
        companyName: form.companyName.trim(),
        alternatePhoneNumber: `${form.alternatePhoneCountryCode}${form.alternatePhoneNumber.replace(/\s+/g, '')}`,
        preferredContactMethod: form.preferredContactMethod,
        position: form.position,
        businessAge: form.businessAge,
        businessSector: form.businessSector,
        ...(form.businessSector === 'OTHER' && { otherBusinessSector: form.otherBusinessSector.trim() }),
        country: capitalizeFirstLetter(form.country),
        ...(form.state && { state: capitalizeFirstLetter(form.state) }),
        ...(form.city  && { city:  capitalizeFirstLetter(form.city) }),
        languagePreference: form.languagePreference,
        roles: form.roles,
        eventInterests: form.eventInterests,  // ✅ NEW

        // ✅ franchiseId logic:
        // - Via invite link → null (backend uses invite token)
        // - Direct signup → selected franchiseId
        ...(inviteData
          ? { franchiseId: null }
          : form.franchiseId
          ? { franchiseId: Number(form.franchiseId) }
          : { franchiseId: null }
        ),

        ...(!isBusinessPartner && planId !== null && { planId }),
      };

      console.log('📤 Submitting form payload:', payload);

      const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      removeItem('formFilled');
      removeItem('phoneVerified');
      onComplete?.({ roles: form.roles, data });

    } catch (error) {
      if (error.message?.includes('Session expired')) {
        clearTokens();
        setSubmitError('Session expired. Redirecting…');
        setTimeout(() => onSessionExpired?.(), 2000);
        return;
      }
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedFranchise = () =>
    franchises.find((f) => String(f.id) === String(form.franchiseId));

  const progress = (step / totalSteps) * 100;

  return (
    <>
      <style>{`
        html, body { height: 100%; margin: 0; padding: 0; }
        .form-scroll::-webkit-scrollbar { width: 6px; }
        .form-scroll::-webkit-scrollbar-track { background: transparent; }
        .form-scroll::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 3px; }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse-glow { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .animate-shimmer { background-size:200% 100%; animation:shimmer 3s linear infinite }
        .animate-pulse-glow { animation:pulse-glow 2s ease-in-out infinite }
      `}</style>

      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        <img src={Backgroundimage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-green-50/60 to-emerald-100/70 backdrop-blur-sm" />
      </div>

      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        <motion.div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-green-300/30 via-emerald-400/20 to-teal-300/10 blur-3xl"
          animate={{ scale: [1,1.2,1], rotate: [0,90,0], x: [0,50,0], y: [0,30,0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-300/25 via-green-400/15 to-teal-300/10 blur-3xl"
          animate={{ scale: [1.2,1,1.2], rotate: [90,0,90], x: [0,-50,0], y: [0,50,0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="form-scroll relative"
        style={{ position: 'fixed', inset: 0, zIndex: 10, overflowY: 'auto', overflowX: 'hidden' }}
      >
        <div className="mx-auto max-w-3xl px-4 py-8 pb-24 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} className="mb-10 text-center"
          >
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-green-200/60 bg-white/80 px-5 py-2.5 shadow-xl backdrop-blur-xl"
            >
              <motion.div animate={{ rotate: [0,360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="h-4 w-4 text-green-600" />
              </motion.div>
              <span className="text-sm font-bold text-green-700">Step {step} of {totalSteps}</span>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-glow" />
            </motion.div>
            <h1 className="mb-3 bg-gradient-to-r from-gray-900 via-green-800 to-emerald-900 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
              Complete Your Profile
            </h1>
            <p className="mx-auto max-w-md text-base font-medium text-gray-600">
              Just a few steps to unlock your business potential
            </p>
          </motion.div>

          {/* Progress Stepper */}
          <motion.div initial={{ opacity: 0, scaleX: 0.8 }} animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }} className="mb-10"
          >
            <div className="relative mb-4 flex items-center justify-between">
              <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2">
                <div className="h-full w-full rounded-full bg-gray-200" />
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600"
                  initial={{ width: '0%' }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              {[
                { num: 1, label: 'Business', icon: Building2 },
                { num: 2, label: 'Contact',  icon: Phone },
                { num: 3, label: 'Location', icon: MapPin },
                { num: 4, label: 'Role',     icon: Award },
              ].map((s) => (
                <motion.button key={s.num} type="button"
                  onClick={() => { if (s.num < step) setStep(s.num); }}
                  whileHover={{ scale: s.num < step ? 1.1 : 1 }}
                  className={`group relative z-10 flex flex-col items-center gap-2 ${s.num < step ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl font-bold shadow-xl transition-all duration-500 ${
                    s.num < step ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                    : s.num === step ? 'scale-110 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white ring-4 ring-green-200'
                    : 'bg-white/80 text-gray-400'
                  }`}>
                    {s.num < step ? (
                      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500 }}>
                        <CheckCircle2 className="h-7 w-7" />
                      </motion.div>
                    ) : (
                      <s.icon className="h-6 w-6" />
                    )}
                    {s.num === step && (
                      <motion.div className="absolute inset-0 rounded-2xl bg-green-400"
                        animate={{ scale: [1,1.2,1], opacity: [0.4,0,0.4] }} transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <span className={`text-xs font-bold ${s.num <= step ? 'text-gray-800' : 'text-gray-400'}`}>{s.label}</span>
                </motion.button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-500">Progress</span>
              <span className="text-green-600">{Math.round(progress)}% Complete</span>
            </div>
          </motion.div>

          {/* ✅ Invite Banner */}
          {inviteData && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-2xl shadow-md">
                  📨
                </div>
                <div>
                  <p className="text-sm font-black text-green-800">
                    Invited to {inviteData.franchiseName || 'Connect Souq'}
                    {inviteData.country && ` — ${inviteData.country}`}
                  </p>
                  <p className="text-xs font-medium text-green-600 mt-0.5">
                    {inviteData.message || 'Complete your registration to join the franchise'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Phone Verified Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mb-10 overflow-hidden rounded-3xl border-2 border-green-200/60 bg-gradient-to-r from-white/80 via-green-50/50 to-emerald-50/40 p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="relative flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-base font-black text-gray-900">Phone Verified</p>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-gray-600">{countryCode} {phone}</p>
              </div>
              <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-1.5 text-xs font-black text-white shadow-lg">
                ✓ ACTIVE
              </span>
            </div>
          </motion.div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">

              {/* ══ STEP 1: Business ══ */}
              {step === 1 && (
                <motion.div key="step1"
                  initial={{ opacity: 0, x: 60, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -60, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative rounded-3xl border-2 border-gray-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
                    <div className="relative mb-8 flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl">
                        <Building2 className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Business Information</h2>
                        <p className="text-sm font-medium text-gray-500">Tell us about your business</p>
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="mb-6 rounded-2xl border-2 border-gray-100/80 bg-gradient-to-br from-gray-50/60 to-green-50/20 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 shadow-md">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-wider text-gray-700">Personal Details</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FloatingInput label="Full Name" placeholder="e.g. Ravi Kumar Sharma"
                          value={form.fullName} error={errors.fullName}
                          onChange={(e) => updateField('fullName', e.target.value)} icon={User}
                        />
                        <FloatingInput label="Company Name" placeholder="e.g. Sharma Trading Co."
                          value={form.companyName} error={errors.companyName}
                          onChange={(e) => updateField('companyName', e.target.value)} icon={Building2}
                        />
                      </div>
                    </div>

                    {/* Business Profile */}
                    <div className="mb-6 rounded-2xl border-2 border-gray-100/80 bg-gradient-to-br from-gray-50/60 to-blue-50/20 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md">
                          <Briefcase className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-wider text-gray-700">Business Profile</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <EnhancedSelect label="Your Position" value={form.position}
                          onChange={(e) => updateField('position', e.target.value)} options={POSITION_OPTIONS}
                        />
                        <EnhancedSelect label="Business Age" value={form.businessAge}
                          onChange={(e) => updateField('businessAge', e.target.value)} options={BUSINESS_AGE_OPTIONS}
                        />
                      </div>
                    </div>

                    {/* Sector */}
                    <div className="rounded-2xl border-2 border-gray-100/80 bg-gradient-to-br from-gray-50/60 to-purple-50/20 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 shadow-md">
                          <Layers className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-wider text-gray-700">Industry Sector</span>
                      </div>
                      <BusinessSectorDropdown value={form.businessSector}
                        onSelect={(v) => { updateField('businessSector', v); if (v !== 'OTHER') updateField('otherBusinessSector', ''); }}
                        error={errors.businessSector}
                      />
                      <AnimatePresence>
                        {form.businessSector === 'OTHER' && (
                          <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <FloatingInput label="" placeholder="e.g. Handloom Weaving…"
                              value={form.otherBusinessSector} error={errors.otherBusinessSector}
                              onChange={(e) => updateField('otherBusinessSector', e.target.value)} maxLength={100}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══ STEP 2: Contact ══ */}
              {step === 2 && (
                <motion.div key="step2"
                  initial={{ opacity: 0, x: 60, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -60, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative rounded-3xl border-2 border-gray-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
                    <div className="relative mb-8 flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl">
                        <Phone className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Contact Details</h2>
                        <p className="text-sm font-medium text-gray-500">How should we reach you?</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <PhoneInputWithCode
                        value={form.alternatePhoneNumber} countryCode={form.alternatePhoneCountryCode}
                        onPhoneChange={(v) => updateField('alternatePhoneNumber', v)}
                        onCodeChange={(v) => updateField('alternatePhoneCountryCode', v)}
                        error={errors.alternatePhoneNumber}
                      />

                      {/* Contact method */}
                      <div>
                        <label className="mb-4 block text-sm font-bold text-gray-800">Preferred Contact Method</label>
                        <div className="grid grid-cols-3 gap-3">
                          {CONTACT_METHOD_OPTIONS.map((m) => {
                            const active = form.preferredContactMethod === m.value;
                            return (
                              <motion.button key={m.value} type="button"
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => updateField('preferredContactMethod', m.value)}
                                className={`relative rounded-2xl border-2 p-5 text-center transition-all duration-300 ${
                                  active ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl'
                                  : 'border-gray-200/60 bg-white/80 hover:border-green-300'
                                }`}
                              >
                                <span className="mb-2 block text-3xl">{m.icon}</span>
                                <span className={`block text-xs font-bold ${active ? 'text-green-700' : 'text-gray-600'}`}>{m.label}</span>
                                {active && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-2 top-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  </motion.div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Language */}
                      <div>
                        <label className="mb-4 block text-sm font-bold text-gray-800">Language Preference</label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {LANGUAGE_OPTIONS.map((lang) => {
                            const active = form.languagePreference === lang.value;
                            return (
                              <motion.button key={lang.value} type="button"
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => updateField('languagePreference', lang.value)}
                                className={`relative rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
                                  active ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl'
                                  : 'border-gray-200/60 bg-white/80 hover:border-green-300'
                                }`}
                              >
                                <span className="mb-1.5 block text-2xl">{lang.flag}</span>
                                <span className={`block text-xs font-bold ${active ? 'text-green-700' : 'text-gray-600'}`}>{lang.label}</span>
                                {active && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-1.5 top-1.5">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                  </motion.div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══ STEP 3: Location & Franchise ══ */}
              {step === 3 && (
                <motion.div key="step3"
                  initial={{ opacity: 0, x: 60, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -60, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative rounded-3xl border-2 border-gray-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
                    <div className="relative mb-8 flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-xl">
                        <MapPin className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Location & Franchise</h2>
                        <p className="text-sm font-medium text-gray-500">
                          {inviteData ? 'Confirm your location details' : 'Select country, then choose your franchise'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <LocationRow form={form} errors={errors} updateField={updateField}
                        availableStates={availableStates} availableCities={availableCities}
                      />

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-start gap-3 rounded-2xl border-2 border-blue-100 bg-blue-50/60 px-4 py-3"
                      >
                        <span className="mt-0.5 text-base">💡</span>
                        <p className="text-xs font-semibold text-blue-700">
                          Only <strong>Country</strong> is required. State & City help find nearby franchises.
                        </p>
                      </motion.div>

                      {/* ✅ Franchise section — hidden if invite link */}
                      {inviteData ? (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-2xl">⭐</div>
                            <div>
                              <p className="text-sm font-black text-green-800">
                                {inviteData.franchiseName || 'Franchise (via invite)'}
                              </p>
                              <p className="text-xs font-medium text-green-600">
                                Your franchise is assigned via invitation — no selection needed
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="rounded-2xl border-2 border-gray-100/80 bg-gradient-to-br from-gray-50/60 to-yellow-50/20 p-5">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
                              <Star className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-wider text-gray-700">Franchise Selection</span>
                          </div>

                          <SearchableDropdown
                            label="Select Franchise"
                            placeholder={
                              !form.country ? 'Select country first'
                              : franchiseLoading ? 'Loading franchises…'
                              : 'Click to load & select franchise'
                            }
                            value={form.franchiseId}
                            displayValue={getSelectedFranchise()?.name || ''}
                            options={franchises}
                            onSelect={(f) => updateField('franchiseId', String(f.id))}
                            error={errors.franchiseId}
                            disabled={!form.country}
                            loading={franchiseLoading}
                            emptyText={franchiseError || 'No franchises available'}
                            onOpen={() => {
                              if (!franchiseFetched && !franchiseLoading && form.country) fetchFranchises();
                            }}
                            icon={Star}
                            dropdownId="franchise-dd"
                            renderItem={(franchise, selected, onClick) => (
                              <button type="button" onClick={onClick}
                                className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-all ${
                                  selected ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg shadow-md ${
                                  franchise.type === 'GENERAL' ? 'bg-gradient-to-br from-green-100 to-emerald-200' : 'bg-gradient-to-br from-blue-100 to-indigo-200'
                                }`}>
                                  {franchise.type === 'GENERAL' ? '🌐' : '🏭'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={`mb-1.5 text-sm font-bold ${selected ? 'text-green-700' : 'text-gray-800'}`}>{franchise.name}</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                      franchise.type === 'GENERAL' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>{franchise.type}</span>
                                    {franchise.sectorName && (
                                      <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-bold text-purple-700">{franchise.sectorName}</span>
                                    )}
                                    <span className="text-[10px] font-medium text-gray-500">
                                      📍 {[franchise.city, franchise.state].filter(Boolean).join(', ')}
                                    </span>
                                  </div>
                                </div>
                                {selected && <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-600" />}
                              </button>
                            )}
                          />

                          {franchiseFetched && franchiseError && franchises.length === 0 && (
                            <motion.button initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                              type="button" onClick={fetchFranchises} whileHover={{ scale: 1.02 }}
                              className="mt-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
                            >
                              <TrendingUp className="h-4 w-4" /> Retry Loading Franchises
                            </motion.button>
                          )}

                          {form.franchiseId && getSelectedFranchise() && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                              className="mt-4 rounded-2xl border-2 border-green-200/80 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-4 shadow-xl"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                                  <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-green-600">Selected Franchise</p>
                                  <p className="truncate text-sm font-black text-green-800">{getSelectedFranchise().name}</p>
                                  <p className="text-xs font-semibold text-green-600">
                                    {getSelectedFranchise().type}
                                    {getSelectedFranchise().sectorName && ` · ${getSelectedFranchise().sectorName}`}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══ STEP 4: Role + Event Interests ══ */}
              {step === 4 && (
                <motion.div key="step4"
                  initial={{ opacity: 0, x: 60, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -60, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative rounded-3xl border-2 border-gray-200/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
                    <div className="relative mb-8 flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl">
                        <Zap className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Choose Your Role</h2>
                        <p className="text-sm font-medium text-gray-500">Select one or multiple roles</p>
                      </div>
                    </div>

                    {/* Roles */}
                    <div className="space-y-4 mb-8">
                      {ROLE_OPTIONS.map((role) => {
                        const active = form.roles.includes(role.value);
                        return (
                          <motion.button key={role.value} type="button"
                            onClick={() => toggleRole(role.value)}
                            whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                            className={`group relative flex w-full items-center gap-5 rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                              active ? 'border-green-400 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 shadow-2xl shadow-green-500/20'
                              : 'border-gray-200/60 bg-white/80 hover:border-green-300 hover:shadow-xl'
                            }`}
                          >
                            <div className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl shadow-xl transition-all duration-300 ${
                              active ? `bg-gradient-to-br ${role.color}` : 'bg-gray-100'
                            }`}>
                              {role.icon}
                            </div>
                            <div className="relative z-10 min-w-0 flex-1">
                              <p className={`mb-1 text-lg font-black ${active ? 'text-green-800' : 'text-gray-800'}`}>{role.label}</p>
                              <p className={`text-sm font-medium ${active ? 'text-green-600' : 'text-gray-500'}`}>{role.desc}</p>
                            </div>
                            <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                              active ? 'border-green-500 bg-green-500 shadow-lg' : 'border-gray-300 bg-white'
                            }`}>
                              {active && (
                                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500 }}>
                                  <CheckCircle2 className="h-5 w-5 text-white" />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {errors.roles && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex items-center gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-4"
                      >
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                        <p className="text-sm font-bold text-red-600">{errors.roles}</p>
                      </motion.div>
                    )}

                    {/* ✅ Event Interests */}
                    <div className="mb-8">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 shadow-md">
                          <Star className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-wider text-gray-700">Event Interests</span>
                        <span className="text-xs font-medium text-gray-400">(optional)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {EVENT_INTEREST_OPTIONS.map((interest) => {
                          const active = form.eventInterests.includes(interest.value);
                          return (
                            <motion.button key={interest.value} type="button"
                              onClick={() => toggleEventInterest(interest.value)}
                              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                              className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
                                active ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl shadow-indigo-500/20'
                                : 'border-gray-200/60 bg-white/80 hover:border-indigo-300 hover:shadow-lg'
                              }`}
                            >
                              <span className="text-2xl">{interest.icon}</span>
                              <span className={`text-xs font-bold leading-tight ${active ? 'text-indigo-700' : 'text-gray-700'}`}>
                                {interest.label}
                              </span>
                              <span className={`text-[10px] font-medium leading-tight ${active ? 'text-indigo-500' : 'text-gray-400'}`}>
                                {interest.desc}
                              </span>
                              {active && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-2xl border-2 border-gray-200/80 bg-gradient-to-br from-gray-50/80 to-green-50/30 p-6"
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-600" />
                        <p className="text-sm font-bold uppercase tracking-wider text-gray-600">Review Your Details</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <SummaryCard label="Name"       value={form.fullName}    icon="👤" />
                        <SummaryCard label="Company"    value={form.companyName} icon="🏢" />
                        <SummaryCard label="Phone"
                          value={form.alternatePhoneNumber ? `${form.alternatePhoneCountryCode} ${form.alternatePhoneNumber}` : ''}
                          icon="📱"
                        />
                        <SummaryCard label="Contact Via" value={form.preferredContactMethod} icon="💬" />
                        <SummaryCard label="Location"
                          value={[form.city, form.state, form.country].filter(Boolean).join(', ')} icon="📍"
                        />
                        <SummaryCard label="Franchise"
                          value={inviteData?.franchiseName || getSelectedFranchise()?.name || (inviteData ? 'Via Invite' : '-')}
                          icon="⭐"
                        />
                        <SummaryCard label="Sector"
                          value={
                            form.businessSector === 'OTHER'
                              ? form.otherBusinessSector || 'Other'
                              : BUSINESS_SECTOR_OPTIONS.find((o) => o.value === form.businessSector)?.label || '-'
                          }
                          icon={BUSINESS_SECTOR_OPTIONS.find((o) => o.value === form.businessSector)?.icon || '🔧'}
                        />
                        <SummaryCard label="Position"  value={form.position}    icon="💼" />
                        <SummaryCard label="Bus. Age"
                          value={BUSINESS_AGE_OPTIONS.find((o) => o.value === form.businessAge)?.label || '-'}
                          icon="📅"
                        />
                      </div>

                      {/* Event interests summary */}
                      {form.eventInterests.length > 0 && (
                        <div className="mt-3 col-span-2 sm:col-span-3 rounded-xl border-2 border-gray-200/60 bg-white/80 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-base">🎯</span>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Event Interests</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {form.eventInterests.map((i) => (
                              <span key={i} className="rounded-lg bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                {EVENT_INTEREST_OPTIONS.find((o) => o.value === i)?.label || i}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Error */}
            {submitError && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mt-6 flex items-center gap-4 rounded-2xl border-2 border-red-200/80 bg-gradient-to-r from-red-50 to-pink-50 p-5 shadow-xl"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 shadow-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <p className="flex-1 text-sm font-bold text-red-600">{submitError}</p>
              </motion.div>
            )}

            {/* Navigation */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }} className="mt-8 flex items-center gap-4"
            >
              {step > 1 && (
                <motion.button type="button" onClick={prevStep}
                  whileHover={{ scale: 1.02, x: -2 }} whileTap={{ scale: 0.98 }}
                  className="group flex h-14 items-center gap-3 rounded-2xl border-2 border-gray-200/80 bg-white/80 px-6 text-sm font-bold text-gray-700 shadow-lg backdrop-blur-xl transition-all hover:border-gray-300"
                >
                  <ArrowRight className="h-5 w-5 rotate-180 transition-transform group-hover:-translate-x-1" />
                  Back
                </motion.button>
              )}

              {step < totalSteps ? (
                <motion.button type="button" onClick={nextStep}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="group relative flex h-14 flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-base font-bold text-white shadow-2xl shadow-green-500/40"
                >
                  <span className="relative z-10">Continue</span>
                  <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </motion.button>
              ) : (
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="group relative flex h-14 flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-base font-bold text-white shadow-2xl shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <><Loader2 className="relative z-10 h-5 w-5 animate-spin" /><span className="relative z-10">Processing…</span></>
                  ) : (
                    <><Sparkles className="relative z-10 h-5 w-5" /><span className="relative z-10">Complete Registration</span></>
                  )}
                </motion.button>
              )}
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-gray-500"
            >
              <Shield className="h-3.5 w-3.5 text-green-600" />
              Your information is encrypted & secure with 256-bit SSL
            </motion.p>
          </form>
        </div>
      </div>
    </>
  );
}