// import { useEffect, useRef, useState } from 'react';
// import AuthCard from '../../components/AuthCard';
// import UserFormScreen from '../../components/UserFormScreen';
// import BusinessPartnerDashboard from '../../screens/BusinessPartnerDashboard';
// import BuyerSellerDashboard from '../../screens/BuyerSellerDashboard';
// import PlansScreen from '../../screens/PlansScreen';
// import PaymentSuccess from '../../screens/PaymentSuccessScreen';
// import PaymentFailed from '../../screens/PaymentFailed';
// import GlobalAdminDashboard from '../../screens/GlobalAdminDashboard';
// import AcceptInvitationScreen from '../../screens/AcceptInvitationScreen';
// import OperatorFormScreen from '../../screens/OperatorFormScreen';
// import MasterOperatorDashboard from '../../screens/MasterOperatorDashboard';
// import {
//   setItem, getItem, saveTokens, toBool,
//   clearTokens, saveUserData, getUserData,
//   removeItem, setSessionExpiredHandler,
// } from '../../api/auth';
// import GeneralOperatorDashboard from '../../screens/GeneralOperatorDashboard';

// // Replace the placeholder with:
// export default function App() {
//   const [screen, setScreen]               = useState('auth');
//   const [booting, setBooting]             = useState(true);
//   const [resumeAuthFlow, setResumeAuthFlow] = useState(null);
//   const [userData, setUserData]           = useState(null);
//   const [selectedRoles, setSelectedRoles] = useState([]);
//   const [inviteData, setInviteData]       = useState(null);

//   const didInit = useRef(false);

//   // ─────────────────────────────────────
//   // ── Role → Screen mapping ──
//   // ─────────────────────────────────────
//   const getScreenFromRoles = (roles = []) => {
//     if (!roles.length) return 'auth';
//     if (roles.includes('GLOBAL_ADMIN'))     return 'global_admin_dashboard';
//     if (roles.includes('MASTER_OPERATOR'))  return 'master_operator_dashboard';
//     if (roles.includes('GENERAL_OPERATOR')) return 'general_operator_dashboard';
//     if (roles.includes('BUSINESS_PARTNER')) return 'bp_dashboard';
//     return 'buyer_seller_dashboard';
//   };

//   // ─────────────────────────────────────
//   // ── Session expired ──
//   // ─────────────────────────────────────
//   const handleSessionExpired = () => {
//     console.log('🔒 Session expired → login');
//     clearTokens();
//     setResumeAuthFlow(null);
//     setUserData(null);
//     setSelectedRoles([]);
//     setInviteData(null);
//     setScreen('auth');
//   };

//   useEffect(() => {
//     setSessionExpiredHandler(handleSessionExpired);
//   }, []);

//   // ─────────────────────────────────────
//   // ── App Init ──
//   // ─────────────────────────────────────
//   useEffect(() => {
//     if (didInit.current) return;
//     didInit.current = true;

//     console.log('═══ App Init ═══');

//     const params      = new URLSearchParams(window.location.search);
//     const currentPath = window.location.pathname;

//     // ── Invitation link detection ──
//     const inviteMatch = currentPath.match(/^\/invite\/(.+)$/);
//     if (inviteMatch) {
//       const inviteToken = inviteMatch[1];
//       console.log('📨 Invite token detected:', inviteToken);

//       setItem('pendingInviteToken', inviteToken);
//       window.history.replaceState({}, '', '/');

//       // ALWAYS show auth screen first — user must login/signup
//       console.log('📨 → Auth screen (must login first)');
//       setResumeAuthFlow('invite');
//       setScreen('auth');
//       setBooting(false);
//       return;
//     }

//     // ── Payment success ──
//     const isPaymentSuccess =
//       currentPath === '/payment/success' ||
//       currentPath === '/payment-success' ||
//       params.get('payment') === 'success' ||
//       params.get('paymentStatus') === 'success';

//     if (isPaymentSuccess) {
//       window.history.replaceState({}, '', '/');
//       setItem('formFilled', 'true');
//       setItem('planPurchased', 'true');
//       setScreen('payment_success');
//       setBooting(false);
//       return;
//     }

