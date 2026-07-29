// utils/locationData.js

export const LOCATION_DATA = {
  Turkey: {
    states: {
      Istanbul: ['Istanbul', 'Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar'],
      Ankara: ['Ankara', 'Çankaya', 'Keçiören', 'Yenimahalle'],
      Izmir: ['Izmir', 'Konak', 'Bornova', 'Karşıyaka'],
      Bursa: ['Bursa', 'Nilüfer', 'Osmangazi'],
      Antalya: ['Antalya', 'Muratpaşa', 'Kepez'],
    },
  },
  India: {
    states: {
      Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
      Delhi: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi'],
      Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
      TamilNadu: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
      Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
      Telangana: ['Hyderabad', 'Warangal', 'Nizamabad'],
      WestBengal: ['Kolkata', 'Howrah', 'Durgapur'],
      UttarPradesh: ['Noida', 'Lucknow', 'Kanpur', 'Agra'],
    },
  },
  'United Arab Emirates': {
    states: {
      Dubai: ['Dubai', 'Jumeirah', 'Deira', 'Business Bay', 'Downtown'],
      'Abu Dhabi': ['Abu Dhabi', 'Al Ain', 'Al Dhafra'],
      Sharjah: ['Sharjah', 'Al Majaz', 'Al Nahda'],
      Ajman: ['Ajman'],
      'Ras Al Khaimah': ['Ras Al Khaimah'],
    },
  },
  'Saudi Arabia': {
    states: {
      Riyadh: ['Riyadh', 'Diriyah'],
      Makkah: ['Jeddah', 'Mecca', 'Taif'],
      'Eastern Province': ['Dammam', 'Khobar', 'Jubail', 'Dhahran'],
      Madinah: ['Medina', 'Yanbu'],
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
  Germany: {
    states: {
      Bavaria: ['Munich', 'Nuremberg', 'Augsburg'],
      Berlin: ['Berlin'],
      'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen'],
      Frankfurt: ['Frankfurt', 'Wiesbaden'],
      Hamburg: ['Hamburg'],
    },
  },
  Singapore: {
    states: {
      Singapore: ['Central Area', 'Jurong East', 'Tampines', 'Woodlands', 'Changi'],
    },
  },
  Australia: {
    states: {
      'New South Wales': ['Sydney', 'Newcastle', 'Wollongong'],
      Victoria: ['Melbourne', 'Geelong', 'Ballarat'],
      Queensland: ['Brisbane', 'Gold Coast', 'Cairns'],
      'Western Australia': ['Perth', 'Fremantle'],
    },
  },
  Canada: {
    states: {
      Ontario: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton'],
      Quebec: ['Montreal', 'Quebec City', 'Laval'],
      'British Columbia': ['Vancouver', 'Victoria', 'Surrey'],
      Alberta: ['Calgary', 'Edmonton'],
    },
  },
  China: {
    states: {
      Guangdong: ['Guangzhou', 'Shenzhen', 'Foshan', 'Dongguan'],
      Shanghai: ['Shanghai'],
      Beijing: ['Beijing'],
      Zhejiang: ['Hangzhou', 'Ningbo', 'Yiwu'],
    },
  },
  Brazil: {
    states: {
      'São Paulo': ['São Paulo', 'Campinas', 'Santos'],
      'Rio de Janeiro': ['Rio de Janeiro', 'Niterói'],
      'Minas Gerais': ['Belo Horizonte'],
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
