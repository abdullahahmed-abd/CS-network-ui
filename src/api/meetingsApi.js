// api/meetingsApi.js
// ══════════════════════════════════════════════════════════════════════════════
// ConnectSouq Meetings Module API Service
// Specification: ConnectSouq Backend — Request/Response Specification v2
// ══════════════════════════════════════════════════════════════════════════════

import { apiCall, authenticatedFetch, getUserData, getItem } from './auth';

const BASE_URL = 'https://unbarrable-semidivisive-rolanda.ngrok-free.dev';

// ─────────────────────────────────────────────
// Enums & Reference Constants
// ─────────────────────────────────────────────
export const MEETING_REQUEST_TYPES = {
  DIRECT: 'DIRECT',
  SPECIFIC_USERS: 'SPECIFIC_USERS',
  SPECIFIC_FRANCHISE: 'SPECIFIC_FRANCHISE',
  FRANCHISE_DOWNLINE: 'FRANCHISE_DOWNLINE',
  ALL: 'ALL',
};

export const MEETING_AUDIENCE_SCOPES = MEETING_REQUEST_TYPES;

export const MEETING_LOCATION_TYPES = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
};

export const MEETING_STATUSES = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// ─────────────────────────────────────────────
// Role Classification Helper for Meetings Module (§2)
// ─────────────────────────────────────────────
export const getMeetingRoleCategory = (user = {}) => {
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
// Client-Side Validation Function
// Mirrored after backend constraints & Role-Based Access Mapping
// ─────────────────────────────────────────────
export const validateMeetingPayload = (payload = {}, user = {}) => {
  const errors = [];
  const roleCategory = getMeetingRoleCategory(user);

  // Title
  if (!payload.title || !payload.title.trim()) {
    errors.push('Meeting title is required.');
  }

  // Duration (5 to 720 minutes)
  const duration = Number(payload.durationMinutes);
  if (!payload.durationMinutes || isNaN(duration)) {
    errors.push('Duration is required.');
  } else if (duration < 5 || duration > 720) {
    errors.push('Duration must be between 5 and 720 minutes.');
  }

  // Scheduled date/time
  if (!payload.scheduledAt) {
    errors.push('Scheduled date and time is required.');
  } else {
    const scheduledTime = new Date(payload.scheduledAt).getTime();
    if (isNaN(scheduledTime)) {
      errors.push('Scheduled time must be a valid date.');
    } else if (scheduledTime <= Date.now()) {
      errors.push('Meeting cannot be scheduled in the past.');
    }
  }

  // Location type & conditional fields
  if (!payload.locationType) {
    errors.push('Location type is required.');
  } else if (payload.locationType === MEETING_LOCATION_TYPES.ONLINE) {
    if (!payload.meetingLink || !payload.meetingLink.trim()) {
      errors.push('Meeting link is required for online meetings.');
    }
  } else if (payload.locationType === MEETING_LOCATION_TYPES.OFFLINE) {
    if (!payload.address || !payload.address.trim()) {
      errors.push('Meeting address is required for offline meetings.');
    }
  } else {
    errors.push('Invalid location type.');
  }

  // Request type & Audience scope
  if (!payload.requestType || !payload.audienceScope) {
    errors.push('Request type and audience scope are required.');
  } else if (payload.requestType !== payload.audienceScope) {
    errors.push('Request type and audience scope must match.');
  }

  // Role permissions check (§1 & §2)
  if (roleCategory === 'MEMBER') {
    if (payload.requestType !== MEETING_REQUEST_TYPES.DIRECT) {
      errors.push('Members can only schedule direct meetings.');
    }
  }

  // Scenario specific fields (§7 Payload Checklist)
  switch (payload.requestType) {
    case MEETING_REQUEST_TYPES.DIRECT:
      if (!payload.conversationId) {
        errors.push('Conversation ID is required for direct meetings.');
      }
      break;

    case MEETING_REQUEST_TYPES.SPECIFIC_USERS:
      if (!Array.isArray(payload.userIds) || payload.userIds.length === 0) {
        errors.push('At least one user must be selected.');
      }
      break;

    case MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE:
      if (!Array.isArray(payload.franchiseIds) || payload.franchiseIds.length === 0) {
        errors.push('Please select at least one franchise.');
      }
      break;

    case MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE:
    case MEETING_REQUEST_TYPES.ALL:
      // No extra fields required per §7 Payload Checklist
      break;

    default:
      errors.push('Invalid meeting scenario.');
      break;
  }

  return errors;
};

// ─────────────────────────────────────────────
// Build ScheduleMeetingRequest Payload
// Cleanly strips ignored fields per scenario checklist (§7)
// ─────────────────────────────────────────────
export const buildMeetingPayload = (form = {}) => {
  const reqType = form.requestType || MEETING_REQUEST_TYPES.DIRECT;
  const locType = form.locationType || MEETING_LOCATION_TYPES.ONLINE;

  const basePayload = {
    title: form.title?.trim() || '',
    ...(form.description?.trim() && { description: form.description.trim() }),
    scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : '',
    durationMinutes: Number(form.durationMinutes) || 30,
    locationType: locType,
    ...(locType === MEETING_LOCATION_TYPES.ONLINE
      ? { meetingLink: form.meetingLink?.trim() || '' }
      : { address: form.address?.trim() || '' }),
    audienceScope: reqType,
    requestType: reqType,
  };

  switch (reqType) {
    case MEETING_REQUEST_TYPES.DIRECT:
      return {
        ...basePayload,
        conversationId: Number(form.conversationId) || null,
      };

    case MEETING_REQUEST_TYPES.SPECIFIC_USERS:
      return {
        ...basePayload,
        userIds: Array.isArray(form.userIds)
          ? form.userIds.map(Number).filter(Boolean)
          : [],
      };

    case MEETING_REQUEST_TYPES.SPECIFIC_FRANCHISE:
      return {
        ...basePayload,
        franchiseIds: Array.isArray(form.franchiseIds)
          ? form.franchiseIds.map(Number).filter(Boolean)
          : [],
      };

    case MEETING_REQUEST_TYPES.FRANCHISE_DOWNLINE:
    case MEETING_REQUEST_TYPES.ALL:
    default:
      return basePayload;
  }
};

// ─────────────────────────────────────────────
// Primary API Function: scheduleMeeting
// Sends POST to /meetings with proper headers & fallback
// ─────────────────────────────────────────────
export const scheduleMeeting = async (formPayload) => {
  const user = getUserData() || {};
  const payload = buildMeetingPayload(formPayload);

  // Client-side safety check
  const clientErrors = validateMeetingPayload(payload, user);
  if (clientErrors.length > 0) {
    throw new Error(clientErrors.join('; '));
  }

  console.log('📅 Scheduling Meeting Payload:', payload);

  try {
    // Attempt standard API call via apiCall (/cs-network/meetings)
    return await apiCall('/meetings', {
      method: 'POST',
      body: payload,
    });
  } catch (err) {
    console.warn('⚠️ apiCall /meetings failed, retrying direct endpoint...', err.message);
    // Fallback attempt directly to /meetings if cs-network prefix differs
    try {
      return await authenticatedFetch(`${BASE_URL}/meetings`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (fallbackErr) {
      throw err; // throw original backend error
    }
  }
};

// ─────────────────────────────────────────────
// Read-Only Fetch APIs (§1, §2, §3 of Fetch APIs Spec)
// ─────────────────────────────────────────────

/**
 * 1. FETCH_ELIGIBLE_FRANCHISES
 * Fetches hierarchy-ordered eligible franchises for the franchise picker UI.
 */
export const fetchEligibleFranchises = async ({ search = '', page = 0, size = 100 } = {}) => {
  const body = {
    requestType: 'FETCH_ELIGIBLE_FRANCHISES',
    ...(search?.trim() && { search: search.trim() }),
    page,
    size,
  };

  try {
    return await apiCall('/meetings', { method: 'POST', body });
  } catch (err) {
    return await authenticatedFetch(`${BASE_URL}/meetings`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
};

/**
 * 2. FETCH_ELIGIBLE_USERS
 * Fetches eligible users across the organizer's hierarchy with membershipType & depth.
 * Handles HTTP 400 hierarchy errors by retrying without franchise narrowing.
 */
export const fetchEligibleUsers = async ({ search = '', franchiseIds, page = 0, size = 100 } = {}) => {
  const buildBody = (fIds) => ({
    requestType: 'FETCH_ELIGIBLE_USERS',
    ...(search?.trim() && { search: search.trim() }),
    ...(Array.isArray(fIds) && fIds.length > 0 && { franchiseIds: fIds.map(Number) }),
    page,
    size,
  });

  try {
    return await apiCall('/meetings', { method: 'POST', body: buildBody(franchiseIds) });
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('outside your permitted hierarchy') && franchiseIds) {
      console.warn('⚠️ FranchiseIds outside hierarchy, retrying unscoped...');
      return await apiCall('/meetings', { method: 'POST', body: buildBody(undefined) });
    }
    try {
      return await authenticatedFetch(`${BASE_URL}/meetings`, {
        method: 'POST',
        body: JSON.stringify(buildBody(franchiseIds)),
      });
    } catch (fallbackErr) {
      throw err;
    }
  }
};

/**
 * 3. FETCH_DOWNLINE_PREVIEW
 * Fetches downline stats (franchiseCount, downlineMemberCount, ownFranchiseMemberCount)
 * for confirmation preview prior to submitting FRANCHISE_DOWNLINE or ALL.
 * Supports optional franchiseId (used by Global Admin targeting specific franchise downlines).
 */
export const fetchDownlinePreview = async ({ franchiseId, page = 0, size = 100 } = {}) => {
  const body = {
    requestType: 'FETCH_DOWNLINE_PREVIEW',
    ...(franchiseId && { franchiseId: Number(franchiseId) }),
    page,
    size,
  };

  try {
    return await apiCall('/meetings', { method: 'POST', body });
  } catch (err) {
    return await authenticatedFetch(`${BASE_URL}/meetings`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
};
