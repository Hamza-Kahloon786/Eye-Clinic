import axiosClient from './axiosClient';

export async function getMedicines(query) {
  const { data } = await axiosClient.get('/medicines', { params: { query } });
  return data;
}

export async function createMedicine(payload) {
  const { data } = await axiosClient.post('/medicines', payload);
  return data;
}

export async function updateMedicine(id, payload) {
  const { data } = await axiosClient.patch(`/medicines/${id}`, payload);
  return data;
}

export async function deleteMedicine(id) {
  const { data } = await axiosClient.delete(`/medicines/${id}`);
  return data;
}
