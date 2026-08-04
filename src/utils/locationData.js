// utils/locationData.js

export const COUNTRY_CODES = [
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', short: 'SA', maxLen: 9  },
  { code: '+971', flag: '🇦🇪', name: 'UAE',          short: 'AE', maxLen: 9  },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait',       short: 'KW', maxLen: 8  },
  { code: '+974', flag: '🇶🇦', name: 'Qatar',        short: 'QA', maxLen: 8  },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain',      short: 'BH', maxLen: 8  },
  { code: '+968', flag: '🇴🇲', name: 'Oman',         short: 'OM', maxLen: 8  },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt',        short: 'EG', maxLen: 10 },
  { code: '+962', flag: '🇯🇴', name: 'Jordan',       short: 'JO', maxLen: 9  },
  { code: '+1',   flag: '🇺🇸', name: 'USA',          short: 'US', maxLen: 10 },
  { code: '+44',  flag: '🇬🇧', name: 'UK',           short: 'GB', maxLen: 10 },
  { code: '+91',  flag: '🇮🇳', name: 'India',        short: 'IN', maxLen: 10 },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan',     short: 'PK', maxLen: 10 },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh',   short: 'BD', maxLen: 10 },
];

export const COUNTRY_TO_CODE_MAP = {
  'India': '+91',
  'United Arab Emirates': '+971',
  'Saudi Arabia': '+966',
  'Pakistan': '+92',
  'Bangladesh': '+880',
  'United States': '+1',
  'United Kingdom': '+44',
  'Egypt': '+20',
  'Kuwait': '+965',
  'Qatar': '+974',
  'Bahrain': '+973',
  'Oman': '+968',
  'Jordan': '+962',
};

export const LOCATION_DATA = {
  India: {
    states: {
      'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
      Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
      Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
      'Uttar Pradesh': ['Noida', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi'],
      Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
      Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
      Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
      'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'],
      Delhi: ['New Delhi', 'Dwarka', 'Rohini', 'Saket'],
      Telangana: ['Hyderabad', 'Warangal', 'Nizamabad'],
      Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode'],
      Punjab: ['Chandigarh', 'Ludhiana', 'Amritsar'],
      Haryana: ['Gurugram', 'Faridabad', 'Panipat'],
    },
  },
  'United Arab Emirates': {
    states: {
      Dubai: ['Dubai', 'Jumeirah', 'Deira', 'Business Bay', 'Downtown'],
      'Abu Dhabi': ['Abu Dhabi', 'Al Ain', 'Al Dhafra'],
      Sharjah: ['Sharjah', 'Al Majaz', 'Al Nahda'],
      Ajman: ['Ajman', 'Al Nuaimiya'],
      'Ras Al Khaimah': ['Ras Al Khaimah'],
    },
  },
  'Saudi Arabia': {
    states: {
      Riyadh: ['Riyadh', 'Diriyah', 'Al Olaya', 'Al Malaz'],
      Makkah: ['Jeddah', 'Mecca', 'Taif', 'Rabigh'],
      'Eastern Province': ['Dammam', 'Khobar', 'Jubail', 'Dhahran'],
      Madinah: ['Medina', 'Yanbu'],
    },
  },
  Pakistan: {
    states: {
      Punjab: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan'],
      Sindh: ['Karachi', 'Hyderabad', 'Sukkur'],
      'Khyber Pakhtunkhwa': ['Peshawar', 'Mardan', 'Abbottabad'],
      Balochistan: ['Quetta', 'Gwadar'],
    },
  },
  Bangladesh: {
    states: {
      Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj'],
      Chittagong: ['Chittagong', 'Comilla'],
      Rajshahi: ['Rajshahi', 'Bogra'],
    },
  },
  'United States': {
    states: {
      California: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose'],
      'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
      Texas: ['Houston', 'Dallas', 'Austin', 'San Antonio'],
      Florida: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
      Illinois: ['Chicago', 'Aurora', 'Naperville'],
    },
  },
  'United Kingdom': {
    states: {
      England: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'],
      Scotland: ['Edinburgh', 'Glasgow', 'Aberdeen'],
      Wales: ['Cardiff', 'Swansea'],
      'Northern Ireland': ['Belfast', 'Derry'],
    },
  },
  Turkey: {
    states: {
      Istanbul: ['Istanbul', 'Kadıköy', 'Beşiktaş', 'Şişli'],
      Ankara: ['Ankara', 'Çankaya', 'Keçiören'],
      Izmir: ['Izmir', 'Konak', 'Bornova'],
    },
  },
  Germany: {
    states: {
      Bavaria: ['Munich', 'Nuremberg'],
      Berlin: ['Berlin'],
      'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund'],
      Frankfurt: ['Frankfurt'],
    },
  },
  Singapore: {
    states: {
      Singapore: ['Central Area', 'Jurong East', 'Tampines', 'Woodlands'],
    },
  },
};

export const getCountries = () => Object.keys(LOCATION_DATA);

export const getStates = (countryName) => {
  if (!countryName || !LOCATION_DATA[countryName]) return [];
  return Object.keys(LOCATION_DATA[countryName].states);
};

export const getCities = (countryName, stateName) => {
  if (!countryName || !stateName || !LOCATION_DATA[countryName]?.states?.[stateName]) return [];
  return LOCATION_DATA[countryName].states[stateName];
};
