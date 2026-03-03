import api from './api';

export async function uploadCompanyPhotos(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));
  return api.post('/companies/me/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function uploadCompanyVideo(file: File) {
  const formData = new FormData();
  formData.append('video', file);
  return api.post('/companies/me/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteCompanyPhoto(photoId: string) {
  return api.delete(`/companies/me/photos/${photoId}`);
}

export async function deleteCompanyVideo() {
  return api.delete('/companies/me/video');
}
