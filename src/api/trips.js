import { api } from './client';

export function searchTrips({ origin, destination, date, seats }) {
  const params = new URLSearchParams();
  if (origin) params.append('origin', origin);
  if (destination) params.append('destination', destination);
  if (date) params.append('date', date);
  if (seats) params.append('seats', seats);
  return api.get('/trips/search?' + params.toString());
}

export function getTrip(id) {
  return api.get('/trips/' + id);
}

export function createTrip(data) {
  return api.post('/trips', data);
}

export function getMyTrips() {
  return api.get('/trips/mine');
}

export function getTripPassengers(id) {
  return api.get('/trips/' + id + '/passengers');
}

export function getDatePrices({ origin, destination, seats, date }) {
  const params = new URLSearchParams();
  if (origin) params.append('origin', origin);
  if (destination) params.append('destination', destination);
  if (seats) params.append('seats', seats);
  if (date) params.append('date', date);
  return api.get('/trips/date-prices?' + params.toString());
}
