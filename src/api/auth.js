// api/auth.js

const BASE_URL =
  'https://01cb-2405-201-3037-e150-441e-937-466f-13e7.ngrok-free.app';

// ── Storage helpers ───────────────────────────────────────────────────────────
export const setItem = (key, value) => {
  try {
    localStorage.setItem(`cs_${key}`, value);
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
};

export const getItem = (key) => {
  try {
    return localStorage.getItem(`cs_${key}`);
  } catch (e) {
    console.warn('localStorage read failed:', e);
    return null;
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(`cs_${key}`);
  } catch (e) {
    console.warn('localStorage remove failed:', e);
  }
};

export const toBool = (value) => String(value).toLowerCase() === 'true';

// ── Cookie helpers ────────────────────────────────────────────────────────────
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// ── Token helpers ─────────────────────────────────────────────────────────────
export const saveTokens = (accessToken, refreshToken) => {
  if (accessToken) setItem('accessToken', accessToken);
  if (refreshToken) setItem('refreshToken', refreshToken);
};

// ✅ Note: HttpOnly cookies JS se read nahi hoti — ye mostly null return karega
// Backend cookie automatically bhej dega via credentials: 'include'
export const getAccessToken = () => {
  const cookieToken = getCookie('accessToken');
  if (cookieToken) {
    console.log('🍪 Token from COOKIE');
    return cookieToken;
  }

  const lsToken = getItem('accessToken');
  if (lsToken) {
    console.log('💾 Token from localStorage');
    return lsToken;
  }

  console.log('🍪 HttpOnly cookie mode (JS cannot read token)');
  return null;
};

export const getRefreshToken = () => {
  return getCookie('refreshToken') || getItem('refreshToken');
};

export const clearTokens = () => {
  removeItem('accessToken');
  removeItem('refreshToken');
  removeItem('userId');
  removeItem('isFormFill');
  removeItem('phoneVerified');
  removeItem('pendingPhone');
  removeItem('userData');
  removeItem('formFilled');
  removeItem('selectedPlanId');
  removeItem('planPurchased');

  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  deleteCookie('JSESSIONID');
};

// ── Save / Get user data ──────────────────────────────────────────────────────
export const saveUserData = (data) => {
  setItem('userData', JSON.stringify(data));
};

export const getUserData = () => {
  const raw = getItem('userData');
  return raw ? JSON.parse(raw) : null;
};

// ── Generic auth operation ────────────────────────────────────────────────────
export const authOperation = async (payload) => {
  const res = await fetch(`${BASE_URL}/cs-network/auth-operations`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Something went wrong');
  return data;
};

// ── Refresh Token ─────────────────────────────────────────────────────────────
// ✅ HttpOnly refresh cookie automatically jayegi via credentials: 'include'
// Body me sirf requestType bhejo. Agar localStorage me hai to fallback me refreshToken bhi bhejo
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  console.log('🔄 Refreshing token...');
  console.log('   Refresh source:', refreshToken ? '💾 localStorage' : '🍪 HttpOnly cookie');

  const body = { requestType: 'REFRESH_TOKEN' };

  // ✅ Agar JS-readable refresh token hai to body me bhi bhejo (fallback)
  if (refreshToken) {
    body.refreshToken = refreshToken;
  }

  const res = await fetch(`${BASE_URL}/cs-network/auth-operations`, {
    method: 'POST',
    credentials: 'include',   // ✅ HttpOnly refresh cookie automatically jayegi
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    console.error('❌ Refresh failed:', data);
    clearTokens();
    throw new Error('Session expired. Please login again.');
  }

  if (data.accessToken) {
    console.log('✅ New access token received');
    saveTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  }

  // ✅ Cookie mode me backend token body me na bhi bheje — nayi cookie set ho gayi hogi
  console.log('✅ Refresh successful (cookie updated by backend)');
  return null;
};

// ── Authenticated Fetch ───────────────────────────────────────────────────────
// ✅ HttpOnly access cookie automatically jayegi via credentials: 'include'
// Agar localStorage me token hai to Bearer header bhi bhej do (fallback)
export const authenticatedFetch = async (url, options = {}) => {
  let accessToken = getAccessToken();

  console.log(
    'authenticatedFetch → token source:',
    accessToken ? '✅ FOUND (localStorage/cookie)' : '🍪 HttpOnly cookie only'
  );

  const buildHeaders = (token) => {
    const baseHeaders = {
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    };

    // ✅ Content-Type only when needed
    if (!(options.body instanceof FormData)) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    // ✅ Token mila to header me bhejo (fallback)
    if (token) {
      baseHeaders['Authorization'] = `Bearer ${token}`;
    }

    return baseHeaders;
  };

  // ── First attempt ──
  // credentials: 'include' → HttpOnly cookies automatically jayengi
  let res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: buildHeaders(accessToken),
  });

  console.log('authenticatedFetch → status:', res.status);

  // ── 401 → try refresh ──
  if (res.status === 401) {
    console.log('401 mila — refresh kar rahe hain...');
    try {
      accessToken = await refreshAccessToken();
      console.log('✅ Token refresh ho gaya');

      res = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: buildHeaders(accessToken),
      });

      console.log('authenticatedFetch retry → status:', res.status);
    } catch (refreshError) {
      console.error('❌ Refresh fail:', refreshError);
      throw new Error('Session expired. Please login again.');
    }
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
};

// ── Google OAuth ──────────────────────────────────────────────────────────────
export const redirectToGoogle = () => {
  window.location.href = `${BASE_URL}/cs-network/oauth2/authorization/google`;
};