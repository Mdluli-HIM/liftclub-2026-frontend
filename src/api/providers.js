import { API_BASE_URL } from './config';

export async function uploadProviderDocuments({ idDocument, licenseDocument }) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  if (idDocument) formData.append('idDocument', idDocument);
  if (licenseDocument) formData.append('licenseDocument', licenseDocument);

  const response = await fetch(API_BASE_URL + '/providers/documents', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}
