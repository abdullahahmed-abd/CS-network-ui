// src/services/api.js
const BASE_URL = 'https://1fd7-2401-4900-8823-1e5e-fce6-797b-1311-ccf8.ngrok-free.app';

export const GOOGLE_AUTH_URL = `${BASE_URL}/cs-network/oauth2/authorization/google`;
export const APPLE_AUTH_URL = `${BASE_URL}/cs-network/oauth2/authorization/apple`;

const AUTH_OPS_URL = `${BASE_URL}/cs-network/auth-operations`;
const MEMBER_URL = `${BASE_URL}/member`;

// ── Generic auth-operations call ──────────────────────────────
export async function callAuthOps(body) {
  const res = await fetch(AUTH_OPS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

// ── Send OTP ──────────────────────────────────────────────────
export async function sendSignupOTP(userId, phoneNumber) {
  return callAuthOps({
    userId,
    phoneNumber,
    requestType: 'SEND_SIGNUP_OTP',
  });
}

export async function sendLoginOTP(phoneNumber) {
  return callAuthOps({
    phoneNumber,
    requestType: 'SEND_LOGIN_OTP',
  });
}

// ── Verify OTP ────────────────────────────────────────────────
export async function verifySignupOTP(userId, phoneNumber, otp) {
  return callAuthOps({
    userId,
    phoneNumber,
    otp,
    requestType: 'VERIFY_SIGNUP_OTP',
  });
}

export async function verifyLoginOTP(phoneNumber, otp) {
  return callAuthOps({
    phoneNumber,
    otp,
    requestType: 'VERIFY_LOGIN_OTP',
  });
}

// ── Save tokens after OTP verify ──────────────────────────────
export function saveAuthData(data, pendingUser) {
  const accessToken = data.accessToken || '';
  const refreshToken = data.refreshToken || '';
  const isFormFill = data.isFormFill === true;

  if (!accessToken) {
    throw new Error('Access token missing in OTP verify response');
  }

  localStorage.setItem('cs_accessToken', accessToken);
  localStorage.setItem('cs_refreshToken', refreshToken);
  localStorage.setItem('cs_isLoggedIn', 'true');
  localStorage.setItem('cs_userId', String(data.userId || pendingUser?.userId || ''));

  const userData = {
    userId: String(data.userId || pendingUser?.userId || ''),
    fullName: data.fullName || pendingUser?.fullName || '',
    email: data.email || pendingUser?.email || '',
    phone: pendingUser?.phone || '',
    isFormFill,
  };

  localStorage.setItem('cs_userData', JSON.stringify(userData));
  return { userData, isFormFill };
}

// ── Submit profile ────────────────────────────────────────────
export async function submitProfile(payload) {
  const accessToken = localStorage.getItem('cs_accessToken');
  if (!accessToken) {
    throw new Error('Access token missing. Please login again.');
  }

  const res = await fetch(MEMBER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `Error ${res.status}`);
  return data;
}

// ── OAuth redirects ───────────────────────────────────────────
export function startGoogleOAuth() {
  window.location.href = GOOGLE_AUTH_URL;
}

export function startAppleOAuth() {
  window.location.href = APPLE_AUTH_URL;
}