import axiosClient from './axiosClient';

export async function createAppointment(payload) {
  const { data } = await axiosClient.post('/appointments', payload);
  return data;
}

export async function getAppointments(date) {
  const { data } = await axiosClient.get('/appointments', { params: { date } });
  return data;
}

export async function checkInAppointment(id, fee) {
  const { data } = await axiosClient.patch(`/appointments/${id}/check-in`, { fee });
  return data;
}

export async function cancelAppointment(id) {
  const { data } = await axiosClient.patch(`/appointments/${id}/cancel`);
  return data;
}
