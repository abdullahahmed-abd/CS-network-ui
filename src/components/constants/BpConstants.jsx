// ═══════════════════ THEME ═══════════════════
export const THEME = {
  primary:        '#A2CB8B',
  primaryDark:    '#7aab65',
  primaryBright:  '#b8d9a4',
  primaryLight:   '#c5e3b3',
  primarySoft:    '#d4ecc5',
  primaryMist:    '#e8f5e2',
  primaryCloud:   '#f0f9eb',
  primarySky:     '#f7fcf4',
  primaryRgb:     '162, 203, 139',
  primaryLightRgb:'197, 227, 179',
  primaryDarkRgb: '122, 171, 101',
  white:          '#FFFFFF',
  offWhite:       '#FAFCFF',
  textDark:       '#1a3a1a',
  textMed:        '#2d5a2d',
  textLight:      '#4a7a4a',
  textMuted:      '#7a9a7a',
  success:        '#66BB6A',
  successDark:    '#43A047',
  warning:        '#FFA726',
  warningDark:    '#FB8C00',
  danger:         '#EF5350',
  dangerDark:     '#E53935',
  stageNew:       '#b8d9a4',
  stageContact:   '#26A69A',
  stageQualified: '#66BB6A',
  stageIntro:     '#7E57C2',
  stageNegotiate: '#FFA726',
  stageWon:       '#43A047',
  stageLost:      '#EF5350',
};

export const PIPELINE_STAGES = [
  { id: 'NEW_LEAD',    label: 'New Lead',    color: THEME.stageNew,       colorDark: THEME.primaryDark, IconComp: null /* assigned in component */ },
  { id: 'CONTACTED',   label: 'Contacted',   color: THEME.stageContact,   colorDark: '#00897B'         },
  { id: 'QUALIFIED',   label: 'Qualified',   color: THEME.stageQualified, colorDark: '#43A047'         },
  { id: 'INTRODUCED',  label: 'Introduced',  color: THEME.stageIntro,     colorDark: '#5E35B1'         },
  { id: 'NEGOTIATION', label: 'Negotiation', color: THEME.stageNegotiate, colorDark: '#FB8C00'         },
  { id: 'CLOSED_WON',  label: 'Closed Won',  color: THEME.stageWon,       colorDark: '#2E7D32'         },
  { id: 'CLOSED_LOST', label: 'Closed Lost', color: THEME.stageLost,      colorDark: '#C62828'         },
];

export const LEAD_TYPES = [
  {
    id: 'CREATE_EXTERNAL_LEAD',
    title: 'External Lead',
    subtitle: 'Non-CS Network person',
    description: 'Add someone outside the network — create their trade intent on their behalf',
    color: THEME.primary,
  },
  {
    id: 'CREATE_TRADE_INTENT_FOR_MEMBER',
    title: 'Create Trade Intent',
    subtitle: 'For existing CS member',
    description: 'Member exists but has no trade intent yet — create one on their behalf',
    color: THEME.stageContact,
  },
  {
    id: 'CREATE_INTERNAL_LEAD',
    title: 'Add Existing Trade Intent',
    subtitle: 'Member + existing intent',
    description: 'Pick an existing member and their existing trade intent — add to your pipeline',
    color: THEME.stageIntro,
  },
];

export const CATEGORIES = [
  'Wheat','Rice','Corn','Barley','Soybean',
  'Cotton','Sugar','Coffee','Cocoa','Palm Oil',
  'Vegetables','Fruits','Pulses','Spices','Other',
];

export const UNITS = ['KG','TON','QUINTAL','POUND','LITER','BARREL'];

