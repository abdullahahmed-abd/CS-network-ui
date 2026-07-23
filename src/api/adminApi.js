import { apiCall } from './auth';

// ══════════════════════════════════════
// GLOBAL ADMIN APIs
// ══════════════════════════════════════
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
// EVENTS APIs (GLOBAL ADMIN)
// ══════════════════════════════════════
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

export const approveRegistration = (registrationId) =>
  apiCall('/global-admin', {
    body: {
      requestType: 'APPROVE_REGISTRATION',
      registrationId,
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

export const submitMasterOperatorForm = (formData) =>
  apiCall('/master-operator', {
    body: {
      requestType: 'SUBMIT_OPERATOR_FORM',
      onboardingRequest: formData,
    },
  });

// ══════════════════════════════════════
// FRANCHISE (GENERAL) OPERATOR APIs
// ══════════════════════════════════════
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