//     // ── Payment failed ──
//     const isPaymentFailed =
//       currentPath === '/payment/failed'        ||
//       currentPath === '/payment-failed'        ||
//       currentPath === '/payment/cancelled'     ||
//       currentPath === '/payment/cancel'        ||
//       params.get('payment') === 'failed'       ||
//       params.get('payment') === 'cancelled'    ||
//       params.get('paymentStatus') === 'failed' ||
//       params.get('paymentStatus') === 'cancelled';

//     if (isPaymentFailed) {
//       window.history.replaceState({}, '', '/');
//       setScreen('payment_failed');
//       setBooting(false);
//       return;
//     }

//     // ── OAuth params ──
//     const userId           = params.get('userId') || params.get('userid');
//     const phoneVerifiedRaw = params.get('phoneVerified') || params.get('verified');
//     const formFilledRaw    =
//       params.get('isFormFill') || params.get('formFilled') ||
//       params.get('fromFill')   || params.get('formfill');
//     const accessToken  = params.get('accessToken');
//     const refreshToken = params.get('refreshToken');
//     const fullName     = params.get('fullName');
//     const email        = params.get('email');

//     const rolesArray = params.getAll('roles').length > 0
//       ? params.getAll('roles')
//       : (params.get('role') ? [params.get('role')] : []);

//     const urlRoles = rolesArray
//       .flatMap(r => r.split(','))
//       .map(r => r.trim().toUpperCase())
//       .filter(Boolean);

//     const storedToken     = getItem('accessToken');
//     const isOAuthCallback = currentPath === '/oauth/callback';

//     const hasOAuthData =
//       userId || phoneVerifiedRaw !== null ||
//       formFilledRaw !== null || accessToken || refreshToken;

//     // ── CASE 1: No OAuth params (returning user) ──
//     if (!hasOAuthData) {
//       const savedPhoneVerifiedRaw = getItem('phoneVerified');
//       const savedFormFilledRaw    = getItem('formFilled');
//       const savedUser             = getUserData() || {};
//       const savedRoles            = savedUser?.roles || [];
//       const hasSavedFlags =
//         savedPhoneVerifiedRaw !== null || savedFormFilledRaw !== null;

//       if (isOAuthCallback && hasSavedFlags) {
//         navigateTo(
//           toBool(savedPhoneVerifiedRaw),
//           toBool(savedFormFilledRaw),
//           savedUser
//         );
//         setBooting(false);
//         return;
//       }

//       if (storedToken) {
//         const formFilled = getItem('formFilled');
//         if (formFilled === 'true') {
//           setSelectedRoles(savedRoles);
//           setScreen(getScreenFromRoles(savedRoles));
//         } else {
//           setScreen('auth');
//         }
//       } else {
//         setScreen('auth');
//       }

//       setBooting(false);
//       return;
//     }

//     // ── CASE 2: Fresh OAuth redirect ──
//     window.history.replaceState({}, '', window.location.pathname);

//     const phoneVerified = toBool(phoneVerifiedRaw);
//     const formFilled    = toBool(formFilledRaw);

//     if (userId) setItem('userId', userId);
//     setItem('phoneVerified', String(phoneVerified));
//     setItem('formFilled', String(formFilled));

//     if (accessToken && refreshToken) {
//       saveTokens(accessToken, refreshToken);
//     }

//     const savedUser  = getUserData() || {};
//     const savedRoles = savedUser?.roles || [];
//     const finalRoles = urlRoles.length > 0 ? urlRoles : savedRoles;

//     const user = {
//       userId,
//       fullName  : fullName || savedUser.fullName || '',
//       email     : email    || savedUser.email    || '',
//       phoneVerified,
//       formFilled,
//       roles     : finalRoles,
//     };

//     if (userId || fullName || email || finalRoles.length) {
//       saveUserData(user);
//     }
//     if (finalRoles.length) {
//       setSelectedRoles(finalRoles);
//     }

//     navigateTo(phoneVerified, formFilled, user);
//   }, []);

//   // ─────────────────────────────────────
//   // ── navigateTo ──
//   // ─────────────────────────────────────
//   const navigateTo = (phoneVerified, formFilled, user = {}) => {
//     console.log('🚀 navigateTo →', {
//       phoneVerified, formFilled, userRoles: user.roles,
//     });

