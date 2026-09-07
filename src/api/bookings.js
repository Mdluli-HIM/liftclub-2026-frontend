import { api } from './client';

export function createBooking(payload) {
  return api.post('/bookings', payload);
}

export function getMyBookings() {
  return api.get('/bookings/mine');
}
