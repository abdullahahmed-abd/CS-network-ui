// api/eventsApi.js
import { authenticatedFetch, BASE_URL } from './auth';

// Helper for API calls
const eventsApiCall = async (endpoint, bodyPayload) => {
  const data = await authenticatedFetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(bodyPayload),
  });
  return data;
};

// ══════════════════════════════════════════════════════════════
// 1️⃣ MEMBER APIs (Endpoint: POST /cs-network/member)
// ══════════════════════════════════════════════════════════════

export const fetchMemberEventList = (page = 0, size = 10) =>
  eventsApiCall('/cs-network/member', {
    memberRequestType: 'FETCH_EVENT_LIST',
    page: Number(page),
    size: Number(size),
  });

// ══════════════════════════════════════════════════════════════
// 2️⃣ FRANCHISE OPERATOR APIs (Endpoint: POST /cs-network/franchise-operator)
// ══════════════════════════════════════════════════════════════

export const createFranchiseOperatorEvent = (eventData) => {
  // Strip photoUrl from speakers and force free-only event (isPaid: false)
  const cleanSpeakers = (eventData.speakers || []).map((s, idx) => ({
    name: s.name,
    designation: s.designation || '',
    bio: s.bio || '',
    displayOrder: idx + 1,
  }));

  const payload = {
    franchiseOperatorRequestType: 'CREATE_EVENT',
    ...eventData,
    speakers: cleanSpeakers,
    isPaid: false,
    paid: false,
    price: null,
    currency: null,
  };
  return eventsApiCall('/cs-network/franchise-operator', payload);
};

export const updateFranchiseOperatorEvent = (eventId, updateData) =>
  eventsApiCall('/cs-network/franchise-operator', {
    franchiseOperatorRequestType: 'UPDATE_EVENT',
    eventId: Number(eventId),
    ...updateData,
  });

export const fetchFranchiseOperatorEvents = (page = 0, size = 10) =>
  eventsApiCall('/cs-network/franchise-operator', {
    franchiseOperatorRequestType: 'FETCH_MY_EVENTS',
    page: Number(page),
    size: Number(size),
  });

export const submitFranchiseOperatorEventReport = ({
  eventId,
  attendeeCount,
  totalExpense,
  expenseCurrency = 'INR',
  reportNotes,
}) =>
  eventsApiCall('/cs-network/franchise-operator', {
    franchiseOperatorRequestType: 'SUBMIT_EVENT_REPORT',
    eventId: Number(eventId),
    attendeeCount: Number(attendeeCount),
    totalExpense: Number(totalExpense),
    expenseCurrency,
    reportNotes,
  });

// ══════════════════════════════════════════════════════════════
// 3️⃣ MASTER FRANCHISE OPERATOR APIs (Endpoint: POST /cs-network/master-operator)
// ══════════════════════════════════════════════════════════════

export const createMasterOperatorEvent = (eventData) => {
  // Strip photoUrl from speakers and map city/state -> eventCity/eventState
  const cleanSpeakers = (eventData.speakers || []).map((s, idx) => ({
    name: s.name,
    designation: s.designation || '',
    bio: s.bio || '',
    displayOrder: idx + 1,
  }));

  const { city, state, ...rest } = eventData;

  const payload = {
    requestType: 'CREATE_EVENT',
    ...rest,
    ...(city && { eventCity: city }),
    ...(state && { eventState: state }),
    speakers: cleanSpeakers,
  };
  return eventsApiCall('/cs-network/master-operator', payload);
};

export const updateMasterOperatorEvent = (eventId, updateData) => {
  const { city, state, ...rest } = updateData;
  return eventsApiCall('/cs-network/master-operator', {
    requestType: 'UPDATE_EVENT',
    eventId: Number(eventId),
    ...rest,
    ...(city && { eventCity: city }),
    ...(state && { eventState: state }),
  });
};

export const fetchMasterOperatorEvents = (page = 0, size = 10) =>
  eventsApiCall('/cs-network/master-operator', {
    requestType: 'FETCH_MY_EVENTS',
    page: Number(page),
    size: Number(size),
  });

