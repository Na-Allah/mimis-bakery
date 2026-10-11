import { API_URL } from '../api/clients';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function getMediaUrl(image: string | null | undefined): string {
  if (!image) return '';

  try {
    const imageUrl = new URL(image, window.location.origin);
    if (!imageUrl.pathname.startsWith('/media/')) return image;

    const apiOrigin = API_URL.startsWith('http')
      ? new URL(API_URL).origin
      : window.location.origin;
    if (
      imageUrl.origin === window.location.origin ||
      imageUrl.origin === apiOrigin ||
      LOCAL_HOSTS.has(imageUrl.hostname)
    ) {
      return `${imageUrl.pathname}${imageUrl.search}${imageUrl.hash}`;
    }
  } catch {
    return image;
  }

  return image;
}