// ══════════════════════════════════════════════════════════════════════════════
// SECTOR TO CATEGORIES & MEASUREMENT UNITS MAPPING
// ══════════════════════════════════════════════════════════════════════════════
export const SECTOR_CATEGORIES = {
  ELECTRONICS: [
    "Mobile Phones", "Laptops", "Desktop Computers", "Tablets", "Televisions",
    "Monitors", "Printers", "Routers", "Network Switches", "Servers",
    "CCTV Cameras", "Smart Watches", "Gaming Consoles", "Speakers", "Headphones",
    "Power Banks", "Hard Drives", "Memory Modules", "Graphic Cards", "Electronic Components"
  ],
  AGRICULTURE: [
    "Wheat", "Rice", "Corn", "Barley", "Soybeans",
    "Cotton", "Sugarcane", "Potatoes", "Onions", "Tomatoes",
    "Apples", "Oranges", "Bananas", "Dates", "Seeds",
    "Fertilizers", "Pesticides", "Animal Feed", "Dairy Products", "Poultry"
  ],
  TEXTILE: [
    "Cotton Fabric", "Silk Fabric", "Polyester Fabric", "Denim Fabric", "Wool Fabric",
    "Yarn", "Thread", "T-Shirts", "Shirts", "Jeans",
    "Jackets", "Sportswear", "Uniforms", "Abayas", "Kanduras",
    "Scarves", "Leather Bags", "Shoes", "Bedsheets", "Curtains"
  ],
  MANUFACTURING: [
    "Industrial Machinery", "Packaging Materials", "Plastic Products", "Metal Components", "Industrial Tools",
    "Pipes", "Bearings", "Valves", "Fasteners", "Industrial Motors",
    "Generators", "Pumps", "Conveyor Systems", "Rubber Products", "Steel Sheets",
    "Aluminium Sheets", "Industrial Chemicals", "Molds", "Factory Equipment", "Production Components"
  ],
  FOOD_AND_BEVERAGE: [
    "Bottled Water", "Soft Drinks", "Juices", "Milk", "Cheese",
    "Yogurt", "Tea", "Coffee", "Sugar", "Flour",
    "Rice", "Frozen Foods", "Bakery Products", "Snacks", "Chocolate",
    "Cooking Oil", "Spices", "Seafood", "Meat Products", "Fresh Produce"
  ],
  CONSTRUCTION: [
    "Cement", "Steel Rebars", "Bricks", "Concrete Blocks", "Sand",
    "Gravel", "Tiles", "Marble", "Granite", "Glass Panels",
    "Aluminium Profiles", "Paint", "Wood Panels", "Electrical Cables", "PVC Pipes",
    "Water Tanks", "Doors", "Windows", "Scaffolding", "Safety Equipment"
  ],
  AUTOMOTIVE: [
    "Cars", "Motorcycles", "Trucks", "Buses", "Tires",
    "Batteries", "Engine Oil", "Brake Pads", "Spark Plugs", "Air Filters",
    "Fuel Pumps", "Radiators", "Shock Absorbers", "Alloy Wheels", "Car Accessories",
    "Lubricants", "Transmission Parts", "Headlights", "Vehicle Electronics", "Spare Parts"
  ],
  CHEMICALS: [
    "Industrial Chemicals", "Petrochemicals", "Solvents", "Adhesives", "Resins",
    "Polymers", "Paint Chemicals", "Cleaning Chemicals", "Water Treatment Chemicals", "Laboratory Chemicals",
    "Fertilizer Chemicals", "Agrochemicals", "Detergent Chemicals", "Textile Chemicals", "Construction Chemicals",
    "Specialty Chemicals", "Chemical Additives", "Pigments", "Coatings", "Chemical Raw Materials"
  ],
  PHARMACEUTICALS: [
    "Prescription Medicines", "OTC Medicines", "Vaccines", "Medical Devices", "Diagnostic Kits",
    "Surgical Supplies", "Hospital Equipment", "Laboratory Equipment", "Healthcare Consumables", "Personal Protective Equipment",
    "Medical Furniture", "Pharmaceutical Ingredients", "Supplements", "Health Products", "Dental Supplies",
    "Orthopedic Equipment", "Monitoring Equipment", "Rehabilitation Equipment", "First Aid Supplies", "Medical Disposables"
  ],
  IT_AND_SOFTWARE: [
    "ERP Software", "CRM Software", "Accounting Software", "Mobile Applications", "Web Applications",
    "Cloud Services", "Cybersecurity Solutions", "SaaS Platforms", "AI Solutions", "Data Analytics Solutions",
    "Networking Solutions", "Servers", "Storage Solutions", "Software Licenses", "IT Support Services",
    "Managed Services", "Web Hosting", "Database Solutions", "Business Intelligence Tools", "Automation Software"
  ],
  REAL_ESTATE: [
    "Residential Property", "Commercial Property", "Industrial Property", "Land", "Warehouses",
    "Retail Spaces", "Office Spaces", "Apartments", "Villas", "Property Management",
    "Facility Management", "Co-working Spaces", "Building Materials", "Construction Land", "Investment Property",
    "Rental Property", "Hospitality Property", "Mixed Use Property", "Real Estate Services", "Property Development"
  ],
  LOGISTICS_AND_TRANSPORTATION: [
    "Freight Services", "Warehousing Services", "Courier Services", "Shipping Services", "Air Cargo",
    "Sea Freight", "Road Transport", "Cold Storage", "Packaging Services", "Customs Clearance",
    "Fleet Vehicles", "Container Services", "Last Mile Delivery", "Supply Chain Services", "Distribution Services",
    "Transport Equipment", "Material Handling Equipment", "Storage Equipment", "Logistics Software", "Cargo Handling Services"
  ],
  RETAIL: [
    "Consumer Electronics", "Fashion Apparel", "Footwear", "Home Appliances", "Furniture",
    "Groceries", "Beauty Products", "Personal Care Products", "Sports Equipment", "Toys",
    "Books", "Office Supplies", "Kitchenware", "Home Decor", "Jewelry",
    "Watches", "Pet Supplies", "Baby Products", "Gift Items", "General Merchandise"
  ],
  HANDICRAFTS: [
    "Handmade Jewelry", "Wood Crafts", "Pottery", "Ceramics", "Handwoven Textiles",
    "Traditional Clothing", "Leather Crafts", "Metal Crafts", "Glass Art", "Paintings",
    "Sculptures", "Decorative Items", "Gift Items", "Embroidery", "Handmade Bags",
    "Handmade Footwear", "Home Decor", "Souvenirs", "Art Supplies", "Craft Materials"
  ],
  ENERGY: [
    "Solar Panels", "Solar Inverters", "Solar Batteries", "Wind Turbines", "Generators",
    "Transformers", "Power Cables", "Electrical Panels", "Fuel", "Lubricants",
    "Gas Cylinders", "Energy Storage Systems", "Charging Stations", "Power Equipment", "Renewable Energy Equipment",
    "Industrial Batteries", "Smart Meters", "Electrical Components", "Power Distribution Equipment", "Energy Solutions"
  ],
  MINING: [
    "Coal", "Iron Ore", "Copper Ore", "Gold Ore", "Bauxite",
    "Limestone", "Granite", "Marble", "Sand", "Gravel",
    "Industrial Minerals", "Mining Equipment", "Drilling Equipment", "Explosives", "Mineral Concentrates",
    "Rare Earth Minerals", "Construction Aggregates", "Crushed Stone", "Mining Chemicals", "Mining Consumables"
  ],
  OTHER: [
    "General Merchandise", "Business Services", "Professional Services", "Consulting Services", "Marketing Services",
    "Training Services", "Office Equipment", "Office Furniture", "Packaging Materials", "Cleaning Supplies",
    "Security Equipment", "Event Supplies", "Printing Services", "Promotional Products", "Industrial Supplies",
    "Commercial Equipment", "Miscellaneous Goods", "Wholesale Products", "Trade Services", "Other"
  ]
};

