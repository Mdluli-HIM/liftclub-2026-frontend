import { api } from './client';

export function createVehicle(data) {
  return api.post('/vehicles', data);
}

export function getMyVehicles() {
  return api.get('/vehicles/mine');
}
