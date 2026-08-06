// api/profileOperationsApi.js
import { authenticatedFetch, BASE_URL, saveUserData, getUserData } from './auth';

/**
 * File validation rules enforced server-side & client-side:
 * - Allowed formats: JPEG, PNG, WEBP, GIF
 * - Maximum size: 5 MB (5 * 1024 * 1024 bytes)
 * - Must not be empty
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, message: 'profilePhoto file is required.' };
  }

  if (file.size === 0) {
    return { valid: false, message: 'File is empty. Please select a valid photo.' };
  }

  const maxBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxBytes) {
    return { valid: false, message: 'Profile photo must be 5MB or smaller.' };
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  const fileNameLower = (file.name || '').toLowerCase();
  const hasValidExt = allowedExtensions.some((ext) => fileNameLower.endsWith(ext));
  const hasValidType = allowedTypes.includes(file.type?.toLowerCase());

  if (!hasValidExt && !hasValidType) {
    return { valid: false, message: 'Only JPEG, PNG, WEBP, or GIF images are supported.' };
  }

  return { valid: true };
};

/**
 * 1. 👤 Upload / Replace Profile Picture
 * Endpoint: POST /profile-operations
 * Authorization: Bearer <token>
 * Content-Type: multipart/form-data
 *
 * FormData fields:
 * - profileRequestType: "UPLOAD_PROFILE_PHOTO"
 * - file: <File object>
 */
export const uploadProfilePhoto = async (file) => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const formData = new FormData();
  formData.append('profileRequestType', 'UPLOAD_PROFILE_PHOTO');
  formData.append('file', file);

  const data = await authenticatedFetch(`${BASE_URL}/cs-network/profile-operations`, {
    method: 'POST',
    body: formData,
  });

  // After successful upload, option to refresh user cache
  if (data?.fileUrl) {
    const existing = getUserData() || {};
    saveUserData({
      ...existing,
      profilePhotoUrl: resolvePhotoUrl(data.fileUrl),
    });
  }

  return data;
};

/**
 * 2. 🖼️ Upload / Replace Event Cover Photo
 * Endpoint: POST /profile-operations
 * Authorization: Bearer <admin-token>
 * Content-Type: multipart/form-data
 *
 * FormData fields:
 * - profileRequestType: "UPLOAD_EVENT_PHOTO"
 * - eventId: <string | number>
 * - file: <File object>
 */
export const uploadEventCoverPhoto = async (eventId, file) => {
  if (!eventId) {
    throw new Error('eventId is required.');
  }

  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const formData = new FormData();
  formData.append('profileRequestType', 'UPLOAD_EVENT_PHOTO');
  formData.append('eventId', String(eventId));
  formData.append('file', file);

  const data = await authenticatedFetch(`${BASE_URL}/cs-network/profile-operations`, {
    method: 'POST',
    body: formData,
  });

  return data;
};

/**
 * 3. 👤 FETCH_MY_PROFILE API
 * Endpoint: POST /cs-network/member
 * Authorization: Bearer <token>
 * Content-Type: application/json
 *
 * Body: { "memberRequestType": "FETCH_MY_PROFILE" }
 */
export const fetchMyProfile = async () => {
  const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
    method: 'POST',
    body: JSON.stringify({
      memberRequestType: 'FETCH_MY_PROFILE',
    }),
  });

  if (data?.profile) {
    const existing = getUserData() || {};
    saveUserData({
      ...existing,
      ...data.profile,
      profilePhotoUrl: resolvePhotoUrl(data.profile.profilePhotoUrl),
    });
  }

  return data;
};

/**
 * Helper to construct image URLs for display.
 *
 * WHY THIS MATTERS:
 * Browsers cannot send custom headers (like ngrok-skip-browser-warning)
 * on <img src> or CSS background-image requests.
 * ngrok returns its HTML warning page instead of the actual image.
 *
 * SOLUTION:
 * Strip the ngrok domain from /uploads paths → use local Vite proxy path.
 * Vite proxy adds the ngrok header server-side → ngrok serves the real image.
 *
 * e.g. https://ngrok-xyz.ngrok-free.app/uploads/photo.jpg
 *       → /uploads/photo.jpg  (proxied via Vite with ngrok header)
 */
export const resolvePhotoUrl = (rawUrl) => {
  if (!rawUrl) return null;

  // Already a local proxy path — just add cache buster
  if (rawUrl.startsWith('/uploads/')) {
    return `${rawUrl}?t=${Date.now()}`;
  }

  // Full ngrok URL with /uploads path → strip domain, use Vite proxy
  try {
    const parsed = new URL(rawUrl);
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${parsed.pathname}?t=${Date.now()}`;
    }
  } catch {
    // Not a valid URL, fall through
  }

  // Relative path without /uploads prefix
  if (rawUrl.startsWith('/')) {
    return `${BASE_URL}${rawUrl}?t=${Date.now()}`;
  }

  // Absolute URL (non-ngrok CDN etc.) — use as-is with cache buster
  const separator = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${separator}t=${Date.now()}`;
};