export const SECTOR_UNITS = {
  AGRICULTURE: ["KG", "TON", "BAG", "BOX", "CARTON", "LITER", "DOZEN", "TRAY"],
  TEXTILE: ["PIECE", "PAIR", "SET", "METER", "ROLL", "BOX", "CARTON", "KG"],
  ELECTRONICS: ["PIECE", "BOX", "CARTON", "PALLET", "SET"],
  MANUFACTURING: ["PIECE", "KG", "TON", "METER", "ROLL", "BOX", "CARTON", "PALLET", "SET"],
  FOOD_AND_BEVERAGE: ["KG", "TON", "LITER", "BOX", "CARTON", "CASE", "BAG", "DOZEN", "TRAY"],
  CONSTRUCTION: ["KG", "TON", "BAG", "PIECE", "METER", "SQ_METER", "PALLET", "ROLL"],
  AUTOMOTIVE: ["PIECE", "SET", "PAIR", "LITER", "BOX", "CARTON", "PALLET"],
  CHEMICALS: ["KG", "TON", "LITER", "DRUM", "BARREL", "BAG", "IBC", "BOX"],
  PHARMACEUTICALS: ["PIECE", "BOX", "CARTON", "STRIP", "VIAL", "BOTTLE", "LITER", "KG"],
  IT_AND_SOFTWARE: ["LICENSE", "USER", "SUBSCRIPTION", "PIECE", "SET"],
  REAL_ESTATE: ["SQ_METER", "SQ_FOOT", "UNIT", "PROPERTY", "ACRE"],
  LOGISTICS_AND_TRANSPORTATION: ["KG", "TON", "CONTAINER", "PALLET", "SHIPMENT", "TRIP", "BOX", "CARTON"],
  RETAIL: ["PIECE", "BOX", "CARTON", "SET", "PAIR", "KG", "LITER"],
  HANDICRAFTS: ["PIECE", "SET", "PAIR", "BOX", "METER", "KG"],
  ENERGY: ["LITER", "BARREL", "KG", "TON", "PIECE", "SET", "PALLET"],
  MINING: ["KG", "TON", "CUBIC_METER", "BAG", "CONTAINER"],
  OTHER: ["PIECE", "KG", "TON", "LITER", "METER", "SQ_METER", "BOX", "CARTON", "SET"]
};