//     const pendingInvite = getItem('pendingInviteToken');

//     if (!phoneVerified) {
//       // Phone not verified → auth
//       setResumeAuthFlow('signup_phone');
//       setScreen('auth');

//     } else if (phoneVerified && pendingInvite) {
//       // Phone verified + pending invite → accept screen
//       console.log('📨 Phone verified + pending invite → accept screen');
//       setScreen('accept_invitation');

//     } else if (phoneVerified && !formFilled) {
//       // Phone verified but form not filled
//       setUserData(user);
//       setScreen('form');

//     } else if (phoneVerified && formFilled) {
//       const urlRoles   = user?.roles || [];
//       const savedUser  = getUserData() || {};
//       const savedRoles = savedUser?.roles || [];
//       const finalRoles = urlRoles.length > 0 ? urlRoles : savedRoles;

//       setSelectedRoles(finalRoles);

//       if (finalRoles.includes('GLOBAL_ADMIN')) {
//         setScreen('global_admin_dashboard');
//       } else if (finalRoles.includes('MASTER_OPERATOR')) {
//         setScreen('master_operator_dashboard');
//       } else if (finalRoles.includes('GENERAL_OPERATOR')) {
//         setScreen('general_operator_dashboard');
//       } else if (finalRoles.includes('BUSINESS_PARTNER')) {
//         setScreen('bp_dashboard');
//       } else if (
//         finalRoles.includes('BUYER') ||
//         finalRoles.includes('SELLER')
//       ) {
//         setScreen('buyer_seller_dashboard');
//       } else if (finalRoles.includes('MEMBER')) {
//         setScreen('buyer_seller_dashboard');
//       } else {
//         setScreen('form');
//       }
//     } else {
//       setScreen('auth');
//     }

//     setBooting(false);
//   };

//   // ─────────────────────────────────────
//   // ── Form complete ──
//   // ─────────────────────────────────────
//   const handleFormComplete = ({ roles, data }) => {
//     setSelectedRoles(roles);
//     const currentUser = getUserData() || {};
//     saveUserData({ ...currentUser, roles });
//     setItem('formFilled', 'true');

//     if (roles.includes('GLOBAL_ADMIN')) {
//       setScreen('global_admin_dashboard');
//     } else if (roles.includes('MASTER_OPERATOR')) {
//       setScreen('master_operator_dashboard');
//     } else if (roles.includes('GENERAL_OPERATOR')) {
//       setScreen('general_operator_dashboard');
//     } else if (roles.includes('BUSINESS_PARTNER')) {
//       setScreen('bp_dashboard');
//     } else {
//       const planPurchased = getItem('planPurchased');
//       if (planPurchased === 'true') {
//         setScreen('buyer_seller_dashboard');
//       } else {
//         setScreen('plans');
//       }
//     }
//   };

//   // ─────────────────────────────────────
//   // ── Payment handlers ──
//   // ─────────────────────────────────────
//   const handlePlanSelect = (planId) => setItem('selectedPlanId', planId);

//   const handlePaymentSuccess = () => {
//     setItem('planPurchased', 'true');
//     const savedRoles = (getUserData() || {})?.roles || selectedRoles;
//     setSelectedRoles(savedRoles);

//     if (savedRoles.includes('GLOBAL_ADMIN')) {
//       setScreen('global_admin_dashboard');
//     } else if (savedRoles.includes('MASTER_OPERATOR')) {
//       setScreen('master_operator_dashboard');
//     } else if (savedRoles.includes('GENERAL_OPERATOR')) {
//       setScreen('general_operator_dashboard');
//     } else if (savedRoles.includes('BUSINESS_PARTNER')) {
//       setScreen('bp_dashboard');
//     } else {
//       setScreen('buyer_seller_dashboard');
//     }
//   };

//   const handlePaymentRetry = () => {
//     setSelectedRoles((getUserData() || {})?.roles || []);
//     setScreen('plans');
//   };

//   const handleBackToPlans = () => {
//     setSelectedRoles((getUserData() || {})?.roles || []);
//     setScreen('plans');
//   };

