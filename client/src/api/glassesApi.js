import axiosClient from './axiosClient';

export async function createSuggestion(payload) {
  const { data } = await axiosClient.post('/glasses', payload);
  return data;
}

export async function getAllSuggestions({ status, query } = {}) {
  const { data } = await axiosClient.get('/glasses', { params: { status, query } });
  return data;
}

export async function getPatientSuggestions(patientId) {
  const { data } = await axiosClient.get(`/patients/${patientId}/glasses`);
  return data;
}

export async function getSuggestionByToken(tokenId) {
  try {
    const { data } = await axiosClient.get(`/glasses/by-token/${tokenId}`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

export async function updateSuggestionStatus(id, payload) {
  const { data } = await axiosClient.patch(`/glasses/${id}/status`, payload);
  return data;
}

export async function updateSuggestion(id, payload) {
  const { data } = await axiosClient.patch(`/glasses/${id}`, payload);
  return data;
}

export async function deleteSuggestion(id) {
  const { data } = await axiosClient.delete(`/glasses/${id}`);
  return data;
}

export async function getOpticalStats() {
  const { data } = await axiosClient.get('/glasses/stats');
  return data;
}
