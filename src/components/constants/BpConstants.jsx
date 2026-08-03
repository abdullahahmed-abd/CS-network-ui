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

export const INTENT_STATUS = {
  OPEN:    { color: '#43A047', bg: '#E8F5E9', label: 'Open'    },
  CLOSED:  { color: '#616161', bg: '#F5F5F5', label: 'Closed'  },
  EXPIRED: { color: '#E53935', bg: '#FFEBEE', label: 'Expired' },
  MATCHED: { color: '#7aab65', bg: '#e8f5e2', label: 'Matched' },
};

export const NAV_ITEMS = [
  { id: 'pipeline',         label: 'Pipeline',      },
  { id: 'trade_intents',    label: 'Trade Intents', },
  { id: 'deals',            label: 'Deals',         },
  { id: 'commissions',      label: 'Commissions',   },
  { id: 'meetings',         label: 'Meetings',      },
  { id: 'events',           label: 'Events',        },
  { id: 'my_registrations', label: 'My Tickets',    },
];

export const BASE_URL =
  'https://unbarrable-semidivisive-rolanda.ngrok-free.dev';