// api/partnershipsApi.js
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Strategic Partnership Module API Service
// Specification: ConnectSouq Backend — Integration Guide v1.1 (August 2026)
// Endpoint: POST /partnerships (multipart/form-data discriminator factory pattern)
// Document Download: GET /partnerships/documents/{documentId}/download
// ══════════════════════════════════════════════════════════════════════════════

import { authenticatedFetch, getAccessToken, BASE_URL } from './auth';

// ─────────────────────────────────────────────
// Enums & Reference Constants (§3.4 & §6)
// ─────────────────────────────────────────────
export const PARTNERSHIP_REQUEST_TYPES = {
  CREATE_PARTNERSHIP: 'CREATE_PARTNERSHIP',
  FETCH_PARTNERSHIP_HIERARCHY: 'FETCH_PARTNERSHIP_HIERARCHY',
  FETCH_PARTNERSHIPS: 'FETCH_PARTNERSHIPS',
  FETCH_PARTNERSHIP_DETAILS: 'FETCH_PARTNERSHIP_DETAILS',
  APPROVE_PARTNERSHIP: 'APPROVE_PARTNERSHIP',
  REJECT_PARTNERSHIP: 'REJECT_PARTNERSHIP',
};

export const PARTNERSHIP_TIERS = {
  LOCAL_ORGANISATION: 'LOCAL_ORGANISATION',
  NATIONAL_CHAMBER_OR_MAJOR_CORPORATE: 'NATIONAL_CHAMBER_OR_MAJOR_CORPORATE',
  GOVERNMENT_MINISTRY_OR_AGENCY: 'GOVERNMENT_MINISTRY_OR_AGENCY',
  STRATEGIC_GLOBAL: 'STRATEGIC_GLOBAL',
};

export const PARTNERSHIP_TIER_LABELS = {
  LOCAL_ORGANISATION: 'Local Organisation',
  NATIONAL_CHAMBER_OR_MAJOR_CORPORATE: 'National Chamber / Major Corporate',
  GOVERNMENT_MINISTRY_OR_AGENCY: 'Government Ministry / Agency',
  STRATEGIC_GLOBAL: 'Strategic Global',
};

export const PARTNERSHIP_STATUSES = {
  PENDING_OPERATOR_APPROVAL: 'PENDING_OPERATOR_APPROVAL',
  PENDING_MASTER_APPROVAL: 'PENDING_MASTER_APPROVAL',
  PENDING_ADMIN_APPROVAL: 'PENDING_ADMIN_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const PARTNERSHIP_FILTERS = {
  MY_PENDING: 'MY_PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ALL: 'ALL',
};

