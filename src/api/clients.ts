
export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getCsrfToken(): Promise<string | null> {
  const response = await fetch(`${API_URL}/auth/csrf/`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Unable to initialize request security.');
  }
  const data = (await response.json()) as { csrfToken?: string };
  return data.csrfToken || getCookie('csrftoken');
}