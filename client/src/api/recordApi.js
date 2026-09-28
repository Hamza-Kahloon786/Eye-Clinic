import axiosClient from './axiosClient';

export async function createRecord(payload) {
  const { data } = await axiosClient.post('/records', payload);
  return data;
}

export async function getAllRecords({ query, date } = {}) {
  const { data } = await axiosClient.get('/records', { params: { query, date } });
  return data;
}

export async function getPatientsWithRecords({ query, date } = {}) {
  const { data } = await axiosClient.get('/records/patients', { params: { query, date } });
  return data;
}

export async function getRecordById(id) {
  const { data } = await axiosClient.get(`/records/${id}`);
  return data;
}

export async function getPatientRecords(patientId) {
  const { data } = await axiosClient.get(`/patients/${patientId}/records`);
  return data;
}

export async function deleteRecord(id) {
  const { data } = await axiosClient.delete(`/records/${id}`);
  return data;
}

export async function getRecordByToken(tokenId) {
  try {
    const { data } = await axiosClient.get(`/records/by-token/${tokenId}`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}