export const fetchMasterPendingEventRequests = (page = 0, size = 10) =>
  eventsApiCall('/cs-network/master-operator', {
    requestType: 'FETCH_PENDING_EVENT_REQUESTS',
    page: Number(page),
    size: Number(size),
  });

export const approveMasterEventRequest = (eventId) =>
  eventsApiCall('/cs-network/master-operator', {
    requestType: 'APPROVE_EVENT_REQUEST',
    eventId: Number(eventId),
  });

export const rejectMasterEventRequest = (eventId, reviewNotes) => {
  if (!reviewNotes || !reviewNotes.trim()) {
    throw new Error('Review notes (rejection reason) are mandatory.');
  }
  return eventsApiCall('/cs-network/master-operator', {
    requestType: 'REJECT_EVENT_REQUEST',
    eventId: Number(eventId),
    reviewNotes: reviewNotes.trim(),
  });
};

export const submitMasterOperatorEventReport = ({
  eventId,
  attendeeCount,
  totalExpense,
  expenseCurrency = 'INR',
  reportNotes,
}) =>
  eventsApiCall('/cs-network/master-operator', {
    requestType: 'SUBMIT_EVENT_REPORT',
    eventId: Number(eventId),
    attendeeCount: Number(attendeeCount),
    totalExpense: Number(totalExpense),
    expenseCurrency,
    reportNotes,
  });

// ══════════════════════════════════════════════════════════════
// 4️⃣ GLOBAL ADMIN APIs (Endpoint: POST /cs-network/global-admin)
// ══════════════════════════════════════════════════════════════

export const createGlobalAdminEvent = (eventData) => {
  const cleanSpeakers = (eventData.speakers || []).map((s, idx) => ({
    name: s.name,
    designation: s.designation || '',
    bio: s.bio || '',
    displayOrder: idx + 1,
  }));

  return eventsApiCall('/cs-network/global-admin', {
    requestType: 'CREATE_EVENT',
    ...eventData,
    speakers: cleanSpeakers,
  });
};

export const fetchGlobalAdminMyEvents = (page = 0, size = 10) =>
  eventsApiCall('/cs-network/global-admin', {
    requestType: 'FETCH_MY_EVENTS',
    page: Number(page),
    size: Number(size),
  });

export const fetchAllGlobalEvents = (page = 0, size = 10) =>
  eventsApiCall('/cs-network/global-admin', {
    requestType: 'FETCH_ALL_EVENTS',
    page: Number(page),
    size: Number(size),
  });

export const fetchGlobalAdminPendingEventRequests = (page = 0, size = 10) =>
  eventsApiCall('/cs-network/global-admin', {
    requestType: 'FETCH_PENDING_EVENT_REQUESTS',
    page: Number(page),
    size: Number(size),
  });

export const approveGlobalAdminEventRequest = (eventId) =>
  eventsApiCall('/cs-network/global-admin', {
    requestType: 'APPROVE_EVENT_REQUEST',
    eventId: Number(eventId),
  });

export const rejectGlobalAdminEventRequest = (eventId, reviewNotes) => {
  if (!reviewNotes || !reviewNotes.trim()) {
    throw new Error('Review notes (rejection reason) are mandatory.');
  }
  return eventsApiCall('/cs-network/global-admin', {
    requestType: 'REJECT_EVENT_REQUEST',
    eventId: Number(eventId),
    reviewNotes: reviewNotes.trim(),
  });
};

export const submitGlobalAdminEventReport = ({
  eventId,
  attendeeCount,
  totalExpense,
  expenseCurrency = 'INR',
  reportNotes,
}) =>
  eventsApiCall('/cs-network/global-admin', {
    requestType: 'SUBMIT_EVENT_REPORT',
    eventId: Number(eventId),
    attendeeCount: Number(attendeeCount),
    totalExpense: Number(totalExpense),
    expenseCurrency,
    reportNotes,
  });

// ══════════════════════════════════════════════════════════════
// 5️⃣ PROFILE & COVER PHOTO UPLOAD APIS
// ══════════════════════════════════════════════════════════════
export {
  uploadProfilePhoto,
  uploadEventCoverPhoto,
  fetchMyProfile,
  resolvePhotoUrl,
} from './profileOperationsApi';

