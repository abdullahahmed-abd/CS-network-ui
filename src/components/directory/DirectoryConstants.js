// components/directory/DirectoryConstants.js

export const BUSINESS_SECTORS = [
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'TEXTILE', label: 'Textile' },
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'FOOD_AND_BEVERAGE', label: 'Food & Beverage' },
  { value: 'CONSTRUCTION', label: 'Construction' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'CHEMICALS', label: 'Chemicals' },
  { value: 'PHARMACEUTICALS', label: 'Pharmaceuticals' },
  { value: 'IT_AND_SOFTWARE', label: 'IT & Software' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'LOGISTICS_AND_TRANSPORTATION', label: 'Logistics & Transportation' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'HANDICRAFTS', label: 'Handicrafts' },
  { value: 'ENERGY', label: 'Energy' },
  { value: 'MINING', label: 'Mining' },
  { value: 'OTHER', label: 'Other' },
];

export const POSITIONS = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'FOUNDER', label: 'Founder' },
  { value: 'CO_FOUNDER', label: 'Co-Founder' },
  { value: 'CEO', label: 'CEO' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'SALES_MANAGER', label: 'Sales Manager' },
  { value: 'BUSINESS_DEVELOPMENT_MANAGER', label: 'Business Development Manager' },
  { value: 'MARKETING_MANAGER', label: 'Marketing Manager' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'FREELANCER', label: 'Freelancer' },
  { value: 'CONSULTANT', label: 'Consultant' },
  { value: 'OTHER', label: 'Other' },
];

export const BUSINESS_AGES = [
  { value: 'LESS_THAN_ONE_YEAR', label: '< 1 Year' },
  { value: 'ONE_TO_THREE_YEARS', label: '1 – 3 Years' },
  { value: 'THREE_TO_FIVE_YEARS', label: '3 – 5 Years' },
  { value: 'MORE_THAN_FIVE_YEARS', label: '5+ Years' },
];

export const FRANCHISE_TYPES = [
  { value: 'MASTER', label: 'Master Franchise' },
  { value: 'GENERAL', label: 'General Franchise' },
  { value: 'SECTOR', label: 'Sector Franchise' },
];

export const formatEnum = (val) => {
  if (!val) return '';
  const all = [...BUSINESS_SECTORS, ...POSITIONS, ...BUSINESS_AGES, ...FRANCHISE_TYPES];
  const found = all.find((item) => item.value === val);
  if (found) return found.label;
  return val.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};
