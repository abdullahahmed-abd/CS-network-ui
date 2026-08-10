import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search, Bell, Plus, Clock, Phone, Mail, MessageSquare,
  Star, Filter, X, Building2, ShieldCheck, LogOut, Loader2,
  RefreshCw, Calendar, Users, Briefcase, ChevronRight, ArrowLeft,
  CheckCircle2, AlertCircle, Handshake, Wallet, CalendarClock,
  LayoutGrid, TrendingUp, Globe2, Eye, Crown, Sparkles, Zap,
  Target, BarChart3, ArrowUpRight, Activity, Timer, MapPin,
  Hash, ArrowRight, MoreHorizontal, ExternalLink, Diamond,
  Send, User, ChevronDown, Sprout, PhoneCall, BadgeCheck,
  UserPlus, Scale, Trophy, XCircle, ClipboardList, Globe,
  FileEdit, Link2, List, Rocket, ShoppingCart, Store, Package,
  ChevronLeft, DollarSign, Wheat, Ticket,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authenticatedFetch, getUserData } from '../api/auth';
import { fetchMyProfile, resolvePhotoUrl } from '../api/profileOperationsApi';
import MyProfileModal from '../components/profile/MyProfileModal';
import BusinessPartnerSidebar from './BusinessPartnerSidebar';
import { CreateProposalModal } from '../components/businesspartner/modals/CreateProposalModal';
import { EventsTab } from './EventsComponents';
import MyRegistrationsTab from './MyRegistrationsTab';
import MeetingsTab from '../components/meetings/MeetingsTab';
import PartnershipsTab from '../components/partnerships/PartnershipsTab';
import { ProposalsTab, ReceivedProposalsContent } from './BuyerSellerDashboard';

const BASE_URL = 'https://connectsouq.sundukpay.com';

/* ═══════════════════ 🎨 GREEN THEME SYSTEM (like BuyerSellerDashboard) ═══════════════════ */
const THEME = {
  primary: '#A2CB8B',
  primaryDark: '#7aab65',
  primaryBright: '#b8d9a4',
  primaryLight: '#c5e3b3',
  primarySoft: '#d4ecc5',
  primaryMist: '#e8f5e2',
  primaryCloud: '#f0f9eb',
  primarySky: '#f7fcf4',

  primaryRgb: '162, 203, 139',
  primaryLightRgb: '197, 227, 179',
  primaryDarkRgb: '122, 171, 101',

  white: '#FFFFFF',
  offWhite: '#FAFCFF',

  textDark: '#1a3a1a',
  textMed: '#2d5a2d',
  textLight: '#4a7a4a',
  textMuted: '#7a9a7a',

  success: '#66BB6A',
  successDark: '#43A047',
  warning: '#FFA726',
  warningDark: '#FB8C00',
  danger: '#EF5350',
  dangerDark: '#E53935',

  stageNew: '#b8d9a4',
  stageContact: '#26A69A',
  stageQualified: '#66BB6A',
  stageIntro: '#7E57C2',
  stageNegotiate: '#FFA726',
  stageWon: '#43A047',
  stageLost: '#EF5350',
};

const generateCSSVars = (theme) => {
  return Object.entries(theme)
    .map(([key, val]) => `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${val};`)
    .join('\n    ');
};

const PIPELINE_STAGES = [
  { id: 'NEW_LEAD', label: 'New Lead', color: THEME.stageNew, colorDark: THEME.primaryDark, IconComp: Sprout },
  { id: 'CONTACTED', label: 'Contacted', color: THEME.stageContact, colorDark: '#00897B', IconComp: PhoneCall },
  { id: 'QUALIFIED', label: 'Qualified', color: THEME.stageQualified, colorDark: '#43A047', IconComp: BadgeCheck },
  { id: 'INTRODUCED', label: 'Introduced', color: THEME.stageIntro, colorDark: '#5E35B1', IconComp: UserPlus },
  { id: 'NEGOTIATION', label: 'Negotiation', color: THEME.stageNegotiate, colorDark: '#FB8C00', IconComp: Scale },
  { id: 'CLOSED_WON', label: 'Closed Won', color: THEME.stageWon, colorDark: '#2E7D32', IconComp: Trophy },
  { id: 'CLOSED_LOST', label: 'Closed Lost', color: THEME.stageLost, colorDark: '#C62828', IconComp: XCircle },
];

const LEAD_TYPES = [
  {
    id: 'CREATE_EXTERNAL_LEAD',
    title: 'External Lead',
    subtitle: 'Non-CS Network person',
    description: 'Add someone outside the network — create their trade intent on their behalf',
    IconComp: Globe,
    color: THEME.primary,
  },
  {
    id: 'CREATE_TRADE_INTENT_FOR_MEMBER',
    title: 'Create Trade Intent',
    subtitle: 'For existing CS member',
    description: 'Member exists but has no trade intent yet — create one on their behalf',
    IconComp: FileEdit,
    color: THEME.stageContact,
  },
  {
    id: 'CREATE_INTERNAL_LEAD',
    title: 'Add Existing Trade Intent',
    subtitle: 'Member + existing intent',
    description: 'Pick an existing member and their existing trade intent — add to your pipeline',
    IconComp: Link2,
    color: THEME.stageIntro,
  },
];

const CATEGORIES = [
  'Wheat', 'Rice', 'Corn', 'Barley', 'Soybean',
  'Cotton', 'Sugar', 'Coffee', 'Cocoa', 'Palm Oil',
  'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Other',
];
const UNITS = ['KG', 'TON', 'QUINTAL', 'POUND', 'LITER', 'BARREL'];

const INTENT_STATUS = {
  OPEN: { color: '#43A047', bg: '#E8F5E9', label: 'Open' },
  CLOSED: { color: '#616161', bg: '#F5F5F5', label: 'Closed' },
  EXPIRED: { color: '#E53935', bg: '#FFEBEE', label: 'Expired' },
  MATCHED: { color: '#7aab65', bg: '#e8f5e2', label: 'Matched' },
};

const navItems = [
  { id: 'partnerships', label: 'Partnerships', icon: Building2 },
  { id: 'pipeline', label: 'Pipeline', icon: LayoutGrid },
  { id: 'trade_intents', label: 'Trade Intents', icon: BarChart3 },
  { id: 'my_intents', label: 'My Intents', icon: Package },
  { id: 'proposals', label: 'Proposals', icon: Send },
  { id: 'deals', label: 'Deals', icon: Handshake },
  { id: 'commissions', label: 'Commissions', icon: Wallet },
  { id: 'meetings', label: 'Meetings', icon: CalendarClock },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'my_registrations', label: 'My Tickets', icon: Ticket },
];

