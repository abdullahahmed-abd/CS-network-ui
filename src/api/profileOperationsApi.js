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
 * 3. 👤 FETCH_MY_PROFILE_PHOTO API
 * Endpoint: POST /cs-network/profile-operations
 * Content-Type: multipart/form-data
 * Authorization: Bearer <token>
 *
 * Body: formData { profileRequestType: "FETCH_PROFILE" }
 * Response: { "profilePhotoUrl": "https://connectsouq.sundukpay.com/uploads/profile-pictures/1/uuid.jpg" }
 */
export const fetchMyProfilePhoto = async () => {
  const formData = new FormData();
  formData.append('profileRequestType', 'FETCH_PROFILE');

  const data = await authenticatedFetch(`${BASE_URL}/cs-network/profile-operations`, {
    method: 'POST',
    body: formData,
  });

  if (data?.profilePhotoUrl) {
    const existing = getUserData() || {};
    saveUserData({
      ...existing,
      profilePhotoUrl: data.profilePhotoUrl,
    });
  }

  return data;
};

/**
 * 4. 🖼️ FETCH_EVENT_COVER_PHOTO API
 * Endpoint: POST /cs-network/profile-operations
 * Content-Type: multipart/form-data
 * Authorization: Bearer <token>
 *
 * Body: formData { profileRequestType: "FETCH_EVENT_COVER_PHOTO", eventId: 3 }
 * Response: { "fileUrl": "https://connectsouq.sundukpay.com/uploads/events/3/uuid.jpg" }
 */
export const fetchEventCoverPhoto = async (eventId) => {
  if (!eventId) {
    throw new Error('eventId is required.');
  }

  const formData = new FormData();
  formData.append('profileRequestType', 'FETCH_EVENT_COVER_PHOTO');
  formData.append('eventId', String(eventId));

  const data = await authenticatedFetch(`${BASE_URL}/cs-network/profile-operations`, {
    method: 'POST',
    body: formData,
  });

  return data;
};

/**
 * 5. 👤 FETCH_MY_PROFILE API
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

  let photoUrl = data?.profile?.profilePhotoUrl || data?.profile?.profilePicture;

  // Also fetch dedicated profile photo via FETCH_PROFILE endpoint
  try {
    const photoRes = await fetchMyProfilePhoto();
    if (photoRes?.profilePhotoUrl) {
      photoUrl = photoRes.profilePhotoUrl;
    }
  } catch (err) {
    console.warn('fetchMyProfilePhoto fallback error:', err);
  }

  if (data?.profile || photoUrl) {
    const existing = getUserData() || {};
    const updatedUser = {
      ...existing,
      ...(data?.profile || {}),
      ...(photoUrl ? { profilePhotoUrl: photoUrl } : {}),
    };
    saveUserData(updatedUser);
  }

  return {
    ...data,
    profile: {
      ...(data?.profile || {}),
      ...(photoUrl ? { profilePhotoUrl: photoUrl } : {}),
    },
  };
};

export const API_BASE_URL = 'https://connectsouq.sundukpay.com/cs-network';

/**
 * Helper to construct image URLs for display.
 * Handles full URLs (e.g. https://connectsouq.sundukpay.com/uploads/...) as well as relative paths.
 */
export const resolvePhotoUrl = (rawUrl) => {
  if (!rawUrl) return null;

  // Clean internal Docker container /app/ path to public web server /uploads/ path
  let cleaned = String(rawUrl)
    .replace('/app/uploads/', '/uploads/')
    .replace('app/uploads/', 'uploads/');

  // Full URL (http:// or https://)
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    const separator = cleaned.includes('?') ? '&' : '?';
    return `${cleaned}${separator}t=${Date.now()}`;
  }

  // Relative path starting with /
  if (cleaned.startsWith('/')) {
    const separator = cleaned.includes('?') ? '&' : '?';
    return `${BASE_URL}${cleaned}${separator}t=${Date.now()}`;
  }

  // Relative path without leading slash
  const separator = cleaned.includes('?') ? '&' : '?';
  return `${BASE_URL}/${cleaned}${separator}t=${Date.now()}`;
};
