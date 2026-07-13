import { useEffect, useRef, useState } from 'react';
import AuthCard from '../../components/AuthCard';
import UserFormScreen from '../../components/UserFormScreen';
// import Dashboard from './components/Dashboard'; // ← Commented out for now
import BusinessPartnerDashboard from '../../screens/BusinessPartnerDashboard';
import PlansScreen from '../../screens/PlansScreen';
import PaymentSuccess from '../../screens/PaymentSuccessScreen';
import PaymentFailed from '../../screens/PaymentFailed';
import {
  setItem, getItem, saveTokens, toBool,
  clearTokens, saveUserData, getUserData,
} from '../../api/auth';

export default function App() {
  const [screen, setScreen]                 = useState('auth');
  const [booting, setBooting]               = useState(true);
  const [resumeAuthFlow, setResumeAuthFlow] = useState(null);
  const [userData, setUserData]             = useState(null);
  const [selectedRoles, setSelectedRoles]   = useState([]);

  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) {
      console.log('⏭️ useEffect already ran — skipping');
      return;
    }
    didInit.current = true;

    console.log('═══ App Init Debug Start ═══');
    console.log('Full URL:', window.location.href);

    const params      = new URLSearchParams(window.location.search);
    const currentPath = window.location.pathname;

    console.log('ALL PARAMS:');
    params.forEach((value, key) => console.log(`  Param → ${key}: ${value}`));

    // ✅ Stripe payment success
    const isPaymentSuccess =
      currentPath === '/payment/success' ||
      currentPath === '/payment-success' ||
      params.get('payment') === 'success' ||
      params.get('paymentStatus') === 'success';

    if (isPaymentSuccess) {
      console.log('💳 ✅ Payment SUCCESS detected!');
      window.history.replaceState({}, '', '/');
      setItem('formFilled', 'true');
      setItem('planPurchased', 'true');
      setScreen('payment_success');
      setBooting(false);
      return;
    }

    // ✅ Stripe payment failed
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
      console.log('💳 ❌ Payment FAILED/CANCELLED detected!');
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

    console.log('Parsed → userId:',        userId);
    console.log('Parsed → accessToken:',   accessToken  ? '✅' : '❌');
    console.log('Parsed → refreshToken:',  refreshToken ? '✅' : '❌');
    console.log('Parsed → phoneVerified:', phoneVerifiedRaw);
    console.log('Parsed → formFilled:',    formFilledRaw);

    const storedToken     = getItem('accessToken');
    const isOAuthCallback = currentPath === '/oauth/callback';

    console.log('localStorage → accessToken:', storedToken ? '✅' : '❌');
    console.log('currentPath:', currentPath);
    console.log('isOAuthCallbackPage:', isOAuthCallback);
    console.log('═══ App Init Debug End ═══');

    const hasOAuthData =
      userId || phoneVerifiedRaw !== null ||
      formFilledRaw !== null || accessToken || refreshToken;

    // ── CASE 1: No OAuth params ──
    if (!hasOAuthData) {
      const savedPhoneVerifiedRaw = getItem('phoneVerified');
      const savedFormFilledRaw    = getItem('formFilled');
      const savedUser             = getUserData() || {};
      const hasSavedFlags         =
        savedPhoneVerifiedRaw !== null || savedFormFilledRaw !== null;

      if (isOAuthCallback && hasSavedFlags) {
        console.log('↩️ Callback remount — resuming saved flow');
        navigateTo(toBool(savedPhoneVerifiedRaw), toBool(savedFormFilledRaw), savedUser);
        return;
      }

      if (storedToken) {
        const formFilled = getItem('formFilled');

        if (formFilled === 'true') {
          // ✅ Temporarily always go to BP Dashboard
          console.log('🤝 Redirecting to BP Dashboard (temp)');
          setScreen('bp_dashboard');
        } else {
          console.log('⚠️ Token hai but form nahi bhara — pehle login karao');
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
      console.log('✅ Tokens URL se save kiye');
    } else {
      console.log('✅ Tokens cookie mein hain');
    }

    const user = {
      userId,
      fullName: fullName || '',
      email: email || '',
      phoneVerified,
      formFilled,
    };

    if (userId || fullName || email) saveUserData(user);

    navigateTo(phoneVerified, formFilled, user);
  }, []);

  const navigateTo = (phoneVerified, formFilled, user = {}) => {
    console.log('navigateTo →', { phoneVerified, formFilled });

    if (!phoneVerified) {
      setResumeAuthFlow('signup_phone');
      setScreen('auth');
    } else if (phoneVerified && !formFilled) {
      setUserData(user);
      setScreen('form');
    } else if (phoneVerified && formFilled) {
      // ✅ Temporarily always go to BP Dashboard
      console.log('🤝 Redirecting to BP Dashboard (temp)');
      setScreen('bp_dashboard');
    } else {
      setScreen('auth');
    }

    setBooting(false);
  };

  const handleSessionExpired = () => {
    clearTokens();
    setResumeAuthFlow(null);
    setUserData(null);
    setSelectedRoles([]);
    setScreen('auth');
  };

  const handleFormComplete = ({ roles, data }) => {
    console.log('Form complete → roles:', roles);
    setSelectedRoles(roles);

    const currentUser = getUserData() || {};
    saveUserData({ ...currentUser, roles });
    setItem('formFilled', 'true');

    // ✅ Temporarily always go to BP Dashboard
    console.log('🤝 All roles → BP Dashboard (temp)');
    setScreen('bp_dashboard');

    // ── Original logic (commented out for now) ──
    // if (roles.includes('BUSINESS_PARTNER')) {
    //   console.log('🤝 Business Partner → BP Dashboard');
    //   setScreen('bp_dashboard');
    // } else {
    //   console.log('📋 Buyer/Seller → Plans Screen');
    //   setScreen('plans');
    // }
  };

  const handlePlanSelect = (planId) => {
    console.log('Plan selected → planId:', planId);
    setItem('selectedPlanId', planId);
  };

  const handlePaymentSuccess = () => {
    console.log('💳 Payment success → BP Dashboard (temp)');
    setScreen('bp_dashboard');
  };

  const handlePaymentRetry = () => {
    console.log('🔄 Payment retry → plans screen');
    const savedUser  = getUserData() || {};
    const savedRoles = savedUser?.roles || [];
    setSelectedRoles(savedRoles);
    setScreen('plans');
  };

  const handleBackToPlans = () => {
    console.log('↩️ Back to plans');
    const savedUser  = getUserData() || {};
    const savedRoles = savedUser?.roles || [];
    setSelectedRoles(savedRoles);
    setScreen('plans');
  };

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

  return (
    <>
      {screen === 'auth' && (
        <AuthCard
          initialFlow={resumeAuthFlow}
          onAuthenticated={() => setScreen('bp_dashboard')}
          onSignupComplete={(data) => { setUserData(data); setScreen('form'); }}
          onFormRequired={(data) => { setUserData(data); setScreen('form'); }}
        />
      )}

      {screen === 'form' && (
        <UserFormScreen
          phone={userData?.phone || ''}
          countryCode={userData?.countryCode || ''}
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
        <PaymentSuccess
          onContinue={handlePaymentSuccess}
        />
      )}

      {screen === 'payment_failed' && (
        <PaymentFailed
          onRetry={handlePaymentRetry}
          onBackToPlans={handleBackToPlans}
        />
      )}

      {/* ✅ Commented out normal Dashboard for now */}
      {/* {screen === 'dashboard' && (
        <Dashboard onLogout={handleSessionExpired} />
      )} */}

      {screen === 'bp_dashboard' && (
        <BusinessPartnerDashboard onLogout={handleSessionExpired} />
      )}
    </>
  );
}