//   // ─────────────────────────────────────
//   // ── Invitation handlers ──
//   // ─────────────────────────────────────
//   const handleInvitationBack = () => {
//     removeItem('pendingInviteToken');
//     const savedRoles = (getUserData() || {})?.roles || [];
//     setSelectedRoles(savedRoles);
//     const target = getScreenFromRoles(savedRoles);
//     setScreen(target === 'auth' ? 'auth' : target);
//   };

//   const handleOperatorForm = (invData) => {
//     console.log('🏢 → Operator Form, inviteData:', invData);
//     setInviteData(invData);
//     setScreen('operator_form');
//   };

//   const handleMemberForm = (invData) => {
//     console.log('👤 → Member Form');
//     setInviteData(invData);
//     setUserData({ ...(getUserData() || {}) });
//     setScreen('form');
//   };

//   const handleOperatorFormComplete = () => {
//     console.log('✅ Operator form done');
//     const savedRoles = (getUserData() || {})?.roles || [];
//     setSelectedRoles(savedRoles);
//     setScreen(getScreenFromRoles(savedRoles));
//   };

//   // ─────────────────────────────────────
//   // ── Auth handlers ──
//   // ─────────────────────────────────────
//   const handleAuthComplete = () => {
//     const savedRoles = (getUserData() || {})?.roles || [];
//     setSelectedRoles(savedRoles);

//     const pendingInvite = getItem('pendingInviteToken');
//     if (pendingInvite) {
//       console.log('📨 Auth done + pending invite → accept screen');
//       setScreen('accept_invitation');
//     } else {
//       setScreen(getScreenFromRoles(savedRoles));
//     }
//   };

//   const handleSignupComplete = (data) => {
//     setUserData(data);
//     const pendingInvite = getItem('pendingInviteToken');
//     if (pendingInvite) {
//       console.log('📨 Signup done + pending invite → accept screen');
//       setScreen('accept_invitation');
//     } else {
//       setScreen('form');
//     }
//   };

//   const handleFormRequired = (data) => {
//     setUserData(data);
//     const pendingInvite = getItem('pendingInviteToken');
//     if (pendingInvite) {
//       console.log('📨 Form required + pending invite → accept screen');
//       setScreen('accept_invitation');
//     } else {
//       setScreen('form');
//     }
//   };

//   // ─────────────────────────────────────
//   // ── Booting spinner ──
//   // ─────────────────────────────────────
//   if (booting) {
//     return (
//       <div style={{
//         minHeight: '100vh', display: 'flex',
//         alignItems: 'center', justifyContent: 'center',
//         background: '#F7FAF4',
//       }}>
//         <div style={{
//           color: '#75806E', fontWeight: 600,
//           fontFamily: 'Manrope, sans-serif',
//         }}>
//           Loading…
//         </div>
//       </div>
//     );
//   }

//   // ─────────────────────────────────────
//   // ── Render ──
//   // ─────────────────────────────────────
//   return (
//     <>
//       {screen === 'auth' && (
//         <AuthCard
//           initialFlow={resumeAuthFlow}
//           onAuthenticated={handleAuthComplete}
//           onSignupComplete={handleSignupComplete}
//           onFormRequired={handleFormRequired}
//         />
//       )}

//       {screen === 'form' && (
//         <UserFormScreen
//           phone={userData?.phone || ''}
//           countryCode={userData?.countryCode || ''}
//           onComplete={handleFormComplete}
//           onSessionExpired={handleSessionExpired}
//         />
//       )}

//       {screen === 'plans' && (
//         <PlansScreen
//           roles={selectedRoles}
//           onPlanSelect={handlePlanSelect}
//           onBack={() => setScreen('form')}
//           onSessionExpired={handleSessionExpired}
//         />
//       )}

//       {screen === 'payment_success' && (
//         <PaymentSuccess onContinue={handlePaymentSuccess} />
//       )}

//       {screen === 'payment_failed' && (
//         <PaymentFailed
//           onRetry={handlePaymentRetry}
//           onBackToPlans={handleBackToPlans}
//         />
//       )}

//       {screen === 'accept_invitation' && (
//         <AcceptInvitationScreen
//           onBack={handleInvitationBack}
//           onOperatorForm={handleOperatorForm}
//           onMemberForm={handleMemberForm}
//         />
//       )}

//       {screen === 'operator_form' && (
//         <OperatorFormScreen
//           inviteData={inviteData}
//           onComplete={handleOperatorFormComplete}
//           onSessionExpired={handleSessionExpired}
//         />
//       )}

