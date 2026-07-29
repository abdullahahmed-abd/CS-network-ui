// api/directoryApi.js
import { apiCall } from './auth';

/**
 * Member Directory Search — SEARCH_DIRECTORY
 * Returns members content, reachPercentage, totalNetworkSize, visibleNetworkSize.
 */
export const searchDirectory = async ({
  search,
  country,
  state,
  city,
  businessSector,
  position,
  businessAge,
  franchiseType,
  page = 0,
  size = 10,
} = {}) => {
  const body = {
    directoryRequestType: 'SEARCH_DIRECTORY',
    page,
    size,
  };

  if (search) body.search = search;
  if (country) body.country = country;
  if (state) body.state = state;
  if (city) body.city = city;
  if (businessSector) body.businessSector = businessSector;
  if (position) body.position = position;
  if (businessAge) body.businessAge = businessAge;
  if (franchiseType) body.franchiseType = franchiseType;

  return apiCall('/directory', { body });
};

/**
 * Operator Directory Search — SEARCH_OPERATORS
 * Staff-only org chart search. Note: businessSector, position, businessAge are NOT supported.
 */
export const searchOperators = async ({
  search,
  country,
  state,
  city,
  franchiseType,
  page = 0,
  size = 10,
} = {}) => {
  const body = {
    directoryRequestType: 'SEARCH_OPERATORS',
    page,
    size,
  };

  if (search) body.search = search;
  if (country) body.country = country;
  if (state) body.state = state;
  if (city) body.city = city;
  if (franchiseType) body.franchiseType = franchiseType;

  return apiCall('/directory', { body });
};

/**
 * Single Member Profile — GET_MEMBER_PROFILE
 * Fetches profile for memberId. Subject to reach & contact masking rules.
 */
export const getMemberProfile = async (memberId) => {
  const body = {
    directoryRequestType: 'GET_MEMBER_PROFILE',
    memberId: Number(memberId),
  };

  return apiCall('/directory', { body });
};
