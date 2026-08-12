// api/adminApi.js
import { apiCall } from './auth';

// ══════════════════════════════════════
// GLOBAL ADMIN APIs
// ══════════════════════════════════════

export const fetchDashboard = () =>
  apiCall('/global-admin', {
    body: {
      requestType: 'FETCH_DASHBOARD',
    },
  });

export const createMasterFranchise = (franchiseName, country) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'CREATE_MASTER_FRANCHISE',
      franchiseName,
      country,
    },
  });

export const inviteMasterOperator = (franchiseId) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'INVITE_MASTER_OPERATOR',
      franchiseId,
    },
  });

// ══════════════════════════════════════
// EVENTS APIs
// ══════════════════════════════════════

export * from './eventsApi';

export const createEvent = (eventData) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'CREATE_EVENT',
      ...eventData,
    },
  });

export const fetchAllEvents = (page = 0, size = 10) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'FETCH_ALL_EVENTS',
      page,
      size,
    },
  });

export const fetchEventRegistrations = (eventId) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'FETCH_EVENT_REGISTRATIONS',
      eventId,
    },
  });

export const approveRegistration = (registrationId, reviewNotes = '') =>
  apiCall('/global-admin', {
    body: {
      requestType: 'APPROVE_REGISTRATION',
      registrationId,
      ...(reviewNotes && reviewNotes.trim() && { reviewNotes: reviewNotes.trim() }),
    },
  });

export const rejectRegistration = (registrationId, reviewNotes = '') =>
  apiCall('/global-admin', {
    body: {
      requestType: 'REJECT_REGISTRATION',
      registrationId,
      reviewNotes,
    },
  });

// ══════════════════════════════════════
// MASTER OPERATOR APIs
// ══════════════════════════════════════

export const fetchMasterDashboard = () =>
  apiCall('/master-operator', {
    body: {
      requestType: 'FETCH_DASHBOARD',
    },
  });

export const createGeneralFranchise = (franchiseName, state, city) =>
  apiCall('/master-operator', {
    body: {
      requestType: 'CREATE_GENERAL_FRANCHISE',
      franchiseName,
      state,
      city,
    },
  });

export const createSectorFranchise = (franchiseName, sectorName) =>
  apiCall('/master-operator', {
    body: {
      requestType: 'CREATE_SECTOR_FRANCHISE',
      franchiseName,
      sectorName,
    },
  });

export const inviteGeneralOperator = (franchiseId) =>
  apiCall('/master-operator', {
    body: {
      requestType: 'INVITE_GENERAL_OPERATOR',
      franchiseId,
    },
  });

export const inviteSectorOperator = (franchiseId) =>
  apiCall('/master-operator', {
    body: {
      requestType: 'INVITE_SECTOR_OPERATOR',
      franchiseId,
    },
  });

export const submitMasterOperatorForm = (formData) =>
  apiCall('/master-operator', {
    body: {
      requestType: 'SUBMIT_OPERATOR_FORM',
      onboardingRequest: formData,
    },
  });

// ══════════════════════════════════════
// FRANCHISE OPERATOR APIs
// (Handles both GENERAL + SECTOR operators)
// ══════════════════════════════════════

// Fetch dashboard — works for both GENERAL and SECTOR franchise operators
export const fetchFranchiseDashboard = () =>
  apiCall('/franchise-operator', {
    body: {
      franchiseOperatorRequestType: 'FETCH_DASHBOARD',
    },
  });

// Refresh member invite link — called when usesRemaining <= 0 or manually
export const refreshMemberInvite = () =>
  apiCall('/franchise-operator', {
    body: {
      franchiseOperatorRequestType: 'REFRESH_MEMBER_INVITE',
    },
  });

export const submitGeneralOperatorForm = (formData) =>
  apiCall('/franchise-operator', {
    body: {
      franchiseOperatorRequestType: 'SUBMIT_OPERATOR_FORM',
      onboardingRequest: formData,
    },
  });

export const inviteMember = () =>
  apiCall('/franchise-operator', {
    body: {
      franchiseOperatorRequestType: 'INVITE_MEMBER',
    },
  });

// ══════════════════════════════════════
// FRANCHISE OPERATOR APIs (Applications & Commissions)
// ══════════════════════════════════════

export const fetchPendingApplications = () =>
  apiCall('/franchise-operator', {
    body: {
      franchiseOperatorRequestType: 'FETCH_PENDING_APPLICATIONS',
    },
  });

export const approveApplication = (applicationId, reviewNotes = '') =>
  apiCall('/franchise-operator', {
    body: {
      franchiseOperatorRequestType: 'APPROVE_APPLICATION',
      applicationId: Number(applicationId),
      ...(reviewNotes && { reviewNotes }),
    },
  });

export const rejectApplication = (applicationId, reviewNotes) => {
  if (!reviewNotes || !reviewNotes.trim()) {
    throw new Error('reviewNotes (rejection reason) is required.');
  }
  return apiCall('/franchise-operator', {
    body: {
      franchiseOperatorRequestType: 'REJECT_APPLICATION',
      applicationId: Number(applicationId),
      reviewNotes: reviewNotes.trim(),
    },
  });
};