//       {screen === 'buyer_seller_dashboard' && (
//         <BuyerSellerDashboard
//           roles={selectedRoles}
//           onLogout={handleSessionExpired}
//         />
//       )}

//       {screen === 'bp_dashboard' && (
//         <BusinessPartnerDashboard onLogout={handleSessionExpired} />
//       )}

//       {screen === 'global_admin_dashboard' && (
//         <GlobalAdminDashboard onLogout={handleSessionExpired} />
//       )}

//       {screen === 'master_operator_dashboard' && (
//         <MasterOperatorDashboard onLogout={handleSessionExpired} />
//       )}
  
// {screen === 'general_operator_dashboard' && (
//   <GeneralOperatorDashboard onLogout={handleSessionExpired} />
// )}

//       {/* General Operator Dashboard — placeholder */}
//       {screen === 'general_operator_dashboard' && (
//         <div style={{
//           minHeight: '100vh',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//           background: '#F7FAF4',
//           fontFamily: 'Manrope, sans-serif',
//           gap: 16,
//         }}>
//           <div style={{ fontSize: 56 }}>🏪</div>
//           <h2 style={{
//             fontSize: 26, fontWeight: 800,
//             color: '#1A3A1A', margin: 0,
//           }}>
//             General Operator Dashboard
//           </h2>
//           <p style={{ color: '#6B8F71', fontSize: 14, margin: 0 }}>
//             Coming soon...
//           </p>
//           <button
//             onClick={handleSessionExpired}
//             style={{
//               marginTop: 8,
//               padding: '12px 28px',
//               borderRadius: 12,
//               background: 'linear-gradient(135deg, #16A34A, #15803D)',
//               color: '#fff', border: 'none',
//               fontWeight: 700, fontSize: 14,
//               cursor: 'pointer',
//               fontFamily: 'Manrope, sans-serif',
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       )}
//     </>
//   );
// }

import { useEffect, useRef, useState } from 'react';
import AuthCard from '../../components/AuthCard';
import UserFormScreen from '../../components/UserFormScreen';
import BusinessPartnerDashboard from '../../screens/BusinessPartnerDashboard';
import BuyerSellerDashboard from '../../screens/BuyerSellerDashboard';
import PlansScreen from '../../screens/PlansScreen';
import PaymentSuccess from '../../screens/PaymentSuccessScreen';
import PaymentFailed from '../../screens/PaymentFailed';
import GlobalAdminDashboard from '../../screens/GlobalAdminDashboard';
import AcceptInvitationScreen from '../../screens/AcceptInvitationScreen';
import OperatorFormScreen from '../../screens/OperatorFormScreen';
import MasterOperatorDashboard from '../../screens/MasterOperatorDashboard';
import GeneralOperatorDashboard from '../../screens/GeneralOperatorDashboard';
import {
  setItem, getItem, saveTokens, toBool,
  clearTokens, saveUserData, getUserData,
  removeItem, setSessionExpiredHandler,
} from '../../api/auth';

