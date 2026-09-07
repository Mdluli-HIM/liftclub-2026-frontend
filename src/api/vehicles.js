import { api } from './client';
import { API_BASE_URL } from './config';

export function getMyVehicles() {
  return api.get('/vehicles/mine');
}

export async function createVehicle({ make, model, year, seatCapacity, color, amenities, registrationNumber, photo }) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('make', make);
  formData.append('model', model);
  formData.append('year', year);
  formData.append('seatCapacity', seatCapacity);
  if (color) formData.append('color', color);
  formData.append('amenities', JSON.stringify(amenities || []));
  formData.append('registrationNumber', registrationNumber);
  if (photo) formData.append('photo', photo);

  const response = await fetch(API_BASE_URL + '/vehicles', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}
