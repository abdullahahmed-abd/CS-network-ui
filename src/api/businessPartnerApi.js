// api/businessPartnerApi.js
import { apiCall } from './auth';

/**
 * Creates a cold-contact lead for a client without a CS account.
 * Simultaneously creates a TradeIntent owned by the BP on the client's behalf.
 */
export const createExternalLead = async ({
  companyName,
  contactPerson,
  phone,
  email,
  notes,
  followUpDate,
  franchiseId,
  intentType,
  category,
  title,
  description,
  quantity,
  unit,
  pricePerUnit,
  currency,
  expiresAt,
}) => {
  const body = {
    businessPartnerRequestType: 'CREATE_EXTERNAL_LEAD',
    companyName,
    contactPerson,
    phone,
    email,
    notes,
    followUpDate,
    ...(franchiseId && { franchiseId: Number(franchiseId) }),
    intentType,
    category,
    title,
    description,
    quantity,
    unit,
    pricePerUnit,
    currency,
    expiresAt,
  };

  return apiCall('/business-partner', { body });
};

/**
 * Adds a registered CS member to the BP's pipeline.
 * Member contact info is automatically pulled from their profile.
 */
export const createInternalLead = async ({
  memberId,
  tradeIntentId,
  notes,
  followUpDate,
}) => {
  const body = {
    businessPartnerRequestType: 'CREATE_INTERNAL_LEAD',
    memberId: Number(memberId),
    tradeIntentId: tradeIntentId ? Number(tradeIntentId) : undefined,
    notes,
    followUpDate,
  };

  return apiCall('/business-partner', { body });
};

/**
 * BP creates a Trade Intent on behalf of a registered CS member.
 * Starts pipeline lead at QUALIFIED stage.
 */
export const createTradeIntentForMember = async ({
  memberId,
  franchiseId,
  intentType,
  category,
  title,
  description,
  quantity,
  unit,
  pricePerUnit,
  currency,
  expiresAt,
}) => {
  const body = {
    businessPartnerRequestType: 'CREATE_TRADE_INTENT_FOR_MEMBER',
    memberId: Number(memberId),
    ...(franchiseId && { franchiseId: Number(franchiseId) }),
    intentType,
    category,
    title,
    description,
    quantity,
    unit,
    pricePerUnit,
    currency,
    expiresAt,
  };

  return apiCall('/business-partner', { body });
};

/**
 * Manually moves a lead to a new pipeline stage.
 * Valid stages: NEW_LEAD, CONTACTED, QUALIFIED, INTRODUCED, NEGOTIATION
 */
export const updateLeadStage = async (leadId, stage) => {
  const body = {
    businessPartnerRequestType: 'UPDATE_LEAD_STAGE',
    leadId: Number(leadId),
    stage,
  };

  return apiCall('/business-partner', { body });
};

/**
 * Partial update of contact/notes info for a lead.
 * Only sends fields that are modified.
 */
export const updateLeadDetails = async (leadId, fields = {}) => {
  const body = {
    businessPartnerRequestType: 'UPDATE_LEAD_DETAILS',
    leadId: Number(leadId),
    ...fields,
  };

  return apiCall('/business-partner', { body });
};

/**
 * Permanently removes a lead from the pipeline.
 */
export const deleteLead = async (leadId) => {
  const body = {
    businessPartnerRequestType: 'DELETE_LEAD',
    leadId: Number(leadId),
  };

  return apiCall('/business-partner', { body });
};

/**
 * Raises a Trade Proposal against the Trade Intent attached to this lead.
 * Automatically advances lead stage to NEGOTIATION if currently prior to NEGOTIATION.
 */
export const createProposalForLead = async (leadId, { quantityRequested, pricePerUnit, timelineDays }) => {
  const body = {
    businessPartnerRequestType: 'CREATE_PROPOSAL_FOR_LEAD',
    leadId: Number(leadId),
    quantityRequested: Number(quantityRequested),
    pricePerUnit: Number(pricePerUnit),
    timelineDays: Number(timelineDays),
  };

  return apiCall('/business-partner', { body });
};

