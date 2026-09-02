const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/contracts`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error?.message || `HTTP error: ${res.status}`;
    throw new Error(message);
  }
  return data;
};

export const getContracts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const getContractById = async (contractId) => {
  const res = await fetch(`${BASE_URL}/${contractId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const addMilestone = async (contractId, milestoneData) => {
  const res = await fetch(`${BASE_URL}/${contractId}/milestones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(milestoneData)
  });
  return handleResponse(res);
};

export const editMilestone = async (contractId, milestoneId, updateData) => {
  const res = await fetch(`${BASE_URL}/${contractId}/milestones/${milestoneId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData)
  });
  return handleResponse(res);
};

export const fundMilestone = async (contractId, milestoneId) => {
  const res = await fetch(`${BASE_URL}/${contractId}/milestones/${milestoneId}/fund`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const deliverMilestone = async (contractId, milestoneId, deliveryPayload) => {
  const res = await fetch(`${BASE_URL}/${contractId}/milestones/${milestoneId}/deliver`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(deliveryPayload)
  });
  return handleResponse(res);
};

export const approveMilestone = async (contractId, milestoneId) => {
  const res = await fetch(`${BASE_URL}/${contractId}/milestones/${milestoneId}/approve`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const createReview = async (contractId, reviewData) => {
  const res = await fetch(`${BASE_URL}/${contractId}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData)
  });
  return handleResponse(res);
};