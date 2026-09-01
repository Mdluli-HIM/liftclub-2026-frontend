import { api } from './client';

export function getProviders() {
  return api.get('/admin/providers');
}

export function approveProvider(id) {
  return api.post('/admin/providers/' + id + '/approve');
}

export function getAllBookings() {
  return api.get('/admin/bookings');
}
