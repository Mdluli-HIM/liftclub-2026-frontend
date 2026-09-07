import { api } from './client';

export function signup(data) {
  return api.post('/auth/signup', data);
}

export function login(data) {
  return api.post('/auth/login', data);
}

export function getMe() {
  return api.get('/auth/me');
}

export function updateMe(payload) {
  return api.patch('/auth/me', payload);
}
