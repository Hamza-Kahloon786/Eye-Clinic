import axiosClient from './axiosClient';

export async function getDashboardStats() {
  const { data } = await axiosClient.get('/stats/dashboard');
  return data;
}
