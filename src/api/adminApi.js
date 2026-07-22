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