export const fetchFranchiseCommissions = ({ page = 0, size = 10, commissionStatusFilter } = {}) =>
  apiCall('/franchise-operator', {
    body: {
      franchiseOperatorRequestType: 'FETCH_COMMISSION_ENTRIES',
      page: Number(page),
      size: Number(size),
      ...(commissionStatusFilter && commissionStatusFilter !== 'ALL' && { commissionStatusFilter }),
    },
  });

export const approveCommissionEntry = (commissionLedgerEntryId, reviewNotes = '') =>
  apiCall('/franchise-operator', {
    body: {
      franchiseOperatorRequestType: 'APPROVE_COMMISSION_ENTRY',
      commissionLedgerEntryId: Number(commissionLedgerEntryId),
      ...(reviewNotes && { reviewNotes }),
    },
  });

export const markCommissionEntryPaid = (commissionLedgerEntryId, reviewNotes = '') =>
  apiCall('/franchise-operator', {
    body: {
      franchiseOperatorRequestType: 'MARK_COMMISSION_ENTRY_PAID',
      commissionLedgerEntryId: Number(commissionLedgerEntryId),
      ...(reviewNotes && { reviewNotes }),
    },
  });

// Backward compat alias
export const fetchGeneralDashboard = fetchFranchiseDashboard;

// ══════════════════════════════════════
// SECTOR OPERATOR APIs
// ══════════════════════════════════════

export const fetchSectorDashboard = () =>
  apiCall('/sector-operator', {
    body: {
      sectorOperatorRequestType: 'FETCH_DASHBOARD',
    },
  });

// ══════════════════════════════════════
// INVITATION APIs
// ══════════════════════════════════════

export const verifyInvitation = (token) =>
  apiCall('/invitations', {
    body: {
      requestType: 'VERIFY',
      token,
    },
  });

export const acceptInvitation = (token) =>
  apiCall('/invitations', {
    body: {
      requestType: 'ACCEPT',
      token,
    },
  });

// ══════════════════════════════════════
// MEETINGS MODULE APIs
// ══════════════════════════════════════
// ══════════════════════════════════════
// GLOBAL ADMIN MEDIA HUB APIs
// ══════════════════════════════════════

export const fetchMediaSections = ({ mediaCategory } = {}) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'FETCH_MEDIA_SECTIONS',
      ...(mediaCategory && { mediaCategory }),
    },
  });

export const createMediaSection = ({ mediaCategory, sectionName, displayOrder = 0 }) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'CREATE_MEDIA_SECTION',
      mediaCategory,
      sectionName,
      displayOrder: Number(displayOrder),
    },
  });

export const updateMediaSection = ({ sectionId, sectionName, displayOrder }) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'UPDATE_MEDIA_SECTION',
      sectionId: Number(sectionId),
      ...(sectionName !== undefined && { sectionName }),
      ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
    },
  });

export const deleteMediaSection = (sectionId) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'DELETE_MEDIA_SECTION',
      sectionId: Number(sectionId),
    },
  });

export const createMediaVideo = ({
  mediaCategory,
  videoTitle,
  youtubeUrl,
  videoDescription,
  sectionId,
  displayOrder = 0,
  published = true,
}) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'CREATE_MEDIA_VIDEO',
      mediaCategory,
      videoTitle,
      youtubeUrl,
      ...(videoDescription && { videoDescription }),
      ...(sectionId !== undefined && sectionId !== null && { sectionId: Number(sectionId) }),
      displayOrder: Number(displayOrder),
      published: Boolean(published),
    },
  });

export const updateMediaVideo = ({
  videoId,
  videoTitle,
  videoDescription,
  youtubeUrl,
  mediaCategory,
  sectionId,
  displayOrder,
  published,
}) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'UPDATE_MEDIA_VIDEO',
      videoId: Number(videoId),
      ...(videoTitle !== undefined && { videoTitle }),
      ...(videoDescription !== undefined && { videoDescription }),
      ...(youtubeUrl !== undefined && { youtubeUrl }),
      ...(mediaCategory !== undefined && { mediaCategory }),
      ...(sectionId !== undefined && { sectionId: Number(sectionId) }),
      ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      ...(published !== undefined && { published: Boolean(published) }),
    },
  });

export const deleteMediaVideo = (videoId) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'DELETE_MEDIA_VIDEO',
      videoId: Number(videoId),
    },
  });

// ══════════════════════════════════════
// TRUST SCORE & LEADERBOARD APIs
// ══════════════════════════════════════

export const fetchTrustLeaderboard = (page = 0, size = 25, scopeToMyNetwork = false) =>
  apiCall('/trust-score', {
    body: {
      requestType: 'GET_LEADERBOARD',
      page: Number(page),
      size: Number(size),
      ...(scopeToMyNetwork ? { scopeToMyNetwork: 'true' } : {}),
    },
  });


export const fetchTrustProfileDetail = (targetUserId, page = 0, size = 10) =>
  apiCall('/trust-score', {
    body: {
      requestType: 'GET_PROFILE_DETAIL',
      targetUserId: Number(targetUserId),
      page: Number(page),
      size: Number(size),
    },
  });

export const awardTrustPoints = ({ targetUserId, awardReason, tokenAmount, trustDimension }) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'AWARD_POINTS',
      targetUserId: String(targetUserId),
      awardReason: awardReason || '',
      tokenAmount: String(tokenAmount),
      trustDimension,
    },
  });


