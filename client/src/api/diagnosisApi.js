import axiosClient from './axiosClient';

export async function getDiagnoses() {
  const { data } = await axiosClient.get('/diagnoses');
  return data;
}

export async function createDiagnosis(name, defaultPrescription) {
  const { data } = await axiosClient.post('/diagnoses', { name, defaultPrescription });
  return data;
}

export async function updateDiagnosis(id, name, defaultPrescription) {
  const { data } = await axiosClient.patch(`/diagnoses/${id}`, { name, defaultPrescription });
  return data;
}

export async function deleteDiagnosis(id) {
  const { data } = await axiosClient.delete(`/diagnoses/${id}`);
  return data;
}