// §6 currentStage -> Human-Readable Label Mapping
export const CURRENT_STAGE_LABELS = {
  PENDING_OPERATOR_APPROVAL: 'Pending Franchise Operator Approval',
  PENDING_MASTER_APPROVAL: 'Pending Master Franchise Approval',
  PENDING_ADMIN_APPROVAL: 'Pending Global Admin Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

// ─────────────────────────────────────────────
// Role Classification Helper for Strategic Partnerships
// ─────────────────────────────────────────────
export const getPartnershipRoleCategory = (user = {}) => {
  const roles = user.roles || [];
  const membershipType = user.membershipType || '';
  const franchiseType = (user.franchiseType || '').toUpperCase();

  if (roles.includes('GLOBAL_ADMIN')) {
    return 'GLOBAL_ADMIN';
  }

  const isOperator =
    roles.includes('OPERATOR') ||
    roles.includes('MASTER_OPERATOR') ||
    roles.includes('GENERAL_OPERATOR') ||
    user.isOperator === true ||
    membershipType === 'OPERATOR';

  if (isOperator) {
    if (franchiseType === 'MASTER' || roles.includes('MASTER_OPERATOR')) {
      return 'MASTER_OPERATOR';
    }
    return 'GENERAL_SECTOR_OPERATOR';
  }

  return 'MEMBER';
};

// ─────────────────────────────────────────────
// Multipart HTTP Client Helper
// Every operation POSTs multipart/form-data to /partnerships
// ─────────────────────────────────────────────
const partnershipCall = async (formData) => {
  const token = getAccessToken();
  const headers = {
    'ngrok-skip-browser-warning': '69420',
  };

  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  // Attempt API call directly or via /cs-network/partnerships
  const tryFetch = async (url) => {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `HTTP error ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  };

  try {
    return await tryFetch(`${BASE_URL}/cs-network/partnerships`);
  } catch (err) {
    if (err.status === 404 || (err.message && err.message.toLowerCase().includes('not found'))) {
      return await tryFetch(`${BASE_URL}/partnerships`);
    }
    throw err;
  }
};

// ─────────────────────────────────────────────
// API Functions (§5.1 - §5.6)
// ─────────────────────────────────────────────

/**
 * 5.1 CREATE_PARTNERSHIP
 * Member registers a new strategic partnership with documents.
 */
export const createPartnership = async ({
  partnershipTier,
  organisationName,
  description = '',
  documents = {}, // Map of key -> File object
}) => {
  if (!partnershipTier) throw new Error('partnershipTier is required.');
  if (!organisationName || !organisationName.trim()) throw new Error('organisationName is required.');
  if (!documents || Object.keys(documents).length === 0) {
    throw new Error('At least one supporting document is required.');
  }

  const formData = new FormData();
  formData.append('requestType', PARTNERSHIP_REQUEST_TYPES.CREATE_PARTNERSHIP);
  formData.append('partnershipTier', partnershipTier);
  formData.append('organisationName', organisationName.trim());
  if (description?.trim()) {
    formData.append('description', description.trim());
  }

  Object.entries(documents).forEach(([key, file]) => {
    if (file instanceof File) {
      formData.append(`documents[${key}]`, file);
    }
  });

  return await partnershipCall(formData);
};

/**
 * 5.2 FETCH_PARTNERSHIP_HIERARCHY
 * Loads franchise tree for left-hand navigation panel (cached client-side).
 */
export const fetchPartnershipHierarchy = async () => {
  const formData = new FormData();
  formData.append('requestType', PARTNERSHIP_REQUEST_TYPES.FETCH_PARTNERSHIP_HIERARCHY);
  return await partnershipCall(formData);
};

/**
 * 5.3 FETCH_PARTNERSHIPS
 * Powers main dashboard table, pagination, search & counts.
 */
export const fetchPartnerships = async ({
  filter = PARTNERSHIP_FILTERS.MY_PENDING,
  page = 0,
  size = 100,
  search = '',
  franchiseId = null,
} = {}) => {
  const formData = new FormData();
  formData.append('requestType', PARTNERSHIP_REQUEST_TYPES.FETCH_PARTNERSHIPS);
  formData.append('filter', filter);
  formData.append('page', String(page));
  formData.append('size', String(size));

  if (search?.trim()) {
    formData.append('search', search.trim());
  }
  if (franchiseId !== null && franchiseId !== undefined && franchiseId !== '') {
    formData.append('franchiseId', String(franchiseId));
  }

  return await partnershipCall(formData);
};

/**
 * 5.4 FETCH_PARTNERSHIP_DETAILS
 * Loads single partnership full detail view.
 */
export const fetchPartnershipDetails = async (partnershipId) => {
  if (!partnershipId) throw new Error('partnershipId is required.');

  const formData = new FormData();
  formData.append('requestType', PARTNERSHIP_REQUEST_TYPES.FETCH_PARTNERSHIP_DETAILS);
  formData.append('partnershipId', String(partnershipId));

  return await partnershipCall(formData);
};

/**
 * 5.5 APPROVE_PARTNERSHIP
 * Approves current pending stage and advances workflow.
 */
export const approvePartnership = async ({ partnershipId, comment = '' }) => {
  if (!partnershipId) throw new Error('partnershipId is required.');

  const formData = new FormData();
  formData.append('requestType', PARTNERSHIP_REQUEST_TYPES.APPROVE_PARTNERSHIP);
  formData.append('partnershipId', String(partnershipId));
  if (comment?.trim()) {
    formData.append('comment', comment.trim());
  }

  return await partnershipCall(formData);
};

/**
 * 5.6 REJECT_PARTNERSHIP
 * Rejects partnership at current pending stage.
 */
export const rejectPartnership = async ({ partnershipId, rejectionReason }) => {
  if (!partnershipId) throw new Error('partnershipId is required.');
  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error('rejectionReason is required.');
  }

  const formData = new FormData();
  formData.append('requestType', PARTNERSHIP_REQUEST_TYPES.REJECT_PARTNERSHIP);
  formData.append('partnershipId', String(partnershipId));
  formData.append('rejectionReason', rejectionReason.trim());

  return await partnershipCall(formData);
};

/**
 * 3.6 Document Download
 * Dedicated GET endpoint for document download / preview.
 * GET /partnerships/documents/{documentId}/download
 */
export const downloadPartnershipDocument = async (documentId, fileName = 'document.pdf') => {
  if (!documentId) throw new Error('documentId is required.');

  const token = getAccessToken();
  const headers = {
    'ngrok-skip-browser-warning': '69420',
  };
  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  const downloadUrl = `${BASE_URL}/cs-network/partnerships/documents/${documentId}/download`;

  try {
    const res = await fetch(downloadUrl, { method: 'GET', headers });
    if (!res.ok) {
      let errMsg = `Download failed (HTTP ${res.status})`;
      try {
        const json = await res.json();
        if (json.message) errMsg = json.message;
      } catch { }
      throw new Error(errMsg);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('❌ Document Download Error:', err);
    throw err;
  }
};
