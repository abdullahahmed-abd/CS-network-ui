// api/auth.js

export const BASE_URL =
  'https://connectsouq.sundukpay.com';

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

export const setCookie = (name, value, days = 7) => {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    // SameSite=None; Secure is required for cross-origin requests (e.g. localhost -> ngrok)
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=None; Secure`;
  } catch (e) {
    console.warn('Cookie write failed:', e);
  }
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// ── Token helpers ─────────────────────────────────────────────────────────────
export const saveTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    setItem('accessToken', accessToken);
    setCookie('accessToken', accessToken, 7);
    setCookie('token', accessToken, 7);
    setCookie('jwt', accessToken, 7);
    setCookie('access_token', accessToken, 7);
    setCookie('Authorization', `Bearer ${accessToken}`, 7);
  }
  if (refreshToken) {
    setItem('refreshToken', refreshToken);
    setCookie('refreshToken', refreshToken, 7);
  }
};

export const getAccessToken = () => {
  const cookieToken = getCookie('accessToken') || getCookie('token') || getCookie('jwt');
  if (cookieToken) return decodeURIComponent(cookieToken);

  const lsToken = getItem('accessToken');
  if (lsToken) {
    setCookie('accessToken', lsToken, 7);
    setCookie('token', lsToken, 7);
    setCookie('jwt', lsToken, 7);
    setCookie('access_token', lsToken, 7);
    setCookie('Authorization', `Bearer ${lsToken}`, 7);
    return lsToken;
  }

  return null;
};

export const getRefreshToken = () => {
  return getCookie('refreshToken') || getCookie('token') || getItem('refreshToken');
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
  removeItem('pendingInviteToken');

  deleteCookie('accessToken');
  deleteCookie('token');
  deleteCookie('jwt');
  deleteCookie('access_token');
  deleteCookie('refreshToken');
  deleteCookie('Authorization');
  deleteCookie('JSESSIONID');
};

export const hasValidSession = () => {
  const accessToken  = getAccessToken();
  const refreshToken = getRefreshToken();
  return !!(accessToken || refreshToken);
};

// ── Save / Get user data ──────────────────────────────────────────────────────
export const saveUserData = (data) => {
  try {
    setItem('userData', JSON.stringify(data));
  } catch (e) {
    console.error('saveUserData error:', e);
  }
};

export const getUserData = () => {
  try {
    const raw = getItem('userData');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// ─────────────────────────────────────────
// Session expired handler (global)
// ─────────────────────────────────────────
let onSessionExpiredCallback = null;

export const setSessionExpiredHandler = (callback) => {
  onSessionExpiredCallback = callback;
};

const triggerSessionExpired = () => {
  console.log('🔒 Session fully expired — logging out');
  clearTokens();
  if (onSessionExpiredCallback) {
    onSessionExpiredCallback();
  }
};

// ─────────────────────────────────────────
// Refresh token — with lock to prevent
// multiple simultaneous refresh calls
// ─────────────────────────────────────────
let isRefreshing   = false;
let refreshPromise = null;

export const refreshAccessToken = async () => {
  // If already refreshing, wait for that to finish
  if (isRefreshing && refreshPromise) {
    console.log('🔄 Refresh already in progress, waiting...');
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();

  console.log('🔄 Refreshing token...');
  console.log('   Refresh source:', refreshToken ? '💾 localStorage' : '🍪 HttpOnly cookie');

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const body = { requestType: 'REFRESH_TOKEN' };

      // Agar JS-readable refresh token hai to body me bhi bhejo (fallback)
      if (refreshToken) {
        body.refreshToken = refreshToken;
      }

      const res = await fetch(`${BASE_URL}/cs-network/auth-operations`, {
        method: 'POST',
        credentials: 'include',
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

      console.log(`📨 Refresh response [${res.status}]:`, data);

      if (!res.ok) {
        console.error('❌ Refresh failed:', data);
        throw new Error('REFRESH_FAILED');
      }

      // Save new tokens
      if (data.accessToken) {
        console.log('✅ New access token received');
        saveTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      }

      // Cookie mode — backend sets new cookie
      console.log('✅ Refresh successful (cookie updated by backend)');
      return null;

    } catch (err) {
      console.error('❌ Token refresh error:', err.message);
      throw err;
    } finally {
      isRefreshing   = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ─────────────────────────────────────────
// Auth operations (OTP send/verify)
// These do NOT need auto-refresh
// ─────────────────────────────────────────
export const authOperation = async (payload) => {
  console.log('🔐 authOperation:', payload.requestType);

  const res = await fetch(`${BASE_URL}/cs-network/auth-operations`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const text = await res.text();
    if (text.includes('ngrok')) {
      throw new Error('Tunnel issue - please refresh.');
    }
    data = { message: text };
  }

  console.log(`📨 authOperation [${res.status}]:`, data);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Something went wrong');
  }

  return data;
};

// ─────────────────────────────────────────
// Authenticated Fetch — WITH auto-refresh
// Use this for ALL protected API calls
// ─────────────────────────────────────────
export const authenticatedFetch = async (url, options = {}, retried = false) => {
  let accessToken = getAccessToken();

  const buildHeaders = (token) => {
    const baseHeaders = {
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData)) {
      baseHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
      baseHeaders['Authorization'] = `Bearer ${token}`;
    }

    return baseHeaders;
  };

  // ── First attempt ──
  let res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: buildHeaders(accessToken),
  });

  console.log(`📡 authenticatedFetch [${res.status}] → ${url}`);

  // ── 401 → try refresh (only once) ──
  if (res.status === 401 && !retried) {
    console.log('🔒 Got 401 — attempting token refresh...');

    try {
      accessToken = await refreshAccessToken();
      console.log('✅ Token refreshed — retrying original request...');

      res = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: buildHeaders(accessToken),
      });

      console.log(`📡 authenticatedFetch retry [${res.status}]`);
    } catch (refreshError) {
      console.error('❌ Refresh failed:', refreshError.message);
      triggerSessionExpired();
      throw new Error('Session expired. Please login again.');
    }
  }

  // ── 401 even after retry — fully expired ──
  if (res.status === 401 && retried) {
    console.log('🔒 401 after refresh — session dead');
    triggerSessionExpired();
    throw new Error('Session expired. Please login again.');
  }

  // ── Parse response ──
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  // ── 403 ──
  if (res.status === 403) {
    const errorMsg = data?.message || 'Access denied. You do not have permission.';
    const err = new Error(errorMsg);
    err.status = 403;
    err.data = data;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
};

// ─────────────────────────────────────────
// apiCall — Shortcut for authenticated calls
// Uses authenticatedFetch with full URL
// ─────────────────────────────────────────
export const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}/cs-network${endpoint}`;

  const fetchOptions = {
    method: options.method || 'POST',
    ...(options.body && {
      body: typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body),
    }),
    ...(options.headers && { headers: options.headers }),
  };

  return authenticatedFetch(url, fetchOptions);
};

// ── Google OAuth ──────────────────────────────────────────────────────────────
export const redirectToGoogle = () => {
  window.location.href = `${BASE_URL}/cs-network/oauth2/authorization/google`;
};