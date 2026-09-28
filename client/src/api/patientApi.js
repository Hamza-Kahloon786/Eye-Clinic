import axiosClient from './axiosClient';

export async function searchPatients(query) {
  const { data } = await axiosClient.get('/patients/search', { params: { query } });
  return data;
}

export async function createPatient(payload) {
  const { data } = await axiosClient.post('/patients', payload);
  return data;
}

export async function getPatient(id) {
  const { data } = await axiosClient.get(`/patients/${id}`);
  return data;
}

export async function updatePatient(id, payload) {
  const { data } = await axiosClient.patch(`/patients/${id}`, payload);
  return data;
}

export async function getPatientTokens(id) {
  const { data } = await axiosClient.get(`/patients/${id}/tokens`);
  return data;
}
