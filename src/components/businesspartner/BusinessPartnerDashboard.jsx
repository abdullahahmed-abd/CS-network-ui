import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search, Bell, Plus, Filter, X, RefreshCw,
  Sparkles, Target, Rocket, Users, Handshake,
  Wallet, CalendarClock, BarChart3, ArrowUpRight,
  Loader2, AlertCircle, Trophy, Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authenticatedFetch, getUserData } from '../../api/auth';
import { fetchMyPipeline } from '../../api/businessPartnerApi';

import BusinessPartnerSidebar from '../businesspartner/BusinessPartnerSidebar';
import BusinessPartnerPipeline from '../businesspartner/BusinessPartnerPipeline';
import BusinessPartnerIntents  from '../businesspartner/BusinessPartnerIntents';
import DirectoryTab            from '../directory/DirectoryTab';
import { AddLeadModal }        from '../businesspartner/modals/AddLeadModal';
import { CreateIntentModal }   from '../businesspartner/modals/CreateIntentModal';
import { Toast }               from '../businesspartner/common/Toast';

import { THEME, PIPELINE_STAGES, NAV_ITEMS, BASE_URL } from '../constants/BpConstants';
import { getInitials } from '../../utils/BpHelpers';
import { BP_STYLES }   from '../../styles/BpStyles';

/* icons for nav items */
import {
  LayoutGrid, Package as PackageIcon,
  Users as UsersIcon, Handshake as HandshakeIcon,
  Wallet as WalletIcon, CalendarClock as CalIcon,
} from 'lucide-react';

const navItems = [
  { id: 'pipeline',      label: 'Pipeline',      icon: LayoutGrid    },
  { id: 'trade_intents', label: 'Trade Intents', icon: BarChart3     },
  { id: 'my_intents',    label: 'My Intents',    icon: PackageIcon   },
  { id: 'my_leads',      label: 'My Leads',      icon: UsersIcon     },
  { id: 'deals',         label: 'Deals',         icon: HandshakeIcon },
  { id: 'commissions',   label: 'Commissions',   icon: WalletIcon    },
  { id: 'meetings',      label: 'Meetings',      icon: CalIcon       },
];