export default function App() {
  const [screen, setScreen]               = useState('auth');
  const [booting, setBooting]             = useState(true);
  const [resumeAuthFlow, setResumeAuthFlow] = useState(null);
  const [userData, setUserData]           = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [inviteData, setInviteData]       = useState(null);

  const didInit = useRef(false);

  // ─────────────────────────────────────
  // ── Role → Screen mapping ──
  // ─────────────────────────────────────
  const getScreenFromRoles = (roles = []) => {
    if (!roles.length) return 'auth';
    if (roles.includes('GLOBAL_ADMIN'))     return 'global_admin_dashboard';
    if (roles.includes('MASTER_OPERATOR'))  return 'master_operator_dashboard';
    if (roles.includes('GENERAL_OPERATOR')) return 'general_operator_dashboard';
    if (roles.includes('BUSINESS_PARTNER')) return 'bp_dashboard';
    return 'buyer_seller_dashboard';
  };

  // ─────────────────────────────────────
  // ── Session expired ──
  // ─────────────────────────────────────
  const handleSessionExpired = () => {
    console.log('🔒 Session expired → login');
    clearTokens();
    setResumeAuthFlow(null);
    setUserData(null);
    setSelectedRoles([]);
    setInviteData(null);
    setScreen('auth');
  };

  useEffect(() => {
    setSessionExpiredHandler(handleSessionExpired);
  }, []);

  // ─────────────────────────────────────
  // ── App Init ──
  // ─────────────────────────────────────
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    console.log('═══ App Init ═══');

    const params      = new URLSearchParams(window.location.search);
    const currentPath = window.location.pathname;

    // ── Invitation link detection ──
    const inviteMatch = currentPath.match(/^\/invite\/(.+)$/);
    if (inviteMatch) {
      const inviteToken = inviteMatch[1];
      console.log('📨 Invite token detected:', inviteToken);

      setItem('pendingInviteToken', inviteToken);
      window.history.replaceState({}, '', '/');

      // ALWAYS show auth screen first
      console.log('📨 → Auth screen (must login first)');
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
      currentPath === '/payment/failed'        ||
      currentPath === '/payment-failed'        ||
      currentPath === '/payment/cancelled'     ||
      currentPath === '/payment/cancel'        ||
      params.get('payment') === 'failed'       ||
      params.get('payment') === 'cancelled'    ||
      params.get('paymentStatus') === 'failed' ||
      params.get('paymentStatus') === 'cancelled';

    if (isPaymentFailed) {
      window.history.replaceState({}, '', '/');
      setScreen('payment_failed');
      setBooting(false);
      return;
    }

    // ── OAuth params ──
    const userId           = params.get('userId') || params.get('userid');
    const phoneVerifiedRaw = params.get('phoneVerified') || params.get('verified');
    const formFilledRaw    =
      params.get('isFormFill') || params.get('formFilled') ||
      params.get('fromFill')   || params.get('formfill');
    const accessToken  = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const fullName     = params.get('fullName');
    const email        = params.get('email');

    const rolesArray = params.getAll('roles').length > 0
      ? params.getAll('roles')
      : (params.get('role') ? [params.get('role')] : []);

    const urlRoles = rolesArray
      .flatMap(r => r.split(','))
      .map(r => r.trim().toUpperCase())
      .filter(Boolean);

    const storedToken     = getItem('accessToken');
    const isOAuthCallback = currentPath === '/oauth/callback';

    const hasOAuthData =
      userId || phoneVerifiedRaw !== null ||
      formFilledRaw !== null || accessToken || refreshToken;

    // ── CASE 1: No OAuth params (returning user) ──
    if (!hasOAuthData) {
      const savedPhoneVerifiedRaw = getItem('phoneVerified');
      const savedFormFilledRaw    = getItem('formFilled');
      const savedUser             = getUserData() || {};
      const savedRoles            = savedUser?.roles || [];
      const hasSavedFlags =
        savedPhoneVerifiedRaw !== null || savedFormFilledRaw !== null;

      if (isOAuthCallback && hasSavedFlags) {
        navigateTo(
          toBool(savedPhoneVerifiedRaw),
          toBool(savedFormFilledRaw),
          savedUser
        );
        setBooting(false);
        return;
      }

      if (storedToken) {
        const formFilled = getItem('formFilled');
        if (formFilled === 'true') {
          setSelectedRoles(savedRoles);
          setScreen(getScreenFromRoles(savedRoles));
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

    const phoneVerified = toBool(phoneVerifiedRaw);
    const formFilled    = toBool(formFilledRaw);

    if (userId) setItem('userId', userId);
    setItem('phoneVerified', String(phoneVerified));
    setItem('formFilled', String(formFilled));

    if (accessToken && refreshToken) {
      saveTokens(accessToken, refreshToken);
    }

    const savedUser  = getUserData() || {};
    const savedRoles = savedUser?.roles || [];
    const finalRoles = urlRoles.length > 0 ? urlRoles : savedRoles;

    const user = {
      userId,
      fullName  : fullName || savedUser.fullName || '',
      email     : email    || savedUser.email    || '',
      phoneVerified,
      formFilled,
      roles     : finalRoles,
    };

    if (userId || fullName || email || finalRoles.length) {
      saveUserData(user);
    }
    if (finalRoles.length) {
      setSelectedRoles(finalRoles);
    }

    navigateTo(phoneVerified, formFilled, user);
  }, []);

  // ─────────────────────────────────────
  // ── navigateTo ──
  // ─────────────────────────────────────
  const navigateTo = (phoneVerified, formFilled, user = {}) => {
    console.log('🚀 navigateTo →', {
      phoneVerified, formFilled, userRoles: user.roles,
    });

    const pendingInvite = getItem('pendingInviteToken');

    if (!phoneVerified) {
      setResumeAuthFlow('signup_phone');
      setScreen('auth');

    } else if (phoneVerified && pendingInvite) {
      console.log('📨 Phone verified + pending invite → accept screen');
      setScreen('accept_invitation');

    } else if (phoneVerified && !formFilled) {
      setUserData(user);
      setScreen('form');

    } else if (phoneVerified && formFilled) {
      const urlRoles   = user?.roles || [];
      const savedUser  = getUserData() || {};
      const savedRoles = savedUser?.roles || [];
      const finalRoles = urlRoles.length > 0 ? urlRoles : savedRoles;

      setSelectedRoles(finalRoles);

      if (finalRoles.includes('GLOBAL_ADMIN')) {
        setScreen('global_admin_dashboard');
      } else if (finalRoles.includes('MASTER_OPERATOR')) {
        setScreen('master_operator_dashboard');
      } else if (finalRoles.includes('GENERAL_OPERATOR')) {
        setScreen('general_operator_dashboard');
      } else if (finalRoles.includes('BUSINESS_PARTNER')) {
        setScreen('bp_dashboard');
      } else if (
        finalRoles.includes('BUYER') ||
        finalRoles.includes('SELLER')
      ) {
        setScreen('buyer_seller_dashboard');
      } else if (finalRoles.includes('MEMBER')) {
        setScreen('buyer_seller_dashboard');
      } else {
        setScreen('form');
      }
    } else {
      setScreen('auth');
    }

    setBooting(false);
  };

  // ─────────────────────────────────────
  // ── Form complete ──
  // ─────────────────────────────────────
  const handleFormComplete = ({ roles, data }) => {
    setSelectedRoles(roles);
    const currentUser = getUserData() || {};
    saveUserData({ ...currentUser, roles });
    setItem('formFilled', 'true');

    // Clear invite data after form complete
    setInviteData(null);

    if (roles.includes('GLOBAL_ADMIN')) {
      setScreen('global_admin_dashboard');
    } else if (roles.includes('MASTER_OPERATOR')) {
      setScreen('master_operator_dashboard');
    } else if (roles.includes('GENERAL_OPERATOR')) {
      setScreen('general_operator_dashboard');
    } else if (roles.includes('BUSINESS_PARTNER')) {
      setScreen('bp_dashboard');
    } else {
      const planPurchased = getItem('planPurchased');
      if (planPurchased === 'true') {
        setScreen('buyer_seller_dashboard');
      } else {
        setScreen('plans');
      }
    }
  };

  // ─────────────────────────────────────
  // ── Payment handlers ──
  // ─────────────────────────────────────
  const handlePlanSelect = (planId) => setItem('selectedPlanId', planId);

  const handlePaymentSuccess = () => {
    setItem('planPurchased', 'true');
    const savedRoles = (getUserData() || {})?.roles || selectedRoles;
    setSelectedRoles(savedRoles);

    if (savedRoles.includes('GLOBAL_ADMIN')) {
      setScreen('global_admin_dashboard');
    } else if (savedRoles.includes('MASTER_OPERATOR')) {
      setScreen('master_operator_dashboard');
    } else if (savedRoles.includes('GENERAL_OPERATOR')) {
      setScreen('general_operator_dashboard');
    } else if (savedRoles.includes('BUSINESS_PARTNER')) {
      setScreen('bp_dashboard');
    } else {
      setScreen('buyer_seller_dashboard');
    }
  };

  const handlePaymentRetry = () => {
    setSelectedRoles((getUserData() || {})?.roles || []);
    setScreen('plans');
  };

  const handleBackToPlans = () => {
    setSelectedRoles((getUserData() || {})?.roles || []);
    setScreen('plans');
  };

  // ─────────────────────────────────────
  // ── Invitation handlers ──
  // ─────────────────────────────────────
  const handleInvitationBack = () => {
    removeItem('pendingInviteToken');
    const savedRoles = (getUserData() || {})?.roles || [];
    setSelectedRoles(savedRoles);
    const target = getScreenFromRoles(savedRoles);
    setScreen(target === 'auth' ? 'auth' : target);
  };

  // purpose === OPERATOR → OperatorFormScreen
  const handleOperatorForm = (invData) => {
    console.log('🏢 → Operator Form, inviteData:', invData);
    setInviteData(invData);
    setScreen('operator_form');
  };

  // purpose === MEMBER → UserFormScreen (with inviteData)
  const handleMemberForm = (invData) => {
    console.log('👤 → Member Form, inviteData:', invData);
    setInviteData(invData);
    setUserData({ ...(getUserData() || {}) });
    setScreen('form');
  };

  const handleOperatorFormComplete = () => {
    console.log('✅ Operator form done');
    const savedRoles = (getUserData() || {})?.roles || [];
    setSelectedRoles(savedRoles);
    setInviteData(null);
    setScreen(getScreenFromRoles(savedRoles));
  };

  // ─────────────────────────────────────
  // ── Auth handlers ──
  // ─────────────────────────────────────
  const handleAuthComplete = () => {
    const savedRoles = (getUserData() || {})?.roles || [];
    setSelectedRoles(savedRoles);

    const pendingInvite = getItem('pendingInviteToken');
    if (pendingInvite) {
      console.log('📨 Auth done + pending invite → accept screen');
      setScreen('accept_invitation');
    } else {
      setScreen(getScreenFromRoles(savedRoles));
    }
  };

  const handleSignupComplete = (data) => {
    setUserData(data);
    const pendingInvite = getItem('pendingInviteToken');
    if (pendingInvite) {
      console.log('📨 Signup done + pending invite → accept screen');
      setScreen('accept_invitation');
    } else {
      setScreen('form');
    }
  };

  const handleFormRequired = (data) => {
    setUserData(data);
    const pendingInvite = getItem('pendingInviteToken');
    if (pendingInvite) {
      console.log('📨 Form required + pending invite → accept screen');
      setScreen('accept_invitation');
    } else {
      setScreen('form');
    }
  };

  // ─────────────────────────────────────
  // ── Booting spinner ──
  // ─────────────────────────────────────
  if (booting) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#F7FAF4',
      }}>
        <div style={{
          color: '#75806E', fontWeight: 600,
          fontFamily: 'Manrope, sans-serif',
        }}>
          Loading…
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────
  // ── Render ──
  // ─────────────────────────────────────
  return (
    <>
      {screen === 'auth' && (
        <AuthCard
          initialFlow={resumeAuthFlow}
          onAuthenticated={handleAuthComplete}
          onSignupComplete={handleSignupComplete}
          onFormRequired={handleFormRequired}
        />
      )}

      {screen === 'form' && (
        <UserFormScreen
          phone={userData?.phone || ''}
          countryCode={userData?.countryCode || ''}
          inviteData={inviteData}
          onComplete={handleFormComplete}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {screen === 'plans' && (
        <PlansScreen
          roles={selectedRoles}
          onPlanSelect={handlePlanSelect}
          onBack={() => setScreen('form')}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {screen === 'payment_success' && (
        <PaymentSuccess onContinue={handlePaymentSuccess} />
      )}

      {screen === 'payment_failed' && (
        <PaymentFailed
          onRetry={handlePaymentRetry}
          onBackToPlans={handleBackToPlans}
        />
      )}

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

      {screen === 'buyer_seller_dashboard' && (
        <BuyerSellerDashboard
          roles={selectedRoles}
          onLogout={handleSessionExpired}
        />
      )}

      {screen === 'bp_dashboard' && (
        <BusinessPartnerDashboard onLogout={handleSessionExpired} />
      )}

      {screen === 'global_admin_dashboard' && (
        <GlobalAdminDashboard onLogout={handleSessionExpired} />
      )}

      {screen === 'master_operator_dashboard' && (
        <MasterOperatorDashboard onLogout={handleSessionExpired} />
      )}

      {screen === 'general_operator_dashboard' && (
        <GeneralOperatorDashboard onLogout={handleSessionExpired} />
      )}
    </>
  );
}