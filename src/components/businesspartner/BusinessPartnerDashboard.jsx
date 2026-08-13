import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search, Bell, Plus, Filter, X, RefreshCw,
  Sparkles, Target, Rocket, Users, Handshake,
  Wallet, CalendarClock, BarChart3, ArrowUpRight,
  Loader2, AlertCircle, Trophy, Package, Ticket,
  FileText, Inbox, MessageSquare, Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authenticatedFetch, getUserData } from '../../api/auth';
import { fetchMyPipeline } from '../../api/businessPartnerApi';
import { fetchMyProfile, resolvePhotoUrl } from '../../api/profileOperationsApi';
import MyProfileModal from '../profile/MyProfileModal';

import BusinessPartnerSidebar from '../businesspartner/BusinessPartnerSidebar';
import BusinessPartnerPipeline from '../businesspartner/BusinessPartnerPipeline';
import BusinessPartnerIntents  from '../businesspartner/BusinessPartnerIntents';
import DirectoryTab            from '../directory/DirectoryTab';
import MeetingsTab             from '../meetings/MeetingsTab';
import PartnershipsTab         from '../partnerships/PartnershipsTab';
import { EventsTab }           from '../../screens/EventsComponents';
import MyRegistrationsTab      from '../../screens/MyRegistrationsTab';
import { AddLeadModal }        from '../businesspartner/modals/AddLeadModal';
import { Toast }               from '../businesspartner/common/Toast';
import { ProposalsTab, InboxTab, TradeChatScreen } from '../../screens/BuyerSellerDashboard';
import { BusinessPartnerCommissions } from './BusinessPartnerCommissions';
import { BusinessPartnerDeals }       from './BusinessPartnerDeals';
import TrustLeaderboardTab            from '../globalAdmin/tabs/TrustLeaderboardTab';


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
  { id: 'pipeline',         label: 'Pipeline',      icon: LayoutGrid    },
  { id: 'leaderboard',      label: 'Leaderboards', icon: Trophy        },
  { id: 'directory',        label: 'Directory',     icon: UsersIcon     },
  { id: 'partnerships',     label: 'Partnerships',  icon: Building2     },
  { id: 'proposals',        label: 'Proposals',     icon: FileText      },
  { id: 'inbox',            label: 'Inbox',         icon: MessageSquare },
  { id: 'deals',            label: 'Deals',         icon: HandshakeIcon },
  { id: 'commissions',      label: 'Commissions',   icon: WalletIcon    },
  { id: 'meetings',         label: 'Meetings',      icon: CalIcon       },
  { id: 'events',           label: 'Events',        icon: CalendarClock },
  { id: 'my_registrations', label: 'My Tickets',    icon: Ticket        },
];


