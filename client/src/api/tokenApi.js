import axiosClient from './axiosClient';

export async function createToken(patientId, fee) {
  const { data } = await axiosClient.post('/tokens', { patientId, fee });
  return data;
}

export async function getTodayQueue() {
  const { data } = await axiosClient.get('/tokens/today');
  return data;
}

export async function getToken(id) {
  const { data } = await axiosClient.get(`/tokens/${id}`);
  return data;
}

export async function updateTokenStatus(id, status) {
  const { data } = await axiosClient.patch(`/tokens/${id}/status`, { status });
  return data;
}

export async function updateTokenDiagnosis(id, diagnosis) {
  const { data } = await axiosClient.patch(`/tokens/${id}/diagnosis`, { diagnosis });
  return data;
}