/* ═══════════════════ GREEN-THEMED CSS (Updated) ═══════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

  :root {
    ${generateCSSVars(THEME)}
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; overflow: hidden; }

  .bp-app {
    font-family: 'DM Sans', 'Inter', system-ui, sans-serif;
    background:
      radial-gradient(ellipse at top left, var(--primary-cloud) 0%, transparent 50%),
      radial-gradient(ellipse at bottom right, var(--primary-mist) 0%, transparent 50%),
      radial-gradient(ellipse at center, var(--primary-sky) 0%, var(--white) 100%),
      linear-gradient(135deg, var(--white) 0%, var(--primary-cloud) 50%, var(--primary-mist) 100%);
    display: grid;
    grid-template-columns: 240px 1fr;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  .bp-app::before {
    content: '';
    position: fixed;
    top: -50%; right: -20%;
    width: 800px; height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(162, 203, 139, 0.15), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .bp-app::after {
    content: '';
    position: fixed;
    bottom: -50%; left: -20%;
    width: 800px; height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(197, 227, 179, 0.12), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--primary-light), var(--primary));
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--primary-bright), var(--primary-dark));
  }

  /* ═══════════════════ SIDEBAR ═══════════════════ */
  .sidebar {
    background: linear-gradient(180deg, var(--white) 0%, var(--primary-sky) 100%);
    backdrop-filter: blur(20px);
    border-right: 1px solid rgba(var(--primary-rgb), 0.15);
    padding: 20px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    z-index: 10;
    box-shadow: 4px 0 24px rgba(var(--primary-rgb), 0.06);
  }

  .sidebar::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 4px; height: 100%;
    background: linear-gradient(180deg, transparent, var(--primary), var(--primary-light), var(--primary), transparent);
    opacity: 0.3;
  }

  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 14px 10px 20px;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.15);
    margin-bottom: 12px;
    flex-shrink: 0;
    position: relative;
  }

  .brand-diamond {
    width: 56px; height: 56px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .brand-diamond::before {
    content: '';
    position: absolute;
    width: 44px; height: 44px;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    transform: rotate(45deg);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.3);
  }
  .brand-diamond::after {
    content: '';
    position: absolute;
    width: 20px; height: 20px;
    background: var(--white);
    transform: rotate(45deg);
    border-radius: 3px;
  }

  .brand-text {
    font-family: 'Inter', sans-serif;
    font-weight: 800; font-size: 15px;
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.02em;
    text-align: center;
  }
  .brand-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--text-muted);
    font-weight: 700;
    margin-top: 2px;
    text-align: center;
  }

  .nav { display: flex; flex-direction: column; gap: 3px; flex-shrink: 0; }
  .nav-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--text-muted);
    padding: 12px 12px 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    color: var(--text-med);
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
  }
  .nav-item::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.08), rgba(var(--primary-light-rgb), 0.08));
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .nav-item:hover {
    color: var(--primary-dark);
    transform: translateX(2px);
  }
  .nav-item:hover::before { opacity: 1; }
  .nav-item.active {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: var(--white);
    font-weight: 700;
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.35);
    transform: translateX(4px);
  }
  .nav-item.active::before { opacity: 0; }
  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; position: relative; z-index: 1; }
  .nav-item span { position: relative; z-index: 1; }

  .nav-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(var(--primary-rgb), 0.2), transparent);
    margin: 12px 8px;
  }

  .nav-stage {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    color: var(--text-light);
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s ease;
  }
  .nav-stage:hover {
    background: rgba(var(--primary-rgb), 0.06);
    color: var(--primary-dark);
    border-color: rgba(var(--primary-rgb), 0.1);
  }
  .nav-stage.active {
    background: rgba(var(--primary-rgb), 0.1);
    color: var(--primary-dark);
    border-color: rgba(var(--primary-rgb), 0.2);
    font-weight: 700;
  }

  .nav-stage-icon-box {
    width: 24px; height: 24px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .nav-stage-icon-box svg { width: 13px; height: 13px; }
  .nav-stage.active .nav-stage-icon-box {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
  }
  .nav-stage.active .nav-stage-icon-box svg { color: var(--white) !important; }

  .nav-stage-count {
    margin-left: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; font-weight: 700;
    color: var(--text-muted);
    padding: 2px 7px;
    background: rgba(var(--primary-rgb), 0.06);
    border-radius: 6px;
  }
  .nav-stage.active .nav-stage-count {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: var(--white);
  }

  .sidebar-foot {
    margin-top: auto;
    padding-top: 16px;
    flex-shrink: 0;
  }
  .profile-card {
    background: linear-gradient(135deg, var(--white) 0%, var(--primary-sky) 100%);
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    border-radius: 16px;
    padding: 14px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.08);
  }
  .profile-card::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 60px; height: 60px;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    opacity: 0.15;
  }
  .profile-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 12px;
  }
  .profile-avatar {
    width: 42px; height: 42px; border-radius: 12px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 800;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.35);
    position: relative;
  }
  .profile-avatar::after {
    content: '';
    position: absolute;
    bottom: -2px; right: -2px;
    width: 12px; height: 12px;
    background: var(--success);
    border: 2px solid var(--white);
    border-radius: 50%;
  }
  .profile-name {
    font-family: 'Inter', sans-serif;
    font-size: 12px; font-weight: 700;
    color: var(--text-dark);
    line-height: 1.2;
  }
  .profile-role {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; color: var(--text-light);
    display: flex; align-items: center; gap: 3px;
    font-weight: 600; margin-top: 2px;
  }
  .profile-role svg { width: 10px; height: 10px; color: var(--primary); }

  .profile-stats {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 6px; margin-bottom: 10px;
  }
  .profile-stat {
    background: rgba(var(--primary-rgb), 0.06);
    border-radius: 8px;
    padding: 8px 6px;
    text-align: center;
  }
  .profile-stat-val {
    font-family: 'Inter', sans-serif;
    font-size: 16px; font-weight: 800;
    color: var(--primary);
    line-height: 1;
  }
  .profile-stat-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 8px; color: var(--text-light);
    text-transform: uppercase; letter-spacing: 0.08em;
    font-weight: 700; margin-top: 3px;
  }

  .profile-rating {
    display: flex; align-items: center; justify-content: center; gap: 3px;
    padding: 6px 0;
    margin-bottom: 8px;
    border-top: 1px dashed rgba(var(--primary-rgb), 0.15);
    border-bottom: 1px dashed rgba(var(--primary-rgb), 0.15);
  }

  .logout-btn {
    width: 100%;
    background: transparent;
    border: 1px solid rgba(239,83,80,0.25);
    border-radius: 10px; padding: 8px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600;
    color: var(--danger);
    cursor: pointer; transition: all 0.2s ease;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .logout-btn:hover {
    background: rgba(239,83,80,0.08);
    border-color: rgba(239,83,80,0.4);
  }

  /* ═══════════════════ MAIN ═══════════════════ */
  .main {
    display: flex; flex-direction: column;
    height: 100vh; overflow: hidden; min-width: 0;
    background: transparent;
    position: relative;
    z-index: 1;
  }

  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; flex-shrink: 0;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.12);
    padding: 14px 28px;
    z-index: 20; min-height: 68px;
    box-shadow: 0 2px 20px rgba(var(--primary-rgb), 0.04);
  }
  .topbar-left {
    display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0;
  }
  .search {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    border-radius: 12px; padding: 10px 16px;
    flex: 1; max-width: 400px; min-width: 180px;
    color: var(--text-light);
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.04);
  }
  .search:focus-within {
    border-color: var(--primary);
    background: var(--white);
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.15);
  }
  .search input {
    border: none; background: transparent; outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    width: 100%; color: var(--text-dark);
  }
  .search input::placeholder { color: var(--text-muted); }

  .topbar-right {
    display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  }

  .icon-btn {
    width: 40px; height: 40px; border-radius: 12px;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    display: flex; align-items: center; justify-content: center;
    color: var(--primary-dark); cursor: pointer;
    position: relative;
    background: rgba(255,255,255,0.8);
    transition: all 0.2s ease; flex-shrink: 0;
  }
  .icon-btn:hover {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    border-color: transparent;
    color: var(--white);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.3);
  }
  .dot {
    position: absolute; top: 8px; right: 8px;
    width: 8px; height: 8px;
    border-radius: 50%; background: var(--danger);
    border: 2px solid var(--white);
    animation: pulse-dot 2s infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.15); }
  }

  .refresh-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 16px; border-radius: 12px;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    background: rgba(255,255,255,0.8);
    color: var(--primary-dark);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease;
  }
  .refresh-btn:hover {
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    border-color: var(--primary);
  }
  .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .add-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.25s ease;
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.35);
    position: relative;
    overflow: hidden;
  }
  .add-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--primary-bright), var(--primary));
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .add-btn > * { position: relative; z-index: 1; }
  .add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(var(--primary-rgb), 0.45);
  }
  .add-btn:hover::before { opacity: 1; }
  .add-btn:active { transform: translateY(0); }

  .main-scroll {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 24px 28px 48px;
    position: relative;
  }

  .greeting-hero {
    background: linear-gradient(135deg, var(--white) 0%, var(--primary-sky) 60%, var(--primary-mist) 100%);
    border-radius: 24px;
    padding: 28px 32px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    box-shadow: 0 8px 32px rgba(var(--primary-rgb), 0.08);
  }
  .greeting-hero::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 200px; height: 200px;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    opacity: 0.1;
  }
  .greeting-hero::after {
    content: '';
    position: absolute;
    bottom: -50px; right: 100px;
    width: 150px; height: 150px;
    background: linear-gradient(135deg, var(--primary-mist), var(--primary-light));
    border-radius: 50%;
    opacity: 0.2;
    filter: blur(30px);
  }
  .greeting-inner {
    display: flex; align-items: center; gap: 20px;
    position: relative; z-index: 1;
  }
  .greeting-diamond {
    width: 64px; height: 64px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  .greeting-diamond::before {
    content: '';
    position: absolute;
    width: 52px; height: 52px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    transform: rotate(45deg);
    border-radius: 10px;
    box-shadow: 0 8px 28px rgba(var(--primary-rgb), 0.4);
  }
  .greeting-diamond::after {
    content: '';
    position: absolute;
    width: 24px; height: 24px;
    background: var(--white);
    transform: rotate(45deg);
    border-radius: 4px;
  }
  .greeting-text h1 {
    font-family: 'Inter', sans-serif;
    font-weight: 800; font-size: 28px;
    color: var(--text-dark);
    margin: 0 0 4px;
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
  }
  .greeting-text p {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-med);
    font-weight: 500;
    display: flex; align-items: center; gap: 6px;
  }

  .kpi-row {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 16px; margin-bottom: 24px;
  }
  .kpi-card {
    background: linear-gradient(135deg, var(--white) 0%, var(--off-white) 100%);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    border-radius: 20px;
    padding: 22px;
    position: relative; overflow: hidden;
    cursor: default;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.06);
  }
  .kpi-card::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 80px;
    background: linear-gradient(135deg, var(--kpi-color, var(--primary)), transparent);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    opacity: 0.12;
  }
  .kpi-card::after {
    content: '';
    position: absolute;
    bottom: -20px; left: -20px;
    width: 100px; height: 100px;
    background: radial-gradient(circle, var(--kpi-color, var(--primary)), transparent 70%);
    opacity: 0.08;
    pointer-events: none;
  }
  .kpi-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(var(--primary-rgb), 0.15);
    border-color: var(--kpi-color, var(--primary));
  }
  .kpi-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
    background: linear-gradient(135deg, var(--kpi-color, var(--primary)), var(--kpi-color-dark, var(--primary-dark)));
    color: var(--white);
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    position: relative;
    z-index: 1;
  }
  .kpi-icon svg { width: 18px; height: 18px; }
  .kpi-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--text-light); margin-bottom: 6px;
  }
  .kpi-value {
    font-family: 'Inter', sans-serif;
    font-size: 32px; font-weight: 800;
    color: var(--text-dark);
    margin-bottom: 4px;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .kpi-delta {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 500;
    color: var(--text-light);
    display: flex; align-items: center; gap: 4px;
  }

  .panel {
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    border-radius: 24px;
    padding: 24px;
    display: flex; flex-direction: column;
    min-height: 0; flex: 1;
    box-shadow: 0 8px 32px rgba(var(--primary-rgb), 0.06);
  }
  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; flex-shrink: 0;
    flex-wrap: wrap; gap: 12px;
  }
  .panel-title {
    font-family: 'Inter', sans-serif;
    font-size: 20px; font-weight: 800;
    color: var(--text-dark);
    letter-spacing: -0.01em;
  }
  .panel-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--text-light);
    margin-top: 3px; font-weight: 500;
  }
  .panel-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    color: var(--primary);
    display: flex; align-items: center; gap: 4px; cursor: pointer;
    transition: all 0.2s ease;
    padding: 8px 14px; border-radius: 10px;
    background: rgba(var(--primary-rgb), 0.08);
  }
  .panel-link:hover {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
  }
  .panel-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

  /* ═══════════════════ KANBAN (Continued in next part due to length) ═══════════════════ */
  .kanban-board {
    display: flex; gap: 16px;
    overflow-x: auto; overflow-y: hidden;
    flex: 1; min-height: 0;
    padding-bottom: 8px;
    align-items: flex-start;
  }

  .kanban-column {
    min-width: 320px; width: 320px; flex-shrink: 0;
    display: flex; flex-direction: column;
    max-height: 100%;
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    border-radius: 20px;
    padding: 8px;
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.04);
  }
  .kanban-col-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; margin-bottom: 10px; flex-shrink: 0;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--white), var(--primary-sky));
    position: relative;
    overflow: hidden;
  }
  .kanban-col-header::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: var(--col-color);
    border-radius: 4px;
  }
  .kanban-col-title {
    display: flex; align-items: center; gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    color: var(--text-dark);
  }
  .kanban-stage-icon {
    width: 26px; height: 26px;
    border-radius: 8px;
    background: var(--col-color);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  }
  .kanban-stage-icon svg { width: 13px; height: 13px; color: var(--white); }

  .kanban-col-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; font-weight: 700;
    padding: 3px 9px; border-radius: 8px;
    background: var(--col-color);
    color: var(--white);
  }
  .kanban-col-add {
    width: 30px; height: 30px; border-radius: 10px;
    border: 1px dashed rgba(var(--primary-rgb), 0.3);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; background: rgba(var(--primary-rgb), 0.06);
    color: var(--primary-dark);
    transition: all 0.2s ease;
  }
  .kanban-col-add:hover {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    border-color: transparent;
    color: var(--white);
    transform: rotate(90deg);
  }

  .kanban-cards {
    display: flex; flex-direction: column; gap: 12px;
    min-height: 60px; flex: 1;
    overflow-y: auto; padding: 0 4px 6px;
  }

  /* Lead Card */
  .lead-card {
    background: var(--white);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    border-radius: 18px;
    padding: 0;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.06);
  }
  .lead-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 16px 40px rgba(var(--primary-rgb), 0.2);
    border-color: rgba(var(--primary-rgb), 0.3);
  }
  .lead-card-header {
    position: relative;
    padding: 18px 18px 14px;
    background: linear-gradient(135deg, var(--white) 0%, var(--primary-sky) 100%);
    overflow: hidden;
  }
  .lead-card-header::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 100px; height: 60px;
    background: linear-gradient(135deg, var(--card-color-light), var(--card-color));
    clip-path: polygon(100% 0, 30% 0, 100% 100%);
    opacity: 0.25;
  }
  .lead-card-header::after {
    content: '';
    position: absolute;
    bottom: -20px; left: -10px;
    width: 60px; height: 60px;
    background: linear-gradient(135deg, var(--card-color-light), var(--card-color));
    border-radius: 50%;
    opacity: 0.15;
    filter: blur(15px);
  }

  /* Bottom Wave for Lead Card */
  .lead-card-footer {
    background: linear-gradient(135deg, var(--primary-sky) 0%, var(--primary-cloud) 100%);
    padding: 14px 18px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative;
    overflow: hidden;
    margin-top: 8px;
  }
  .lead-card-footer::before {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 40px;
  }

  .lead-card-avatar-wrap {
    display: flex; align-items: center; justify-content: center;
    padding: 8px 0 14px;
    position: relative; z-index: 1;
  }
  .lead-card-diamond {
    width: 60px; height: 60px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .lead-card-diamond::before {
    content: '';
    position: absolute;
    width: 48px; height: 48px;
    background: linear-gradient(135deg, var(--card-color), var(--card-color-dark));
    transform: rotate(45deg);
    border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  .lead-card-initials {
    position: relative; z-index: 2;
    color: var(--white);
    font-family: 'Inter', sans-serif;
    font-size: 15px; font-weight: 800;
    letter-spacing: 0.02em;
  }
  .lead-card-name-block {
    text-align: center;
    padding: 0 8px;
    position: relative; z-index: 1;
  }
  .lead-card-company {
    font-family: 'Inter', sans-serif;
    font-size: 16px; font-weight: 800;
    color: var(--text-dark);
    line-height: 1.2;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }
  .lead-card-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .lead-card-divider-fancy {
    display: flex; align-items: center; justify-content: center;
    gap: 6px;
    padding: 12px 20px 4px;
  }
  .lead-card-divider-fancy::before,
  .lead-card-divider-fancy::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(var(--primary-rgb), 0.25), transparent);
  }
  .lead-card-divider-dot {
    width: 6px; height: 6px;
    background: var(--primary);
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
  }
  .lead-card-info {
    padding: 12px 18px 14px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .lead-info-row {
    display: flex; align-items: center; gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--text-med);
    font-weight: 500;
  }
  .lead-info-icon {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    display: flex; align-items: center; justify-content: center;
    color: var(--primary-dark);
    flex-shrink: 0;
  }
  .lead-info-icon svg { width: 12px; height: 12px; }
  .lead-info-text {
    flex: 1; min-width: 0;
    color: var(--text-dark);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .lead-card-badges-row {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 18px 8px;
    flex-wrap: wrap;
  }
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700;
    white-space: nowrap; flex-shrink: 0;
    letter-spacing: 0.02em;
  }
  .chip svg { width: 10px; height: 10px; }
  .chip.internal {
    background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
    color: #2E7D32;
    border: 1px solid rgba(46,125,50,0.2);
  }
  .chip.external {
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    color: var(--primary-dark);
    border: 1px solid rgba(var(--primary-rgb), 0.2);
  }
  .lead-tag {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 600;
    padding: 4px 10px; border-radius: 8px;
    white-space: nowrap;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .lead-tag svg { width: 9px; height: 9px; }
  .lead-tag.followup {
    background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
    color: #E65100;
    border: 1px solid rgba(230,81,0,0.2);
  }
  .lead-tag.overdue {
    background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
    color: #C62828;
    border: 1px solid rgba(198,40,40,0.2);
  }
  .lead-card-intent {
    margin: 8px 14px;
    padding: 12px 14px;
    background: linear-gradient(135deg, var(--primary-sky), var(--primary-cloud));
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    border-radius: 12px;
    display: flex; align-items: center; gap: 10px;
    transition: all 0.2s ease;
  }
  .lead-card-intent-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.25);
  }
  .lead-card-intent-icon svg { width: 13px; height: 13px; color: var(--white); }
  .lead-card-intent-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    color: var(--text-dark);
    flex: 1; min-width: 0;
    display: -webkit-box; -webkit-line-clamp: 1;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .lead-card-notes {
    margin: 4px 14px 8px;
    padding: 10px 14px;
    background: rgba(var(--primary-rgb), 0.04);
    border-left: 3px solid var(--primary);
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: var(--text-med);
    line-height: 1.5;
    font-style: italic;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }

  .lead-card-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: var(--text-light);
    display: flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,0.9);
    padding: 5px 10px;
    border-radius: 8px;
    font-weight: 600;
    position: relative; z-index: 1;
  }
  .lead-card-time svg { width: 10px; height: 10px; }
  .lead-card-actions {
    display: flex; gap: 6px;
    position: relative; z-index: 1;
  }
  .lead-action-btn {
    width: 32px; height: 32px; border-radius: 10px;
    border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    background: var(--white);
    color: var(--primary);
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.15);
  }
  .lead-action-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
  }
  .lead-action-btn.call {
    background: linear-gradient(135deg, var(--success), var(--success-dark));
    color: var(--white);
  }
  .lead-action-btn.email {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
  }
  .lead-action-btn.whatsapp {
    background: linear-gradient(135deg, var(--stage-contact), #00897B);
    color: var(--white);
  }
  .lead-card-id {
    position: absolute;
    top: 10px; right: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; font-weight: 700;
    color: var(--text-light);
    background: rgba(255,255,255,0.9);
    padding: 3px 8px;
    border-radius: 6px;
    z-index: 3;
    border: 1px solid rgba(var(--primary-rgb), 0.1);
    display: flex; align-items: center; gap: 3px;
  }
  .lead-card-id svg { width: 8px; height: 8px; }

  .kanban-empty {
    padding: 40px 16px; text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 500;
    color: var(--text-light);
    border: 2px dashed rgba(var(--primary-rgb), 0.15);
    border-radius: 16px;
    background: rgba(255,255,255,0.4);
  }
  .kanban-empty-icon {
    display: inline-flex;
    width: 48px; height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    align-items: center; justify-content: center;
    margin-bottom: 10px;
    opacity: 0.6;
  }
  .kanban-empty-icon svg { width: 22px; height: 22px; color: var(--primary-dark); }
  .kanban-empty-sub {
    font-size: 11px; color: var(--text-muted); margin-top: 6px;
    font-weight: 400;
  }

  /* ═══════════════════ INTENTS GRID ═══════════════════ */
  .intents-toolbar {
    display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .intents-filter-btn {
    padding: 8px 16px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s ease;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    background: var(--white);
    color: var(--text-med);
  }
  .intents-filter-btn:hover {
    border-color: var(--primary);
    color: var(--primary-dark);
  }
  .intents-filter-btn.active {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
  }

  .intents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding-bottom: 8px;
  }

  .intent-card {
    background: var(--white);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    border-radius: 18px;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.06);
  }
  .intent-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(var(--primary-rgb), 0.2);
    border-color: rgba(var(--primary-rgb), 0.3);
  }

  /* Bottom Wave for Intent Card */
  .intent-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 60px;
    background: linear-gradient(135deg, var(--primary-sky), var(--primary-cloud));
    opacity: 0.3;
    z-index: 0;
  }

  .intent-header {
    display: flex; align-items: flex-start; gap: 12px;
    margin-bottom: 14px;
    padding: 18px 18px 0;
    position: relative;
    z-index: 1;
  }
  .intent-type-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .intent-type-icon svg { width: 18px; height: 18px; color: var(--white); }
  .intent-type-icon.buy {
    background: linear-gradient(135deg, #64B5F6, #1976D2);
    box-shadow: 0 4px 12px rgba(25,118,210,0.3);
  }
  .intent-type-icon.sell {
    background: linear-gradient(135deg, #FFB74D, #F57C00);
    box-shadow: 0 4px 12px rgba(245,124,0,0.3);
  }
  .intent-header-text {
    flex: 1; min-width: 0;
  }
  .intent-title {
    font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 700;
    color: var(--text-dark);
    line-height: 1.3;
    margin-bottom: 3px;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .intent-category {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600;
    color: var(--text-light);
  }

  .intent-badges {
    display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;
    padding: 0 18px;
    position: relative;
    z-index: 1;
  }
  .intent-badge {
    padding: 3px 10px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.03em;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .intent-badge.type-buy {
    background: rgba(25,118,210,0.1);
    color: #1976D2;
  }
  .intent-badge.type-sell {
    background: rgba(245,124,0,0.1);
    color: #F57C00;
  }

  .intent-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 8px; margin-bottom: 14px;
    padding: 0 18px;
    position: relative;
    z-index: 1;
  }
  .intent-detail-box {
    background: linear-gradient(135deg, var(--primary-sky), var(--primary-cloud));
    border-radius: 10px;
    padding: 10px 12px;
  }
  .intent-detail-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; font-weight: 700;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }
  .intent-detail-value {
    font-family: 'Inter', sans-serif;
    font-size: 12px; font-weight: 700;
    color: var(--text-dark);
  }
  .intent-detail-value.highlight {
    color: var(--success-dark);
  }

  .intent-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 18px 18px;
    border-top: 1px solid rgba(var(--primary-rgb), 0.08);
    position: relative;
    z-index: 1;
  }
  .intent-creator {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: var(--text-light);
  }
  .intent-view-btn {
    padding: 6px 12px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; gap: 4px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.25);
  }
  .intent-view-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.35);
  }

  .intent-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 12px; margin-top: 20px;
  }
  .pagination-btn {
    width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid rgba(var(--primary-rgb), 0.2);
    background: var(--white);
    color: var(--primary-dark);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .pagination-btn:hover:not(:disabled) {
    background: var(--primary);
    color: var(--white);
    border-color: transparent;
  }
  .pagination-btn:disabled {
    opacity: 0.4; cursor: not-allowed;
  }
  .pagination-info {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    color: var(--text-dark);
  }

  /* ═══════════════════ EMPTY STATE ═══════════════════ */
  .empty-state {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 20px; gap: 16px;
    background: var(--white);
    border: 2px dashed rgba(var(--primary-rgb), 0.15);
    border-radius: 20px;
  }
  .empty-state-icon-box {
    width: 72px; height: 72px;
    border-radius: 20px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    display: flex; align-items: center; justify-content: center;
  }
  .empty-state-icon-box svg { width: 32px; height: 32px; color: var(--primary-dark); }
  .empty-state-title {
    font-family: 'Inter', sans-serif;
    font-size: 15px; font-weight: 700;
    color: var(--text-dark);
  }
  .empty-state-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--text-light);
    text-align: center;
  }

  /* ═══════════════════ LOADING / ERROR ═══════════════════ */
  .bp-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 20px; gap: 16px;
  }
  .bp-loading-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    color: var(--primary-dark);
  }
  .bp-error {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 20px; gap: 12px; text-align: center;
  }
  .bp-error-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    color: var(--danger);
    max-width: 400px;
  }
  .retry-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.3);
  }
  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.4);
  }

  /* ═══════════════════ MODAL ═══════════════════ */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 100;
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .modal-backdrop {
    position: absolute; inset: 0;
    background: rgba(26, 58, 26, 0.35);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .modal-content {
    position: relative; z-index: 1;
    background: linear-gradient(160deg, var(--white), var(--primary-sky));
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    border-radius: 24px;
    width: 100%; max-width: 540px; max-height: 88vh;
    overflow-y: auto;
    box-shadow: 0 32px 80px rgba(122, 171, 101, 0.25);
  }
  .modal-content::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 120px; height: 80px;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    clip-path: polygon(100% 0, 20% 0, 100% 100%);
    opacity: 0.15;
    border-radius: 24px 24px 0 0;
  }
  .modal-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 24px 24px 18px;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.1);
    position: relative;
    z-index: 1;
  }
  .modal-header h2 {
    font-family: 'Inter', sans-serif;
    font-size: 18px; font-weight: 800;
    color: var(--text-dark); margin: 0;
    letter-spacing: -0.01em;
  }
  .modal-header p {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--text-light);
    margin: 6px 0 0; font-weight: 500;
  }
  .modal-close {
    width: 34px; height: 34px; border-radius: 10px;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; background: var(--white);
    color: var(--text-light);
    transition: all 0.2s ease; flex-shrink: 0;
  }
  .modal-close:hover {
    background: var(--danger);
    border-color: var(--danger);
    color: var(--white);
  }
  .modal-body { padding: 18px 24px 24px; }
  .modal-section { margin-bottom: 20px; }
  .modal-section-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--primary); margin-bottom: 10px;
  }
  .modal-field {
    display: flex; align-items: center; gap: 12px; padding: 8px 0;
  }
  .modal-field-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .modal-field-icon svg { width: 15px; height: 15px; color: var(--primary-dark); }
  .modal-field-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; color: var(--text-light);
    font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  }
  .modal-field-value {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-dark); font-weight: 600;
    word-break: break-word;
  }
  .modal-notes {
    background: linear-gradient(135deg, var(--primary-sky), var(--primary-cloud));
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    border-radius: 12px; padding: 14px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--text-dark);
    line-height: 1.6; font-weight: 400;
  }
  .modal-actions {
    display: flex; gap: 8px; margin-top: 10px;
    padding-top: 14px;
    border-top: 1px solid rgba(var(--primary-rgb), 0.1);
  }
  .modal-action-link {
    flex: 1; display: flex; align-items: center;
    justify-content: center; gap: 6px;
    padding: 12px 14px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700; font-size: 12px;
    text-decoration: none;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
  }
  .modal-action-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.35);
  }

  /* Add Lead type list */
  .lead-type-list { display: flex; flex-direction: column; gap: 10px; }
  .lead-type-option {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 18px; border-radius: 16px;
    cursor: pointer; transition: all 0.25s ease;
    background: var(--white);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.05);
  }
  .lead-type-option:hover {
    background: linear-gradient(135deg, var(--white), var(--primary-sky));
    border-color: var(--primary);
    transform: translateX(4px);
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.15);
  }
  .lead-type-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .lead-type-icon svg { width: 22px; height: 22px; color: var(--primary-dark); }
  .lead-type-info { flex: 1; min-width: 0; }
  .lead-type-title {
    font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 700;
    color: var(--text-dark);
  }
  .lead-type-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    margin-top: 2px;
  }
  .lead-type-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; color: var(--text-light);
    margin-top: 4px; line-height: 1.4; font-weight: 400;
  }
  .lead-type-arrow { color: var(--primary); flex-shrink: 0; }

  /* Form */
  .form-group { margin-bottom: 14px; }
  .form-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    color: var(--text-dark); margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .form-label-required::after { content: ' *'; color: var(--danger); }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 11px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--text-dark); border-radius: 12px;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    background: var(--white);
    outline: none; transition: all 0.2s ease;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
  }
  .form-input::placeholder, .form-textarea::placeholder {
    color: var(--text-muted); font-weight: 400;
  }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; color: var(--text-light);
    margin-top: 4px;
  }
  .form-back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    color: var(--primary);
    background: rgba(var(--primary-rgb), 0.08); border: none; cursor: pointer;
    padding: 8px 14px; border-radius: 10px;
    margin-bottom: 14px; transition: all 0.2s ease;
  }
  .form-back-btn:hover {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
  }
  .form-submit-btn {
    width: 100%; padding: 13px;
    border-radius: 12px; border: none;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    cursor: pointer; margin-top: 8px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.25s ease;
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.35);
    letter-spacing: 0.02em;
  }
  .form-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(var(--primary-rgb), 0.45);
  }
  .form-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .form-error {
    background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
    border: 1px solid rgba(239,83,80,0.25);
    color: #C62828;
    padding: 10px 14px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }

  /* Intent type toggle */
  .intent-type-toggle {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; margin-bottom: 14px;
  }
  .intent-type-btn {
    padding: 12px; border-radius: 12px;
    border: 2px solid rgba(var(--primary-rgb), 0.15);
    background: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.2s ease;
    color: var(--text-med);
  }
  .intent-type-btn svg { width: 14px; height: 14px; }
  .intent-type-btn.active-buy {
    background: linear-gradient(135deg, #64B5F6, #1976D2);
    color: var(--white);
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(25,118,210,0.3);
  }
  .intent-type-btn.active-sell {
    background: linear-gradient(135deg, #FFB74D, #F57C00);
    color: var(--white);
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(245,124,0,0.3);
  }

  /* Toast */
  .bp-toast {
    position: fixed; top: 20px; right: 20px; z-index: 200;
    padding: 14px 20px; border-radius: 14px;
    display: flex; align-items: center; gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    max-width: 400px;
  }
  .bp-toast-success {
    background: linear-gradient(135deg, var(--success), var(--success-dark));
    color: var(--white);
    box-shadow: 0 12px 40px rgba(67,160,71,0.35);
  }
  .bp-toast-error {
    background: linear-gradient(135deg, var(--danger), var(--danger-dark));
    color: var(--white);
    box-shadow: 0 12px 40px rgba(229,57,53,0.35);
  }

  .scroll-top-btn {
    position: fixed; bottom: 28px; right: 28px;
    width: 48px; height: 48px; border-radius: 14px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    border: none;
    color: var(--white); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 24px rgba(var(--primary-rgb), 0.4); z-index: 50;
    transition: all 0.25s ease;
    opacity: 0; transform: translateY(10px); pointer-events: none;
  }
  .scroll-top-btn.visible {
    opacity: 1; transform: translateY(0); pointer-events: auto;
  }
  .scroll-top-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 32px rgba(var(--primary-rgb), 0.5);
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* Coming soon placeholder */
  .coming-soon {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 20px; gap: 16px; text-align: center;
    background: rgba(255,255,255,0.5);
    border-radius: 20px;
    border: 2px dashed rgba(var(--primary-rgb), 0.15);
  }
  .coming-soon-icon {
    width: 80px; height: 80px;
    border-radius: 24px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    display: flex; align-items: center; justify-content: center;
  }
  .coming-soon-icon svg { width: 36px; height: 36px; color: var(--primary-dark); }
  .coming-soon-title {
    font-family: 'Inter', sans-serif;
    font-size: 20px; font-weight: 800;
    color: var(--text-dark);
  }
  .coming-soon-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--text-light);
    max-width: 300px;
  }

  @media (max-width: 900px) {
    .kpi-row { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 720px) {
    .bp-app { grid-template-columns: 1fr; height: auto; }
    .sidebar {
      flex-direction: row; overflow-x: auto; overflow-y: hidden;
      border-right: none; border-bottom: 1px solid rgba(var(--primary-rgb), 0.15);
      height: auto; padding: 10px 12px; gap: 6px;
    }
    .sidebar::before { display: none; }
    .nav { flex-direction: row; gap: 3px; }
    .nav-item { white-space: nowrap; padding: 8px 10px; }
    .sidebar-foot, .brand, .nav-label, .nav-divider, .nav-stage { display: none; }
    .main { height: auto; overflow: visible; }
    .main-scroll { overflow: visible; padding: 16px 14px 40px; }
    .topbar { padding: 10px 14px; }
    .kanban-column { min-width: 280px; width: 280px; }
    .form-row { grid-template-columns: 1fr; }
    .kpi-row { grid-template-columns: 1fr 1fr; }
    .greeting-hero { padding: 20px; }
    .greeting-inner { flex-direction: column; text-align: center; }
    .intents-grid { grid-template-columns: 1fr; }
  }
`;

/* ══════════════════════════════════════════════════════════════ */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60));
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${diff}h ago`;
    const days = Math.floor(diff / 24);
    if (days === 1) return '1d ago';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

const formatFollowUp = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const target = new Date(d); target.setHours(0, 0, 0, 0);
    const diff = Math.floor((target - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, overdue: true };
    if (diff === 0) return { text: 'Today', overdue: false };
    if (diff === 1) return { text: 'Tomorrow', overdue: false };
    return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: false };
  } catch { return { text: dateStr, overdue: false }; }
};

const formatFullDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) : '—';

const fmtNumber = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n ?? 0);

const fmtCurrency = (n, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(n ?? 0);

const getInitials = (name) => {
  if (!name) return 'BP';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const getStageConfig = (stageId) => PIPELINE_STAGES.find(s => s.id === stageId);

/* ══════════════════════════════════════════════════════════════ */
// Due to message length limit, I'll continue in the next message with:
// - IntentCard component
// - All modals (Create Intent, Intent Detail, Lead Modal, Add Lead)
// - Toast component
// - Main Dashboard component

// Would you like me to continue with Part 2 of the dashboard file?/* ══════════════════════════════════════════════════════════════ */
/* Intent Card Component */
function IntentCard({ intent, onView }) {
  const isBuy = intent.intentType === 'BUY';
  const status = INTENT_STATUS[intent.status] || INTENT_STATUS.OPEN;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="intent-card"
      onClick={() => onView(intent)}
    >
      <div className="intent-header">
        <div className={`intent-type-icon ${isBuy ? 'buy' : 'sell'}`}>
          {isBuy ? <ShoppingCart /> : <Store />}
        </div>
        <div className="intent-header-text">
          <div className="intent-title">{intent.title}</div>
          <div className="intent-category">{intent.category}</div>
        </div>
      </div>

      <div className="intent-badges">
        <span className={`intent-badge ${isBuy ? 'type-buy' : 'type-sell'}`}>
          {isBuy ? 'BUY' : 'SELL'}
        </span>
        <span
          className="intent-badge"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      <div className="intent-grid">
        <div className="intent-detail-box">
          <div className="intent-detail-label">Quantity</div>
          <div className="intent-detail-value">
            {fmtNumber(intent.quantity)} {intent.unit}
          </div>
        </div>
        <div className="intent-detail-box">
          <div className="intent-detail-label">Price/Unit</div>
          <div className="intent-detail-value">
            {fmtCurrency(intent.pricePerUnit, intent.currency)}
          </div>
        </div>
        <div className="intent-detail-box">
          <div className="intent-detail-label">Total Value</div>
          <div className="intent-detail-value highlight">
            {fmtCurrency(intent.totalValue, intent.currency)}
          </div>
        </div>
        <div className="intent-detail-box">
          <div className="intent-detail-label">Expires</div>
          <div className="intent-detail-value">
            {formatFullDate(intent.expiresAt)}
          </div>
        </div>
      </div>

      <div className="intent-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="intent-creator">By {intent.createdByName || '—'}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {onRaiseProposal && (
            <button
              className="intent-view-btn"
              style={{ background: '#2e7d32', color: '#fff', border: 'none' }}
              onClick={(e) => { e.stopPropagation(); onRaiseProposal(intent); }}
            >
              Raise Proposal
            </button>
          )}
          <button
            className="intent-view-btn"
            onClick={(e) => { e.stopPropagation(); onView(intent); }}
          >
            <Eye size={11} /> View
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* Create Intent Modal */
function CreateIntentModal({ onClose, onSuccess, showToast }) {
  const [form, setForm] = useState({
    intentType: 'BUY',
    category: 'Wheat',
    title: '',
    description: '',
    quantity: '',
    unit: 'KG',
    pricePerUnit: '',
    currency: 'INR',
    expiresAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) return setError('Title is required');
    if (!form.quantity) return setError('Quantity is required');
    if (!form.pricePerUnit) return setError('Price per unit is required');
    if (!form.expiresAt) return setError('Expiry date is required');

    setLoading(true);
    try {
      const payload = {
        businessPartnerRequestType: 'CREATE_INTENT',
        franchiseId: 2,
        intentType: form.intentType,
        category: form.category,
        title: form.title,
        description: form.description,
        quantity: Number(form.quantity),
        unit: form.unit,
        pricePerUnit: Number(form.pricePerUnit),
        currency: form.currency,
        expiresAt: new Date(form.expiresAt).toISOString(),
      };

      await authenticatedFetch(
        `${BASE_URL}/cs-network/business-partner`,
        { method: 'POST', body: JSON.stringify(payload) }
      );

      showToast('Trade intent created successfully!', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create intent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Create Trade Intent</h2>
            <p>Post a buy or sell offer to the market</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="form-error">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Intent Type</label>
              <div className="intent-type-toggle">
                <button
                  type="button"
                  className={`intent-type-btn ${form.intentType === 'BUY' ? 'active-buy' : ''}`}
                  onClick={() => update('intentType', 'BUY')}
                >
                  <ShoppingCart /> BUY
                </button>
                <button
                  type="button"
                  className={`intent-type-btn ${form.intentType === 'SELL' ? 'active-sell' : ''}`}
                  onClick={() => update('intentType', 'SELL')}
                >
                  <Store /> SELL
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Title</label>
              <input
                className="form-input"
                placeholder="e.g. Premium Basmati Rice"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your trade intent..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label form-label-required">Quantity</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.quantity}
                  onChange={(e) => update('quantity', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select
                  className="form-select"
                  value={form.unit}
                  onChange={(e) => update('unit', e.target.value)}
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label form-label-required">Price/Unit</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 46"
                  value={form.pricePerUnit}
                  onChange={(e) => update('pricePerUnit', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  className="form-select"
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value)}
                >
                  <option value="INR">INR ₹</option>
                  <option value="USD">USD $</option>
                  <option value="AED">AED د.إ</option>
                  <option value="EUR">EUR €</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Expires At</label>
              <input
                className="form-input"
                type="datetime-local"
                min={getNowDateTimeString()}
                value={form.expiresAt}
                onChange={(e) => update('expiresAt', e.target.value)}
              />
            </div>

            <button type="submit" className="form-submit-btn" disabled={loading}>
              {loading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</>
                : <><CheckCircle2 size={15} /> Create Intent</>
              }
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* Intent Detail Modal */
function IntentDetailModal({ intent, onClose, onRaiseProposal }) {
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  useEffect(() => {
    if (!intent?.id) return;
    setLoadingProposals(true);
    authenticatedFetch(`${BASE_URL}/cs-network/member`, {
      method: 'POST',
      body: JSON.stringify({
        memberRequestType: 'FETCH_PROPOSALS_FOR_INTENT',
        tradeIntentId: Number(intent.id),
      }),
    })
      .then((data) => setProposals(data?.proposals || []))
      .catch((err) => console.warn('Fetch proposals error:', err))
      .finally(() => setLoadingProposals(false));
  }, [intent?.id]);

  if (!intent) return null;
  const isBuy = intent.intentType === 'BUY';
  const status = INTENT_STATUS[intent.status] || INTENT_STATUS.OPEN;

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span className={`intent-badge ${isBuy ? 'type-buy' : 'type-sell'}`}>
                {isBuy ? <ShoppingCart size={10} /> : <Store size={10} />}
                {intent.intentType}
              </span>
              <span
                className="intent-badge"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
            </div>
            <h2>{intent.title}</h2>
            <p>{intent.category}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          {intent.description && (
            <div className="modal-section">
              <div className="modal-section-title">Description</div>
              <div className="modal-notes">{intent.description}</div>
            </div>
          )}

          <div className="modal-section">
            <div className="modal-section-title">Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Quantity', value: `${fmtNumber(intent.quantity)} ${intent.unit}` },
                { label: 'Price/Unit', value: fmtCurrency(intent.pricePerUnit, intent.currency) },
                { label: 'Total Value', value: fmtCurrency(intent.totalValue, intent.currency) },
                { label: 'Expires', value: formatFullDate(intent.expiresAt) },
                { label: 'Created', value: formatFullDate(intent.createdAt) },
                { label: 'Currency', value: intent.currency || 'INR' },
              ].map((item) => (
                <div key={item.label} className="intent-detail-box">
                  <div className="intent-detail-label">{item.label}</div>
                  <div className="intent-detail-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Posted By</div>
            <div className="modal-field">
              <div className="modal-field-icon"><Users /></div>
              <div style={{ minWidth: 0 }}>
                <div className="modal-field-label">Creator</div>
                <div className="modal-field-value">{intent.createdByName || '—'}</div>
              </div>
            </div>
            {intent.franchiseName && (
              <div className="modal-field">
                <div className="modal-field-icon"><Building2 /></div>
                <div style={{ minWidth: 0 }}>
                  <div className="modal-field-label">Franchise</div>
                  <div className="modal-field-value">{intent.franchiseName}</div>
                </div>
              </div>
            )}
          </div>

          {/* Proposals for this Intent */}
          <div className="modal-section" style={{ marginTop: 16 }}>
            <div className="modal-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Received Proposals ({proposals.length})</span>
              {loadingProposals && <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />}
            </div>
            {loadingProposals ? (
              <div style={{ padding: 12, textAlign: 'center', color: '#64748B', fontSize: 12 }}>
                Loading proposals...
              </div>
            ) : proposals.length === 0 ? (
              <div style={{ padding: 12, textAlign: 'center', color: '#94A3B8', fontSize: 12, background: '#F8FAFC', borderRadius: 10 }}>
                No proposals received for this intent yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {proposals.map((prop) => (
                  <div key={prop.proposalId || prop.id} style={{
                    padding: 10, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{prop.proposerName || 'Proposer'}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {fmtCurrency(prop.offeredPrice || prop.pricePerUnit, intent.currency)}/unit · {prop.offeredQuantity || prop.quantity} {intent.unit}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      background: prop.status === 'ACCEPTED' ? '#DCFCE7' : '#FEF3C7',
                      color: prop.status === 'ACCEPTED' ? '#15803D' : '#B45309',
                    }}>
                      {prop.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {onRaiseProposal && (
            <div style={{ marginTop: 20 }}>
              <button
                className="form-submit-btn"
                onClick={() => {
                  onClose();
                  onRaiseProposal(intent);
                }}
              >
                Raise Proposal on this Intent
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* Lead Modal */
function LeadModal({ lead, currentStageId, stages, onClose }) {
  if (!lead) return null;
  const stage = stages.find(s => s.id === currentStageId);
  const followUp = formatFollowUp(lead.followUpDate);
  const isInternal = lead.leadType === 'INTERNAL';
  const StageIcon = stage?.IconComp;

  return (
    <div className="modal-overlay">
      <motion.div className="modal-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div className="modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <h2>{lead.companyName || lead.contactPerson}</h2>
              <span className={`chip ${isInternal ? 'internal' : 'external'}`}>
                {isInternal ? <Link2 /> : <Globe />}
                {lead.leadType}
              </span>
            </div>
            <p>{lead.contactPerson}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 999,
                background: 'linear-gradient(135deg, var(--primary-cloud), var(--primary-mist))',
                border: '1px solid rgba(var(--primary-rgb), 0.2)',
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 10, fontWeight: 700,
                color: stage?.color || 'var(--primary)',
              }}>
                {StageIcon && <StageIcon size={11} />}
                {stage?.label}
              </span>
              <span style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10, color: 'var(--text-light)', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <Hash size={10} /> {lead.id}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          {isInternal && lead.tradeIntentTitle && (
            <div className="modal-section">
              <div className="modal-section-title">Trade Intent</div>
              <div style={{
                background: 'linear-gradient(135deg, var(--primary-sky), var(--primary-cloud))',
                border: '1px solid rgba(var(--primary-rgb), 0.2)',
                borderRadius: 14, padding: 16,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Briefcase size={18} color="#FFF" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-dark)' }}>
                    {lead.tradeIntentTitle}
                  </div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>
                    Member: {lead.memberName || '—'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="modal-section">
            <div className="modal-section-title">Contact Information</div>
            {[
              { icon: <Users />, label: 'Contact Person', value: lead.contactPerson || '—' },
              { icon: <Phone />, label: 'Phone', value: lead.phone || '—' },
              { icon: <Mail />, label: 'Email', value: lead.email || '—' },
              { icon: <Building2 />, label: 'Company', value: lead.companyName || '—' },
            ].map((f, i) => (
              <div className="modal-field" key={i}>
                <div className="modal-field-icon">{f.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="modal-field-label">{f.label}</div>
                  <div className="modal-field-value">{f.value}</div>
                </div>
              </div>
            ))}
          </div>

          {followUp && (
            <div className="modal-section">
              <div className="modal-section-title">Follow-up</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                borderRadius: 12,
                background: followUp.overdue ? 'linear-gradient(135deg, #FFEBEE, #FFCDD2)' : 'linear-gradient(135deg, var(--primary-sky), var(--primary-cloud))',
                border: `1px solid ${followUp.overdue ? 'rgba(239,83,80,0.25)' : 'rgba(var(--primary-rgb), 0.2)'}`,
              }}>
                <Calendar size={15} style={{ color: followUp.overdue ? '#C62828' : 'var(--primary)', flexShrink: 0 }} />
                <span style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13, fontWeight: 700,
                  color: followUp.overdue ? '#C62828' : 'var(--text-dark)',
                }}>
                  {followUp.text}
                </span>
              </div>
            </div>
          )}

          {lead.notes && (
            <div className="modal-section">
              <div className="modal-section-title">Notes</div>
              <div className="modal-notes">{lead.notes}</div>
            </div>
          )}

          <div className="modal-actions">
            {[
              { href: `tel:${lead.phone}`, icon: <Phone size={13} />, text: 'Call', show: !!lead.phone },
              { href: `mailto:${lead.email}`, icon: <Mail size={13} />, text: 'Email', show: !!lead.email },
              { href: `https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}`, icon: <MessageSquare size={13} />, text: 'WhatsApp', target: '_blank', show: !!lead.phone },
            ].filter(a => a.show).map((a, i) => (
              <a key={i} href={a.href} target={a.target || '_self'} rel="noreferrer" className="modal-action-link">
                {a.icon} {a.text}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* Add Lead Modal */
function AddLeadModal({ onClose, onSuccess, showToast }) {
  const [step, setStep] = useState('choose');
  const [selectedType, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [externalForm, setExternalForm] = useState({ companyName: '', contactPerson: '', phone: '', email: '', title: '', description: '', quantity: '', unit: 'KG', pricePerUnit: '', currency: 'INR', intentType: 'BUY', category: 'AGRICULTURE', expiresAt: '', notes: '', followUpDate: '' });
  const [memberIntentForm, setMemberIntentForm] = useState({ memberId: '', title: '', description: '', quantity: '', unit: 'KG', pricePerUnit: '', currency: 'INR', intentType: 'SELL', category: 'AGRICULTURE', expiresAt: '', notes: '', followUpDate: '' });
  const [internalForm, setInternalForm] = useState({ memberId: '', tradeIntentId: '', notes: '', followUpDate: '' });

  // Franchise Member Search State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberSearchPage, setMemberSearchPage] = useState(0);
  const [memberSearchTotalPages, setMemberSearchTotalPages] = useState(1);
  const [memberSearchMessage, setMemberSearchMessage] = useState('');

  // Member Trade Intents State
  const [memberIntents, setMemberIntents] = useState([]);
  const [loadingIntents, setLoadingIntents] = useState(false);

  const loadMemberIntents = async (mId) => {
    if (!mId) { setMemberIntents([]); return; }
    setLoadingIntents(true);
    try {
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/business-partner`, {
        method: 'POST',
        body: JSON.stringify({ businessPartnerRequestType: 'FETCH_MEMBER_INTENTS', memberId: Number(mId) }),
      });
      const intents = data?.tradeIntents || data?.memberIntents || data?.intents || data?.content || (Array.isArray(data) ? data : []);
      setMemberIntents(intents);
    } catch (err) {
      console.error('FETCH_MEMBER_INTENTS error:', err);
      setMemberIntents([]);
    } finally { setLoadingIntents(false); }
  };

  const handleSearchMembers = async (query = memberSearchQuery, pageNum = 0) => {
    if (!query || !query.trim()) {
      setMemberSearchResults([]);
      setMemberSearchMessage('');
      return;
    }
    setSearchingMembers(true);
    setError('');
    try {
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/business-partner`, {
        method: 'POST',
        body: JSON.stringify({
          businessPartnerRequestType: 'FETCH_FRANCHISE_MEMBERS',
          search: query.trim(),
          page: pageNum,
          size: 10,
        }),
      });
      setMemberSearchResults(data?.franchiseMembers || []);
      setMemberSearchPage(data?.currentPage || 0);
      setMemberSearchTotalPages(data?.totalPages || 1);
      setMemberSearchMessage(data?.message || `${(data?.franchiseMembers || []).length} member(s) found.`);
    } catch (err) {
      console.error('FETCH_FRANCHISE_MEMBERS error:', err);
      setError(err.message || 'Failed to fetch franchise members');
    } finally {
      setSearchingMembers(false);
    }
  };

  useEffect(() => {
    if (!memberSearchQuery || !memberSearchQuery.trim()) {
      setMemberSearchResults([]);
      setMemberSearchMessage('');
      return;
    }
    const timer = setTimeout(() => {
      handleSearchMembers(memberSearchQuery, 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [memberSearchQuery]);

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setInternalForm(prev => ({ ...prev, memberId: String(member.id), tradeIntentId: '' }));
    setMemberIntentForm(prev => ({ ...prev, memberId: String(member.id) }));
    loadMemberIntents(member.id);
  };

  const handleClearSelectedMember = () => {
    setSelectedMember(null);
    setInternalForm(prev => ({ ...prev, memberId: '', tradeIntentId: '' }));
    setMemberIntentForm(prev => ({ ...prev, memberId: '' }));
    setMemberIntents([]);
  };

  const handleSelectType = (type) => { setSelected(type); setStep('form'); setError(''); };
  const handleBack = () => { setStep('choose'); setSelected(null); setError(''); };

  const formatExpiresAt = (d) => {
    if (!d) return undefined;
    if (d.includes('T')) return d;
    return `${d}T23:59:59Z`;
  };

  const buildPayload = () => {
    const rt = selectedType.id;
    if (rt === 'CREATE_EXTERNAL_LEAD') {
      return {
        businessPartnerRequestType: rt,
        companyName: externalForm.companyName,
        contactPerson: externalForm.contactPerson || undefined,
        phone: externalForm.phone,
        email: externalForm.email,
        notes: externalForm.notes || undefined,
        followUpDate: externalForm.followUpDate || undefined,
        intentType: externalForm.intentType,
        category: externalForm.category,
        title: externalForm.title,
        description: externalForm.description || undefined,
        quantity: Number(externalForm.quantity),
        unit: externalForm.unit || 'KG',
        pricePerUnit: Number(externalForm.pricePerUnit),
        currency: externalForm.currency || 'INR',
        expiresAt: formatExpiresAt(externalForm.expiresAt),
      };
    }
    if (rt === 'CREATE_TRADE_INTENT_FOR_MEMBER') {
      return {
        businessPartnerRequestType: rt,
        memberId: Number(memberIntentForm.memberId),
        intentType: memberIntentForm.intentType,
        category: memberIntentForm.category,
        title: memberIntentForm.title,
        description: memberIntentForm.description || undefined,
        quantity: Number(memberIntentForm.quantity),
        unit: memberIntentForm.unit || 'KG',
        pricePerUnit: Number(memberIntentForm.pricePerUnit),
        currency: memberIntentForm.currency || 'INR',
        expiresAt: formatExpiresAt(memberIntentForm.expiresAt),
      };
    }
    if (rt === 'CREATE_INTERNAL_LEAD') {
      return {
        businessPartnerRequestType: rt,
        memberId: Number(internalForm.memberId),
        tradeIntentId: internalForm.tradeIntentId ? Number(internalForm.tradeIntentId) : null,
        notes: internalForm.notes || undefined,
        followUpDate: internalForm.followUpDate || undefined,
      };
    }
    return null;
  };

  const validate = () => {
    const rt = selectedType.id;
    if (rt === 'CREATE_EXTERNAL_LEAD') {
      if (!externalForm.companyName.trim()) return 'Company Name is required';
      if (!externalForm.phone.trim() && !externalForm.email.trim()) return 'Phone or Email is required';
      if (!externalForm.title.trim()) return 'Title is required';
      if (!externalForm.quantity || Number(externalForm.quantity) <= 0) return 'Valid Quantity is required';
      if (!externalForm.pricePerUnit || Number(externalForm.pricePerUnit) <= 0) return 'Valid Price Per Unit is required';
    }
    if (rt === 'CREATE_TRADE_INTENT_FOR_MEMBER') {
      if (!memberIntentForm.memberId) return 'Member ID is required';
      if (!memberIntentForm.title.trim()) return 'Title is required';
      if (!memberIntentForm.quantity || Number(memberIntentForm.quantity) <= 0) return 'Valid Quantity is required';
      if (!memberIntentForm.pricePerUnit || Number(memberIntentForm.pricePerUnit) <= 0) return 'Valid Price Per Unit is required';
    }
    if (rt === 'CREATE_INTERNAL_LEAD') {
      if (!internalForm.memberId) return 'Member ID is required';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const ve = validate(); if (ve) { setError(ve); return; }
    setLoading(true);
    try {
      const payload = buildPayload();
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/business-partner`, { method: 'POST', body: JSON.stringify(payload) });
      showToast(data?.message || 'Lead created successfully!', 'success');
      onSuccess?.(data?.lead); onClose();
    } catch (err) { setError(err.message || 'Failed to create lead'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <motion.div className="modal-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div className="modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>{step === 'choose' ? 'Add New Lead' : selectedType?.title}</h2>
            <p>{step === 'choose' ? 'Choose the type of lead to add' : selectedType?.subtitle}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          {step === 'choose' && (
            <div className="lead-type-list">
              {LEAD_TYPES.map((type) => {
                const TypeIcon = type.IconComp;
                return (
                  <div key={type.id} className="lead-type-option" onClick={() => handleSelectType(type)}>
                    <div className="lead-type-icon"><TypeIcon /></div>
                    <div className="lead-type-info">
                      <div className="lead-type-title">{type.title}</div>
                      <div className="lead-type-subtitle" style={{ color: type.color }}>{type.subtitle}</div>
                      <div className="lead-type-desc">{type.description}</div>
                    </div>
                    <ChevronRight size={16} className="lead-type-arrow" />
                  </div>
                );
              })}
            </div>
          )}

          {step === 'form' && selectedType && (
            <form onSubmit={handleSubmit}>
              <button type="button" className="form-back-btn" onClick={handleBack}>
                <ArrowLeft size={13} /> Back
              </button>
              {error && (
                <div className="form-error"><AlertCircle size={14} /> {error}</div>
              )}

              {selectedType.id === 'CREATE_EXTERNAL_LEAD' && (<>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label form-label-required">Company Name</label>
                    <input className="form-input" placeholder="Noor Enterprises" value={externalForm.companyName} onChange={e => setExternalForm({ ...externalForm, companyName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input className="form-input" placeholder="John Smith" value={externalForm.contactPerson} onChange={e => setExternalForm({ ...externalForm, contactPerson: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" placeholder="+919876543210" value={externalForm.phone} onChange={e => setExternalForm({ ...externalForm, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" placeholder="john@abctrading.com" value={externalForm.email} onChange={e => setExternalForm({ ...externalForm, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label form-label-required">Intent Type</label>
                    <select className="form-input" value={externalForm.intentType} onChange={e => setExternalForm({ ...externalForm, intentType: e.target.value })}>
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={externalForm.category} onChange={e => setExternalForm({ ...externalForm, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c.toUpperCase()}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Title</label>
                  <input className="form-input" placeholder="Buy Premium Basmati Rice" value={externalForm.title} onChange={e => setExternalForm({ ...externalForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Looking to purchase 1000 kg of premium basmati rice..." value={externalForm.description} onChange={e => setExternalForm({ ...externalForm, description: e.target.value })} />
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  <div className="form-group">
                    <label className="form-label form-label-required">Quantity</label>
                    <input className="form-input" type="number" placeholder="1000" value={externalForm.quantity} onChange={e => setExternalForm({ ...externalForm, quantity: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Price/Unit</label>
                    <input className="form-input" type="number" step="0.01" placeholder="85.50" value={externalForm.pricePerUnit} onChange={e => setExternalForm({ ...externalForm, pricePerUnit: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input className="form-input" placeholder="KG" value={externalForm.unit} onChange={e => setExternalForm({ ...externalForm, unit: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <input className="form-input" placeholder="INR" value={externalForm.currency} onChange={e => setExternalForm({ ...externalForm, currency: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date (expiresAt)</label>
                  <input className="form-input" type="date" min={getTodayDateString()} value={externalForm.expiresAt} onChange={e => setExternalForm({ ...externalForm, expiresAt: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Interested in purchasing rice in bulk." value={externalForm.notes} onChange={e => setExternalForm({ ...externalForm, notes: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Follow-up Date</label>
                  <input className="form-input" type="date" min={getTodayDateString()} value={externalForm.followUpDate} onChange={e => setExternalForm({ ...externalForm, followUpDate: e.target.value })} />
                </div>
              </>)}

              {selectedType.id === 'CREATE_TRADE_INTENT_FOR_MEMBER' && (<>
                <div className="form-group">
                  <label className="form-label form-label-required">Franchise Member</label>
                  {selectedMember ? (
                    <div style={{ padding: '10px 12px', background: '#e8f5e2', border: '1px solid #a2cb8b', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1a3a1a' }}>
                          {selectedMember.fullName} <span style={{ color: '#4a7a4a', fontWeight: 'normal' }}>(ID: #{selectedMember.id})</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#2d5a2d' }}>
                          {selectedMember.companyName || selectedMember.whatsappNumber || selectedMember.email}
                        </div>
                      </div>
                      <button type="button" onClick={handleClearSelectedMember} style={{ background: 'none', border: 'none', color: '#e53935', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Change</button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          className="form-input"
                          name="memberSearchInputNoAutofill1"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck="false"
                          placeholder="Search member by Name, Phone, Company..."
                          value={memberSearchQuery}
                          onChange={e => setMemberSearchQuery(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchMembers(memberSearchQuery, 0); } }}
                        />
                        <button type="button" className="btn btn-secondary" onClick={() => handleSearchMembers(memberSearchQuery, 0)} disabled={searchingMembers}>
                          {searchingMembers ? 'Searching...' : 'Search'}
                        </button>
                      </div>
                      {memberSearchResults.length > 0 && (
                        <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '6px', background: '#fafafa', marginBottom: '8px' }}>
                          {memberSearchResults.map(m => (
                            <div key={m.id} onClick={() => handleSelectMember(m)} style={{ padding: '8px', background: '#fff', border: '1px solid #eee', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{m.fullName}</div>
                                <div style={{ fontSize: '11px', color: '#555' }}>{m.companyName ? `${m.companyName} • ` : ''}{m.whatsappNumber || m.email}</div>
                              </div>
                              <span style={{ fontSize: '11px', color: '#7aab65', fontWeight: 'bold' }}>Select</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label form-label-required">Intent Type</label>
                    <select className="form-input" value={memberIntentForm.intentType} onChange={e => setMemberIntentForm({ ...memberIntentForm, intentType: e.target.value })}>
                      <option value="SELL">SELL</option>
                      <option value="BUY">BUY</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={memberIntentForm.category} onChange={e => setMemberIntentForm({ ...memberIntentForm, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c.toUpperCase()}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Title</label>
                  <input className="form-input" placeholder="Premium Basmati Rice" value={memberIntentForm.title} onChange={e => setMemberIntentForm({ ...memberIntentForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="High-quality basmati rice available for bulk orders." value={memberIntentForm.description} onChange={e => setMemberIntentForm({ ...memberIntentForm, description: e.target.value })} />
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  <div className="form-group">
                    <label className="form-label form-label-required">Quantity</label>
                    <input className="form-input" type="number" placeholder="1000" value={memberIntentForm.quantity} onChange={e => setMemberIntentForm({ ...memberIntentForm, quantity: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Price/Unit</label>
                    <input className="form-input" type="number" step="0.01" placeholder="75.50" value={memberIntentForm.pricePerUnit} onChange={e => setMemberIntentForm({ ...memberIntentForm, pricePerUnit: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input className="form-input" placeholder="KG" value={memberIntentForm.unit} onChange={e => setMemberIntentForm({ ...memberIntentForm, unit: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <input className="form-input" placeholder="INR" value={memberIntentForm.currency} onChange={e => setMemberIntentForm({ ...memberIntentForm, currency: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date (expiresAt)</label>
                  <input className="form-input" type="date" min={getTodayDateString()} value={memberIntentForm.expiresAt} onChange={e => setMemberIntentForm({ ...memberIntentForm, expiresAt: e.target.value })} />
                </div>
              </>)}

              {selectedType.id === 'CREATE_INTERNAL_LEAD' && (<>
                <div className="form-group">
                  <label className="form-label form-label-required">Franchise Member</label>
                  {selectedMember ? (
                    <div style={{ padding: '10px 12px', background: '#e8f5e2', border: '1px solid #a2cb8b', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1a3a1a' }}>
                          {selectedMember.fullName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#2d5a2d' }}>
                          {selectedMember.companyName ? `${selectedMember.companyName} • ` : ''}
                          {selectedMember.whatsappNumber || selectedMember.email}
                        </div>
                        {(selectedMember.city || selectedMember.state || selectedMember.country) && (
                          <div style={{ fontSize: '10px', color: '#7aab65' }}>
                            📍 {[selectedMember.city, selectedMember.state, selectedMember.country].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={handleClearSelectedMember} style={{ background: 'none', border: 'none', color: '#e53935', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Change</button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          className="form-input"
                          name="memberSearchInputNoAutofill2"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck="false"
                          placeholder="Search member by Name, Phone, Company..."
                          value={memberSearchQuery}
                          onChange={e => setMemberSearchQuery(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchMembers(memberSearchQuery, 0); } }}
                        />
                        <button type="button" className="btn btn-secondary" onClick={() => handleSearchMembers(memberSearchQuery, 0)} disabled={searchingMembers}>
                          {searchingMembers ? 'Searching...' : 'Search'}
                        </button>
                      </div>
                      {memberSearchMessage && (
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>{memberSearchMessage}</div>
                      )}
                      {memberSearchResults.length > 0 && (
                        <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '6px', background: '#fafafa', marginBottom: '8px' }}>
                          {memberSearchResults.map(m => (
                            <div key={m.id} onClick={() => handleSelectMember(m)} style={{ padding: '8px', background: '#fff', border: '1px solid #eee', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{m.fullName}</div>
                                <div style={{ fontSize: '11px', color: '#555' }}>{m.companyName ? `${m.companyName} • ` : ''}{m.whatsappNumber || m.email}</div>
                                {(m.city || m.state || m.country) && (
                                  <div style={{ fontSize: '10px', color: '#888' }}>{[m.city, m.state, m.country].filter(Boolean).join(', ')}</div>
                                )}
                              </div>
                              <span style={{ fontSize: '11px', color: '#7aab65', fontWeight: 'bold' }}>Select</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Member's Trade Intent (Optional) {loadingIntents && <span style={{ color: '#7aab65', fontSize: '11px', fontWeight: 'normal' }}>Loading intents...</span>}
                  </label>
                  {loadingIntents ? (
                    <div style={{ padding: '10px', fontSize: '12px', color: '#666', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                      Fetching trade intents for member...
                    </div>
                  ) : memberIntents.length > 0 ? (
                    <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '6px', background: '#fafafa', marginBottom: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>Select an intent created by this member:</div>
                      {memberIntents.map(intent => {
                        const isSelected = String(internalForm.tradeIntentId) === String(intent.id);
                        return (
                          <div
                            key={intent.id}
                            onClick={() => setInternalForm(prev => ({ ...prev, tradeIntentId: isSelected ? '' : String(intent.id) }))}
                            style={{
                              padding: '8px 10px',
                              background: isSelected ? '#e8f5e2' : '#fff',
                              border: isSelected ? '2px solid #7aab65' : '1px solid #eee',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              marginBottom: '6px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#1a3a1a' }}>
                                <span style={{ padding: '2px 6px', background: intent.intentType === 'SELL' ? '#e3f2fd' : '#fff3e0', color: intent.intentType === 'SELL' ? '#1565c0' : '#e65100', borderRadius: '4px', fontSize: '10px', marginRight: '6px' }}>
                                  {intent.intentType || 'INTENT'}
                                </span>
                                {intent.title || intent.tradeIntentTitle || `Trade Intent`}
                                <span style={{ marginLeft: '4px', color: '#777', fontWeight: 'normal', fontSize: '11px' }}>#{intent.id}</span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                                {intent.category && <span>{intent.category} </span>}
                                {intent.quantity && <span>• {intent.quantity} {intent.unit || 'units'} {intent.pricePerUnit ? `@ ${intent.currency || 'INR'} ${intent.pricePerUnit}` : ''}</span>}
                              </div>
                            </div>
                            <span style={{ fontSize: '11px', color: isSelected ? '#2e7d32' : '#999', fontWeight: 'bold' }}>
                              {isSelected ? '✓ Selected' : 'Select'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : internalForm.memberId ? (
                    <div style={{ padding: '8px', fontSize: '11px', color: '#777', background: '#fafafa', borderRadius: '8px', border: '1px dashed #ccc', marginBottom: '6px' }}>
                      No active trade intents found for this member.
                    </div>
                  ) : null}
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Notes..." value={internalForm.notes} onChange={e => setInternalForm({ ...internalForm, notes: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Follow-up Date</label>
                  <input className="form-input" type="date" min={getTodayDateString()} value={internalForm.followUpDate} onChange={e => setInternalForm({ ...internalForm, followUpDate: e.target.value })} />
                </div>
              </>)}

              <button type="submit" className="form-submit-btn" disabled={loading}>
                {loading
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</>
                  : <><CheckCircle2 size={15} /> Create Lead</>
                }
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      className={`bp-toast bp-toast-${type}`}
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
    >
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* MAIN DASHBOARD COMPONENT */
/* ══════════════════════════════════════════════════════════════ */
export default function BusinessPartnerDashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('pipeline');
  const [activeStage, setActiveStage] = useState('all');

  // Pipeline state
  const [leads, setLeads] = useState({});
  const [stageCounts, setStageCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Intents state
  const [intents, setIntents] = useState([]);
  const [myIntents, setMyIntents] = useState([]);
  const [intentsLoading, setIntentsLoading] = useState(false);
  const [myIntentsLoading, setMyIntentsLoading] = useState(false);
  const [intentsError, setIntentsError] = useState('');
  const [intentPage, setIntentPage] = useState(0);
  const [intentTotalPages, setIntentTotalPages] = useState(1);
  const [intentFilter, setIntentFilter] = useState('ALL');
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [showCreateIntent, setShowCreateIntent] = useState(false);

  // Lead state
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLead, setShowAddLead] = useState(false);
  const [proposalIntent, setProposalIntent] = useState(null);
  const [toast, setToast] = useState(null);

  const scrollBtnRef = useRef(null);
  const didFetchRef = useRef(false);
  const requestRef = useRef(false);
  const loadedOnceRef = useRef(false);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getUserData() || {});

  useEffect(() => {
    fetchMyProfile()
      .then((res) => {
        if (res?.profile) {
          setUserProfile((prev) => ({ ...prev, ...res.profile }));
        }
      })
      .catch((err) => {
        console.warn('BP fetchMyProfile failed:', err);
      });
  }, []);

  const handleProfileUpdated = (updated) => {
    if (updated) {
      setUserProfile((prev) => ({ ...prev, ...updated }));
    }
  };

  const userData = userProfile;
  const showToast = (message, type = 'success') => setToast({ message, type });

  // ═══════════════ Fetch Pipeline ═══════════════
  const fetchPipeline = useCallback(async (isRefresh = false) => {
    if (requestRef.current) return;
    requestRef.current = true;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    if (!isRefresh) setError('');
    try {
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/business-partner`, {
        method: 'POST',
        body: JSON.stringify({ businessPartnerRequestType: 'FETCH_MY_PIPELINE' }),
      });
      if (data?.pipeline?.board) {
        setLeads(data.pipeline.board);
        setStageCounts(data.pipeline.stageCounts || {});
        loadedOnceRef.current = true; setError('');
      } else {
        const eb = {}; PIPELINE_STAGES.forEach(s => { eb[s.id] = []; });
        setLeads(eb); setStageCounts({});
        loadedOnceRef.current = true; setError('');
      }
    } catch (err) {
      if (loadedOnceRef.current) return;
      setError(err.message || 'Failed to load pipeline');
    } finally {
      requestRef.current = false;
      setLoading(false); setRefreshing(false);
    }
  }, []);

  // ═══════════════ Fetch Trade Intents ═══════════════
  const fetchIntents = useCallback(async (pg = 0) => {
    setIntentsLoading(true);
    setIntentsError('');
    try {
      const payload = {
        memberRequestType: 'FETCH_INTENT',
        page: pg,
        size: 12,
      };
      if (intentFilter !== 'ALL') payload.intentType = intentFilter;

      const data = await authenticatedFetch(
        `${BASE_URL}/cs-network/member`,
        { method: 'POST', body: JSON.stringify(payload) }
      );

      const content = data?.intents?.content || data?.intents || [];
      setIntents(Array.isArray(content) ? content : []);
      setIntentTotalPages(data?.intents?.totalPages || 1);
    } catch (err) {
      setIntentsError(err.message || 'Failed to load trade intents');
    } finally {
      setIntentsLoading(false);
    }
  }, [intentFilter]);

  // ═══════════════ Fetch My Intents ═══════════════
  const fetchMyIntents = useCallback(async () => {
    setMyIntentsLoading(true);
    try {
      const data = await authenticatedFetch(
        `${BASE_URL}/cs-network/member`,
        {
          method: 'POST',
          body: JSON.stringify({ memberRequestType: 'FETCH_MY_INTENT' }),
        }
      );
      const list =
        data?.myIntents?.content || data?.myIntents ||
        data?.intents?.content  || data?.intents   ||
        data?.content || (Array.isArray(data) ? data : []);
      setMyIntents(list);
    } catch (err) {
      console.error('My intents error:', err);
    } finally {
      setMyIntentsLoading(false);
    }
  }, []);

  // Initial pipeline fetch
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchPipeline();
  }, [fetchPipeline]);

  // Fetch intents when tab or filter changes
  useEffect(() => {
    if (activeNav === 'trade_intents') fetchIntents(intentPage);
  }, [activeNav, intentPage, fetchIntents]);

  useEffect(() => {
    if (activeNav === 'my_intents' || activeNav === 'proposals') fetchMyIntents();
  }, [activeNav, fetchMyIntents]);

  const handleLeadCreated = (newLead) => {
    if (newLead?.stage) {
      setLeads(prev => {
        const u = { ...prev };
        if (!u[newLead.stage]) u[newLead.stage] = [];
        u[newLead.stage] = [newLead, ...u[newLead.stage].filter(l => l.id !== newLead.id)];
        return u;
      });
      setStageCounts(prev => ({ ...prev, [newLead.stage]: (prev[newLead.stage] || 0) + 1 }));
    }
    setTimeout(() => fetchPipeline(true), 500);
  };

  const handleIntentCreated = () => {
    fetchIntents(0);
    setIntentPage(0);
    if (activeNav === 'my_intents') fetchMyIntents();
  };

  const getTotalLeads = () => Object.values(stageCounts).reduce((s, c) => s + c, 0);
  const filteredStages = activeStage === 'all' ? PIPELINE_STAGES : PIPELINE_STAGES.filter(s => s.id === activeStage);

  const filterLeads = (stageLeads) => {
    if (!searchQuery.trim()) return stageLeads;
    const q = searchQuery.toLowerCase();
    return stageLeads.filter(l =>
      (l.companyName || '').toLowerCase().includes(q) ||
      (l.contactPerson || '').toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q) ||
      (l.phone || '').includes(searchQuery) ||
      (l.tradeIntentTitle || '').toLowerCase().includes(q) ||
      (l.notes || '').toLowerCase().includes(q)
    );
  };

  const filteredIntents = intents.filter((intent) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (intent.title || '').toLowerCase().includes(q) ||
      (intent.category || '').toLowerCase().includes(q)
    );
  });

  const kpiData = [
    { label: 'Total Leads', value: getTotalLeads(), delta: `${PIPELINE_STAGES.length} stages`, icon: Users, color: THEME.primary, colorDark: THEME.primaryDark },
    { label: 'Active Deals', value: (stageCounts['CONTACTED'] || 0) + (stageCounts['QUALIFIED'] || 0) + (stageCounts['NEGOTIATION'] || 0), delta: 'In progress', icon: Handshake, color: THEME.stageContact, colorDark: '#00897B' },
    { label: 'Deals Won', value: stageCounts['CLOSED_WON'] || 0, delta: 'Closed successfully', icon: Trophy, color: THEME.success, colorDark: THEME.successDark },
    { label: 'Market Intents', value: intents.length, delta: 'Available now', icon: BarChart3, color: THEME.warning, colorDark: THEME.warningDark },
  ];

  const getPageTitle = () => {
    const item = navItems.find(n => n.id === activeNav);
    return item?.label || 'Dashboard';
  };

  return (
    <div className="bp-app">
      <style>{STYLES}</style>

      {/* Sidebar — inlined so CSS from STYLES applies with no issues */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand">
          <div className="brand-diamond" />
          <div>
            <div className="brand-text">CONNECT SOUQ</div>
            <div className="brand-sub">Business Partner</div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="nav">
          <div className="nav-label">Main Menu</div>
          {navItems.map((item) => {
            const NavIcon = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                {NavIcon && <NavIcon size={16} />}
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Pipeline Stages (shown when pipeline active) */}
        {activeNav === 'pipeline' && (
          <>
            <div className="nav-divider" />
            <div>
              <div className="nav-label">Pipeline Stages</div>
              <div
                className={`nav-stage ${activeStage === 'all' ? 'active' : ''}`}
                onClick={() => setActiveStage('all')}
              >
                <div className="nav-stage-icon-box" style={{ background: `${THEME.primary}20` }}>
                  <List style={{ color: THEME.primary }} size={14} />
                </div>
                <span style={{ flex: 1 }}>All Stages</span>
                <span className="nav-stage-count">{getTotalLeads()}</span>
              </div>
              {PIPELINE_STAGES.map((stage) => {
                const StageIcon = stage.IconComp;
                return (
                  <div
                    key={stage.id}
                    className={`nav-stage ${activeStage === stage.id ? 'active' : ''}`}
                    onClick={() => setActiveStage(stage.id)}
                  >
                    <div className="nav-stage-icon-box" style={{ background: `${stage.color}20` }}>
                      <StageIcon style={{ color: stage.color }} />
                    </div>
                    <span style={{ flex: 1 }}>{stage.label}</span>
                    <span className="nav-stage-count">{stageCounts[stage.id] || 0}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Profile Card */}
        <div className="sidebar-foot" style={{ marginTop: 'auto', paddingTop: 12 }}>
          <div
            className="profile-card cursor-pointer hover:border-emerald-400 transition"
            onClick={() => setProfileModalOpen(true)}
            title="Click to view / edit My Profile"
            style={{ cursor: 'pointer' }}
          >
            <div className="profile-header">
              {(() => {
                const photoSrc = resolvePhotoUrl(userData?.profilePhotoUrl || userData?.profilePicture);
                return photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={userData?.fullName || 'BP'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                    className="profile-avatar object-cover"
                    style={{ width: 36, height: 36, borderRadius: '50%' }}
                  />
                ) : (
                  <div className="profile-avatar">{(userData?.fullName || userData?.email || 'BP').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}</div>
                );
              })()}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="profile-name">{(userData?.fullName || userData?.email || 'PARTNER').toUpperCase()}</div>
                <div className="profile-role">
                  <ShieldCheck size={10} /> Verified Partner
                </div>
              </div>
            </div>
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-val">{stageCounts['CLOSED_WON'] || 0}</div>
                <div className="profile-stat-label">Won</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">{getTotalLeads()}</div>
                <div className="profile-stat-label">Leads</div>
              </div>
            </div>
            {onLogout && (
              <button className="logout-btn" onClick={onLogout}>
                <LogOut size={12} /> Logout
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="search">
              <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                placeholder={
                  activeNav === 'pipeline' ? 'Search leads…' :
                    activeNav === 'trade_intents' || activeNav === 'my_intents' ? 'Search intents by title or category…' :
                      'Search…'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, flexShrink: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="topbar-right">
            {activeNav === 'pipeline' && (
              <button className="refresh-btn" onClick={() => fetchPipeline(true)} disabled={refreshing}>
                <RefreshCw size={13} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            )}
            {activeNav === 'trade_intents' && (
              <button className="refresh-btn" onClick={() => fetchIntents(intentPage)} disabled={intentsLoading}>
                <RefreshCw size={13} style={intentsLoading ? { animation: 'spin 1s linear infinite' } : {}} />
                Refresh
              </button>
            )}

            {activeNav === 'pipeline' && (
              <button className="add-btn" onClick={() => setShowAddLead(true)}>
                <Plus size={15} /> Add Lead
              </button>
            )}


            <div className="icon-btn"><Filter size={16} /></div>

            <div className="icon-btn">
              <Bell size={16} />
              <span className="dot" />
            </div>

            <div className="profile-avatar" style={{ width: 40, height: 40, borderRadius: 12 }}>
              {getInitials(userData?.fullName || 'BP')}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="main-scroll"
          id="bp-main-scroll"
          onScroll={e => {
            if (scrollBtnRef.current) {
              e.target.scrollTop > 300
                ? scrollBtnRef.current.classList.add('visible')
                : scrollBtnRef.current.classList.remove('visible');
            }
          }}
        >
          {/* Greeting Hero & KPI Cards (only for pipeline & intents tabs) */}
          {['pipeline', 'trade_intents', 'my_intents'].includes(activeNav) && (
            <>
              <div className="greeting-hero">
                <div className="greeting-inner">
                  <div className="greeting-diamond" />
                  <div className="greeting-text">
                    <h1>{getPageTitle()} <Sparkles size={20} style={{ color: 'var(--primary)' }} /></h1>
                    <p>
                      <Target size={13} />
                      {activeNav === 'pipeline' && `${getTotalLeads()} leads across ${PIPELINE_STAGES.length} stages`}
                      {activeNav === 'trade_intents' && `Browse ${intents.length} live trade intents in the market`}
                      {activeNav === 'my_intents' && `${myIntents.length} intents you created`}
                      <Rocket size={13} />
                    </p>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="kpi-row">
                {kpiData.map(k => (
                  <div
                    className="kpi-card"
                    key={k.label}
                    style={{ '--kpi-color': k.color, '--kpi-color-dark': k.colorDark }}
                  >
                    <div className="kpi-icon">
                      <k.icon />
                    </div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value">{k.value}</div>
                    <div className="kpi-delta">
                      <ArrowUpRight size={12} /> {k.delta}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pipeline Tab */}
          {activeNav === 'pipeline' && (
            <>
              {loading && (
                <div className="bp-loading">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 size={32} style={{ color: 'var(--primary)' }} />
                  </motion.div>
                  <div className="bp-loading-text">Loading your pipeline…</div>
                </div>
              )}

              {error && !loading && (
                <div className="bp-error">
                  <AlertCircle size={28} style={{ color: 'var(--danger)' }} />
                  <div className="bp-error-text">{error}</div>
                  <button className="retry-btn" onClick={() => fetchPipeline()}>
                    <RefreshCw size={13} /> Try Again
                  </button>
                </div>
              )}

              {!loading && !error && (
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <div className="panel-title">
                        {activeStage === 'all' ? 'Deal Pipeline Board' : getStageConfig(activeStage)?.label}
                      </div>
                      <div className="panel-subtitle">
                        {searchQuery ? `Searching: "${searchQuery}"` : 'Click any card for details'}
                      </div>
                    </div>
                    <div className="panel-actions">
                      <div className="panel-link" onClick={() => setActiveStage('all')}>
                        View All <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>

                  <div className="kanban-board">
                    {filteredStages.map((stage) => {
                      const stageLeads = filterLeads(leads[stage.id] || []);
                      const StageIcon = stage.IconComp;
                      return (
                        <div className="kanban-column" key={stage.id}>
                          <div className="kanban-col-header" style={{ '--col-color': stage.color }}>
                            <div className="kanban-col-title">
                              <div className="kanban-stage-icon" style={{ background: stage.color }}>
                                <StageIcon />
                              </div>
                              {stage.label}
                              <span className="kanban-col-count" style={{ background: stage.color }}>
                                {stageLeads.length}
                              </span>
                            </div>
                            <button className="kanban-col-add" onClick={() => setShowAddLead(true)}>
                              <Plus size={13} />
                            </button>
                          </div>

                          <div className="kanban-cards">
                            <AnimatePresence>
                              {stageLeads.map((lead, li) => {
                                const isInternal = lead.leadType === 'INTERNAL';
                                const followUp = formatFollowUp(lead.followUpDate);
                                const companyInitials = getInitials(lead.companyName || lead.contactPerson);
                                return (
                                  <motion.div
                                    key={lead.id}
                                    className="lead-card"
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: li * 0.05, duration: 0.35 }}
                                    onClick={() => { setSelectedLead(lead); setSelectedStage(stage.id); }}
                                    style={{
                                      '--card-color': stage.color,
                                      '--card-color-light': stage.color,
                                      '--card-color-dark': stage.colorDark,
                                    }}
                                  >
                                    <div className="lead-card-id"><Hash /> {lead.id}</div>

                                    <div className="lead-card-header">
                                      <div className="lead-card-avatar-wrap">
                                        <div className="lead-card-diamond">
                                          <span className="lead-card-initials">{companyInitials}</span>
                                        </div>
                                      </div>
                                      <div className="lead-card-name-block">
                                        <div className="lead-card-company">{lead.companyName || lead.contactPerson}</div>
                                        {lead.companyName && lead.contactPerson && (
                                          <div className="lead-card-title">{lead.contactPerson}</div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="lead-card-divider-fancy">
                                      <div className="lead-card-divider-dot" />
                                    </div>

                                    <div className="lead-card-info">
                                      {lead.phone && (
                                        <div className="lead-info-row">
                                          <div className="lead-info-icon"><Phone /></div>
                                          <span className="lead-info-text">{lead.phone}</span>
                                        </div>
                                      )}
                                      {lead.email && (
                                        <div className="lead-info-row">
                                          <div className="lead-info-icon"><Mail /></div>
                                          <span className="lead-info-text">{lead.email}</span>
                                        </div>
                                      )}
                                      {isInternal && lead.memberName && (
                                        <div className="lead-info-row">
                                          <div className="lead-info-icon"><User /></div>
                                          <span className="lead-info-text">{lead.memberName}</span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="lead-card-badges-row">
                                      <span className={`chip ${isInternal ? 'internal' : 'external'}`}>
                                        {isInternal ? <Link2 /> : <Globe />}
                                        {isInternal ? 'Internal' : 'External'}
                                      </span>
                                      {followUp && (
                                        <span className={`lead-tag ${followUp.overdue ? 'overdue' : 'followup'}`}>
                                          <Calendar /> {followUp.text}
                                        </span>
                                      )}
                                    </div>

                                    {isInternal && lead.tradeIntentTitle && (
                                      <div className="lead-card-intent">
                                        <div className="lead-card-intent-icon"><Briefcase /></div>
                                        <span className="lead-card-intent-text">{lead.tradeIntentTitle}</span>
                                      </div>
                                    )}

                                    {lead.notes && <div className="lead-card-notes">{lead.notes}</div>}

                                    <div className="lead-card-footer">
                                      <div className="lead-card-time">
                                        <Clock /> {formatDate(lead.updatedAt)}
                                      </div>
                                      <div className="lead-card-actions">
                                        {lead.phone && (
                                          <button className="lead-action-btn call" title="Call"
                                            onClick={e => { e.stopPropagation(); window.location.href = `tel:${lead.phone}`; }}>
                                            <Phone size={13} />
                                          </button>
                                        )}
                                        {lead.email && (
                                          <button className="lead-action-btn email" title="Email"
                                            onClick={e => { e.stopPropagation(); window.location.href = `mailto:${lead.email}`; }}>
                                            <Mail size={13} />
                                          </button>
                                        )}
                                        {lead.phone && (
                                          <button className="lead-action-btn whatsapp" title="WhatsApp"
                                            onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank'); }}>
                                            <MessageSquare size={13} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>

                            {stageLeads.length === 0 && (
                              <div className="kanban-empty">
                                <div className="kanban-empty-icon"><StageIcon /></div>
                                {searchQuery ? 'No matching leads' : 'No leads yet'}
                                <div className="kanban-empty-sub">
                                  {searchQuery ? 'Try a different search' : 'Add your first lead to get started'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Trade Intents Tab */}
          {activeNav === 'trade_intents' && (
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Trade Intents Market</div>
                  <div className="panel-subtitle">
                    Live trade opportunities • Click any card for details
                  </div>
                </div>
                <div className="panel-actions">
                  <div className="intents-toolbar" style={{ margin: 0 }}>
                    {['ALL', 'BUY', 'SELL'].map((type) => (
                      <button
                        key={type}
                        className={`intents-filter-btn ${intentFilter === type ? 'active' : ''}`}
                        onClick={() => { setIntentFilter(type); setIntentPage(0); }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {intentsLoading ? (
                <div className="bp-loading">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 size={32} style={{ color: 'var(--primary)' }} />
                  </motion.div>
                  <div className="bp-loading-text">Loading market intents…</div>
                </div>
              ) : intentsError ? (
                <div className="bp-error">
                  <AlertCircle size={28} style={{ color: 'var(--danger)' }} />
                  <div className="bp-error-text">{intentsError}</div>
                  <button className="retry-btn" onClick={() => fetchIntents(intentPage)}>
                    <RefreshCw size={13} /> Try Again
                  </button>
                </div>
              ) : filteredIntents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon-box"><Package /></div>
                  <div className="empty-state-title">
                    {searchQuery ? 'No matching intents' : 'No trade intents available'}
                  </div>
                  <div className="empty-state-desc">
                    {searchQuery ? 'Try a different search' : 'Be the first to post a trade intent!'}
                  </div>
                </div>
              ) : (
                <>
                  <div className="intents-grid">
                    <AnimatePresence mode="popLayout">
                      {filteredIntents.map((intent) => (
                        <IntentCard
                          key={intent.id}
                          intent={intent}
                          onView={setSelectedIntent}
                          onRaiseProposal={setProposalIntent}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {intentTotalPages > 1 && (
                    <div className="intent-pagination">
                      <button
                        className="pagination-btn"
                        onClick={() => setIntentPage((p) => Math.max(0, p - 1))}
                        disabled={intentPage === 0}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="pagination-info">
                        Page {intentPage + 1} of {intentTotalPages}
                      </span>
                      <button
                        className="pagination-btn"
                        onClick={() => setIntentPage((p) => Math.min(intentTotalPages - 1, p + 1))}
                        disabled={intentPage >= intentTotalPages - 1}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          {/* Proposals Tab (Received & Sent) */}
          {activeNav === 'proposals' && (
            <ProposalsTab
              myIntents={myIntents}
              myIntentsLoading={myIntentsLoading}
              onRefreshMyIntents={fetchMyIntents}
            />
          )}

          {/* My Intents & Received Proposals Tab */}
          {activeNav === 'my_intents' && (
            <ReceivedProposalsContent
              myIntents={myIntents}
              myIntentsLoading={myIntentsLoading}
              onRefreshMyIntents={fetchMyIntents}
            />
          )}

          {/* Meetings Tab */}
          {activeNav === 'meetings' && <MeetingsTab />}

          {/* Strategic Partnerships Tab */}
          {activeNav === 'partnerships' && <PartnershipsTab />}

          {/* Events Tab */}
          {activeNav === 'events' && <EventsTab />}

          {/* My Registrations / Tickets Tab */}
          {activeNav === 'my_registrations' && <MyRegistrationsTab />}

          {/* Other Tabs (Coming Soon) */}
          {['my_leads', 'deals', 'commissions'].includes(activeNav) && (
            <div className="coming-soon">
              <div className="coming-soon-icon">
                {activeNav === 'my_leads' && <Users />}
                {activeNav === 'deals' && <Handshake />}
                {activeNav === 'commissions' && <Wallet />}
              </div>
              <div className="coming-soon-title">{getPageTitle()} — Coming Soon</div>
              <div className="coming-soon-desc">
                This feature is under development. Check back soon!
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedLead && (
          <LeadModal
            lead={selectedLead}
            currentStageId={selectedStage}
            stages={PIPELINE_STAGES}
            onClose={() => { setSelectedLead(null); setSelectedStage(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedIntent && (
          <IntentDetailModal
            intent={selectedIntent}
            onClose={() => setSelectedIntent(null)}
            onRaiseProposal={setProposalIntent}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {proposalIntent && (
          <CreateProposalModal
            intent={proposalIntent}
            onClose={() => setProposalIntent(null)}
            onSuccess={() => {
              showToast?.('Proposal submitted successfully!', 'success');
              setProposalIntent(null);
            }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddLead && (
          <AddLeadModal
            onClose={() => setShowAddLead(false)}
            onSuccess={handleLeadCreated}
            showToast={showToast}
          />
        )}
      </AnimatePresence>



      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <button
        ref={scrollBtnRef}
        className="scroll-top-btn"
        onClick={() => document.getElementById('bp-main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* My Profile Modal */}
      <MyProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
}