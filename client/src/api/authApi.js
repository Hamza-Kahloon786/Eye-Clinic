import axiosClient from './axiosClient';

export async function login(username, password) {
  const { data } = await axiosClient.post('/auth/login', { username, password });
  return data;
}

export async function fetchMe() {
  const { data } = await axiosClient.get('/auth/me');
  return data;
}