/**
 * Raises a Trade Proposal against a Trade Intent.
 */
export const createProposalForIntent = async (intentId, { quantityRequested, pricePerUnit, timelineDays }) => {
  const body = {
    businessPartnerRequestType: 'CREATE_PROPOSAL',
    tradeIntentId: Number(intentId),
    quantityRequested: Number(quantityRequested),
    pricePerUnit: Number(pricePerUnit),
    timelineDays: Number(timelineDays),
  };

  return apiCall('/business-partner', { body });
};

/**
 * Returns all Trade Proposals for the intent attached to this lead.
 */
export const fetchLeadProposals = async (leadId) => {
  const body = {
    businessPartnerRequestType: 'FETCH_LEAD_PROPOSALS',
    leadId: Number(leadId),
  };

  return apiCall('/business-partner', { body });
};

/**
 * Returns the single Trade Intent currently attached to this lead.
 */
export const fetchLeadIntent = async (leadId) => {
  const body = {
    businessPartnerRequestType: 'FETCH_LEAD_INTENT',
    leadId: Number(leadId),
  };

  return apiCall('/business-partner', { body });
};

/**
 * Hands a lead off to another Business Partner.
 * Transmit ownership completely and preserves referral chain up to 7 hops.
 */
export const referLead = async (leadId, toBusinessPartnerId) => {
  const body = {
    businessPartnerRequestType: 'REFER_LEAD',
    leadId: Number(leadId),
    toBusinessPartnerId: Number(toBusinessPartnerId),
  };

  return apiCall('/business-partner', { body });
};

/**
 * Attaches an existing Trade Intent to a lead.
 */
export const attachTradeIntentToLead = async (leadId, tradeIntentId) => {
  const body = {
    businessPartnerRequestType: 'ATTACH_TRADE_INTENT_TO_LEAD',
    leadId: Number(leadId),
    tradeIntentId: Number(tradeIntentId),
  };

  return apiCall('/business-partner', { body });
};

/**
 * Fetches trade intents owned by a specific member.
 */
export const fetchMemberIntents = async (memberId) => {
  const body = {
    businessPartnerRequestType: 'FETCH_MEMBER_INTENTS',
    memberId: Number(memberId),
  };

  return apiCall('/business-partner', { body });
};

/**
 * Fetches full pipeline for the calling Business Partner.
 */
export const fetchMyPipeline = async () => {
  const body = {
    businessPartnerRequestType: 'FETCH_MY_PIPELINE',
  };

  return apiCall('/business-partner', { body });
};

/**
 * Fetches pipeline leads for a specific stage.
 */
export const fetchPipelineByStage = async (stage) => {
  const body = {
    businessPartnerRequestType: 'FETCH_PIPELINE_BY_STAGE',
    stage,
  };

  return apiCall('/business-partner', { body });
};

/**
 * Fetches/Searches members in the Business Partner's franchise.
 * Searchable by name, whatsapp number, email, or user id.
 */
export const fetchFranchiseMembers = async ({ search = '', page = 0, size = 10 } = {}) => {
  const body = {
    businessPartnerRequestType: 'FETCH_FRANCHISE_MEMBERS',
    search,
    page,
    size,
  };

  return apiCall('/business-partner', { body });
};

/**
 * Fetches/Searches Business Partners in the network.
 * Uses memberRequestType: 'FIND_BUSINESS_PARTNERS' on /member endpoint.
 */
export const findBusinessPartners = async ({ businessSector, country, state, city, search } = {}) => {
  const body = {
    memberRequestType: 'FIND_BUSINESS_PARTNERS',
    ...(businessSector && { businessSector }),
    ...(country && { country }),
    ...(state && { state }),
    ...(city && { city }),
    ...(search && { search }),
  };

  return apiCall('/member', { body });
};


