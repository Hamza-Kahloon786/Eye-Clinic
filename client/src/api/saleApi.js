import axiosClient from './axiosClient';

export async function createSale(payload) {
  const { data } = await axiosClient.post('/sales', payload);
  return data;
}

export async function getSales({ query, date } = {}) {
  const { data } = await axiosClient.get('/sales', { params: { query, date } });
  return data;
}

export async function getSalesStats() {
  const { data } = await axiosClient.get('/sales/stats');
  return data;
}