export const normalizeSectorKey = (sector) => {
  if (!sector) return 'AGRICULTURE';
  const s = String(sector).trim().toUpperCase();

  if (s.includes('AGRICULTUR')) return 'AGRICULTURE';
  if (s.includes('TEXTILE')) return 'TEXTILE';
  if (s.includes('ELECTRONIC')) return 'ELECTRONICS';
  if (s.includes('MANUFACTUR')) return 'MANUFACTURING';
  if (s.includes('FOOD') || s.includes('BEVERAGE')) return 'FOOD_AND_BEVERAGE';
  if (s.includes('CONSTRUCT')) return 'CONSTRUCTION';
  if (s.includes('AUTOMOTIV') || s.includes('AUTO')) return 'AUTOMOTIVE';
  if (s.includes('CHEMICAL')) return 'CHEMICALS';
  if (s.includes('PHARMA')) return 'PHARMACEUTICALS';
  if (s.includes('IT') || s.includes('SOFTWARE')) return 'IT_AND_SOFTWARE';
  if (s.includes('REAL') || s.includes('ESTATE')) return 'REAL_ESTATE';
  if (s.includes('LOGISTIC') || s.includes('TRANSPORT')) return 'LOGISTICS_AND_TRANSPORTATION';
  if (s.includes('RETAIL')) return 'RETAIL';
  if (s.includes('HANDICRAFT')) return 'HANDICRAFTS';
  if (s.includes('ENERGY') || s.includes('SOLAR') || s.includes('POWER')) return 'ENERGY';
  if (s.includes('MINING') || s.includes('ORE')) return 'MINING';

  const formattedKey = s.replace(/[\s\-\&\/]+/g, '_');
  if (SECTOR_CATEGORIES[formattedKey]) return formattedKey;

  return 'OTHER';
};

export const getSectorData = (sector) => {
  const sectorKey = normalizeSectorKey(sector);
  const categories = SECTOR_CATEGORIES[sectorKey] || SECTOR_CATEGORIES.OTHER;
  const units = SECTOR_UNITS[sectorKey] || SECTOR_UNITS.OTHER;
  return { sectorKey, categories, units };
};

export const INTENT_STATUS = {
  OPEN:    { color: '#43A047', bg: '#E8F5E9', label: 'Open'    },
  CLOSED:  { color: '#616161', bg: '#F5F5F5', label: 'Closed'  },
  EXPIRED: { color: '#E53935', bg: '#FFEBEE', label: 'Expired' },
  MATCHED: { color: '#7aab65', bg: '#e8f5e2', label: 'Matched' },
};

export const NAV_ITEMS = [
  { id: 'pipeline',         label: 'Pipeline',      },
  { id: 'deals',            label: 'Deals',         },
  { id: 'commissions',      label: 'Commissions',   },
  { id: 'meetings',         label: 'Meetings',      },
  { id: 'events',           label: 'Events',        },
  { id: 'my_registrations', label: 'My Tickets',    },
];

export const BASE_URL = 'https://connectsouq.sundukpay.com';