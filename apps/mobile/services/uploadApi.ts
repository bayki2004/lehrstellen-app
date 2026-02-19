import api from './api';

export async function uploadCompanyPhotos(uris: string[]) {
  const formData = new FormData();
  uris.forEach((uri, i) => {
    formData.append('photos', {
      uri,
      name: `photo_${i}.jpg`,
      type: 'image/jpeg',
    } as any);
  });
  return api.post('/companies/me/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function uploadCompanyVideo(uri: string) {
  const formData = new FormData();
  formData.append('video', {
    uri,
    name: 'video.mp4',
    type: 'video/mp4',
  } as any);
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
