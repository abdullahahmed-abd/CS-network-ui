// ══════════════════════════════════════════════════════════
// App.jsx — Full updated version with Franchise Operator Dashboard
// ══════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from 'react';
import AuthCard from '../../components/AuthCard';
import UserFormScreen from '../../components/UserFormScreen';
import BusinessPartnerDashboard from '../../components/businesspartner/BusinessPartnerDashboard';
import BusinessPartnerStatusModal from '../../components/businesspartner/BusinessPartnerStatusModal';
import BuyerSellerDashboard from '../../screens/BuyerSellerDashboard';
import PlansScreen from '../../screens/PlansScreen';
import PaymentSuccess from '../../screens/PaymentSuccessScreen';
import PaymentFailed from '../../screens/PaymentFailed';
import GlobalAdminDashboard from '../../components/globalAdmin/GlobalAdminDashboard';
import AcceptInvitationScreen from '../../screens/AcceptInvitationScreen';
import OperatorFormScreen from '../../screens/OperatorFormScreen';
import MasterOperatorDashboard from '../../components/masterOperator/MasterOperatorDashboard';
import FranchiseOperatorDashboard from '../../components/masterOperator/MasterOperatorDashboard'; // ✅ NEW

import {
  setItem, getItem, saveTokens, toBool,
  clearTokens, saveUserData, getUserData,
  removeItem, setSessionExpiredHandler,
  authenticatedFetch, getCookie,
} from '../../api/auth';
import { fetchMyProfile } from '../../api/profileOperationsApi';

const BASE_URL = 'https://connectsouq.sundukpay.com';

// ── BP status localStorage key ──
const BP_STATUS_KEY = 'bpApplicationStatus';
const BP_FRANCHISE_KEY = 'bpFranchiseName';

