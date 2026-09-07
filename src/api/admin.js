import { api } from './client';

export function getProviders() {
  return api.get('/admin/providers');
}

export function getProviderDetail(id) {
  return api.get('/admin/providers/' + id);
}

export function approveProvider(id) {
  return api.post('/admin/providers/' + id + '/approve');
}

export function rejectProvider(id, reason) {
  return api.post('/admin/providers/' + id + '/reject', { reason });
}

export function getAllBookings() {
  return api.get('/admin/bookings');
}
