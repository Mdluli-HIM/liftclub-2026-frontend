import { api } from './client';

export function createBooking(tripId, seats) {
  return api.post('/bookings', { tripId, seats });
}

export function getMyBookings() {
  return api.get('/bookings/mine');
}