export default function BusinessPartnerDashboard({ onLogout }) {
  /* ── Nav ── */
  const [activeNav,   setActiveNav]   = useState('pipeline');
  const [activeStage, setActiveStage] = useState('all');

  /* ── Pipeline ── */
  const [leads,       setLeads]       = useState({});
  const [stageCounts, setStageCounts] = useState({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [refreshing,  setRefreshing]  = useState(false);

  /* ── Intents ── */
  const [intents,         setIntents]         = useState([]);
  const [myIntents,       setMyIntents]       = useState([]);
  const [intentsLoading,  setIntentsLoading]  = useState(false);
  const [myIntentsLoading,setMyIntentsLoading]= useState(false);
  const [intentsError,    setIntentsError]    = useState('');
  const [intentPage,      setIntentPage]      = useState(0);
  const [intentTotalPages,setIntentTotalPages]= useState(1);
  const [intentFilter,    setIntentFilter]    = useState('ALL');

  /* ── Modals / UI ── */
  const [showAddLead,      setShowAddLead]      = useState(false);
  const [showCreateIntent, setShowCreateIntent] = useState(false);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [toast,            setToast]            = useState(null);

  const scrollBtnRef  = useRef(null);
  const didFetchRef   = useRef(false);
  const requestRef    = useRef(false);
  const loadedOnceRef = useRef(false);

  const userData  = getUserData() || {};
  const showToast = (message, type = 'success') => setToast({ message, type });

  /* ════════ Fetch Pipeline ════════ */
  const fetchPipeline = useCallback(async (isRefresh = false) => {
    if (requestRef.current) return;
    requestRef.current = true;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    if (!isRefresh) setError('');
    try {
      const data = await fetchMyPipeline();
      if (data?.pipeline?.board || data?.board) {
        setLeads(data?.pipeline?.board || data?.board);
        setStageCounts(data?.pipeline?.stageCounts || data?.stageCounts || {});
        loadedOnceRef.current = true;
        setError('');
      } else {
        const eb = {};
        PIPELINE_STAGES.forEach(s => { eb[s.id] = []; });
        setLeads(eb);
        setStageCounts({});
        loadedOnceRef.current = true;
        setError('');
      }
    } catch (err) {
      if (!loadedOnceRef.current) setError(err.message || 'Failed to load pipeline');
    } finally {
      requestRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ════════ Fetch Trade Intents ════════ */
  const fetchIntents = useCallback(async (pg = 0) => {
    setIntentsLoading(true);
    setIntentsError('');
    try {
      const payload = { memberRequestType: 'FETCH_INTENT', page: pg, size: 12 };
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

  /* ════════ Fetch My Intents ════════ */
  const fetchMyIntents = useCallback(async () => {
    setMyIntentsLoading(true);
    try {
      const data = await authenticatedFetch(
        `${BASE_URL}/cs-network/business-partner`,
        {
          method: 'POST',
          body: JSON.stringify({ businessPartnerRequestType: 'GET_MY_INTENTS' }),
        }
      );
      const content = data?.myIntents?.content || data?.intents?.content || data?.intents || [];
      setMyIntents(Array.isArray(content) ? content : []);
    } catch (err) {
      console.error('My intents error:', err);
    } finally {
      setMyIntentsLoading(false);
    }
  }, []);

  /* ════════ Effects ════════ */
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchPipeline();
  }, [fetchPipeline]);

  useEffect(() => {
    if (activeNav === 'trade_intents') fetchIntents(intentPage);
  }, [activeNav, intentPage, fetchIntents]);

  useEffect(() => {
    if (activeNav === 'my_intents') fetchMyIntents();
  }, [activeNav, fetchMyIntents]);

  /* ════════ Handlers ════════ */
  const handleLeadCreated = (newLead) => {
    if (newLead?.stage) {
      setLeads(prev => {
        const u = { ...prev };
        if (!u[newLead.stage]) u[newLead.stage] = [];
        u[newLead.stage] = [newLead, ...u[newLead.stage].filter(l => l.id !== newLead.id)];
        return u;
      });
      setStageCounts(prev => ({
        ...prev,
        [newLead.stage]: (prev[newLead.stage] || 0) + 1,
      }));
    }
    setTimeout(() => fetchPipeline(true), 500);
  };

  const handleIntentCreated = () => {
    fetchIntents(0);
    setIntentPage(0);
    if (activeNav === 'my_intents') fetchMyIntents();
  };

  /* ════════ Derived ════════ */
  const getTotalLeads = () =>
    Object.values(stageCounts).reduce((s, c) => s + c, 0);

  const getPageTitle = () =>
    navItems.find(n => n.id === activeNav)?.label || 'Dashboard';

  const kpiData = [
    {
      label: 'Total Leads',
      value: getTotalLeads(),
      delta: `${PIPELINE_STAGES.length} stages`,
      icon:  Users,
      color: THEME.primary,
      colorDark: THEME.primaryDark,
    },
    {
      label: 'Active Deals',
      value: (stageCounts['CONTACTED']   || 0)
           + (stageCounts['QUALIFIED']   || 0)
           + (stageCounts['NEGOTIATION'] || 0),
      delta: 'In progress',
      icon:  Handshake,
      color: THEME.stageContact,
      colorDark: '#00897B',
    },
    {
      label: 'Deals Won',
      value: stageCounts['CLOSED_WON'] || 0,
      delta: 'Closed successfully',
      icon:  Trophy,
      color: THEME.success,
      colorDark: THEME.successDark,
    },
    {
      label: 'Market Intents',
      value: intents.length,
      delta: 'Available now',
      icon:  BarChart3,
      color: THEME.warning,
      colorDark: THEME.warningDark,
    },
  ];

  /* ════════ Render ════════ */
  return (
    <div className="bp-app">
      <style>{BP_STYLES}</style>

      {/* ── Sidebar ── */}
      <BusinessPartnerSidebar
        navItems={navItems}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        activeStage={activeStage}
        setActiveStage={setActiveStage}
        stageCounts={stageCounts}
        getTotalLeads={getTotalLeads}
        userData={userData}
        onLogout={onLogout}
      />

      <main className="main">
        {/* ── Topbar ── */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="search">
              <Search size={16} style={{ color:'var(--text-muted)', flexShrink:0 }} />
              <input
                placeholder={
                  activeNav === 'pipeline'
                    ? 'Search leads…'
                    : ['trade_intents','my_intents'].includes(activeNav)
                    ? 'Search intents by title or category…'
                    : 'Search…'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background:'none', border:'none', cursor:'pointer',
                           color:'var(--text-muted)', padding:0, flexShrink:0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="topbar-right">
            {/* Refresh buttons */}
            {activeNav === 'pipeline' && (
              <button
                className="refresh-btn"
                onClick={() => fetchPipeline(true)}
                disabled={refreshing}
              >
                <RefreshCw
                  size={13}
                  style={refreshing ? { animation:'spin 1s linear infinite' } : {}}
                />
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            )}
            {activeNav === 'trade_intents' && (
              <button
                className="refresh-btn"
                onClick={() => fetchIntents(intentPage)}
                disabled={intentsLoading}
              >
                <RefreshCw
                  size={13}
                  style={intentsLoading ? { animation:'spin 1s linear infinite' } : {}}
                />
                Refresh
              </button>
            )}

            {/* Add buttons */}
            {activeNav === 'pipeline' && (
              <button className="add-btn" onClick={() => setShowAddLead(true)}>
                <Plus size={15} /> Add Lead
              </button>
            )}
            {['trade_intents','my_intents'].includes(activeNav) && (
              <button className="add-btn" onClick={() => setShowCreateIntent(true)}>
                <Plus size={15} /> New Intent
              </button>
            )}

            <div className="icon-btn"><Filter size={16} /></div>
            <div className="icon-btn">
              <Bell size={16} />
              <span className="dot" />
            </div>
            <div
              className="profile-avatar"
              style={{ width:40, height:40, borderRadius:12 }}
            >
              {getInitials(userData?.fullName || 'BP')}
            </div>
          </div>
        </div>

        {/* ── Main Scroll ── */}
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
          {/* Greeting Hero */}
          <div className="greeting-hero">
            <div className="greeting-inner">
              <div className="greeting-diamond" />
              <div className="greeting-text">
                <h1>
                  {getPageTitle()}
                  <Sparkles size={20} style={{ color:'var(--primary)' }} />
                </h1>
                <p>
                  <Target size={13} />
                  {activeNav === 'pipeline' &&
                    `${getTotalLeads()} leads across ${PIPELINE_STAGES.length} stages`}
                  {activeNav === 'trade_intents' &&
                    `Browse ${intents.length} live trade intents in the market`}
                  {activeNav === 'my_intents' &&
                    `${myIntents.length} intents you created`}
                  {!['pipeline','trade_intents','my_intents'].includes(activeNav) &&
                    'Manage your business efficiently'}
                  <Rocket size={13} />
                </p>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="kpi-row">
            {kpiData.map(k => (
              <div
                key={k.label}
                className="kpi-card"
                style={{ '--kpi-color': k.color, '--kpi-color-dark': k.colorDark }}
              >
                <div className="kpi-icon"><k.icon /></div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">{k.value}</div>
                <div className="kpi-delta">
                  <ArrowUpRight size={12} /> {k.delta}
                </div>
              </div>
            ))}
          </div>

          {/* ── Tab: Pipeline ── */}
          {activeNav === 'pipeline' && (
            <BusinessPartnerPipeline
              leads={leads}
              stageCounts={stageCounts}
              loading={loading}
              error={error}
              refreshing={refreshing}
              activeStage={activeStage}
              setActiveStage={setActiveStage}
              searchQuery={searchQuery}
              onFetchPipeline={fetchPipeline}
              onAddLead={() => setShowAddLead(true)}
              showToast={showToast}
            />
          )}

          {/* ── Tab: Trade Intents ── */}
          {activeNav === 'trade_intents' && (
            <BusinessPartnerIntents
              mode="market"
              intents={intents}
              loading={intentsLoading}
              error={intentsError}
              intentPage={intentPage}
              setIntentPage={setIntentPage}
              intentTotalPages={intentTotalPages}
              intentFilter={intentFilter}
              setIntentFilter={setIntentFilter}
              searchQuery={searchQuery}
              onRefresh={() => fetchIntents(intentPage)}
              onCreateIntent={() => setShowCreateIntent(true)}
            />
          )}

          {/* ── Tab: My Intents ── */}
          {activeNav === 'my_intents' && (
            <BusinessPartnerIntents
              mode="mine"
              intents={myIntents}
              loading={myIntentsLoading}
              error=""
              intentPage={0}
              setIntentPage={() => {}}
              intentTotalPages={1}
              intentFilter="ALL"
              setIntentFilter={() => {}}
              searchQuery={searchQuery}
              onRefresh={fetchMyIntents}
              onCreateIntent={() => setShowCreateIntent(true)}
            />
          )}

          {/* ══ Tab: Directory ══ */}
          {activeNav === 'directory' && (
            <DirectoryTab />
          )}

          {/* ── Coming Soon tabs ── */}
          {['my_leads','deals','commissions','meetings'].includes(activeNav) && (
            <div className="coming-soon">
              <div className="coming-soon-icon">
                {activeNav === 'my_leads'    && <Users />}
                {activeNav === 'deals'       && <Handshake />}
                {activeNav === 'commissions' && <Wallet />}
                {activeNav === 'meetings'    && <CalendarClock />}
              </div>
              <div className="coming-soon-title">
                {getPageTitle()} — Coming Soon
              </div>
              <div className="coming-soon-desc">
                This feature is under development. Check back soon!
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ════════ Modals ════════ */}
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
        {showCreateIntent && (
          <CreateIntentModal
            onClose={() => setShowCreateIntent(false)}
            onSuccess={handleIntentCreated}
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

      {/* Scroll-to-top */}
      <button
        ref={scrollBtnRef}
        className="scroll-top-btn"
        onClick={() =>
          document.getElementById('bp-main-scroll')
            ?.scrollTo({ top: 0, behavior: 'smooth' })
        }
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  );
}