export default function App() {
  const [screen, setScreen] = useState('auth');
  const [booting, setBooting] = useState(true);
  const [resumeAuthFlow, setResumeAuthFlow] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [inviteData, setInviteData] = useState(null);

  // ── BP Modal state ──
  const [bpModalOpen, setBpModalOpen] = useState(false);
  const [bpStatus, setBpStatus] = useState(null);
  const [bpFranchiseName, setBpFranchiseName] = useState('');

  const didInit = useRef(false);

  // ─────────────────────────────────────────────────────────
  // ── Role → Screen mapping ──
  // ─────────────────────────────────────────────────────────
  const getScreenFromRoles = (roles = [], userDataParam = null) => {
    const user = userDataParam || getUserData() || {};
    if (!roles.length && !user?.isOperator && user?.membershipType !== 'OPERATOR') return 'auth';

    // Global Admin
    if (roles.includes('GLOBAL_ADMIN')) return 'global_admin_dashboard';

    // ── Operator check ──
    const isOperator =
      roles.includes('OPERATOR') ||
      roles.includes('MASTER_OPERATOR') ||
      roles.includes('GENERAL_OPERATOR') ||
      user?.isOperator === true ||
      user?.membershipType === 'OPERATOR';

    if (isOperator) {
      const fType = (
        user?.franchiseType ||
        (roles.includes('MASTER_OPERATOR') ? 'MASTER' : '')
      ).toUpperCase();

      // MASTER → Master Operator Dashboard
      if (fType === 'MASTER' || roles.includes('MASTER_OPERATOR')) {
        return 'master_operator_dashboard';
      }

      // GENERAL or SECTOR → Franchise Operator Dashboard (auto-detects inside)
      // fType can be 'GENERAL' or 'SECTOR'
      return 'franchise_operator_dashboard'; // ✅ NEW unified screen
    }

    if (roles.includes('BUSINESS_PARTNER')) return 'bp_dashboard';
    return 'buyer_seller_dashboard';
  };

  // ─────────────────────────────────────────────────────────
  // ── BP Status helpers ──
  // ─────────────────────────────────────────────────────────
  const saveBpStatus = (status, franchiseName = '') => {
    if (status) {
      setItem(BP_STATUS_KEY, status);
      setItem(BP_FRANCHISE_KEY, franchiseName || '');
    } else {
      removeItem(BP_STATUS_KEY);
      removeItem(BP_FRANCHISE_KEY);
    }
  };

  const clearBpStatus = () => {
    removeItem(BP_STATUS_KEY);
    removeItem(BP_FRANCHISE_KEY);
    setBpStatus(null);
    setBpFranchiseName('');
    setBpModalOpen(false);
  };

  const openBpModal = (status, franchiseName = '') => {
    if (!status) return;
    setBpStatus(status);
    setBpFranchiseName(franchiseName || getItem(BP_FRANCHISE_KEY) || '');
    setBpModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────
  // ── Session expired ──
  // ─────────────────────────────────────────────────────────
  const handleSessionExpired = () => {
    clearTokens();
    saveBpStatus(null);
    setResumeAuthFlow(null);
    setUserData(null);
    setSelectedRoles([]);
    setInviteData(null);
    setBpModalOpen(false);
    setBpStatus(null);
    setScreen('auth');
  };

  useEffect(() => {
    setSessionExpiredHandler(handleSessionExpired);
  }, []);

  // ─────────────────────────────────────────────────────────
  // ── App Init ──
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const params = new URLSearchParams(window.location.search);
    const currentPath = window.location.pathname;

    // ── Invitation link ──
    const inviteMatch = currentPath.match(/^\/invite\/(.+)$/);
    if (inviteMatch) {
      setItem('pendingInviteToken', inviteMatch[1]);
      window.history.replaceState({}, '', '/');
      setResumeAuthFlow('invite');
      setScreen('auth');
      setBooting(false);
      return;
    }

    // ── Payment success ──
    const isPaymentSuccess =
      currentPath === '/payment/success' ||
      currentPath === '/payment-success' ||
      params.get('payment') === 'success' ||
      params.get('paymentStatus') === 'success';

    if (isPaymentSuccess) {
      window.history.replaceState({}, '', '/');
      setItem('formFilled', 'true');
      setItem('planPurchased', 'true');
      setScreen('payment_success');
      setBooting(false);
      return;
    }

    // ── Payment failed ──
    const isPaymentFailed =
      currentPath === '/payment/failed' ||
      currentPath === '/payment-failed' ||
      currentPath === '/payment/cancelled' ||
      currentPath === '/payment/cancel' ||
      params.get('payment') === 'failed' ||
      params.get('payment') === 'cancelled' ||
      params.get('paymentStatus') === 'failed' ||
      params.get('paymentStatus') === 'cancelled';

    if (isPaymentFailed) {
      window.history.replaceState({}, '', '/');
      setScreen('payment_failed');
      setBooting(false);
      return;
    }

    // ── OAuth params ──
    const userId = params.get('userId') || params.get('userid');
    const phoneVerifiedRaw = params.get('phoneVerified') || params.get('verified');
    const formFilledRaw =
      params.get('isFormFill') || params.get('formFilled') ||
      params.get('fromFill') || params.get('formfill');
    const accessToken = params.get('accessToken') || params.get('access_token') || params.get('token');
    const refreshToken = params.get('refreshToken') || params.get('refresh_token') || params.get('refresh');
    const fullName = params.get('fullName');
    const email = params.get('email');
    const isOperatorRaw = params.get('isOperator');
    const membershipType = params.get('membershipType');
    const franchiseType = params.get('franchiseType');   // 'GENERAL' | 'SECTOR' | 'MASTER'
    const franchiseId = params.get('franchiseId');
    const bpAppStatus = params.get('businessPartnerApplicationStatus');
    const franchiseName = params.get('franchiseName') || '';

    const rolesArray = params.getAll('roles').length > 0
      ? params.getAll('roles')
      : (params.get('role') ? [params.get('role')] : []);

    const urlRoles = rolesArray
      .flatMap(r => r.split(','))
      .map(r => r.trim().toUpperCase())
      .filter(Boolean);

    const storedToken = getItem('accessToken');
    const hasOAuthData = userId || phoneVerifiedRaw !== null ||
      formFilledRaw !== null || accessToken || refreshToken;

    // ── CASE 1: No OAuth params (returning user / page refresh) ──
    if (!hasOAuthData) {
      const savedUser = getUserData() || {};
      const savedRoles = savedUser?.roles || [];
      const storedBpStatus = getItem(BP_STATUS_KEY);

      if (storedToken) {
        const formFilled = getItem('formFilled');
        if (formFilled === 'true') {
          setSelectedRoles(savedRoles);

          const isOperatorUser =
            savedRoles.includes('OPERATOR') ||
            savedRoles.includes('MASTER_OPERATOR') ||
            savedRoles.includes('GENERAL_OPERATOR') ||
            savedUser?.isOperator ||
            savedUser?.membershipType === 'OPERATOR';

          if (storedBpStatus === 'PENDING' && savedRoles.includes('MEMBER') && !isOperatorUser) {
            setScreen('auth');
          } else {
            setScreen(getScreenFromRoles(savedRoles, savedUser));
          }
        } else {
          setScreen('auth');
        }
      } else {
        setScreen('auth');
      }
      setBooting(false);
      return;
    }

    // ── CASE 2: Fresh OAuth redirect ──
    window.history.replaceState({}, '', window.location.pathname);

    const phoneVerified = phoneVerifiedRaw !== null ? toBool(phoneVerifiedRaw) : true;
    const formFilled = formFilledRaw !== null ? toBool(formFilledRaw) : true;

    if (userId) setItem('userId', userId);
    setItem('phoneVerified', String(phoneVerified));
    setItem('formFilled', String(formFilled));

    if (accessToken) saveTokens(accessToken, refreshToken || null);

    const savedUser = getUserData() || {};
    const savedRoles = savedUser?.roles || [];
    const finalRoles = urlRoles.length > 0 ? urlRoles : savedRoles;

    const isOperator = isOperatorRaw !== null
      ? toBool(isOperatorRaw)
      : (membershipType === 'OPERATOR' || savedUser?.isOperator || false);

    const user = {
      userId: userId || savedUser.userId || '',
      fullName: fullName || savedUser.fullName || '',
      email: email || savedUser.email || '',
      phoneVerified,
      formFilled,
      roles: finalRoles,
      isOperator,
      membershipType: membershipType || savedUser.membershipType || (isOperator ? 'OPERATOR' : ''),
      franchiseType: franchiseType || savedUser.franchiseType || '',
      franchiseId: franchiseId || savedUser.franchiseId || null,
    };

    if (userId || fullName || email || finalRoles.length || isOperator) saveUserData(user);
    if (finalRoles.length) setSelectedRoles(finalRoles);
    if (bpAppStatus) saveBpStatus(bpAppStatus, franchiseName);

    navigateTo(phoneVerified, formFilled, user, bpAppStatus, franchiseName);
  }, []);

  // ─────────────────────────────────────────────────────────
  // ── navigateTo ──
  // ─────────────────────────────────────────────────────────
  const navigateTo = (
    phoneVerified,
    formFilled,
    user = {},
    bpAppStatus = null,
    franchiseName = ''
  ) => {
    const pendingInvite = getItem('pendingInviteToken');
    const savedUser = getUserData() || {};

    if (!phoneVerified) {
      setResumeAuthFlow('signup_phone');
      setScreen('auth');

    } else if (phoneVerified && pendingInvite) {
      setScreen('accept_invitation');

    } else if (phoneVerified && !formFilled) {
      setUserData(user);
      setScreen('form');

    } else if (phoneVerified && formFilled) {
      const urlRoles = user?.roles || [];
      const savedRoles = savedUser?.roles || [];
      const finalRoles = urlRoles.length > 0 ? urlRoles : savedRoles;

      setSelectedRoles(finalRoles);

      const isOperatorUser =
        finalRoles.includes('OPERATOR') ||
        finalRoles.includes('MASTER_OPERATOR') ||
        finalRoles.includes('GENERAL_OPERATOR') ||
        user?.isOperator ||
        savedUser?.isOperator ||
        user?.membershipType === 'OPERATOR' ||
        savedUser?.membershipType === 'OPERATOR';

      if (bpAppStatus && finalRoles.includes('MEMBER') && !isOperatorUser) {
        if (bpAppStatus === 'PENDING') {
          setScreen('bp_pending');
          setTimeout(() => openBpModal('PENDING', franchiseName), 400);

        } else if (bpAppStatus === 'APPROVED') {
          const updatedRoles = [...new Set([...finalRoles, 'BUSINESS_PARTNER'])];
          setSelectedRoles(updatedRoles);
          saveUserData({ ...savedUser, roles: updatedRoles });
          setScreen('bp_dashboard');

          // Only show popup modal once if user wasn't ALREADY a Business Partner
          const wasAlreadyBp = savedRoles.includes('BUSINESS_PARTNER') || getItem('bpApprovalSeen') === 'true';
          if (!wasAlreadyBp) {
            setItem('bpApprovalSeen', 'true');
            setTimeout(() => openBpModal('APPROVED', franchiseName), 500);
          }

        } else if (bpAppStatus === 'REJECTED') {
          setScreen('bp_pending');
          setTimeout(() => openBpModal('REJECTED', franchiseName), 400);
        }
      } else {
        setScreen(getScreenFromRoles(finalRoles, user));
      }
    } else {
      setScreen('auth');
    }

    setBooting(false);
  };

  // ─────────────────────────────────────────────────────────
  // ── Refresh BP status from backend ──
  // ─────────────────────────────────────────────────────────
  const refreshBpStatus = useCallback(async () => {
    try {
      console.log('🔄 Checking BP Application Status from backend...');
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST',
        body: JSON.stringify({ memberRequestType: 'GET_BP_APPLICATION_STATUS' }),
      });

      console.log('📡 GET_BP_APPLICATION_STATUS raw response:', data);

      const rawStatus =
        data?.businessPartnerApplicationStatus ||
        data?.applicationStatus ||
        data?.bpApplicationStatus ||
        data?.bpStatus ||
        data?.status ||
        data?.data?.businessPartnerApplicationStatus ||
        data?.data?.applicationStatus ||
        data?.data?.status;

      const normStatus = rawStatus ? String(rawStatus).toUpperCase() : '';
      const newFranchiseName =
        data?.franchiseName ||
        data?.data?.franchiseName ||
        bpFranchiseName;

      const isApproved =
        normStatus === 'APPROVED' ||
        data?.roles?.includes('BUSINESS_PARTNER') ||
        data?.user?.roles?.includes('BUSINESS_PARTNER') ||
        data?.isApproved === true;

      const finalStatus = isApproved ? 'APPROVED' : (normStatus || bpStatus || 'PENDING');

      console.log('🎯 BP Status evaluated:', finalStatus, 'isApproved:', isApproved);

      saveBpStatus(finalStatus, newFranchiseName);
      setBpStatus(finalStatus);
      setBpFranchiseName(newFranchiseName);

      if (isApproved) {
        const savedUser = getUserData() || {};
        const updatedRoles = [...new Set([...(savedUser.roles || []), 'BUSINESS_PARTNER'])];
        saveUserData({ ...savedUser, roles: updatedRoles });
        setSelectedRoles(updatedRoles);
        setBpModalOpen(false);
        setScreen('bp_dashboard');
      }

      return finalStatus;
    } catch (err) {
      console.error('❌ BP status refresh failed:', err);
      const savedUser = getUserData() || {};
      if (savedUser?.roles?.includes('BUSINESS_PARTNER')) {
        saveBpStatus('APPROVED', bpFranchiseName);
        setBpStatus('APPROVED');
        setBpModalOpen(false);
        setScreen('bp_dashboard');
        return 'APPROVED';
      }
      return null;
    }
  }, [bpFranchiseName, bpStatus]);

  // ─────────────────────────────────────────────────────────
  // ── Form complete ──
  // ─────────────────────────────────────────────────────────
  const handleFormComplete = ({ roles, data }) => {
    setSelectedRoles(roles);
    const currentUser = getUserData() || {};
    saveUserData({ ...currentUser, roles });
    setItem('formFilled', 'true');
    setInviteData(null);

    if (roles.includes('GLOBAL_ADMIN')) {
      setScreen('global_admin_dashboard');

    } else if (roles.includes('MASTER_OPERATOR')) {
      setScreen('master_operator_dashboard');

    } else if (
      roles.includes('GENERAL_OPERATOR') ||
      roles.includes('OPERATOR') ||
      currentUser?.isOperator ||
      currentUser?.membershipType === 'OPERATOR'
    ) {
      // ✅ General or Sector operator → franchise_operator_dashboard
      setScreen('franchise_operator_dashboard');

    } else if (roles.includes('BUSINESS_PARTNER')) {
      const bpAppStatus = data?.businessPartnerApplicationStatus || 'PENDING';
      const franchiseName = data?.franchiseName || '';

      saveBpStatus(bpAppStatus, franchiseName);
      setBpStatus(bpAppStatus);
      setBpFranchiseName(franchiseName);

      if (bpAppStatus === 'APPROVED') {
        setItem('bpApprovalSeen', 'true');
        setScreen('bp_dashboard');
      } else if (bpAppStatus === 'REJECTED') {
        setScreen('bp_pending');
        setTimeout(() => openBpModal('REJECTED', franchiseName), 400);
      } else {
        setScreen('bp_pending');
        setTimeout(() => openBpModal('PENDING', franchiseName), 400);
      }

    } else {
      const planPurchased = getItem('planPurchased');
      if (planPurchased === 'true') {
        setScreen('buyer_seller_dashboard');
      } else {
        setScreen('plans');
      }
    }
  };

  // ─────────────────────────────────────────────────────────
  // ── BP Modal handlers ──
  // ─────────────────────────────────────────────────────────
  const handleBpModalClose = () => setBpModalOpen(false);

  const handleBpGoToDashboard = () => {
    setItem('bpApprovalSeen', 'true');
    clearBpStatus();
    setScreen('bp_dashboard');
  };

  const handleBpBackToSignup = () => {
    clearBpStatus();
    clearTokens();
    removeItem('formFilled');
    removeItem('phoneVerified');
    setSelectedRoles([]);
    setUserData(null);
    setScreen('auth');
  };

  // ─────────────────────────────────────────────────────────
  // ── Payment handlers ──
  // ─────────────────────────────────────────────────────────
  const handlePlanSelect = (planId) => {
    setItem('selectedPlanId', String(planId));
    setItem('planPurchased', 'true');
    setItem('formFilled', 'true');

    const savedUser = getUserData() || {};
    const savedRoles = (savedUser?.roles && savedUser.roles.length > 0)
      ? savedUser.roles
      : (selectedRoles.length > 0 ? selectedRoles : ['MEMBER']);

    saveUserData({
      ...savedUser,
      roles: savedRoles,
    });

    setSelectedRoles(savedRoles);

    const targetScreen = getScreenFromRoles(savedRoles, savedUser);
    console.log('🚀 Plan selected, transitioning to target screen:', targetScreen);
    setScreen(targetScreen);
  };

  const handlePaymentSuccess = () => {
    setItem('planPurchased', 'true');
    setItem('formFilled', 'true');

    const savedUser = getUserData() || {};
    const savedRoles = (savedUser?.roles && savedUser.roles.length > 0)
      ? savedUser.roles
      : (selectedRoles.length > 0 ? selectedRoles : ['MEMBER']);

    saveUserData({
      ...savedUser,
      roles: savedRoles,
    });

    setSelectedRoles(savedRoles);
    setScreen(getScreenFromRoles(savedRoles, savedUser));
  };

  const handlePaymentRetry = () => {
    setSelectedRoles((getUserData() || {})?.roles || []);
    setScreen('plans');
  };

  const handleBackToPlans = () => {
    setSelectedRoles((getUserData() || {})?.roles || []);
    setScreen('plans');
  };

  // ─────────────────────────────────────────────────────────
  // ── Invitation handlers ──
  // ─────────────────────────────────────────────────────────
  const handleInvitationBack = () => {
    removeItem('pendingInviteToken');
    const savedUser = getUserData() || {};
    const savedRoles = savedUser?.roles || [];
    setSelectedRoles(savedRoles);
    const target = getScreenFromRoles(savedRoles, savedUser);
    setScreen(target === 'auth' ? 'auth' : target);
  };

  const handleOperatorForm = (invData) => {
    setInviteData(invData);
    setScreen('operator_form');
  };

  const handleMemberForm = (invData) => {
    setInviteData(invData);
    setUserData({ ...(getUserData() || {}) });
    setScreen('form');
  };

  const handleOperatorFormComplete = () => {
    const savedUser = getUserData() || {};
    const savedRoles = savedUser?.roles || [];
    setSelectedRoles(savedRoles);
    setInviteData(null);
    setScreen(getScreenFromRoles(savedRoles, savedUser));
  };

  // ─────────────────────────────────────────────────────────
  // ── Auth handlers ──
  // ─────────────────────────────────────────────────────────
  const handleAuthComplete = () => {
    const savedUser = getUserData() || {};
    const savedRoles = savedUser?.roles || [];
    setSelectedRoles(savedRoles);

    const pendingInvite = getItem('pendingInviteToken');
    if (pendingInvite) { setScreen('accept_invitation'); return; }

    const formFilled = getItem('formFilled');
    if (formFilled !== 'true') {
      setUserData(savedUser);
      setScreen('form');
      return;
    }

    const storedBpStatus = getItem(BP_STATUS_KEY);
    const isOperatorUser =
      savedRoles.includes('OPERATOR') ||
      savedRoles.includes('MASTER_OPERATOR') ||
      savedRoles.includes('GENERAL_OPERATOR') ||
      savedUser?.isOperator ||
      savedUser?.membershipType === 'OPERATOR';

    if (
      storedBpStatus &&
      (storedBpStatus === 'PENDING' || storedBpStatus === 'REJECTED') &&
      !isOperatorUser
    ) {
      setScreen('bp_pending');
      setTimeout(() => openBpModal(storedBpStatus, getItem(BP_FRANCHISE_KEY) || ''), 400);
      return;
    }

    setScreen(getScreenFromRoles(savedRoles, savedUser));
  };

  const handleSignupComplete = (data) => {
    setUserData(data);
    const pendingInvite = getItem('pendingInviteToken');
    if (pendingInvite) { setScreen('accept_invitation'); } else { setScreen('form'); }
  };

  const handleFormRequired = (data) => {
    setUserData(data);
    const pendingInvite = getItem('pendingInviteToken');
    if (pendingInvite) { setScreen('accept_invitation'); } else { setScreen('form'); }
  };

  // ─────────────────────────────────────────────────────────
  // ── Booting spinner ──
  // ─────────────────────────────────────────────────────────
  if (booting) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#F7FAF4',
      }}>
        <div style={{ color: '#75806E', fontWeight: 600, fontFamily: 'Manrope, sans-serif' }}>
          Loading…
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // ── BP Pending Screen ──
  // ─────────────────────────────────────────────────────────
  const BpPendingScreen = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [msg, setMsg] = useState('');

    const handleCheckStatus = async () => {
      setRefreshing(true);
      setMsg('');
      try {
        const resStatus = await refreshBpStatus();
        const upper = resStatus ? String(resStatus).toUpperCase() : '';
        const userRoles = getUserData()?.roles || [];

        if (upper === 'APPROVED' || userRoles.includes('BUSINESS_PARTNER')) {
          setBpModalOpen(false);
          setScreen('bp_dashboard');
        } else if (upper === 'REJECTED') {
          setMsg('Application status updated: Rejected.');
        } else if (upper === 'PENDING') {
          setMsg('Application is still pending approval. Please try again in a moment.');
        } else {
          setMsg('Could not update status. Please try refreshing again.');
        }
      } catch (err) {
        console.error('Check status click error:', err);
        setMsg('Failed to check status. Please try again.');
      } finally {
        setRefreshing(false);
      }
    };

    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 50%,#f0fdfa 100%)',
        fontFamily: 'Manrope, sans-serif',
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '440px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {bpStatus === 'REJECTED' ? '😔' : '⏳'}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>
            {bpStatus === 'REJECTED' ? 'Application Rejected' : 'Awaiting Approval'}
          </h2>
          <p style={{ color: '#6b7280', fontWeight: 500, marginBottom: '1.25rem' }}>
            {bpStatus === 'REJECTED'
              ? 'Your application was not approved.'
              : 'Your Business Partner application is under review by the Franchise Operator.'}
          </p>

          {msg && (
            <div style={{
              marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '12px',
              background: bpStatus === 'REJECTED' ? '#fee2e2' : '#e0f2fe',
              color: bpStatus === 'REJECTED' ? '#991b1b' : '#0369a1',
              fontSize: '0.85rem', fontWeight: 700
            }}>
              {msg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {bpStatus !== 'REJECTED' && (
              <button
                onClick={handleCheckStatus}
                disabled={refreshing}
                style={{
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  padding: '0.85rem 1.5rem', fontWeight: 700,
                  cursor: 'pointer', fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                  opacity: refreshing ? 0.7 : 1
                }}
              >
                {refreshing ? '🔄 Refreshing & Checking...' : '🔄 Refresh & Check Status'}
              </button>
            )}

            <button
              onClick={() => setBpModalOpen(true)}
              style={{
                background: '#ffffff',
                color: '#374151', border: '1px solid #d1d5db', borderRadius: '12px',
                padding: '0.75rem 1.5rem', fontWeight: 700,
                cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              View Status Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────
  // ── Render ──
  // ─────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Auth ── */}
      {screen === 'auth' && (
        <AuthCard
          initialFlow={resumeAuthFlow}
          onAuthenticated={handleAuthComplete}
          onSignupComplete={handleSignupComplete}
          onFormRequired={handleFormRequired}
        />
      )}

      {/* ── User Form ── */}
      {screen === 'form' && (
        <UserFormScreen
          phone={userData?.phone || ''}
          countryCode={userData?.countryCode || ''}
          inviteData={inviteData}
          onComplete={handleFormComplete}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {/* ── Plans ── */}
      {screen === 'plans' && (
        <PlansScreen
          roles={selectedRoles}
          onPlanSelect={handlePlanSelect}
          onBack={() => setScreen('form')}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {/* ── Payment ── */}
      {screen === 'payment_success' && (
        <PaymentSuccess onContinue={handlePaymentSuccess} />
      )}
      {screen === 'payment_failed' && (
        <PaymentFailed
          onRetry={handlePaymentRetry}
          onBackToPlans={handleBackToPlans}
        />
      )}

      {/* ── Invitation ── */}
      {screen === 'accept_invitation' && (
        <AcceptInvitationScreen
          onBack={handleInvitationBack}
          onOperatorForm={handleOperatorForm}
          onMemberForm={handleMemberForm}
        />
      )}
      {screen === 'operator_form' && (
        <OperatorFormScreen
          inviteData={inviteData}
          onComplete={handleOperatorFormComplete}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {/* ── Buyer/Seller ── */}
      {screen === 'buyer_seller_dashboard' && (
        <BuyerSellerDashboard
          roles={selectedRoles}
          onLogout={handleSessionExpired}
        />
      )}

      {/* ── BP screens ── */}
      {screen === 'bp_pending' && <BpPendingScreen />}
      {screen === 'bp_dashboard' && (
        <BusinessPartnerDashboard onLogout={handleSessionExpired} />
      )}

      {/* ── Admin ── */}
      {screen === 'global_admin_dashboard' && (
        <GlobalAdminDashboard onLogout={handleSessionExpired} />
      )}

      {/* ── Master Operator ── */}
      {screen === 'master_operator_dashboard' && (
        <MasterOperatorDashboard onLogout={handleSessionExpired} />
      )}

      {/* ── Franchise Operator (GENERAL + SECTOR unified) ── */}
      {/* ✅ Auto-detects franchiseType from getUserData().franchiseType */}
      {screen === 'franchise_operator_dashboard' && (
        <FranchiseOperatorDashboard onLogout={handleSessionExpired} />
      )}

      {/* ── BP Status Modal ── */}
      <BusinessPartnerStatusModal
        status={bpStatus}
        isOpen={bpModalOpen}
        franchiseName={bpFranchiseName}
        onClose={handleBpModalClose}
        onGoToDashboard={handleBpGoToDashboard}
        onBackToSignup={handleBpBackToSignup}
        onRefreshStatus={refreshBpStatus}
      />
    </>
  );
}