export default function BusinessPartnerDashboard({ onLogout }) {
  /* ── Nav ── */
  const [activeNav,   setActiveNav]   = useState('pipeline');
  const [activeStage, setActiveStage] = useState('all');
  const [activeProposalLead, setActiveProposalLead] = useState(null);

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
  const [searchQuery,      setSearchQuery]      = useState('');
  const [toast,            setToast]            = useState(null);

  const scrollBtnRef  = useRef(null);
  const didFetchRef   = useRef(false);
  const requestRef    = useRef(false);
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

  const userData  = userProfile;
  const showToast = (message, type = 'success') => setToast({ message, type });

  /* ════════ Fetch Pipeline ════════ */
  const fetchPipeline = useCallback(async (isRefresh = false) => {
    if (requestRef.current) return;
    requestRef.current = true;
    if (isRefresh) setRefreshing(true);
    else if (!loadedOnceRef.current) setLoading(true);

    try {
      const data = await fetchMyPipeline();

      const grouped = {};
      const counts = {};
      PIPELINE_STAGES.forEach(s => { grouped[s.id] = []; counts[s.id] = 0; });

      // 1. Board Object Parsing
      const boardObj = data?.pipeline?.board || data?.board;
      let hasBoardLeads = false;
      if (boardObj && typeof boardObj === 'object' && !Array.isArray(boardObj)) {
        Object.keys(grouped).forEach(stage => {
          const arr = Array.isArray(boardObj[stage]) ? boardObj[stage] : [];
          grouped[stage] = arr;
          counts[stage] = arr.length;
          if (arr.length > 0) hasBoardLeads = true;
        });
      }

      // 2. Lead Array Parsing (fallback if board object wasn't provided or empty)
      if (!hasBoardLeads) {
        let rawLeads = [];
        if (Array.isArray(data?.pipeline?.leads)) {
          rawLeads = data.pipeline.leads;
        } else if (Array.isArray(data?.leads)) {
          rawLeads = data.leads;
        } else if (Array.isArray(data?.pipeline?.content)) {
          rawLeads = data.pipeline.content;
        } else if (Array.isArray(data?.pipeline)) {
          rawLeads = data.pipeline;
        } else if (Array.isArray(data?.content)) {
          rawLeads = data.content;
        } else if (Array.isArray(data?.data)) {
          rawLeads = data.data;
        } else if (Array.isArray(data)) {
          rawLeads = data;
        }

        rawLeads.forEach(lead => {
          const st = lead.stage || lead.leadStage || 'NEW_LEAD';
          if (!grouped[st]) grouped[st] = [];
          grouped[st].push(lead);
          counts[st] = (counts[st] || 0) + 1;
        });
      }

      setLeads(grouped);
      setStageCounts(counts);
      loadedOnceRef.current = true;
      setError('');
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
      setMyIntents(Array.isArray(list) ? list : []);
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
    if (activeNav === 'my_intents' || activeNav === 'proposals') fetchMyIntents();
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
        setActiveNav={(navId) => {
          setActiveProposalLead(null);
          setActiveNav(navId);
        }}
        activeStage={activeStage}
        setActiveStage={setActiveStage}
        stageCounts={stageCounts}
        getTotalLeads={getTotalLeads}
        userData={userData}
        onLogout={onLogout}
        onOpenProfile={() => setProfileModalOpen(true)}
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
                    : activeNav === 'my_intents'
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


            {/* Add buttons */}
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
            <div
              className="profile-avatar cursor-pointer hover:scale-105 transition"
              onClick={() => setProfileModalOpen(true)}
              title="Click to view / edit My Profile"
              style={{ width:40, height:40, borderRadius:12, cursor: 'pointer', overflow: 'hidden' }}
            >
              {(() => {
                const photoSrc = resolvePhotoUrl(userData?.profilePhotoUrl || userData?.profilePicture);
                return photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={userData?.fullName || 'BP'}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(userData?.fullName || userData?.email || 'BP')
                );
              })()}
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
                  {activeNav === 'my_intents' &&
                    `${myIntents.length} intents you created`}
                  {!['pipeline','my_intents'].includes(activeNav) &&
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
              onBrowseLeadIntents={(lead) => {
                setActiveProposalLead(lead);
                setActiveNav('trade_intents');
              }}
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
              showToast={showToast}
              activeProposalLead={activeProposalLead}
              onClearProposalLead={() => setActiveProposalLead(null)}
              onSuccessProposal={() => {
                setActiveProposalLead(null);
                fetchPipeline(true);
              }}
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
            />
          )}

          {/* ══ Tab: Leaderboard ══ */}
          {activeNav === 'leaderboard' && (
            <TrustLeaderboardTab userRole="BUSINESS_PARTNER" />
          )}

          {/* ══ Tab: Partnerships ══ */}

          {activeNav === 'partnerships' && (
            <PartnershipsTab />
          )}

          {/* ══ Tab: Proposals ══ */}
          {activeNav === 'proposals' && (
            <ProposalsTab
              myIntents={myIntents}
              myIntentsLoading={myIntentsLoading}
              onRefreshMyIntents={fetchMyIntents}
            />
          )}

          {/* ══ Tab: Inbox ══ */}
          {activeNav === 'inbox' && (
            <InboxTab />
          )}

          {/* ══ Tab: Directory ══ */}
          {activeNav === 'directory' && (
            <DirectoryTab />
          )}

          {/* ══ Tab: Meetings ══ */}
          {activeNav === 'meetings' && (
            <MeetingsTab />
          )}

          {/* ══ Tab: Events ══ */}
          {activeNav === 'events' && (
            <EventsTab />
          )}

          {/* ══ Tab: My Tickets ══ */}
          {activeNav === 'my_registrations' && (
            <MyRegistrationsTab />
          )}

          {/* ══ Tab: Deals ══ */}
          {activeNav === 'deals' && (
            <BusinessPartnerDeals
              leads={leads}
              showToast={showToast}
              onNavigateToCommissions={() => setActiveNav('commissions')}
            />
          )}

          {/* ══ Tab: Commissions ══ */}
          {activeNav === 'commissions' && (
            <BusinessPartnerCommissions showToast={showToast} />
          )}

          {/* ── Coming Soon tabs ── */}
          {['my_leads'].includes(activeNav) && (
            <div className="coming-soon">
              <div className="coming-soon-icon">
                {activeNav === 'my_leads' && <Users />}
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

      {/* My Profile Modal */}
      <MyProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
}